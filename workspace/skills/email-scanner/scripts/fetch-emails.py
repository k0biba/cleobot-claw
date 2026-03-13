#!/usr/bin/env python3
"""Fetch new emails from Gmail via IMAP. Output JSON-Lines (one per new email)."""

import argparse
import email
import email.header
import email.utils
import imaplib
import json
import os
import sys
from datetime import datetime, timedelta, timezone


def decode_header(raw):
    """Decode an email header value into a plain string."""
    if raw is None:
        return ""
    parts = email.header.decode_header(raw)
    decoded = []
    for data, charset in parts:
        if isinstance(data, bytes):
            decoded.append(data.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(data)
    return " ".join(decoded)


def extract_text_body(msg, max_len=2000):
    """Extract plain-text body from an email message, truncated to max_len."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            if ct == "text/plain" and not part.get("Content-Disposition", "").startswith("attachment"):
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    body = payload.decode(charset, errors="replace")
                    break
        # Fallback to text/html if no plain text found
        if not body:
            for part in msg.walk():
                ct = part.get_content_type()
                if ct == "text/html" and not part.get("Content-Disposition", "").startswith("attachment"):
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        body = payload.decode(charset, errors="replace")
                        break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            body = payload.decode(charset, errors="replace")

    return body[:max_len]


def load_state(path):
    """Load state file; return default if missing or invalid."""
    if not path or not os.path.exists(path):
        return {"version": 1, "lastScanAt": None, "processedUids": {}}
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {"version": 1, "lastScanAt": None, "processedUids": {}}


def save_state(path, state):
    """Atomically write state file."""
    if not path:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, path)


def prune_old_uids(state, max_age_days=7):
    """Remove UIDs older than max_age_days from state."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=max_age_days)).isoformat()
    state["processedUids"] = {
        uid: ts for uid, ts in state["processedUids"].items()
        if ts >= cutoff
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch new emails via IMAP")
    parser.add_argument("--user", required=True, help="IMAP username (email address)")
    parser.add_argument("--password-file", required=True, help="Path to file containing password")
    parser.add_argument("--since", required=True, help="Fetch emails since this date (YYYY-MM-DD)")
    parser.add_argument("--state-file", required=True, help="Path to processed UIDs state file")
    parser.add_argument("--server", default="imap.gmail.com", help="IMAP server hostname")
    parser.add_argument("--port", type=int, default=993, help="IMAP server port")
    args = parser.parse_args()

    # Read password
    try:
        with open(os.path.expanduser(args.password_file), "r") as f:
            password = f.read().strip()
    except FileNotFoundError:
        print(f"Error: password file not found: {args.password_file}", file=sys.stderr)
        sys.exit(1)

    # Load state
    state_path = os.path.expanduser(args.state_file)
    state = load_state(state_path)
    known_uids = set(state["processedUids"].keys())

    # Connect to IMAP
    try:
        conn = imaplib.IMAP4_SSL(args.server, args.port)
        conn.login(args.user, password)
    except imaplib.IMAP4.error as e:
        print(f"Error: IMAP login failed: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        conn.select("INBOX", readonly=True)

        # Search for emails since the given date
        # IMAP date format: DD-Mon-YYYY
        since_dt = datetime.strptime(args.since, "%Y-%m-%d")
        imap_date = since_dt.strftime("%d-%b-%Y")
        status, data = conn.search(None, f'(SINCE "{imap_date}")')

        if status != "OK" or not data[0]:
            # No emails found
            state["lastScanAt"] = datetime.now(timezone.utc).isoformat()
            prune_old_uids(state)
            save_state(state_path, state)
            return

        msg_nums = data[0].split()
        new_uids = []

        for num in msg_nums:
            # Fetch UID and full message
            status, uid_data = conn.fetch(num, "(UID)")
            if status != "OK":
                continue
            # Parse UID from response like b'1 (UID 12345)'
            uid_str = uid_data[0].decode()
            uid = uid_str.split("UID")[1].strip().rstrip(")")
            uid = uid.strip()

            if uid in known_uids:
                continue

            # Fetch full message
            status, msg_data = conn.fetch(num, "(RFC822)")
            if status != "OK" or not msg_data[0]:
                continue

            raw = msg_data[0][1]
            msg = email.message_from_bytes(raw)

            subject = decode_header(msg.get("Subject"))
            from_addr = decode_header(msg.get("From"))
            date_str = msg.get("Date", "")

            # Parse date to ISO format
            parsed_date = email.utils.parsedate_to_datetime(date_str) if date_str else None
            iso_date = parsed_date.isoformat() if parsed_date else ""

            body = extract_text_body(msg)

            record = {
                "uid": uid,
                "subject": subject,
                "from": from_addr,
                "date": iso_date,
                "body": body,
            }
            print(json.dumps(record, ensure_ascii=False))

            new_uids.append(uid)

        # Update state
        now = datetime.now(timezone.utc).isoformat()
        state["lastScanAt"] = now
        for uid in new_uids:
            state["processedUids"][uid] = now

        prune_old_uids(state)
        save_state(state_path, state)

    finally:
        try:
            conn.close()
        except Exception:
            pass
        conn.logout()


if __name__ == "__main__":
    main()
