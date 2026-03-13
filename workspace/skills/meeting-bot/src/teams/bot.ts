import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MeetingBotConfig } from "../config.js";
import { getToken } from "./auth.js";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/communications/calls";

interface ParsedMeetingInfo {
  threadId: string;
  organizerId: string;
  tenantId: string;
}

export function parseMeetingUrl(url: string): ParsedMeetingInfo {
  // Teams meeting URL format:
  // https://teams.microsoft.com/l/meetup-join/19%3ameeting_...%40thread.v2/0?context=%7b%22Tid%22%3a%22...%22%2c%22Oid%22%3a%22...%22%7d
  const parsed = new URL(url);
  const pathParts = parsed.pathname.split("/");

  // Find the thread ID part (URL-encoded, contains "thread.v2")
  const threadIdEncoded = pathParts.find((p) => p.includes("thread") || p.includes("%40thread"));
  if (!threadIdEncoded) {
    throw new Error("Could not extract threadId from Teams URL. Expected a meetup-join URL.");
  }
  const threadId = decodeURIComponent(threadIdEncoded);

  // Extract context from query parameter (base64 or URL-encoded JSON)
  const contextParam = parsed.searchParams.get("context");
  if (!contextParam) {
    throw new Error("Could not extract context from Teams URL query parameters.");
  }

  let context: { Tid?: string; Oid?: string };
  try {
    // Context is URL-encoded JSON
    context = JSON.parse(contextParam);
  } catch {
    try {
      // Try base64 decode
      context = JSON.parse(Buffer.from(contextParam, "base64").toString("utf-8"));
    } catch {
      throw new Error("Could not parse context parameter from Teams URL.");
    }
  }

  if (!context.Tid || !context.Oid) {
    throw new Error("Teams URL context missing Tid or Oid.");
  }

  return {
    threadId,
    organizerId: context.Oid,
    tenantId: context.Tid,
  };
}

export async function joinMeeting(
  config: MeetingBotConfig,
  meetingUrl: string,
): Promise<string> {
  const token = await getToken(config);
  const { threadId, organizerId, tenantId } = parseMeetingUrl(meetingUrl);

  const body = {
    callbackUri: `${config.callbackBaseUrl}/api/callback`,
    requestedModalities: ["audio"],
    mediaConfig: {
      "@odata.type": "#microsoft.graph.serviceHostedMediaConfig",
    },
    chatInfo: {
      threadId,
      messageId: "0",
    },
    meetingInfo: {
      "@odata.type": "#microsoft.graph.organizerMeetingInfo",
      organizer: {
        user: {
          id: organizerId,
          tenantId,
        },
      },
    },
    tenantId,
  };

  const res = await fetch(GRAPH_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(`Meeting not found (404). Check the meeting URL.`);
    }
    if (res.status === 403) {
      throw new Error(`Not authorized (403). See docs/azure-setup.md for required permissions.`);
    }
    throw new Error(`Failed to join meeting: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function startRecordChunk(config: MeetingBotConfig, callId: string): Promise<void> {
  const token = await getToken(config);

  const body = {
    bargeInAllowed: true,
    maxRecordDurationInSeconds: 120,
    initialSilenceTimeoutInSeconds: 120,
    maxSilenceTimeoutInSeconds: 120,
    playBeep: false,
    stopTones: [],
  };

  const res = await fetch(`${GRAPH_BASE}/${callId}/recordResponse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start recording chunk: ${res.status} ${text}`);
  }
}

export async function downloadChunk(
  recordingLocation: string,
  accessToken: string,
  index: number,
  outputDir: string,
): Promise<string> {
  const res = await fetch(recordingLocation, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download chunk ${index}: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const chunkPath = join(outputDir, `chunk_${String(index).padStart(3, "0")}.wav`);
  writeFileSync(chunkPath, buffer);
  return chunkPath;
}

export async function hangUp(config: MeetingBotConfig, callId: string): Promise<void> {
  const token = await getToken(config);

  const res = await fetch(`${GRAPH_BASE}/${callId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 204 No Content is success, also accept 404 (already ended)
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Failed to hang up: ${res.status} ${text}`);
  }
}
