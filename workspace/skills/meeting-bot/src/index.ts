#!/usr/bin/env node

import { Command } from "commander";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { loadConfig } from "./config.js";
import { loadState, saveState, clearState, stateExists, type BotState } from "./state.js";
import { joinMeeting, hangUp } from "./teams/bot.js";
import { CallbackServer } from "./teams/callback.js";
import { RecordingManager } from "./teams/recording.js";
import { stitchChunks } from "./pipeline/convert.js";
import { transcribe } from "./pipeline/transcribe.js";
import { diarize, alignTranscriptWithSpeakers, type AlignedSegment } from "./pipeline/diarize.js";
import { summarize } from "./pipeline/summarize.js";

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatTranscript(segments: AlignedSegment[]): string {
  return segments
    .map((seg) => `[${formatTimestamp(seg.start)}] **${seg.speaker}**: ${seg.text}`)
    .join("\n");
}

function deriveMeetingId(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/");
    const threadPart = pathParts.find((p) => p.includes("thread") || p.includes("%40thread"));
    if (threadPart) {
      const decoded = decodeURIComponent(threadPart);
      // Extract a short ID from the thread ID
      const match = decoded.match(/meeting_([A-Za-z0-9]+)/);
      if (match) return match[1].slice(0, 12);
    }
  } catch { /* fallback */ }
  return Date.now().toString(36);
}

async function runPipeline(state: BotState, config: ReturnType<typeof loadConfig>): Promise<void> {
  state.status = "processing";
  saveState(state);
  console.error("[pipeline] Starting processing...");

  const outputDir = state.outputDir;
  const recordingPath = join(outputDir, "recording.wav");
  const transcriptPath = join(outputDir, "transcript.txt");
  const summaryPath = join(outputDir, "summary.md");

  // 1. Stitch chunks
  console.error(`[pipeline] Stitching ${state.recordingChunks.length} chunks...`);
  stitchChunks(state.recordingChunks, recordingPath);

  // 2. Transcribe
  console.error("[pipeline] Transcribing with Whisper...");
  const whisperSegments = await transcribe(config.openaiApiKey, recordingPath);

  if (whisperSegments.length === 0) {
    console.error("[pipeline] No speech detected in recording");
    writeFileSync(transcriptPath, "(No speech detected)", "utf-8");
    writeFileSync(summaryPath, "# Meeting Summary\n\nNo speech was detected in the recording.", "utf-8");
    cleanupChunks(state);
    state.status = "done";
    saveState(state);
    return;
  }

  // 3. Diarize
  console.error("[pipeline] Running speaker diarization...");
  const diarizationSegments = await diarize(recordingPath, config.hfToken);

  // 4. Align
  const alignedSegments = alignTranscriptWithSpeakers(whisperSegments, diarizationSegments);

  // 5. Write transcript
  const transcriptText = formatTranscript(alignedSegments);
  writeFileSync(transcriptPath, transcriptText, "utf-8");
  console.error(`[pipeline] Transcript saved: ${transcriptPath}`);

  // 6. Summarize
  console.error("[pipeline] Generating summary with Claude...");
  try {
    const summaryText = await summarize(config.anthropicApiKey, transcriptText);
    writeFileSync(summaryPath, summaryText, "utf-8");
    console.error(`[pipeline] Summary saved: ${summaryPath}`);
  } catch (err) {
    console.error(`[pipeline] Summarization failed: ${err instanceof Error ? err.message : String(err)}`);
    console.error("[pipeline] Saving transcript without summary");
    writeFileSync(summaryPath, "# Meeting Summary\n\nSummarization failed. See transcript.txt for the full transcript.", "utf-8");
  }

  // 7. Cleanup chunks
  cleanupChunks(state);

  // 8. Done
  state.status = "done";
  saveState(state);

  // 9. Output results
  console.log(JSON.stringify({
    status: "done",
    outputDir,
    files: {
      recording: recordingPath,
      transcript: transcriptPath,
      summary: summaryPath,
    },
  }, null, 2));
}

function cleanupChunks(state: BotState): void {
  for (const chunk of state.recordingChunks) {
    try { unlinkSync(chunk); } catch { /* ignore */ }
  }
}

