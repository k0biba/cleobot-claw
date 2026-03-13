#!/bin/bash
# Calendar reminder script - runs every 15 min
# Checks for appointments in the next 15-30 minutes

STATE_FILE="/home/cleobot/.openclaw/workspace/memory/heartbeat-state.json"
PASSWORD_FILE="$HOME/.config/caldav/icloud_password"
CALDAV_URL="https://p47-caldav.icloud.com:443/11770963512/calendars/home/"

# Get current time
NOW=$(date -u +%Y%m%dT%H%M%SZ)
NOW_TS=$(date +%s)

# Calculate time range: now to +30min
END_TIME=$(date -u -d "+30 minutes" +%Y%m%dT%H%M%SZ)

# Query calendar
RESPONSE=$(curl -s -X REPORT -u "boerner.jakub@gmail.com:$(cat $PASSWORD_FILE)" \
  -H "Depth: 1" \
  -H "Content-Type: application/xml" \
  -d "<?xml version=\"1.0\" encoding=\"utf-8\"?>
<c:calendar-query xmlns:c=\"urn:ietf:params:xml:ns:caldav\" xmlns:d=\"DAV:\">
  <d:prop><c:calendar-data/></d:prop>
  <c:filter>
    <c:comp-filter name=\"VCALENDAR\">
      <c:comp-filter name=\"VEVENT\">
        <c:time-range start=\"$NOW\" end=\"$END_TIME\"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>" \
  "$CALDAV_URL" 2>/dev/null)

# Parse events and check for reminders needed
# Extract event summaries and start times
echo "$RESPONSE" | grep -oP 'SUMMARY:.*(?=\\r\\n)' | head -1 | cut -d: -f2-

# Check for DTSTART
DTSTART=$(echo "$RESPONSE" | grep -oP 'DTSTART[^:]*:([0-9T]+)' | head -1 | grep -oP '[0-9T]+$')

if [ -n "$DTSTART" ]; then
    # Parse time (handle TZID format)
    # For Europe/Berlin, we need to convert
    EVENT_TIME=$(echo "$DTSTART" | sed 's/T/ /g')
    
    # Get event UID
    UID=$(echo "$RESPONSE" | grep -oP 'UID:.*(?=\\r\\n)' | head -1 | cut -d: -f2-)
    
    # Check if already notified
    if [ -f "$STATE_FILE" ]; then
        NOTIFIED=$(grep -o "\"$UID\": *true" "$STATE_FILE" 2>/dev/null)
    fi
    
    if [ -z "$NOTIFIED" ]; then
        # Calculate minutes until event
        # For simplicity, assume Berlin timezone (+1 or +2 depending on DST)
        # This is a rough check
        
        # Send reminder notification
        echo "REMINDER_NEEDED:$UID"
    fi
fi