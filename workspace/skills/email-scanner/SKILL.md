---
name: email-scanner
description: Scan a Gmail inbox via IMAP for appointment emails, detect dates/times, check for calendar duplicates, and propose new entries via Telegram.
metadata: {"clawdbot":{"emoji":"📧","os":["linux"],"requires":{"bins":["python3","curl"]}}}
---

# Email-Scanner Skill

Scans a dedicated Gmail mailbox for emails containing appointments (doctor confirmations, bookings, invitations, etc.) and proposes calendar entries via Telegram.

## How It Works

1. A Python script fetches new emails via IMAP
2. The agent (you) reads each email and decides if it contains an appointment
3. If yes: check CalDAV for duplicates, then notify via Telegram
4. User confirms → agent creates the CalDAV event

## 1. Fetching Emails

Run the fetch script from the skill directory:

```bash
python3 /home/cleobot/.openclaw/workspace/skills/email-scanner/scripts/fetch-emails.py \
  --user "<EMAIL>" \
  --password-file ~/.config/email/gmail_app_password \
  --since "$(date -d '2 days ago' +%Y-%m-%d)" \
  --state-file /home/cleobot/.openclaw/workspace/skills/email-scanner/.state/processed.json
```

The `--user` and server config come from `openclaw.json` → `skills.entries.email-scanner.config`.

Output: JSON-Lines, one line per new (unprocessed) email:
```json
{"uid": "12345", "subject": "Terminbestätigung", "from": "praxis@example.com", "date": "2026-02-23T14:30:00", "body": "Sehr geehrter Herr ..."}
```

If no new emails, the script outputs nothing.

## 2. Appointment Detection

For each email, decide: **Does this contain a concrete appointment with a date/time?**

### YES — likely contains an appointment:
- Doctor/dentist appointment confirmations (Terminbestätigung, Terminreservierung)
- Travel/hotel/flight bookings with dates
- Meeting invitations with time and place
- University exam dates, seminar schedules
- Service appointments (Handwerker, Liefertermin with time window)
- Event tickets with date/time

### NO — ignore these:
- Newsletters, marketing, promotional emails
- Password resets, verification codes
- Order confirmations without appointments (Paketversand without delivery window)
- Social media notifications
- Bank statements, invoices without due dates requiring attendance
- General correspondence without specific appointment times

### Extract from appointment emails:
- **summary**: Short title (e.g. "Zahnarzt Dr. Mueller")
- **date**: YYYY-MM-DD
- **startTime**: HH:MM (use best guess if only date given, e.g. "08:00" for morning appointments)
- **endTime**: HH:MM (estimate 1h if not specified)
- **location**: Address or place name if mentioned
- **suggestedCalendar**: Pick from available calendars (Privat, Arbeit, Sport, Uni, Psychotherapie, Arzt) based on context

## 3. Calendar Duplicate Check

Before notifying the user, check if this appointment already exists in the calendar. Use a CalDAV REPORT query for the appointment date across all calendars:

```bash
curl -s -X REPORT -u "boerner.jakub@gmail.com:$(cat ~/.config/caldav/icloud_password)" \
  -H "Depth: 1" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:d="DAV:">
  <d:prop><c:calendar-data/></d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="YYYYMMDDT000000Z" end="YYYYMMDDT235959Z"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>' \
  "https://p47-caldav.icloud.com:443/11770963512/calendars/CALENDAR_PATH/"
```

Replace `YYYYMMDD` with the appointment date and `CALENDAR_PATH` with each calendar path from TOOLS.md.

**Duplicate criteria:** An event on the same day with a similar summary (fuzzy match — "Zahnarzt" matches "Zahnarzt Dr. Mueller") means it's already tracked. Skip silently.

## 4. Telegram Notification

If the appointment is new (no duplicate), send a Telegram message:

```
📧 Neuer Termin gefunden (Email von <sender>):

  <summary>
  <DD.MM.YYYY>, <HH:MM>-<HH:MM>
  <location>

Soll ich den in den Kalender (<suggestedCalendar>) eintragen?
```

## 5. Pending Appointments

After notifying, save the appointment to `.state/pending-appointments.json`:

```json
{
  "pending": [
    {
      "id": "<random-uuid>",
      "emailUid": "12345",
      "summary": "Zahnarzt Dr. Mueller",
      "date": "2026-02-28",
      "startTime": "10:00",
      "endTime": "11:00",
      "location": "Praxis Mueller, Berliner Str. 15",
      "suggestedCalendar": "Arzt",
      "notifiedAt": "2026-02-23T16:00:00Z"
    }
  ]
}
```

The file path: `/home/cleobot/.openclaw/workspace/skills/email-scanner/.state/pending-appointments.json`

## 6. Confirmation Flow

When the user responds "Ja" (or similar affirmative) to a pending appointment notification:

1. Read `pending-appointments.json`
2. Find the matching pending entry
3. Create the CalDAV event via `curl PUT`:

```bash
curl -s -X PUT \
  -u "boerner.jakub@gmail.com:$(cat ~/.config/caldav/icloud_password)" \
  -H "Content-Type: text/calendar; charset=utf-8" \
  -d 'BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cleo//Email-Scanner//EN
BEGIN:VEVENT
UID:<random-uuid>@cleo
DTSTART:<YYYYMMDD>T<HHMM>00
DTEND:<YYYYMMDD>T<HHMM>00
SUMMARY:<summary>
LOCATION:<location>
DESCRIPTION:Aus Email erstellt (UID: <emailUid>)
END:VEVENT
END:VCALENDAR' \
  "https://p47-caldav.icloud.com:443/11770963512/calendars/<CALENDAR_PATH>/<event-uid>.ics"
```

Calendar paths (from TOOLS.md):
| Name | Path |
|------|------|
| Privat | home |
| Arbeit | work |
| Sport | 3D43AA37-1581-46FB-95E1-721C59890961 |
| Uni | 5A673322-A386-48C4-9978-AE28B43F60C8 |
| Psychotherapie | 03525301-C15A-4CF5-BCB6-749F64C35D60 |
| Arzt | 65DBAE2E-6EB3-447E-A1E5-C6FEF337B6BD |

4. Remove the entry from `pending-appointments.json`
5. Confirm via Telegram: "Termin eingetragen: <summary> am <date>"

## 7. Handling EMAIL_SCAN_CHECK Events

When receiving the `EMAIL_SCAN_CHECK` system event (cron, every 15 min):

1. Run the fetch script (see section 1)
2. For each new email: detect appointment (section 2)
3. If appointment found: duplicate check (section 3)
4. If no duplicate: Telegram notification (section 4) + save pending (section 5)
5. If no new appointments found: **stay silent** (no message)

## Notes

- Body is truncated to ~2000 chars by the script — enough for appointment detection
- The state file tracks processed UIDs to avoid re-scanning
- UIDs older than 7 days are automatically cleaned from state
- Pending appointments without user response can be cleaned up after a reasonable time (e.g. 14 days)
