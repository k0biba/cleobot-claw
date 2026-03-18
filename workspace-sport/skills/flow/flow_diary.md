---
name: flow-diary
description: Flow-Tagebuch — Post-Training Check-in. Fuehrt den User nach dem Sport Schritt fuer Schritt durch die Reflexion. Adaptiv je nach Programmwoche. Speichert in journal/.
metadata: {"clawdbot":{}}
---

# Flow-Tagebuch (Post-Training)

Dieses Skill fuehrt den Post-Training Check-in durch. Es ist das zentrale Werkzeug fuer die Reflexion nach sportlichen Aktivitaeten.

## Ausloser

- User berichtet vom Training ("Bin fertig", "Zurueck vom Laufen", "War beim Sport")
- Automatisch ~30-60 Min nach Sport-Kalender-Event-Ende
- User ruft den Skill direkt auf

## Ablauf

Immer eine Frage, dann warten. Nie zwei Fragen gleichzeitig.

### Schicht 1: Erleben (immer)

Eine dieser Fragen (rotieren, nicht immer dieselbe):
- "Was ist haengengeblieben?"
- "Gab es einen stimmigen Moment?"
- "Ein Wort fuers Training?"
- "Was war heute anders als sonst?"

### Schicht 2: Flow-Skala (immer)

"Auf einer Skala von 1-10 — wie sehr warst du drin?"

Je nach Antwort:
- **Hoch (7-10):** "Was hat das ermoeglicht?"
- **Mittel (4-6):** "Was hat dich rein-, was rausgezogen?"
- **Niedrig (1-3):** "Ablenkung, Widerstand, oder einfach nicht der Tag?"

### Schicht 3: Koerper (immer)

Eine dieser Fragen (rotieren):
- "Wo spuerst du den Koerper gerade am meisten?"
- "Scan einmal durch — von Kopf bis Fuss."
- "Wie fuehlen sich die Beine an?"
- "Spuerst du irgendwo Leichtigkeit? Schwere?"

### Schicht 4: Wochenabhaengig (adaptiv)

Aktuelle Woche aus `user_data/program_state.md` lesen.

**Ab Woche 2 (Flow-Trainer):**
- "Wie war das Verhaeltnis von Herausforderung und Koennen heute?"
- "Hast du dich gefordert gefuehlt — oder war es zu leicht, zu schwer?"

**Ab Woche 3 (Flow-Trainer):**
- "Hast du deine Sinnspannung gespuert? Zwischen dem was ist und dem was sein koennte?"
- "Wie hat dich dein 'Wofuer' heute begleitet?"

**Ab Woche 4 (Flow-Trainer):**
- "Was nimmst du aus dem Training mit in den Alltag?"
- "Gibt es etwas, das sich uebertragen laesst — auf Arbeit, Beziehungen, den Rest des Tages?"

### Schicht 5: Mitnehmen (optional)

"Etwas, das du dir merken willst?"

Nur fragen wenn der User offen wirkt. Wenn er kurz angebunden ist: weglassen.

### Schicht 6: Abschluss

Spiegelung in 2-3 Saetzen. Zusammenfassen was der User gesagt hat — nicht deuten.

"Ich schreib das auf."

## Speichern

Nach Abschluss in `journal/YYYY-MM-DD_flow.md` schreiben:

```markdown
## Post-Training [HH:MM]

- **Aktivitaet:** [Was]
- **Erleben:** [Antwort Schicht 1]
- **Flow:** [Zahl]/10 — [Kontext aus Follow-up]
- **Koerper:** [Antwort Schicht 3]
- **Herausforderung/Koennen:** [Antwort Schicht 4, falls gestellt]
- **Sinnspannung:** [Antwort Schicht 4, falls gestellt]
- **Transfer:** [Antwort Schicht 4, falls gestellt]
- **Mitnehmen:** [Antwort oder —]
- **Zusammenfassung:** [Spiegelung]
```

Wenn am selben Tag schon ein Eintrag existiert: anhaengen, nicht ueberschreiben.

## Nachbereitung

- `user_data/flow_profile.md` aktualisieren wenn neue Muster erkennbar
- Bei auffaelligen Mustern (z.B. 3x niedrige Flow-Werte hintereinander): im naechsten Check-in ansprechen, nicht sofort
- **Kein Optimierungsdruck.** Niedrige Flow-Werte sind keine Fehler.

## Verhaltensregeln

- Fragen rotieren — nicht jedes Mal dieselbe Formulierung
- Kontext nutzen — gestrige Eintraege lesen, darauf aufbauen
- 30-Minuten-Timeout — keine Antwort nach 30 Min → nichts tun
- Kurz nach hartem Training — weniger Fragen, nicht alle Schichten durchgehen
- "Heute nicht" oder "Nein" → "Okay." — und fertig
