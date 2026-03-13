#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import crypto from 'node:crypto';

const CFG = {
  gatewayUrl: process.env.OPENCLAW_GATEWAY_URL?.trim() || 'ws://127.0.0.1:18789',
  gatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || detectGatewayToken(),
  matrixStateUrl: process.env.MATRIX_STATE_URL?.trim() || 'http://localhost:7849/state',
  sessionKey: process.env.OPENCLAW_SESSION_KEY?.trim() || '',
  requestTimeoutMs: intEnv('MATRIX_REQUEST_TIMEOUT_MS', 2500),
  idleDelayMs: intEnv('MATRIX_IDLE_DELAY_MS', 250),
  reconnectDelayMs: intEnv('BRIDGE_RECONNECT_DELAY_MS', 3000),
  completedRunTtlMs: intEnv('BRIDGE_COMPLETED_RUN_TTL_MS', 3000),
  finalCooldownMs: intEnv('BRIDGE_FINAL_COOLDOWN_MS', 4000),
  debug: boolEnv('LED_MATRIX_BRIDGE_DEBUG', true),
};

if (!CFG.gatewayToken) {
  console.error('[led-matrix-bridge] No gateway token available.');
  console.error('Set OPENCLAW_GATEWAY_TOKEN or ensure `openclaw dashboard --no-open` works locally.');
  process.exit(1);
}

let ws = null;
let connectNonce = null;
let connectRequestId = null;
let currentLogicalState = null;
let desiredLogicalState = 'idle';
let lastMatrixState = null;
let idleTimer = null;
let reconnectTimer = null;
let activeRuns = new Set();
let typingRuns = new Set();
let completedRuns = new Map();
let suppressThinkingUntil = 0;
let connectedOnce = false;
let reconnectAttempts = 0;

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function boolEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const v = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return fallback;
}

function detectGatewayToken() {
  try {
    const out = execFileSync('openclaw', ['dashboard', '--no-open'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = out.match(/#token=([A-Za-z0-9._-]+)/);
    return m?.[1] || '';
  } catch {
    return '';
  }
}

function log(...args) {
  if (CFG.debug) console.log('[led-matrix-bridge]', ...args);
}

async function pushMatrixState(logicalState, reason = '') {
  const matrixState = logicalState;
  if (matrixState === lastMatrixState) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CFG.requestTimeoutMs);
  try {
    const res = await fetch(CFG.matrixStateUrl, {
      method: 'POST',
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: matrixState }),
    });
    lastMatrixState = matrixState;
    log(`state -> ${logicalState} (${matrixState})${reason ? ` | ${reason}` : ''} | http ${res.status}`);
  } catch (err) {
    console.error(`[led-matrix-bridge] failed to set matrix state ${matrixState}:`, err?.message || err);
  } finally {
    clearTimeout(timeout);
  }
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdle(reason = '') {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    idleTimer = null;
    if (activeRuns.size === 0 && typingRuns.size === 0) {
      setLogicalState('idle', reason || 'all runs settled');
    }
  }, CFG.idleDelayMs);
}

function setLogicalState(next, reason = '') {
  desiredLogicalState = next;
  clearIdleTimer();
  if (currentLogicalState === next) return;
  currentLogicalState = next;
  void pushMatrixState(next, reason);
}

function sessionMatches(payload) {
  if (!CFG.sessionKey) return true;
  const key = payload?.sessionKey;
  if (typeof key !== 'string') return true;
  return key === CFG.sessionKey;
}

function markThinking(runId, reason) {
  if (runId) activeRuns.add(runId);
  if (Date.now() < suppressThinkingUntil) {
    log(`suppress thinking during final cooldown${reason ? ` | ${reason}` : ''}`);
    return;
  }
  if (typingRuns.size > 0 || currentLogicalState === 'typing') {
    return;
  }
  setLogicalState('thinking', reason);
}

function markTyping(runId, reason) {
  suppressThinkingUntil = 0;
  if (runId) {
    activeRuns.add(runId);
    typingRuns.add(runId);
  }
  setLogicalState('typing', reason);
}

function markRunDone(runId, reason) {
  suppressThinkingUntil = Date.now() + CFG.finalCooldownMs;
  if (runId) {
    activeRuns.delete(runId);
    typingRuns.delete(runId);
    completedRuns.set(runId, Date.now());
  }
  if (typingRuns.size > 0) {
    setLogicalState('typing', reason);
    return;
  }
  if (activeRuns.size > 0) {
    setLogicalState('thinking', reason);
    return;
  }
  scheduleIdle(reason);
}

function pruneCompletedRuns() {
  const cutoff = Date.now() - CFG.completedRunTtlMs;
  for (const [runId, ts] of completedRuns.entries()) {
    if (ts < cutoff) completedRuns.delete(runId);
  }
}

