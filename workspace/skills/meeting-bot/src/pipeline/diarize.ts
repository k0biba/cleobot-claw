import { execFile } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { TranscriptSegment } from "./transcribe.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIDECAR_DIR = join(__dirname, "..", "..", "sidecar");
const DIARIZE_SCRIPT = join(SIDECAR_DIR, "diarize.py");
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface DiarizationSegment {
  speaker: string;
  start: number;
  end: number;
}

export interface AlignedSegment {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export async function diarize(
  wavPath: string,
  hfToken: string | null,
): Promise<DiarizationSegment[] | null> {
  if (!hfToken) {
    console.error("[diarize] No HF_TOKEN configured, skipping diarization (single-speaker fallback)");
    return null;
  }

  return new Promise((resolve) => {
    const env = { ...process.env, HF_TOKEN: hfToken };

    const proc = execFile(
      "python3",
      [DIARIZE_SCRIPT, wavPath],
      { env, timeout: TIMEOUT_MS, maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`[diarize] Diarization failed (graceful fallback): ${error.message}`);
          if (stderr) console.error(`[diarize] stderr: ${stderr}`);
          resolve(null);
          return;
        }

        try {
          const segments = JSON.parse(stdout) as DiarizationSegment[];
          console.error(`[diarize] ${segments.length} speaker segments found`);
          resolve(segments);
        } catch (parseErr) {
          console.error(`[diarize] Failed to parse output: ${parseErr}`);
          resolve(null);
        }
      },
    );

    // Handle process-level errors
    proc.on("error", (err) => {
      console.error(`[diarize] Process error: ${err.message}`);
      resolve(null);
    });
  });
}

export function alignTranscriptWithSpeakers(
  transcript: TranscriptSegment[],
  diarization: DiarizationSegment[] | null,
): AlignedSegment[] {
  if (!diarization || diarization.length === 0) {
    return transcript.map((seg) => ({
      ...seg,
      speaker: "Speaker 1",
    }));
  }

  // Build speaker name mapping: SPEAKER_00 → Speaker 1, etc.
  const speakerIds = [...new Set(diarization.map((d) => d.speaker))].sort();
  const speakerMap = new Map<string, string>();
  speakerIds.forEach((id, i) => {
    speakerMap.set(id, `Speaker ${i + 1}`);
  });

  return transcript.map((seg) => {
    // Find diarization segment with greatest temporal overlap
    let bestSpeaker = "Speaker 1";
    let bestOverlap = 0;

    for (const dSeg of diarization) {
      const overlapStart = Math.max(seg.start, dSeg.start);
      const overlapEnd = Math.min(seg.end, dSeg.end);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestSpeaker = speakerMap.get(dSeg.speaker) ?? "Speaker 1";
      }
    }

    return {
      ...seg,
      speaker: bestSpeaker,
    };
  });
}
