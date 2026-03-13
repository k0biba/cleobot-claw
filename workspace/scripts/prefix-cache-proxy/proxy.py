"""
Prefix-Cache-Optimizing Proxy for OpenClaw + LM Studio.

Sits between OpenClaw and the inference server. Reorders system prompt
sections so static content comes first (cacheable prefix), dynamic
content last (invalidates only a small tail).

Architecture:
  OpenClaw Gateway -> this proxy (port 18790) -> LM Studio (port 1234)
"""

import re
import json
import logging
import time
from typing import Any

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

UPSTREAM_URL = "http://localhost:1234"
PROXY_PORT = 18790
LOG_LEVEL = "info"

# ---------------------------------------------------------------------------
# Section classification
# ---------------------------------------------------------------------------

# XML-style tags that appear in OpenClaw system prompts.
# Each tag is mapped to a priority tier:
#   0 = static   (tool defs, rules, instructions — never changes)
#   1 = semi     (workspace files, skills, deferred tools — changes rarely)
#   2 = dynamic  (timestamps, runtime info, commands — changes every request)

TAG_TIERS: dict[str, int] = {
    "functions": 0,
    "function": 0,
    "fast_mode_info": 0,
    "available-deferred-tools": 1,
    "system-reminder": 2,        # will be inspected further
    "local-command-caveat": 2,
    "command-name": 2,
    "command-message": 2,
    "command-args": 2,
    "local-command-stdout": 2,
}

# Patterns inside <system-reminder> that mark it as dynamic.
DYNAMIC_REMINDER_PATTERNS = [
    r"currentDate",
    r"Today's date",
    r"task tools haven't been used",
    r"Exited Plan Mode",
    r"entered plan mode",
]
DYNAMIC_REMINDER_RE = re.compile(
    "|".join(DYNAMIC_REMINDER_PATTERNS), re.IGNORECASE
)

# Pattern to split a system message into tagged blocks and plain-text gaps.
# Matches <tag ...>...</tag> including nested content (non-greedy).
BLOCK_RE = re.compile(
    r"(<(\w[\w-]*)(?:\s[^>]*)?>.*?</\2>)", re.DOTALL
)

log = logging.getLogger("prefix-cache-proxy")

# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------


def classify_block(tag: str, content: str) -> int:
    """Return tier (0=static, 1=semi, 2=dynamic) for a tagged block."""
    base = TAG_TIERS.get(tag, 1)  # unknown tags default to semi-static
    if tag == "system-reminder":
        if DYNAMIC_REMINDER_RE.search(content):
            return 2
        # Skill listings, other semi-static reminders
        return 1
    return base


def split_system_content(text: str) -> tuple[str, str, str]:
    """
    Split a system message into (static, semi_static, dynamic) strings.

    Plain text between tags is classified as static (core instructions).
    """
    # Find all tagged blocks with their positions
    parts: list[tuple[int, str, int, int]] = []  # (tier, text, start, end)

    for m in BLOCK_RE.finditer(text):
        block_text = m.group(1)
        tag = m.group(2)
        tier = classify_block(tag, block_text)
        parts.append((tier, block_text, m.start(), m.end()))

    if not parts:
        # No tagged blocks found — everything is static
        return (text.strip(), "", "")

    # Collect gaps (plain text between/before/after tagged blocks)
    gaps: list[tuple[int, str]] = []
    prev_end = 0
    for _, _, start, end in parts:
        if start > prev_end:
            gap = text[prev_end:start].strip()
            if gap:
                gaps.append((0, gap))  # plain text = static
        prev_end = end
    # trailing text
    if prev_end < len(text):
        trail = text[prev_end:].strip()
        if trail:
            gaps.append((0, trail))

    # Merge everything and bucket by tier
    all_pieces = [(t, txt) for t, txt, _, _ in parts] + gaps
    buckets: dict[int, list[str]] = {0: [], 1: [], 2: []}
    for tier, txt in all_pieces:
        buckets[tier].append(txt)

    return (
        "\n\n".join(buckets[0]),
        "\n\n".join(buckets[1]),
        "\n\n".join(buckets[2]),
    )


