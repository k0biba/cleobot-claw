import { execFileSync, execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";

export function stitchChunks(chunkPaths: string[], outputPath: string): void {
  if (chunkPaths.length === 0) {
    throw new Error("No recording chunks to stitch");
  }

  if (chunkPaths.length === 1) {
    // Single chunk: just convert to 16kHz mono
    execFileSync("ffmpeg", [
      "-y", "-i", chunkPaths[0],
      "-ar", "16000", "-ac", "1", "-f", "wav",
      outputPath,
    ], { stdio: "pipe" });
    return;
  }

  // Multiple chunks: use ffmpeg concat demuxer
  const concatListPath = join(dirname(outputPath), "concat_list.txt");
  const concatContent = chunkPaths.map((p) => `file '${p}'`).join("\n");
  writeFileSync(concatListPath, concatContent, "utf-8");

  try {
    execFileSync("ffmpeg", [
      "-y", "-f", "concat", "-safe", "0",
      "-i", concatListPath,
      "-ar", "16000", "-ac", "1", "-f", "wav",
      outputPath,
    ], { stdio: "pipe" });
  } finally {
    try { unlinkSync(concatListPath); } catch { /* ignore */ }
  }

  console.error(`[convert] Stitched ${chunkPaths.length} chunks → ${outputPath}`);
}

export function splitForWhisper(inputPath: string, outputDir: string, maxDurationSec = 600): string[] {
  // Get duration
  const durationStr = execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`,
    { encoding: "utf-8" },
  ).trim();
  const totalDuration = parseFloat(durationStr);

  if (totalDuration <= maxDurationSec) {
    return [inputPath];
  }

  const parts: string[] = [];
  let offset = 0;
  let index = 0;

  while (offset < totalDuration) {
    const partPath = join(outputDir, `whisper_part_${String(index).padStart(3, "0")}.wav`);
    execFileSync("ffmpeg", [
      "-y", "-i", inputPath,
      "-ss", String(offset),
      "-t", String(maxDurationSec),
      "-ar", "16000", "-ac", "1", "-f", "wav",
      partPath,
    ], { stdio: "pipe" });
    parts.push(partPath);
    offset += maxDurationSec;
    index++;
  }

  console.error(`[convert] Split into ${parts.length} parts for Whisper`);
  return parts;
}
