---
name: sport-calendar
description: Sport-Kalender via CalDAV (iCloud). Lesen und Schreiben von Sport-Events mit vdirsyncer + khal. NUR der Sport-Kalender — kein Zugriff auf andere Kalender.
metadata: {"clawdbot":{"requires":{"bins":["vdirsyncer","khal"]}}}
---

# Sport-Kalender (CalDAV)

**vdirsyncer** syncs den Sport-Kalender zu lokalen `.ics`-Dateien. **khal** liest und schreibt sie.

## Wichtig: Scope-Beschraenkung

Dieser Skill hat **ausschliesslich** Zugriff auf den Sport-Kalender:
- **Kalender-Name:** Sport
- **Kalender-ID:** `3D43AA37-1581-46FB-95E1-721C59890961`
- **IMMER** `-a Sport` bei allen khal-Befehlen verwenden
- **NIE** andere Kalender abfragen oder beschreiben (Privat, Arbeit, Uni, Psychotherapie, Arzt)

## Sync

Immer vor dem Lesen syncen, und nach dem Schreiben:
```bash
vdirsyncer sync sport_calendar
```

## Events lesen

```bash
khal list -a Sport                          # Heute
khal list -a Sport today 7d                 # Naechste 7 Tage
khal list -a Sport tomorrow                 # Morgen
khal list -a Sport 2026-03-20 2026-03-27    # Datumsbereich
```

## Events suchen

```bash
khal search -a Sport "Laufen"
khal search -a Sport "Krafttraining" --format "{start-date} {start-time} {title}"
```

## Events erstellen

```bash
khal new -a Sport 2026-03-20 18:00 19:00 "Laufen"
khal new -a Sport tomorrow 17:00 18:30 "Krafttraining"
khal new -a Sport 2026-03-22 "Ruhetag"                          # Ganztaegig
khal new -a Sport 2026-03-20 18:00 19:30 "Laufen" :: Fokus: Tempo
vdirsyncer sync sport_calendar
```

Nach dem Erstellen immer syncen.

## Events aendern

`khal edit` ist interaktiv (braucht TTY):
```bash
khal edit -a Sport "Laufen"
```

Menuepunkte: `s` (Titel), `d` (Beschreibung), `t` (Zeit), `l` (Ort), `D` (loeschen), `n` (weiter), `q` (beenden).

Nach dem Aendern syncen:
```bash
vdirsyncer sync sport_calendar
```

## Ausgabeformat (fuer Scripting)

```bash
khal list -a Sport --format "{start-date} {start-time}-{end-time} {title}" today 7d
khal list -a Sport --format "{uid} | {title} | {start-date} {start-time}" today 14d
```

Platzhalter: `{title}`, `{description}`, `{start}`, `{end}`, `{start-date}`, `{start-time}`, `{end-date}`, `{end-time}`, `{location}`, `{calendar}`, `{uid}`

## Use Cases im Sport-Agent

### Sporteinheit planen
User: "Ich will morgen um 18 Uhr laufen gehen"
```bash
vdirsyncer sync sport_calendar
khal new -a Sport tomorrow 18:00 19:00 "Laufen"
vdirsyncer sync sport_calendar
```

### Anstehende Trainings pruefen
Fuer Pre-Training-Vorbereitung oder Weekly Review:
```bash
vdirsyncer sync sport_calendar
khal list -a Sport today 7d
```

### Post-Training-Trigger
Wenn ein Event in der Vergangenheit liegt (~30-60 Min nach Ende): automatische Nachfrage "Wie war's beim [Aktivitaet]?" und Post-Training-Modus starten.

## Cache

Bei veralteten Daten nach Sync:
```bash
rm ~/.local/share/khal/khal.db
vdirsyncer sync sport_calendar
```