def reorder_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Reorder message list for optimal prefix caching:

    1. Collect all system messages, split into static/semi/dynamic.
    2. Emit one system message with [static + semi-static] at the start.
    3. Keep conversation history (user/assistant/tool) in order.
    4. Inject dynamic content as a system message right before the last
       user message, so the entire conversation history is also cacheable.
    """
    # Separate system messages from conversation
    system_parts_static: list[str] = []
    system_parts_semi: list[str] = []
    system_parts_dynamic: list[str] = []
    conversation: list[dict[str, Any]] = []

    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")

        if role == "system" and isinstance(content, str):
            s, semi, d = split_system_content(content)
            if s:
                system_parts_static.append(s)
            if semi:
                system_parts_semi.append(semi)
            if d:
                system_parts_dynamic.append(d)
        else:
            conversation.append(msg)

    # Build the static system message (cached prefix)
    static_content = "\n\n".join(
        system_parts_static + system_parts_semi
    ).strip()

    # Build the dynamic system message (small, appended near the end)
    dynamic_content = "\n\n".join(system_parts_dynamic).strip()

    result: list[dict[str, Any]] = []

    # 1. Static system message first
    if static_content:
        result.append({"role": "system", "content": static_content})

    # 2. Conversation history, but inject dynamic before last user message
    if dynamic_content and conversation:
        # Find the last user message index
        last_user_idx = None
        for i in range(len(conversation) - 1, -1, -1):
            if conversation[i].get("role") == "user":
                last_user_idx = i
                break

        if last_user_idx is not None:
            result.extend(conversation[:last_user_idx])
            result.append({"role": "system", "content": dynamic_content})
            result.extend(conversation[last_user_idx:])
        else:
            # No user message found — append dynamic at end
            result.extend(conversation)
            result.append({"role": "system", "content": dynamic_content})
    else:
        result.extend(conversation)
        if dynamic_content:
            result.append({"role": "system", "content": dynamic_content})

    return result


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="prefix-cache-proxy")
client = httpx.AsyncClient(base_url=UPSTREAM_URL, timeout=600.0)


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    original_count = sum(
        len(m.get("content", "")) for m in messages if isinstance(m.get("content"), str)
    )

    # Reorder for prefix caching
    body["messages"] = reorder_messages(messages)

    reordered_count = sum(
        len(m.get("content", "")) for m in body["messages"] if isinstance(m.get("content"), str)
    )
    n_msgs_before = len(messages)
    n_msgs_after = len(body["messages"])

    log.info(
        "reorder: %d→%d messages, %d chars (preserved), "
        "static prefix should be cacheable",
        n_msgs_before, n_msgs_after, reordered_count,
    )

    # Check if streaming is requested
    stream = body.get("stream", False)

    if stream:
        req = client.build_request(
            "POST",
            "/v1/chat/completions",
            json=body,
            headers={"content-type": "application/json"},
        )
        upstream = await client.send(req, stream=True)

        async def stream_response():
            async for chunk in upstream.aiter_bytes():
                yield chunk
            await upstream.aclose()

        return StreamingResponse(
            stream_response(),
            status_code=upstream.status_code,
            media_type="text/event-stream",
            headers=dict(upstream.headers),
        )
    else:
        resp = await client.post("/v1/chat/completions", json=body)
        return JSONResponse(content=resp.json(), status_code=resp.status_code)


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_passthrough(request: Request, path: str):
    """Pass through all other endpoints unchanged."""
    body = await request.body()
    resp = await client.request(
        method=request.method,
        url=f"/{path}",
        content=body,
        headers={
            k: v for k, v in request.headers.items()
            if k.lower() not in ("host", "content-length")
        },
    )
    return JSONResponse(content=resp.json(), status_code=resp.status_code)


@app.on_event("shutdown")
async def shutdown():
    await client.aclose()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL.upper()),
        format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
    )
    log.info("Starting prefix-cache-proxy on :%d → %s", PROXY_PORT, UPSTREAM_URL)
    uvicorn.run(app, host="127.0.0.1", port=PROXY_PORT, log_level=LOG_LEVEL)
