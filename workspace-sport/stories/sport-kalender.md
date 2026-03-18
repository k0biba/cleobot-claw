# Story: Sport-Kalender als stiller Taktgeber

## Szenario

Sonntag, 19:00. Jakub sitzt beim Weekly Review mit Flow. Sie schauen auf die Woche zurueck.

## Der Flow

**Flow:** Wochenrueckblick. Hast du zehn Minuten?

**Jakub:** Ja, passt.

**Flow:** Diese Woche standen drei Einheiten im Kalender: Dienstag Laufen, Donnerstag Krafttraining, Samstag Bouldern. Beim Laufen und Bouldern hast du dich danach gemeldet. Donnerstag war still. Wie war die Woche insgesamt?

**Jakub:** Donnerstag hab ich ausfallen lassen, war zu muede. Aber Dienstag und Samstag waren richtig gut.

**Flow:** Zwei von drei, beide mit hohen Flow-Werten. Bouldern mit 8, Laufen mit 7. Faellt dir ein Muster auf?

## Variante: Spontane Planung

Mittwoch, 12:30. Jakub schreibt Flow.

**Jakub:** Ich will morgen frueh laufen gehen, so 7 Uhr. Kannst du das eintragen?

**Flow:** Steht drin. Donnerstag 07:00-08:00 Laufen.

*Flow erstellt das Event im Sport-Kalender via CalDAV.*

Donnerstag, 08:45. Flow meldet sich.

**Flow:** Wie war's beim Laufen?

**Jakub:** Mega. Morgens um 7 ist die Stadt noch leer, das war ein ganz anderes Laufen.

*Post-Training Check-in startet.*

## Variante: Nachfrage nach verpasstem Training

Samstag, 20:00. Im Kalender stand "Schwimmen 18:00-19:00". Jakub hat sich nicht gemeldet.

**Flow:** Du hattest heute Schwimmen im Kalender. Wie war's — oder ist es ausgefallen?

**Jakub:** Ausgefallen. Hatte spontan Besuch.

**Flow:** Alles klar.

*Kein Nachbohren. Kein "Willst du es nachholen?". Einfach zur Kenntnis genommen.*

## Was passiert im Hintergrund

Der Sport-Kalender ist der stille Taktgeber fuer drei Dinge:

1. **Post-Training-Trigger:** ~30-60 Min nach Event-Ende fragt Flow automatisch nach. Der User muss nicht daran denken, sich zu melden — aber er kann natuerlich auch vorher schreiben.

2. **Weekly Review Kontext:** Flow weiss welche Einheiten geplant waren, welche stattfanden (= Rueckmeldung kam), welche nicht. Das gibt dem Rueckblick Struktur ohne dass der User alles aus dem Gedaechtnis rekonstruieren muss.

3. **Planung:** Wenn Jakub eine Einheit plant, landet sie direkt im Kalender. Kein separates Tool, kein App-Wechsel. "Trag mir morgen Laufen ein" und es steht.

## Wo der Nutzen liegt

- **Kein Tracking-Aufwand:** Der Kalender existiert sowieso. Flow liest ihn mit und nutzt die Informationen als Kontext. Der User muss nichts zusaetzlich pflegen.

- **Sanfte Erinnerung, kein Druck:** "Wie war's beim Schwimmen?" ist keine Erinnerung im klassischen Sinn — es ist eine Einladung zur Reflexion. Und wenn die Antwort "Ausgefallen" ist, ist das okay. Kein Guilt-Trip.

- **Muster werden sichtbar:** Ueber Wochen zeigt der Kalender: Welche Sportarten macht Jakub regelmaessig? Welche fallen oft aus? Wann trainiert er am liebsten? Morgens, abends? Diese Muster fliessen in den Flow-Profil und den Weekly Review ein — ohne dass jemand sie aktiv tracken muss.

- **Eine Quelle der Wahrheit:** Statt dass Jakub in einem Chat schreibt "Ich war heute laufen" und Flow raetselt wann und wie lange, steht im Kalender: "Laufen, 18:00-19:00". Konkreter Kontext fuer bessere Fragen.

- **Isolation bleibt gewahrt:** Der Sport-Agent sieht nur den Sport-Kalender. Keine Arbeitstermine, keine Arztbesuche, keine Therapie. Selbst wenn Timo spaeter Zugang bekommt, sieht er nur Sport-Events.
