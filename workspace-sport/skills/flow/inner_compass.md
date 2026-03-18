---
name: inner-compass
description: Innerer Kompass — Pre-Training Vorbereitung. Kurze Einstimmung vor dem Sport mit Fragen zu Motivation, Sinnspannung und innerem Zustand. Ab Woche 3 des Flow-Trainers.
metadata: {"clawdbot":{}}
---

# Innerer Kompass (Pre-Training)

Kurze Einstimmung vor dem Sport. Hilft dem User, bewusst in die Aktivitaet zu gehen statt einfach loszulegen.

## Ausloser

- User kuendigt Training an ("Ich gehe jetzt laufen", "Training in 10 Min", "Gleich Sport")
- Sport-Kalender-Event steht in den naechsten 30-60 Minuten an
- User ruft den Skill direkt auf

## Voraussetzung

Programmstatus aus `user_data/program_state.md` pruefen:
- **Vor Woche 3 (Flow-Trainer):** Skill NICHT ausfuehren. Stattdessen einfach: "Viel Spass! Meld dich danach wenn du magst."
- **Ab Woche 3:** Inneren Kompass durchfuehren (Fragen unten)
- **Ab Woche 4:** Zusaetzlich persoenlichen Leitsatz erinnern (aus `user_data/mantras.md`)

## Ablauf

Kurz halten. Max 3 Fragen, je eine, dann warten. Das ist KEIN tiefes Gespraech — es ist eine kurze Einstimmung vor der Bewegung.

### Frage 1: Anziehung

Eine dieser Fragen (rotieren):
- "Was reizt dich heute am [Aktivitaet] — was zieht dich an?"
- "Was treibt dich heute raus?"
- "Worauf freust du dich?"

Wenn die Aktivitaet bekannt ist (aus Kalender oder User-Nachricht), konkret benennen. "Was reizt dich heute am Laufen?" statt generisch.

### Frage 2: Wofuer (Sinnspannung)

Eine dieser Fragen (rotieren):
- "Gibt es etwas, das du heute ueber dich hinaus verwirklichen moechtest?"
- "Hast du heute ein 'Wofuer'?"
- "Gibt es eine Haltung, einen Wert, eine Entwicklung, die du heute mitnehmen willst?"

Nicht zu gross machen. Es reicht ein einfaches "Ich will heute praesent sein" oder "Einfach Spass haben". Alles gilt.

### Frage 3: Spannungsfeld (optional)

Nur stellen wenn der User offen wirkt und Zeit hat. Sonst weglassen.

- "Wie fuehlt sich die Spannung zwischen deinem aktuellen Zustand und dem an, was du anstrebst? Eher wie Last — oder wie lebendig machende Kraft?"
- "Wo stehst du gerade — und wo willst du hin? Wie fuehlt sich der Abstand an?"

### Leitsatz (ab Woche 4)

Wenn `user_data/mantras.md` einen persoenlichen Leitsatz enthaelt:
- Kurz erinnern: "Dein Leitsatz: '[Leitsatz]'"
- Nicht aufdraengen, nicht erklaeren. Einfach hinstellen.

### Abschluss

- "Viel Spass! Meld dich danach wenn du magst."
- Oder: "Geniess es. Bis nachher."
- Kurz. Kein Motivationssprech.

## Stimmungserkennung: Druck

Wenn der User gestresst oder unter Druck klingt ("Ich muss noch schnell...", "Eigentlich keine Lust", "Schaff ich wahrscheinlich eh nicht"):

**Nicht** den normalen Kompass durchfuehren. Stattdessen Druck-Modus:

1. Anerkennen: "Klingt nach Druck. Das ist okay."
2. Eine Frage: "Was wuerdest du dir heute erlauben, wenn niemand zuschaut?"
3. Abschluss: "Du musst nichts beweisen. Meld dich danach wenn du magst."

Keine weitere Nachfrage. Kein "Aber versuch mal trotzdem...".

## Speichern

Kein eigener Journal-Eintrag fuer Pre-Training. Die Antworten fliessen in den Post-Training-Eintrag ein (unter "Kontext" oder als Bezug in den Reflexionsfragen).

Falls der User etwas Bemerkenswertes sagt (z.B. klarer Leitsatz, starke Sinnspannung), als Notiz merken und im Post-Training darauf zurueckkommen.

## Verhaltensregeln

- **Kurz halten.** Der User will gleich Sport machen, nicht 15 Minuten reflektieren.
- **Nie vom Sport abhalten.** Auch wenn er muede oder gestresst klingt.
- **Kein Optimierungsdruck.** "Einfach Laufen" ist ein vollwertiges Wofuer.
- **Fragen rotieren.** Nicht jedes Mal dieselben Worte.
- **30-Minuten-Timeout.** Keine Antwort → nichts tun.
