# TOOLS.md — Local Notes

## Sport-Kalender (CalDAV, read-only)

- **Email:** boerner.jakub@gmail.com
- **CalDAV URL:** https://caldav.icloud.com/
- **Calendar Home:** https://p47-caldav.icloud.com:443/11770963512/calendars/
- **Password file:** ~/.config/caldav/sport_agent_password
- **Kalender:** Sport (`3D43AA37-1581-46FB-95E1-721C59890961`) — NUR dieser Kalender
- **Zugriff:** Read-only. Keine Events erstellen oder aendern.

### Nutzung

```bash
# Sync nur Sport-Kalender
vdirsyncer sync sport_calendar

# Anstehende Sport-Events
khal list -a Sport today 7d

# Suche
khal search -a Sport "Laufen"
```

### Automatische Post-Training-Nachfrage

Wenn ein Sport-Kalender-Event endet:
1. ~30-60 Min nach Event-Ende
2. "Wie war's beim [Aktivitaet]?"
3. Post-Training-Modus starten

### Wichtig

- **NUR** den Sport-Kalender lesen — Privat, Arbeit, Uni, Psychotherapie, Arzt sind NICHT zugaenglich
- Selbst wenn Timo spaeter Zugang bekommt, sieht er nur Sport-Kalender-Daten