async function handleJoin(url: string, options: { passcode?: string }): Promise<void> {
  if (stateExists()) {
    const existing = loadState();
    if (existing && existing.status !== "done" && existing.status !== "error") {
      console.error("Error: Already in a meeting. Use 'stop' first or check 'status'.");
      process.exit(1);
    }
    clearState();
  }

  const config = loadConfig();

  // Create output directory
  const dateStr = new Date().toISOString().slice(0, 10);
  const meetingId = deriveMeetingId(url);
  const outputDir = join(config.outputDir, `${dateStr}_${meetingId}`);
  mkdirSync(outputDir, { recursive: true });

  // Start callback server
  const callback = new CallbackServer(config.callbackPort);
  await callback.start();

  // Join meeting
  console.error(`[join] Joining meeting: ${url}`);
  let callId: string;
  try {
    callId = await joinMeeting(config, url);
  } catch (err) {
    await callback.stop();
    console.error(`Error joining meeting: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.error(`[join] Joined with callId: ${callId}`);

  // Save initial state
  const state: BotState = {
    callId,
    meetingUrl: url,
    outputDir,
    startTime: new Date().toISOString(),
    status: "joining",
    recordingChunks: [],
    callbackPort: config.callbackPort,
  };
  saveState(state);

  // Set up recording manager
  const recorder = new RecordingManager(config, callback, state);

  // Wait for call established, then start recording
  callback.on("callEstablished", async () => {
    console.error("[join] Call established, starting recording...");
    await recorder.startRecording();
  });

  // Handle stop request
  const performStop = async (): Promise<{ success: boolean; outputDir?: string; error?: string }> => {
    try {
      recorder.stopRecording();
      console.error("[join] Hanging up...");
      await hangUp(config, state.callId);
      await runPipeline(state, config);
      clearState();
      await callback.stop();
      return { success: true, outputDir: state.outputDir };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      state.status = "error";
      state.error = errorMsg;
      saveState(state);
      await callback.stop();
      return { success: false, error: errorMsg };
    }
  };

  callback.on("stopRequested", async () => {
    console.error("[join] Stop requested via API");
    const result = await performStop();
    callback.emit("pipelineComplete", result);
    process.exit(result.success ? 0 : 1);
  });

  // Handle meeting ended by host
  callback.on("callEnded", async () => {
    console.error("[join] Meeting ended");
    recorder.stopRecording();
    try {
      await runPipeline(state, config);
      clearState();
    } catch (err) {
      console.error(`[pipeline] Error: ${err instanceof Error ? err.message : String(err)}`);
      state.status = "error";
      state.error = err instanceof Error ? err.message : String(err);
      saveState(state);
    }
    await callback.stop();
    process.exit(0);
  });

  // Handle SIGINT/SIGTERM gracefully
  const gracefulShutdown = async () => {
    console.error("\n[join] Shutting down...");
    const result = await performStop();
    process.exit(result.success ? 0 : 1);
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  console.error("[join] Bot is running. Waiting for meeting events...");
}

async function handleStop(): Promise<void> {
  const state = loadState();
  if (!state || state.status === "done" || state.status === "error") {
    console.error("No active meeting session.");
    process.exit(1);
  }

  console.error("[stop] Sending stop signal...");

  try {
    const res = await fetch(`http://localhost:${state.callbackPort}/api/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    const result = await res.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Failed to stop: ${err instanceof Error ? err.message : String(err)}`);
    console.error("The bot process may not be running. Clearing state...");
    clearState();
    process.exit(1);
  }
}

function handleStatus(): void {
  const state = loadState();
  if (!state) {
    console.log(JSON.stringify({ status: "idle" }));
    return;
  }
  console.log(JSON.stringify(state, null, 2));
}

const program = new Command();

program
  .name("meeting-bot")
  .description("Teams meeting recorder, transcriber, and summarizer")
  .version("1.0.0");

program
  .command("join")
  .description("Join a Teams meeting and start recording")
  .requiredOption("--url <url>", "Teams meeting URL")
  .option("--passcode <code>", "Meeting passcode (if required)")
  .action(handleJoin);

program
  .command("stop")
  .description("Stop recording and process the meeting")
  .action(handleStop);

program
  .command("status")
  .description("Show current bot status")
  .action(handleStatus);

program.parse();
