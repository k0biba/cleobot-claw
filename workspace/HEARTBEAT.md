# HEARTBEAT.md

Bei jedem Heartbeat folgende Checks durchführen:

## 1. Email-Scan-Check (alle 15 Min via Cron)
Wenn System-Event `EMAIL_SCAN_CHECK` empfangen wird:
1. Email-Scanner Script ausfuehren (siehe email-scanner Skill)
2. Fuer jede neue Email pruefen: Enthaelt sie einen Termin?
3. Falls ja: Kalender-Duplikatcheck nur ausfuehren, wenn eine Kalender-Anbindung vorhanden ist
4. Falls kein Duplikat gefunden wird: Nachricht mit Termin-Details senden und nachfragen, ob eingetragen werden soll
5. Pending-Appointment in `.state/pending-appointments.json` speichern
6. Nur melden, wenn tatsaechlich neue Termine gefunden — sonst still bleiben

## 2. Tracking
Letzten Check in `memory/heartbeat-state.json` speichern.

## 3. Quiet Hours
- 23:00–08:00 Uhr: nichts proaktiv senden
- Sonst: HEARTBEAT_OK
