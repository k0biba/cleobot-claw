---
name: briefing
description: Tages-Briefing mit Kalender, Todos und Vorsätzen. Morgens automatisch per Cron oder manuell per /briefing. Triggers on "briefing", "was steht an", "Tagesüberblick".
metadata: {"clawdbot":{"emoji":"☀️","os":["macos","linux"],"requires":{"bins":["khal","vdirsyncer"]}}}
---

# Tages-Briefing

## Daten sammeln

Drei Quellen, in dieser Reihenfolge:

1. **Kalender:** `vdirsyncer sync`, dann `khal list today` (bzw. `khal list tomorrow` abends). Bei Fehler: Briefing trotzdem senden, "Keine Kalenderdaten verfügbar" notieren.
2. **Todos:** `TODO.md` lesen. Offene Items (`- [ ]`) extrahieren, nach Datum gruppieren. Erledigte (`[x]`) auslassen.
3. **Vorsätze:** `VORSAETZE.md` lesen, heutiges Datum suchen (bzw. morgiges Datum abends). Immer anzeigen wenn vorhanden.

## Zeitabhängige Variante

Aktuelle Uhrzeit per `date +%H` bestimmen.

- **Morgens (vor 11:00):** Vorausschauend. "Guten Morgen." → Termine heute, Vorsätze heute, Todos
- **Tagsüber (11:00–17:00):** Status-Update. "Stand der Dinge." → Restliche Termine heute, Vorsätze heute, offene Todos
- **Abends (nach 17:00):** Blick auf morgen. "Blick auf morgen." → Termine morgen, Todos morgen, Vorsätze morgen (falls vorhanden)

## Darstellung

### Gesamtstruktur

```
Guten Morgen.

📅 Termine heute
  09:00–10:00  Zahnarzt Dr. Müller (Praxis Müller)
  14:00–15:30  Team-Sync
  [oder: "Keine Termine heute."]

🔔 Vorsätze
  [komprimiert, oder Sektion weglassen]

📋 Offene Todos
  [gruppiert nach Datum]
```

Max. 25 Zeilen. Knapp, scannbar, kein Report.

### Todos

```
📋 Offene Todos

Heute (Fr, 13.03.):
  · Retouren wegbringen (Hermes + DHL, dort Sendung abholen)
  · Hose zum Schneider (Knopf)
  · Pflanzen gießen

⚠ Überfällig (seit 23.02.):
  · Wohnung aufräumen (~2h)
  · Steuerabrechnung USt Q3/Q4
```

- Heute zuerst, dann überfällige gruppiert nach Datum
- Sub-Tasks in Klammern komprimiert (nicht verschachtelt)
- Erledigte (`[x]`) werden ausgelassen
- ⚠-Marker für überfällige Items

### Vorsätze

```
🔔 Vorsätze

Nicht direkt Zigarette nach dem Aufstehen.
→ kalt duschen · 5 Min Yoga · 10 Min lesen
```

- VOR den Todos platziert (Vorsätze = Haltung, Todos = Aufgaben)
- Komprimiert auf 1–2 Zeilen, keine verschachtelten Bullets
- Kein Motivationssprech, nur knapp spiegeln
- Sektion weglassen wenn keine Vorsätze für den relevanten Tag existieren

## Regeln

- Keine Einleitung, keine Nachfrage. Direkt das Briefing ausgeben.
- Deutsch, Duzen.
- Keine Emojis im Fließtext, nur die Sektions-Header (📅, 🔔, 📋, ⚠).
