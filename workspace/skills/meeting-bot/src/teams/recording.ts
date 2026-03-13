import type { MeetingBotConfig } from "../config.js";
import type { BotState } from "../state.js";
import { saveState } from "../state.js";
import { startRecordChunk, downloadChunk } from "./bot.js";
import type { CallbackServer, RecordingCompletedEvent } from "./callback.js";

const MAX_RETRY = 3;
const RETRY_DELAY_MS = 2000;

export class RecordingManager {
  private config: MeetingBotConfig;
  private callback: CallbackServer;
  private state: BotState;
  private isRecording = false;
  private chunkIndex = 0;

  constructor(config: MeetingBotConfig, callback: CallbackServer, state: BotState) {
    this.config = config;
    this.callback = callback;
    this.state = state;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.callback.on("recordingCompleted", async (event: RecordingCompletedEvent) => {
      try {
        await this.handleChunkCompleted(event);
      } catch (err) {
        console.error("[recording] Error handling completed chunk:", err);
      }
    });
  }

  private async handleChunkCompleted(event: RecordingCompletedEvent): Promise<void> {
    const { recordingLocation, recordingAccessToken } = event;

    // Download with retries
    let chunkPath: string | null = null;
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      try {
        chunkPath = await downloadChunk(
          recordingLocation,
          recordingAccessToken,
          this.chunkIndex,
          this.state.outputDir,
        );
        break;
      } catch (err) {
        console.error(`[recording] Download attempt ${attempt + 1}/${MAX_RETRY} failed:`, err);
        if (attempt < MAX_RETRY - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        }
      }
    }

    if (chunkPath) {
      this.state.recordingChunks.push(chunkPath);
      this.chunkIndex++;
      saveState(this.state);
      console.error(`[recording] Chunk ${this.chunkIndex} saved: ${chunkPath}`);
    } else {
      console.error(`[recording] WARNING: Failed to download chunk ${this.chunkIndex} after ${MAX_RETRY} attempts, skipping`);
      this.chunkIndex++;
    }

    // Start next chunk if still recording
    if (this.isRecording) {
      await this.startNextChunk();
    }
  }

  private async startNextChunk(): Promise<void> {
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      try {
        await startRecordChunk(this.config, this.state.callId);
        return;
      } catch (err) {
        console.error(`[recording] Start chunk attempt ${attempt + 1}/${MAX_RETRY} failed:`, err);
        if (attempt < MAX_RETRY - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        } else {
          console.error("[recording] Failed to start recording chunk after retries");
          this.state.status = "error";
          this.state.error = `Recording failed: ${err instanceof Error ? err.message : String(err)}`;
          saveState(this.state);
        }
      }
    }
  }

  async startRecording(): Promise<void> {
    this.isRecording = true;
    this.state.status = "recording";
    saveState(this.state);
    await this.startNextChunk();
  }

  stopRecording(): void {
    this.isRecording = false;
  }
}