function onGatewayEvent(msg) {
  pruneCompletedRuns();
  if (msg?.event === 'agent') {
    const payload = msg.payload || {};
    if (!sessionMatches(payload)) return;
    const runId = typeof payload.runId === 'string' ? payload.runId : null;
    const stream = payload.stream;
    const phase = payload?.data?.phase;

    if (stream === 'lifecycle' && phase === 'start') {
      if (runId && completedRuns.has(runId)) {
        log(`ignoring stale lifecycle start for completed run ${runId}`);
        return;
      }
      markThinking(runId, 'agent lifecycle start');
      return;
    }
    if (stream === 'lifecycle' && phase === 'end') {
      markRunDone(runId, 'agent lifecycle end');
      return;
    }
    if (stream === 'tool') {
      const toolPhase = payload?.data?.phase;
      if (toolPhase === 'start' || toolPhase === 'update') {
        markThinking(runId, `tool ${toolPhase}`);
      } else if (toolPhase === 'result') {
        if (typingRuns.has(runId)) setLogicalState('typing', 'tool result while typing');
        else if (activeRuns.has(runId)) setLogicalState('thinking', 'tool result');
      }
      return;
    }
    return;
  }

  if (msg?.event === 'chat') {
    const payload = msg.payload || {};
    if (!sessionMatches(payload)) return;
    const state = payload.state;
    const runId = typeof payload.runId === 'string' ? payload.runId : null;

    if (state === 'delta') {
      markTyping(runId, 'chat delta');
      return;
    }
    if (state === 'final' || state === 'aborted' || state === 'error') {
      markRunDone(runId, `chat ${state}`);
      return;
    }
    if (state === 'accepted' || state === 'queued' || state === 'start') {
      markThinking(runId, `chat ${state}`);
    }
  }
}

function send(obj) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(obj));
}

function connectRequest() {
  connectRequestId = crypto.randomUUID();
  send({
    type: 'req',
    id: connectRequestId,
    method: 'connect',
    params: {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: 'gateway-client',
        displayName: 'LED Matrix Bridge',
        version: '0.1.0',
        platform: process.platform,
        mode: 'backend',
        instanceId: crypto.randomUUID(),
      },
      role: 'operator',
      scopes: ['operator.admin'],
      caps: ['tool-events'],
      auth: { token: CFG.gatewayToken },
    },
  });
}

function resetRuntimeState() {
  activeRuns = new Set();
  typingRuns = new Set();
  completedRuns = new Map();
  suppressThinkingUntil = 0;
  clearIdleTimer();
  currentLogicalState = null;
  desiredLogicalState = 'idle';
  reconnectAttempts = 0; // Reset beim Connect-Loop-Start
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  
  // Exponentielles Backoff: 1s, 2s, 4s, 8s, max 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  reconnectAttempts++;
  const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts - 1), maxDelay);
  
  log(`reconnect attempt ${reconnectAttempts}, delay: ${delay}ms`);
  
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectLoop();
  }, delay);
}

async function connectLoop() {
  try {
    resetRuntimeState();
    await pushMatrixState('idle', connectedOnce ? 'reconnecting' : 'startup');
    log(`connecting to ${CFG.gatewayUrl} (session=${CFG.sessionKey || 'ALL'})`);
    ws = new WebSocket(CFG.gatewayUrl);

    ws.addEventListener('open', () => {
      log('websocket open');
    });

    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(String(ev.data ?? ''));
      } catch {
        return;
      }

      if (msg?.type === 'event' && msg?.event === 'connect.challenge') {
        connectNonce = msg?.payload?.nonce || null;
        log('received connect challenge');
        connectRequest();
        return;
      }

      if (msg?.type === 'res' && msg?.id === connectRequestId) {
        if (msg.ok) {
          connectedOnce = true;
          reconnectAttempts = 0; // Reset bei erfolgreichem Connect
          log('gateway connect ok');
          setLogicalState('idle', 'gateway connected');
        } else {
          console.error('[led-matrix-bridge] gateway connect failed:', msg?.error || msg);
          try { ws?.close(); } catch {}
        }
        return;
      }

      if (msg?.type === 'event') onGatewayEvent(msg);
    });

    ws.addEventListener('close', (ev) => {
      log(`websocket closed (${ev.code}) ${ev.reason || ''}`.trim());
      try { ws = null; } catch {}
      resetRuntimeState();
      void pushMatrixState('idle', 'gateway closed');
      scheduleReconnect();
    });

    ws.addEventListener('error', (err) => {
      console.error('[led-matrix-bridge] websocket error:', err?.message || err);
    });
  } catch (err) {
    console.error('[led-matrix-bridge] connect loop failed:', err?.message || err);
    scheduleReconnect();
  }
}

process.on('SIGINT', async () => {
  log('SIGINT -> idle + exit');
  try { await pushMatrixState('idle', 'shutdown'); } catch {}
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('SIGTERM -> idle + exit');
  try { await pushMatrixState('idle', 'shutdown'); } catch {}
  process.exit(0);
});

await connectLoop();
await sleep(1 << 30);
