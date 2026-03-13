---
name: meeting-bot
description: Join Microsoft Teams meetings, record audio, transcribe with Whisper, diarize speakers with pyannote, and summarize with Claude. Use when the user asks to join a Teams meeting, record a meeting, transcribe a call, or get meeting notes. Triggers on requests like "join this Teams meeting", "record this meeting", "transcribe the call", "get meeting summary".
license: MIT
compatibility: Requires Node.js 22+, python3, and ffmpeg. Linux only.
metadata:
  version: "1.0.0"
  openclaw:
    os:
      - linux
    emoji: "\U0001F399"
    requires:
      bins:
        - node
        - python3
        - ffmpeg
---

# Meeting Bot

Join Teams meetings, record audio, transcribe, diarize speakers, and generate summaries via `$SKILL_DIR/dist/index.js`.

## Commands

### Join a meeting

```bash
node "$SKILL_DIR/dist/index.js" join --url "<teams-meeting-url>"
```

The bot joins the Teams meeting, starts recording in looped 2-minute chunks, and waits until the meeting ends or `stop` is called. After stopping, it runs the full pipeline (stitch audio, transcribe, diarize, summarize) and outputs `transcript.txt` and `summary.md`.

### Stop recording

```bash
node "$SKILL_DIR/dist/index.js" stop
```

Signals the running bot to leave the meeting and process the recording. Waits for the pipeline to complete and outputs file paths.

### Check status

```bash
node "$SKILL_DIR/dist/index.js" status
```

Returns JSON with current bot state or `{"status":"idle"}` if no meeting is active.

## How to use this skill

1. When the user provides a Teams meeting URL, extract it from the message
2. Run `join --url <URL>` to start recording
3. The bot runs as a foreground process — it will output progress to stderr
4. When the user says to stop, or the meeting ends, run `stop`
5. Read the generated `summary.md` and present it to the user
6. The transcript is available at `transcript.txt` in the output directory

## Output

Files are saved to `~/openclaw-meetings/YYYY-MM-DD_<meetingId>/`:

| File | Description |
|------|-------------|
| `recording.wav` | Stitched full audio (16kHz mono) |
| `transcript.txt` | Timestamped transcript with speaker labels |
| `summary.md` | Meeting summary with topics, decisions, action items |

## Configuration

Configure in `~/.openclaw/openclaw.json` under `skills.entries["meeting-bot"].config`:

| Key | Env Fallback | Description |
|-----|-------------|-------------|
| `azureTenantId` | `MEETING_BOT_AZURE_TENANT_ID` | Azure AD Tenant ID |
| `azureClientId` | `MEETING_BOT_AZURE_CLIENT_ID` | Azure App Registration Client ID |
| `azureClientSecret` | `MEETING_BOT_AZURE_CLIENT_SECRET` | Azure App Registration Client Secret |
| `callbackBaseUrl` | `MEETING_BOT_CALLBACK_BASE_URL` | Public URL for Graph callbacks (e.g. ngrok) |
| `openaiApiKey` | `OPENAI_API_KEY` | OpenAI API key for Whisper |
| `anthropicApiKey` | `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `hfToken` | `HF_TOKEN` | HuggingFace token for pyannote (optional) |
| `outputDir` | `MEETING_BOT_OUTPUT_DIR` | Output directory (default: ~/openclaw-meetings) |
| `callbackPort` | `MEETING_BOT_CALLBACK_PORT` | Callback server port (default: 3978) |

## Prerequisites

- Azure App Registration with Bot Channel (see `docs/azure-setup.md`)
- ffmpeg installed on the system
- Python 3 with pyannote.audio (optional, for speaker diarization)
- Public callback URL (ngrok for development)

## Critical rules

1. **Never join a meeting without an explicit URL** from the user
2. **Only one meeting at a time** — check status before joining
3. **Always present the summary** to the user after processing completes
4. **pyannote is optional** — the bot works without it (single-speaker fallback)
5. **The bot joins as an external participant** — the meeting host must allow external participants
