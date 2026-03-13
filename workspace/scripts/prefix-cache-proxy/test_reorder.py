"""Quick smoke test for the reorder logic."""

from proxy import split_system_content, reorder_messages

# --- Test split_system_content ---

SYSTEM_PROMPT = """You are an assistant. Follow these rules carefully.

<functions>
<function>{"name": "Bash", "description": "Run commands"}</function>
<function>{"name": "Read", "description": "Read files"}</function>
</functions>

Important safety instructions go here. Never do X, always do Y.

<available-deferred-tools>
WebFetch
WebSearch
TaskCreate
</available-deferred-tools>

<system-reminder>
# currentDate
Today's date is 2026-03-13.
</system-reminder>

<system-reminder>
The following skills are available:
- commit: Create git commits
- review-pr: Review pull requests
</system-reminder>

<local-command-caveat>Messages below were generated locally.</local-command-caveat>
<command-name>/clear</command-name>
<command-message>clear</command-message>
<command-args></command-args>
<local-command-stdout></local-command-stdout>"""

static, semi, dynamic = split_system_content(SYSTEM_PROMPT)

print("=== STATIC (tier 0) ===")
print(static[:200], "..." if len(static) > 200 else "")
print(f"\n  [{len(static)} chars]")

print("\n=== SEMI-STATIC (tier 1) ===")
print(semi[:200], "..." if len(semi) > 200 else "")
print(f"\n  [{len(semi)} chars]")

print("\n=== DYNAMIC (tier 2) ===")
print(dynamic[:300], "..." if len(dynamic) > 300 else "")
print(f"\n  [{len(dynamic)} chars]")

# --- Test reorder_messages ---

messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": "Check my email"},
    {"role": "assistant", "content": "You have 3 unread emails."},
    {"role": "user", "content": "What about the calendar?"},
]

reordered = reorder_messages(messages)

print("\n\n=== REORDERED MESSAGES ===")
for i, msg in enumerate(reordered):
    role = msg["role"]
    content = msg["content"]
    preview = content[:80].replace("\n", "\\n")
    print(f"  [{i}] {role:10s} ({len(content):5d} chars): {preview}...")

print(f"\nOriginal: {len(messages)} messages")
print(f"Reordered: {len(reordered)} messages")
print(f"Expected: system(static) → user → assistant → system(dynamic) → user")
