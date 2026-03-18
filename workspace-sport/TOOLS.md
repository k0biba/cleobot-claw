# TOOLS.md — Local Notes

## Sport-Kalender (CalDAV, read-write)

- **Email:** boerner.jakub@gmail.com
- **CalDAV URL:** https://caldav.icloud.com/
- **Calendar Home:** https://p47-caldav.icloud.com:443/11770963512/calendars/
- **Password file:** ~/.config/caldav/sport_agent_password
- **Kalender:** Sport (`3D43AA37-1581-46FB-95E1-721C59890961`) — NUR dieser Kalender
- **Zugriff:** Read-write. Events lesen UND erstellen/aendern — aber ausschliesslich im Sport-Kalender.

### Nutzung

```bash
# Sync nur Sport-Kalender
vdirsyncer sync sport_calendar

# Anstehende Sport-Events
khal list -a Sport today 7d

# Suche
khal search -a Sport "Laufen"

# Event erstellen (nur im Sport-Kalender!)
khal new -a Sport 2026-03-20 18:00 19:00 "Laufen"
khal new -a Sport tomorrow 17:00 18:30 "Krafttraining" :: Fokus: Oberkörper
vdirsyncer sync sport_calendar
```

### Wann Events erstellen

- User plant eine Sporteinheit ("Ich will morgen laufen")
- User vereinbart einen Trainings-Termin
- Immer **-a Sport** verwenden — nie in andere Kalender schreiben
- Nach dem Erstellen immer `vdirsyncer sync sport_calendar`

### Automatische Post-Training-Nachfrage

Wenn ein Sport-Kalender-Event endet:
1. ~30-60 Min nach Event-Ende
2. "Wie war's beim [Aktivitaet]?"
3. Post-Training-Modus starten

### Wichtig

- **NUR** den Sport-Kalender nutzen — Privat, Arbeit, Uni, Psychotherapie, Arzt sind NICHT zugaenglich
- Selbst wenn Timo spaeter Zugang bekommt, sieht er nur Sport-Kalender-Daten
