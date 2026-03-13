#!/usr/bin/env python3
"""Speaker diarization using pyannote.audio.

Usage: python3 diarize.py <wav_path>

Requires HF_TOKEN environment variable for pyannote model access.
Outputs JSON to stdout: [{"speaker": "SPEAKER_00", "start": 1.234, "end": 5.678}, ...]

Exit codes:
  0 - Success
  1 - Usage error
  2 - Import error (pyannote not installed)
"""

import json
import os
import sys


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 diarize.py <wav_path>", file=sys.stderr)
        sys.exit(1)

    wav_path = sys.argv[1]

    if not os.path.exists(wav_path):
        print(f"Error: File not found: {wav_path}", file=sys.stderr)
        sys.exit(1)

    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        from pyannote.audio import Pipeline
    except ImportError:
        print(
            "Error: pyannote.audio not installed. "
            "Install with: pip install pyannote.audio>=3.1.0 torch>=2.0.0",
            file=sys.stderr,
        )
        sys.exit(2)

    try:
        import torch

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}", file=sys.stderr)

        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=hf_token,
        )
        pipeline = pipeline.to(device)

        diarization = pipeline(wav_path)

        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append(
                {
                    "speaker": speaker,
                    "start": round(turn.start, 3),
                    "end": round(turn.end, 3),
                }
            )

        json.dump(segments, sys.stdout)
        print()  # newline after JSON

    except Exception as e:
        print(f"Error during diarization: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
