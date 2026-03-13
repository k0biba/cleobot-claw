import OpenAI from "openai";
import { createReadStream, statSync } from "node:fs";
import { splitForWhisper } from "./convert.js";
import { dirname } from "node:path";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

const WHISPER_SIZE_LIMIT = 24 * 1024 * 1024; // 24MB

export async function transcribe(
  apiKey: string,
  wavPath: string,
): Promise<TranscriptSegment[]> {
  const client = new OpenAI({ apiKey });

  const fileSize = statSync(wavPath).size;
  let parts: string[];

  if (fileSize > WHISPER_SIZE_LIMIT) {
    console.error(`[transcribe] File ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds 24MB limit, splitting...`);
    parts = splitForWhisper(wavPath, dirname(wavPath));
  } else {
    parts = [wavPath];
  }

  const allSegments: TranscriptSegment[] = [];
  let timeOffset = 0;

  for (const part of parts) {
    const segments = await transcribePart(client, part, timeOffset);
    allSegments.push(...segments);

    // Calculate offset for next part based on last segment end
    if (segments.length > 0) {
      timeOffset = segments[segments.length - 1].end;
    }
  }

  console.error(`[transcribe] ${allSegments.length} segments transcribed`);
  return allSegments;
}

async function transcribePart(
  client: OpenAI,
  filePath: string,
  timeOffset: number,
): Promise<TranscriptSegment[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.audio.transcriptions.create({
        model: "whisper-1",
        file: createReadStream(filePath),
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
      });

      const segments = (response as unknown as { segments?: Array<{ start: number; end: number; text: string }> }).segments ?? [];

      return segments.map((seg) => ({
        start: seg.start + timeOffset,
        end: seg.end + timeOffset,
        text: seg.text.trim(),
      }));
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        console.error("[transcribe] Whisper API failed, retrying...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw new Error(
    `Whisper transcription failed after 2 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}
