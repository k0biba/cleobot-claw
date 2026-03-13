import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const STATE_PATH = join(SKILL_DIR, ".state.json");

export interface BotState {
  callId: string;
  meetingUrl: string;
  outputDir: string;
  startTime: string;
  status: "joining" | "recording" | "processing" | "done" | "error";
  recordingChunks: string[];
  error?: string;
  callbackPort: number;
}

export function loadState(): BotState | null {
  try {
    const raw = readFileSync(STATE_PATH, "utf-8");
    return JSON.parse(raw) as BotState;
  } catch {
    return null;
  }
}

export function saveState(state: BotState): void {
  const tmpPath = STATE_PATH + ".tmp";
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
  renameSync(tmpPath, STATE_PATH);
}

export function clearState(): void {
  try {
    unlinkSync(STATE_PATH);
  } catch {
    // Already gone
  }
}

export function stateExists(): boolean {
  return existsSync(STATE_PATH);
}
