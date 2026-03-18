# OpenClaw Personal Trainer Agent - Technisches Briefing & Konzeptspezifikation

> Dieses Dokument dient als vollstaendige Arbeitsgrundlage fuer den lokalen OpenClaw-Agent-Entwickler.
> Es enthaelt alle extrahierten Uebungen, die Architektur-Vision und konkrete Implementierungshinweise.

---

## 1. PROJEKTUEBERBLICK

### 1.1 Ziel
Entwicklung eines OpenClaw-Agents als persoenlicher Trainer, der den Nutzer (Jakub) bei der Vor- und Nachbereitung sportlicher Aktivitaeten unterstuetzt. Der Agent verbindet zwei wissenschaftlich fundierte Quellen:

1. **Masterarbeit** (Timo Ehrenberg, DHGS Hamburg, 2025): "Zwischen Vergaenglichkeit und Unendlichkeit - Flow im Sport als existenzielle Erfahrung von Gegenwaertigkeit und Sinn" - Ein 5-Wochen-Konzept fuer Flow-Erleben im Sport
2. **Handout** (Timo Ehrenberg, 2025): "Zwischen den Zeilen des Lebens" - Ein 12-Wochen-Programm zur persoenlichen Entwicklung basierend auf Positiver Psychologie

### 1.2 Technologie
- **Framework**: OpenClaw (open-source AI agent)
- **Persistenz**: Markdown-Dateien auf Disk (OpenClaw-nativ)
- **Messaging-Integration**: WhatsApp, Telegram oder Signal
- **Erweiterung**: AgentSkills (ein Skill pro Uebungstyp)

### 1.3 Spaetere Ausbaustufe
Timo Ehrenberg (Autor beider Quellen) soll als Supervisor Zugang erhalten mit folgenden Funktionen: Fortschritts-Review, Agent-Interaktions-Audit, Feedback-Annotationen. Details dazu in Abschnitt 7.

---

## 2. QUELLDOKUMENT A: 5-WOCHEN FLOW-KONZEPT (MASTERARBEIT)

### 2.1 Grundannahmen des Konzepts

Das Konzept basiert auf drei zentralen Annahmen:

1. **Flow entsteht durch Koerperwahrnehmung**: Der Koerper eroeffnet den Zugang zum Erleben des Moments. Uebungen zielen darauf ab, Koerperempfindungen bewusst wahrzunehmen und als Orientierungspunkte zu nutzen.

2. **Flow haengt vom Zusammenspiel von Herausforderung, Druck und eigenen Zielen ab**: Entscheidend ist, wie jemand Anforderungen, Erwartungen oder Unsicherheiten erlebt. Das Konzept regt an, die eigenen Muster im Umgang mit Stress und Druck bewusster wahrzunehmen.

3. **Flow-Erlebnisse werden erst durch Reflexion nachhaltig wirksam**: Sie muessen reflektiert und in den eigenen Alltag eingeordnet werden, um als Ressource zu dienen.

**Leitprinzipien**: Koerperwahrnehmung, bewusster Umgang mit Druck, Offenheit fuer Sinnmomente, Einbettung der Erfahrungen in den Alltag.

### 2.2 Struktur

- 4 inhaltliche Bloecke ueber 6 Wochen (eine Woche Pause moeglich)
- Modular aufgebaut, individuelle Schwerpunktsetzung erlaubt
- Uebungen sollen sich nahtlos in sportliche Routinen integrieren
- 20-30 Minuten konzentrierte Zeit pro Uebung empfohlen
- Persoenliches Notizheft/Flow-Tagebuch empfohlen

### 2.3 Alle Uebungen im Detail

#### WOCHE 1: Eintauchen in den Flow - Einfuehrung in Praesenz und vertieftes Erleben

**Theorie-Input**: Was ist Flow? (Csikszentmihalyi). Merkmale: Koerper weiss was zu tun ist, unmittelbares Feedback, Faehigkeiten passen zur Aufgabe, Bewusstsein und Handeln verschmelzen, Zeitgefuehl geht verloren, Selbstvergessenheit, intrinsische Motivation.

**Erste Selbsteinschaetzung - Reflexionsfragen zum Einstieg**:
- Flow im Sport: Wie haeufig? Woran merkst du es? Welche Bedingungen foerdern es?
- Sportliches Erleben allgemein: angestrengt, leistungsfokussiert, spielerisch, frei, unter Druck? Welche Gefuehle?
- Sinn und Motivation: Warum machst du Sport? Gibt es Momente wo Sport "mehr" bedeutet als nur Bewegung?
- Gegenwaertigkeit: Wie gut gelingt es dir, ganz im Moment zu sein? Was bringt dich raus, was hilft?
- Innere Haltung in herausfordernden Situationen: Welche Gedanken/Muster tauchen auf bei Druck?

**Uebung 1: Flow im Koerper** (Zeitpunkt: irgendwann wenn Zeit)
- Stelle dir vor, du bist in einem Flow-Moment im Sport
- Fragen: Wo im Koerper spuerst du es? Wie fuehlt es sich koerperlich an (warm, leicht, kribbelnd, kraftvoll)? Welche Koerperbereiche aktiv/ruhig? Wie bewegt sich dein Koerper im Flow?
- Zeichne Koerperumriss, markiere Flow-Stellen mit Farben/Formen/Worten
- Optional: Fuege Bewegungslinien hinzu
- **Teil 2 - Flow in der Musik**: Gibt es Musik die sich wie Flow anfuehlt? Welche Songs spiegeln dein Erleben? Was genau erinnert an deinen Flow-Zustand (Rhythmus, Dynamik, Atmosphaere)? Waehle 1-3 Musikstuecke, notiere Titel und beschreibe Gefuehle beim Hoeren.

**Uebung 2: Flow-Tagebuch** (Zeitpunkt: direkt nach dem Sport, 3x pro Woche)
- Was habe ich gemacht?
- Gab es einen Moment der sich stimmig, fliessend oder fokussiert angefuehlt hat?
  - Wenn ja: Was hat ihn beguenstigt (Gedanken, Herausforderung, Umgebung, Stimmung)?
  - Wenn nein: Was hat davon abgehalten?
- Skala 1-10: Wie stark habe ich Flow empfunden?
- Am Wochenende: Eintraege durchlesen. Muster? Hilfreiche Bedingungen oder Hemmnisse? Was foerdern?

#### WOCHE 2: Zwischen Spannung und Druck - Flow, Selbstwahrnehmung und persoenliche Herausforderung

**Theorie-Input**: Zusammenspiel von Flow, Selbstwahrnehmung und Druck. Verschiedene Druckformen: Aeusserer Druck (Trainer, Team), Innerer Druck (eigene Ansprueche, innere Kritik), Sozialer Druck (Rollenbilder), Leistungsdruck (Wettkampfangst), Alltagsstress/Zeitdruck. Unterscheidung: Gesunde Spannung (aktivierend) vs. Blockierender Druck (Angst, Stress).

**Uebung 1: Balance-Matrix** (Zeitpunkt: irgendwann)
- Zeichne Koordinatensystem: X-Achse = Herausforderung (gering->hoch), Y-Achse = Koennen (gering->hoch)
- Trage konkrete Sportsituationen ein: Wann zu leicht? Wann ueberfordert? Wann genau richtig gefordert?
- Reflexion: Welche Situationen haben Flow beguenstigt? Wo schlug Herausforderung in Druck/Langeweile um? Was lernen fuer kuenftige Situationen?

**Uebung 2: Schreibuebung - Druck reflektieren und umformulieren** (Zeitpunkt: irgendwann)
- Formuliere 5-10 Saetze die beginnen mit: "Wenn ich unter aeusserem, innerem oder sozialem Druck stehe, dann fuehle ich mich..."
- Dann: Saetze ueberpruefen. Welche stehen lassen? Wo ergaenzen, klarer, freundlicher formulieren?
- Aussagen umwandeln: z.B. "Ich habe oft das Gefuehl, nicht gut genug zu sein" -> "Ich darf Fehler machen. Mein Wert bleibt."
- Reflexion: Welche Gedanken/Gefuehle loesen Druck aus? Welche veraendern? Wie besser unterstuetzen?

#### WOCHE 3: Transzendenz, Sinnfindung und Drucktransformation - Ein existenzieller Blick auf Flow

**Theorie-Input**: Frankl (Sinnspannung statt Sinnleere), Yalom (Vergaenglichkeit als Tiefenschaerfe), Kierkegaard (aesthetische vs. ethische Sphaere), Sartre (Freiheit und Verantwortung). Flow als existenzielle Praesenz, nicht nur Leistungsoptimierung.

**Uebung 1: Existenzielle Reflexion - Brief an dein zukuenftiges Ich** (Zeitpunkt: irgendwann, 15-20 Min)
- Leitfragen:
  - Sinn: Warum mache ich das alles?
  - Verbundenheit: Mit wem oder was fuehle ich mich verbunden?
  - Gelassenheit: Wie gehe ich mit Erwartungen, Druck oder Enttaeuschungen um?
- Hinweis: Intuitiv schreiben, ohne Anspruch auf "Richtigkeit"

**Uebung 2: Zwischen Heute und Morgen - Sinnspannung entdecken** (20-30 Min)

***Teil 1 - VOR dem Sport: Innerer Kompass (10-15 Min)***
Nimm vor einer sportlichen Aktivitaet einen Moment der Ruhe. Beantworte schriftlich:
1. Was reizt mich heute an meiner sportlichen Aktivitaet - was zieht mich an? (Bewegung, Herausforderung, Zustand...)
2. Gibt es etwas, das ich (ueber mich hinaus) verwirklichen moechte - heute, diese Woche oder generell im Training? (Haltung, Wert, Beitrag, Entwicklung, etwas Groesseres als das eigene Ego?)
3. Was ist das Spannungsfeld zwischen meinem aktuellen Zustand und dem, was ich anstrebe? (Fuehlt es sich an wie Last oder wie lebendig machende Kraft?)

***Teil 2 - NACH dem Sport: Resonanz und Reflexion (10-15 Min)***
1. Gab es heute einen Moment, in dem du deine "Sinnspannung" besonders gespuert hast? (zwischen Aufgeben und Durchhalten, Komfort und Herausforderung, Selbstzweifel und Vertrauen?)
2. Wie hat dich dein "Wofuer" begleitet - war es spuerbar, motivierend, veraendernd?
3. Wie fuehlt sich die Spannung jetzt an? Hat sich etwas verschoben, geklaert oder verstaerkt?

#### WOCHE 4: Flow verankern - Wie Erfahrungen zu Ressourcen werden

**Theorie-Input**: Transfer (Erfahrungen aus dem Sport auf andere Lebensbereiche uebertragen), Selbstbindung (bewusste Identifikation mit Werten und Verhalten), Rituale und Leitsaetze als mentale Anker.

**Transfer-Reflexion**:
- Was hat in den letzten Wochen bei dir funktioniert?
- Wann hast du dich lebendig, praesent, fokussiert gefuehlt?
- Was laesst sich auf andere Lebensbereiche uebertragen?

**Selbstbindungs-Reflexion**:
- Was davon ist fuer mich mehr als nur ein schoenes Gefuehl?
- Was sagt es ueber das aus, was mir im Leben wichtig ist?

**Rituale und Leitsaetze - Den Flow erinnern**:
- Kleine Rituale vor dem Training: Atemuebungen, Bewegungsabfolgen, Symbole
- Persoenlicher Leitsatz, z.B.:
  - "Wenn ich atme und spuere, bin ich ganz da"
  - "Mein Koerper kennt den Weg"
  - "Ich vertraue dem Moment"
- Lebensfragen: Wie sieht ein Leben aus das regelmaessig solche Erfahrungen moeglich macht? Welche bewussten Entscheidungen willst du heute treffen?

**Abschlussreflexion** (separates Uebungsblatt - im Anhang der Masterarbeit, Seite 45)

---

## 3. QUELLDOKUMENT B: 12-WOCHEN LEBENSKOMPASS (HANDOUT)

### 3.1 Programmstruktur

12 Wochen, je 30 Min - 1 Stunde. Jede Woche: Theorieinput + Fragebogen/Intervention. Empfohlener Rhythmus: Sonntagabend vor Beginn der neuen Woche. Vier Ueberthemen: Identitaet, Beziehung/Verbindung, Umwelt, Sinn/Transzendenz.

### 3.2 Alle Wochen und Uebungen

#### Woche 1: Einleitung + "Ich ohne alles" + Konzept der 3 Gesichter

**Uebung: "Ich ohne alles - Wer bleibt uebrig?"**
1. Schreiben: 10 Dinge notieren die dich aktuell stark ausmachen
2. Wegdenken: Liste von unten nach oben durchgehen, Begriffe Schritt fuer Schritt "verschwinden" lassen. Bei jedem Punkt vorstellen: Du verlierst die Faehigkeit, das Interesse, jemand nimmt es dir weg. Was macht das mit dir?
3. Reflexion: 2-3 Saetze aufschreiben. "Wenn alles weg ist - was ist dann noch da?"

**Uebung 1: Konzept der 3 Gesichter (Tatemae/Honne/Tokimeki)**
- 3 Masken beschriften mit selbstgewaehlten Symbolen
- Tatemae (Fassade): Was zeige ich nach aussen? Was halte ich zurueck?
- Honne (wahres Ich): Was denke/fuehle ich oft, spreche aber selten aus?
- Tokimeki (tiefe Beruehrung): Was bringt mein Herz zum Leuchten? Wo echte emotionale Verbindung?
- Reflexion: Was entdecke ich? Welche Maske am haeufigsten? Wo Sehnsucht nach mehr Echtheit?

#### Woche 2: Lebenskunst

**Fragebogen Lebenskunst** (35 Items, 6-stufige Skala)
11 Bereiche mit je 3-4 Items:
- SK (Soziale Kontakte), KS (Koerperliche Selbstfuersorge), OP (Optimierung), SE (Selbstkenntnis), SI (Sinn), PL (Positive Lebenseinstellung), GEL (Gelassenheit), GEN (Genuss), CO (Coping), RE- (Reflexion, invertiert!), SL (Selbstbestimmte Lebensgestaltung)
- Auswertung: Punkte 0-5, RE- invertiert, Summe durch Anzahl Items pro Bereich
- Visualisierung als Balkendiagramm

**Uebung 1: Lebenskunst (kreativ)**
- Timer 20 Min, Leben als Kunstwerk/Landkarte malen
- Verschiedene Bereiche (Beziehungen, Arbeit, Natur, Kreativitaet, Ruhe) farblich/symbolisch gestalten
- Betrachten: Welche Farben dominieren? Formen weich oder kantig? Bewegung oder Ruhe? Verbindungen harmonisch oder spannend?

#### Woche 3: Lifedesign

**Uebung 1: Drei alternative Lebensentwuerfe** (20-30 Min)
- Leben 1: Jetziges Leben weitergedacht - Was tust du? Wo lebst du? Wie fuehlt sich dein Alltag an?
- Leben 2: Komplett anderes Leben - Was waere moeglich bei mutigem Richtungswechsel?
- Leben 3: Fantasievolles Leben ohne Limitierungen - Wofuer wuerdest du dich entscheiden wenn alles moeglich waere?
- Jedes Leben ergaenzen um: Beruf, Wohnort, Beziehungen, Tagesstruktur, Gefuehle

**Uebung 2: Woche skizzieren** (20-30 Min)
- Typische Woche als Raster (Fruemorgens bis Nacht, Mo-So)
- Farbmarkierung: Gruen = Energie gebend, Rot = Energie kostend, Blau = neutral
- Lebenskunst-Konten zuordnen (K=Koerper, S=Seele, G=Geist, U=Umwelt)
- Reflexion: Welche Konten gut gefuellt? Wo Mangel/Uebergewicht? Balance?

#### Woche 4: Identitaet + Primal World Beliefs + Drei Konzepte eines guten Lebens

**Theorie**: Rogers (Kongruenz, Selbstkonzept, Selbstakzeptanz), Heusser (drei Facetten: Selbstkonzept kognitiv, Selbstwert emotional, Kontrollueberzeugung verhalten), Psychische Flexibilitaet

**Primal World Beliefs**:
- Online-Test: https://myprimals.com/discover-your-primals/
- Drei Dimensionen: Sicherheit vs. Unsicherheit, Kontrolle vs. Unkontrollierbarkeit, Zufall vs. Vorhersehbarkeit

**Uebung: Drei Konzepte eines guten Lebens**
1. Erinnere dich an eine besondere Situation wo du dich lebendig/erfuellt gefuehlt hast
2. Schreibe die Geschichte kurz auf (5-7 Saetze): Was passiert? Wer dabei? Wo?
3. Beantworte: Was hat es besonders gemacht? Welche Gefuehle/Gedanken im Moment? Was war wichtig?
4. Zuordnung: War es Hedonismus (Zufriedenheit/Genuss), Eudaemonismus (Sinn/Beitrag), oder Psychologisch reiches Leben (Neues/Wachstum/Abenteuer)?
5. Optional: Mit 2-3 weiteren Erlebnissen wiederholen um Muster zu erkennen

#### Woche 5: Multiple Discrepancies Theory (Subjektives Wohlbefinden)

**Theorie**: Glueck abhaengig von Uebereinstimmung zwischen Lebensrealitaet und Erwartungen. Drei Diskrepanz-Quellen: Geschichte (Vergangenheit vs. Jetzt), Umfeld (Ich vs. Andere), Wuensche (Wollen vs. Haben).

**Fragebogen: Thriving-Inventory 2.0** (Comprehensive Inventory of Thriving, Diener 2014)
54 Items, 5-stufige Skala. 18 Bereiche mit je 3 Items:
- UN (Unterstuetzung), RE (Respekt), GE (Gemeinschaft), VE (Vertrauen), EI (Einsamkeit, invertiert), AU (Autonomie, invertiert), SI (Sinn), LZ (Lebenszufriedenheit), PE (Positive Emotionen), NE (Negative Emotionen, invertiert), FA (Faehigkeit), EN (Engagement), SE (Selbstwirksamkeit), SW (Selbstwert), OP (Optimismus), ZU (Zugehoerigkeit), LEI (Leistung), LER (Lernen)
- Auswertung: 1-5 Punkte, AU/NE/EI invertiert, Summe/3 pro Bereich
- Visualisierung als Spinnendiagramm (Auswertungsmaske nach Mangelsdorf 2015)
- Schritt 1: Persoenliche Wichtigkeit jedes Bereichs im Diagramm markieren
- Schritt 2: CIT-Ergebnisse in anderer Farbe eintragen, Diskrepanzen identifizieren

#### Woche 6: Psychologisches Wohlbefinden (eudaemonisch)

**Theorie**: Carol Ryff - 6 Dimensionen: Selbstakzeptanz, Positive Beziehungen, Autonomie, Umweltkontrolle, Persoenliches Wachstum, Sinn im Leben

**Uebung 1: Tagebuch des Wunsch-Ichs**
- Ruhigen Ort suchen, nachdenken wie Leben in 5-10 Jahren aussehen soll wenn alles perfekt laeuft
- Mind-Map mit "Mein Wunsch-Ich" in der Mitte, umgebende Kreise fuer Aspekte

**Uebung 2: Fuellstaende meines psychologischen Wohlbefindens** (DHGS/DGPP)
- 6 Bereiche nach Ryff als Kreisdiagramm
- Schritt 1: Aktuellen Fuellstand pro Bereich einschaetzen
- Schritt 2: Welche Bereiche gut gefuellt? Was traegt dazu bei?
- Schritt 3: Welchen Bereich auffuellen? Groesster positiver Effekt?
- Schritt 4: Was waere ein erster guter Schritt?
- Hilfsfragen: Was fuellt diesen Bereich? Was sorgt fuer Nachfuellen? Wer kann helfen? Was laesst abfliessen?

#### Woche 7: Der Entwicklungsbaum - Ein Bild fuer persoenliche Entfaltung

**Modell**: Baum-Metapher mit 5 Elementen:
1. Wurzeln = Werte und Herkunft
2. Stamm = Staerken und Faehigkeiten
3. Aeste = Lebensziele und Ausrichtung
4. Blaetter/Krone = Persoenliche Entwicklung
5. Sonne = Sinn und Orientierung

**Uebung 1: Lebensbaum** (DHGS/DGPP, basierend auf Positive Acorn)
- Schritt 1: Elemente verstehen (Unterstuetzende Ressourcen, Werte, Staerken, Lebensbereiche, Entwicklungen, Sinn)
- Schritt 2: Eigenen Baum kreieren mit detaillierten Fragen pro Element
  - Ressourcen: Was naehrt mein Wachstum?
  - Werte: Was ist mir im Leben wichtig? Was tue ich wirklich gern?
  - Staerken: Womit identifiziere ich mich voll?
  - Lebensbereiche: Welche aktuell am bedeutsamsten?
  - Sinn: Was ist das Ziel aller Bestrebungen? Woraus schoepfe ich Sinn?
  - Entwicklungen: Welche "Fruechte" traegt mein Baum?
- Schritt 3: 9 Reflexionsfragen (Entsprechen die Ergebnisse dem gewuenschten Leben? Werte-Widersprueche? Staerken-Werte-Verbindung? Wachstumsbereiche? Naechste Phase?)

#### Woche 8: Werte - Grundlage unseres Denkens, Fuehlens und Handelns

**Theorie**: Schwartz Wertezirkel, individuelle vs. kollektive Werte, Vom Wert zum Verhalten (Wichtigkeit, Bewusstheit, Konflikte)

**Uebung 1: Werte-Survey** (per E-Mail, xlsx-Fragebogen)

**Uebung 2: Ein anziehender Humor** (DHGS/DGPP)
- Reflektieren: Welche Redewendungen/Mimiken sprechen an? Was bringt zum Lachen? Welche Dinge mit Humor nehmen?

**Uebung 3: Werte-Matrix**
- Umfangreiche Werteliste (ca. 80+ Werte von Abenteuer bis Zuverlaessigkeit)
- Bis zu 10 wichtigste Werte auswaehlen
- In Matrix horizontal und vertikal eintragen
- Fuer jede Zweier-Konstellation abwaegen welcher Wert wichtiger ist
- Zusammenzaehlen: Haeufigkeit = Wichtigkeit

**Die Volltreffer-Uebung**:
- Drei wichtigste Werte identifizieren
- Auf Zielscheibe markieren: Wie sehr lebst du diesen Wert aktuell (Mitte = voll im Einklang)?
- Differenzierung nach Lebensbereichen (Privat vs. Beruf)

#### Woche 9: Staerken

**Theorie**: Staerke = Talent + Uebung + Faehigkeit/Wissen + Motivation. Charakterstaerken (VIA-Modell, 24 Staerken). Signaturstaerken = persoenliche Kernstaerken. Vier Kategorien: Realisierte Staerken, Unrealisierte Staerken, Erlerntes Verhalten, Schwaechen.

**Uebung 1: VIA-Test**
- Online: charakterstaerken.org oder viacharacter.org
- Reflexion nach Test:
  - Spontane Reaktion auf Ergebnis?
  - Starke Staerken (Top 3-5): Wie vertraut? Was bedeuten sie? Wo eingesetzt? Wie ergaenzen sie sich?
  - Schlafende Staerken (untere 3-5): Als Schwaechen erlebt? Wie als "schlafende Staerken" sehen? Wie sanft aufwecken?

#### Woche 10: Emotionen / Positive Emotionen
(Theorie zu Fredrickson Broaden-and-Build, 10 positive Emotionen)

#### Woche 11: Optimismus + Rumination
(Theorie zu erlerntem Optimismus nach Seligman + Umgang mit Gedankenkreisen)

#### Woche 12: Achtsamkeit + Selbstwert vs. Selbstmitgefuehl + Authentisch leben nach Erich Fromm

---

## 4. AGENT-ARCHITEKTUR

### 4.1 Programme (Modi)

```
PROGRAMM_FLOW_TRAINER    = "flow"        # Basierend auf Masterarbeit (5 Wochen)
PROGRAMM_LEBENSKOMPASS   = "leben"       # Basierend auf Handout (12 Wochen)
PROGRAMM_INTEGRATED      = "integrated"  # Verbindung beider Welten
```

### 4.2 Interaktionsmodi

```
MODUS_PRE_TRAINING    # Vor dem Sport (Innerer Kompass, Rituale, Leitsaetze)
MODUS_POST_TRAINING   # Nach dem Sport (Flow-Tagebuch, Resonanz/Reflexion)
MODUS_WEEKLY_REVIEW   # Wochenrueckblick (Sonntag, Pattern-Analyse)
MODUS_EXERCISE        # Gezielte Uebung auf Abruf
MODUS_CHECKIN         # Kurzer Mood-Check-In
MODUS_THEORY          # Theorie-Input fuer aktuelle Woche
```

### 4.3 AgentSkills (ein Skill pro Uebungstyp)

```
skills/
  flow/
    flow_body.md              # Uebung: Flow im Koerper
    flow_music.md             # Uebung: Flow in der Musik
    flow_diary.md             # Uebung: Flow-Tagebuch (Post-Training)
    balance_matrix.md         # Uebung: Balance-Matrix
    pressure_writing.md       # Uebung: Druck reflektieren/umformulieren
    inner_compass.md          # Uebung: Innerer Kompass (Pre-Training)
    resonance_reflection.md   # Uebung: Resonanz und Reflexion (Post-Training)
    future_letter.md          # Uebung: Brief ans zukuenftige Ich
    rituals_mantras.md        # Uebung: Rituale und Leitsaetze
    transfer_reflection.md    # Uebung: Transfer/Abschlussreflexion
  leben/
    identity_stripping.md     # Uebung: Ich ohne alles
    three_faces.md            # Uebung: 3 Gesichter (Tatemae/Honne/Tokimeki)
    life_art.md               # Uebung: Lebenskunst-Landkarte
    life_design_3lives.md     # Uebung: Drei Lebensentwuerfe
    life_design_week.md       # Uebung: Wochenskizze mit Energiefarben
    good_life_concepts.md     # Uebung: Drei Konzepte eines guten Lebens
    wish_self_journal.md      # Uebung: Tagebuch des Wunsch-Ichs
    wellbeing_levels.md       # Uebung: Fuellstaende psych. Wohlbefinden
    life_tree.md              # Uebung: Lebensbaum
    values_matrix.md          # Uebung: Werte-Matrix
    values_bullseye.md        # Uebung: Volltreffer-Uebung
    strengths_via.md          # Uebung: VIA-Staerkentest + Reflexion
  questionnaires/
    lebenskunst_35.md         # Fragebogen: Lebenskunst (35 Items, 11 Bereiche)
    thriving_inventory.md     # Fragebogen: CIT 2.0 (54 Items, 18 Bereiche)
    first_self_assessment.md  # Fragebogen: Erste Selbsteinschaetzung Flow
```

### 4.4 Daten-Persistenz (Markdown-Dateien)

```
user_data/
  profile.md                # Nutzerprofil: Sportarten, Ziele, Praeferenzen
  flow_profile.md           # Sich aufbauendes Flow-Profil (Trigger, Hemmnisse, Bedingungen)
  program_state.md          # Aktuelles Programm, aktuelle Woche, Fortschritt
  values.md                 # Erarbeitete Werte (aus Werte-Matrix/Volltreffer)
  strengths.md              # VIA-Ergebnisse und Reflexion
  mantras.md                # Persoenliche Leitsaetze/Rituale
  journal/
    YYYY-MM-DD_flow.md      # Flow-Tagebuch-Eintraege
    YYYY-MM-DD_checkin.md   # Mood-Check-Ins
    YYYY-MM-DD_exercise.md  # Uebungs-Ergebnisse
  weekly_reviews/
    YYYY-WXX_review.md      # Wochenrueckblicke mit Pattern-Analyse
  questionnaire_results/
    lebenskunst_YYYY-MM-DD.md
    thriving_YYYY-MM-DD.md
```

---

## 5. INTERAKTIONSLOGIK

### 5.1 Pre-Training Flow

```
User: "Ich gehe jetzt laufen" / "Training in 10 Min" / [Zeitplan-Trigger]
  |
  v
Agent prüft: Welches Programm aktiv? Welche Woche?
  |
  v
[Wenn Woche 3+]: Innerer Kompass (3 Fragen, kurz)
[Wenn Woche 4+]: + Persoenlicher Leitsatz erinnern
[Wenn Druck erkannt]: Spezial-Modus -> Druck-Reflexion (Woche 2) + Fokus auf Loslassen
  |
  v
Agent: "Viel Spass beim Laufen! Meld dich danach wenn du magst."
```

### 5.2 Post-Training Flow

```
User: "Bin fertig" / "Zurueck vom Training" / [Timer]
  |
  v
Flow-Tagebuch-Fragen (adaptiv je nach Woche):
  - Basis (immer): Was gemacht? Flow-Moment? Skala 1-10.
  - Woche 2+: Balance-Matrix-Bezug (Herausforderung vs. Koennen?)
  - Woche 3+: Sinnspannung gespuert? Wofuer begleitet?
  - Woche 4+: Transfer-Frage (Was nimmst du mit in den Alltag?)
  |
  v
Agent speichert in journal/, aktualisiert flow_profile.md
  |
  v
[Wenn Pattern erkannt]: "Mir faellt auf, dass du draussen immer hoehere Flow-Werte hast..."
```

### 5.3 Woechentliche Reflexion (Sonntag)

```
Agent-initiiert (z.B. Sonntag 18:00):
  |
  v
Zusammenfassung der Woche:
  - Flow-Werte Ueberblick
  - Erkannte Muster
  - Highlights/Tiefpunkte
  |
  v
Tiefere Uebung aus aktuellem Wochenprogramm anbieten
  |
  v
Naechste Woche einleiten (Theorie-Haeppchen)
```

### 5.4 Adaptives Verhalten

- **Stimmungserkennung**: Wenn User gestresst/unter Druck klingt -> Druck-Modus (Woche 2 Uebungen)
- **Zeitadaption**: Kurze Nachrichten nach hartem Training, ausfuehrlichere an ruhigen Tagen
- **Pattern-Hinweise**: Agent erkennt laengsschnittliche Muster und teilt sie kontextgerecht mit
- **Keine Ueberflutung**: Max 1 proaktive Nachricht pro Tag, nie waehrend des Trainings
- **Integrated Mode**: Verknuepft Flow-Erfahrungen mit Lebenskompass-Themen (z.B. "Dein Flow beim Klettern zeigt dir was ueber deine Werte...")

---

## 6. FRAGEBOGEN-AUSWERTUNGSLOGIK

### 6.1 Lebenskunst-Fragebogen (35 Items)

```
Bereiche und Item-Zuordnung:
SK (Soziale Kontakte):    Items 1, 12, 23           -> Summe / 3
KS (Koerperl. Selbstf.): Items 2, 13, 24           -> Summe / 3
OP (Optimierung):         Items 3, 14, 25           -> Summe / 3
SE (Selbstkenntnis):      Items 4, 15, 26           -> Summe / 3
SI (Sinn):                Items 5, 16, 27, 34       -> Summe / 4
PL (Positive Lebenseinst.): Items 6, 17, 28, 35     -> Summe / 4
GEL (Gelassenheit):       Items 7, 18, 29           -> Summe / 3
GEN (Genuss):             Items 8, 19, 30           -> Summe / 3
CO (Coping):              Items 9, 20, 31           -> Summe / 3
RE- (Reflexion):          Items 10, 21, 32          -> INVERTIERT, Summe / 3
SL (Selbstbest. Lebensg.): Items 11, 22, 33         -> Summe / 3

Skala: 0 (trifft ueberhaupt nicht zu) bis 5 (trifft vollkommen zu)
RE-Bereich: 5 (trifft ueberhaupt nicht zu) bis 0 (trifft vollkommen zu)
```

### 6.2 Thriving Inventory 2.0 (54 Items)

```
18 Bereiche mit je 3 Items. Skala 1-5.
Invertierte Bereiche: AU (Autonomie), NE (Negative Emotionen), EI (Einsamkeit)
Invertiert: 5=1, 4=2, 3=3, 2=4, 1=5
Ergebnis: Summe / 3 pro Bereich
Visualisierung: Spinnendiagramm mit 18 Achsen
```

---

## 7. SUPERVISOR-INTEGRATION (SPAETERE AUSBAUSTUFE)

### 7.1 Architektur-Konzept fuer Timo als Supervisor

```
supervisor/
  timo/
    access.md               # Zugriffsrechte (read-only auf user_data/)
    dashboard.md            # Aggregierte Ansicht
    annotations/
      YYYY-MM-DD_note.md    # Timos Feedback-Notizen
    agent_review/
      YYYY-WXX_protocol.md  # Review der Agent-Interaktionen
```

### 7.2 Supervisor-Funktionen

1. **Fortschritts-Dashboard**: Aggregierte Flow-Werte ueber Wochen, abgeschlossene Uebungen, erkannte Muster
2. **Agent-Audit**: Welche Fragen hat der Agent gestellt? War das Timing gut? Waren Reflexionsimpulse passend?
3. **Feedback-Annotationen**: Timo kann Kommentare hinterlassen die der Agent dem User zutraegt
4. **Programm-Anpassung**: Timo kann Empfehlungen geben welche Uebungen priorisiert werden sollten

### 7.3 Datenschutz

- Timo sieht nur aggregierte Daten und vom User freigegebene Eintraege
- Rohe Tagebuch-Eintraege nur mit expliziter Freigabe
- Annotationen werden dem User als "Feedback von Timo" praesentiert, nicht als Anweisungen

---

## 8. IMPLEMENTIERUNGS-REIHENFOLGE (EMPFEHLUNG)

### Phase 1: MVP (Flow-Trainer Kern)
1. User-Profil-Setup (Sportart, Trainingshaeufigkeit, Ziele)
2. Flow-Tagebuch (Post-Training) mit Persistenz
3. Innerer Kompass (Pre-Training)
4. Wochenrueckblick mit einfacher Pattern-Erkennung

### Phase 2: Vollstaendiger Flow-Trainer
5. Alle Woche 1-4 Uebungen als abrufbare Skills
6. Adaptives Pre/Post-Training (wochenabhaengig)
7. Fragebogen-Integration (Lebenskunst + CIT)
8. Leitsaetze und Rituale

### Phase 3: Lebenskompass-Integration
9. 12-Wochen-Programm als separater Modus
10. Integrated Mode (Verbindung Flow + Lebensthemen)
11. Alle Lebenskompass-Uebungen als Skills

### Phase 4: Supervisor-Anbindung
12. Read-Only-Zugang fuer Timo
13. Aggregiertes Dashboard
14. Feedback-Annotationen
15. Agent-Interaktions-Audit

---

## 9. WICHTIGE DESIGNPRINZIPIEN

1. **Kein Selbstoptimierungs-Druck**: Beide Quellen betonen explizit, dass es NICHT um Perfektion geht, sondern um Achtsamkeit, Kontinuitaet und Freude an der eigenen Entwicklung. Der Agent soll dies widerspiegeln.

2. **Eigenstaendigkeit foerdern**: Das Flow-Konzept ist explizit so gestaltet, dass es eigenstaendig durchfuehrbar ist. Der Agent soll begleiten, nicht steuern.

3. **Qualitaet vor Vollstaendigkeit**: Wenn eine Uebung nicht zusagt, weglassen. Lieber 20 Min konzentriert als halbherzig.

4. **Koerper-Geist-Verbindung**: Viele Uebungen zielen auf Koerperwahrnehmung. Der Agent kann das durch gezielte Fragen unterstuetzen ("Wo im Koerper spuerst du das gerade?").

5. **Modularer Aufbau**: User soll frei waehlen koennen welche Uebungen wann. Keine starre Reihenfolge erzwingen.

6. **Pausen respektieren**: Zwischen Themen bewusst Pausen einlegen um das Erarbeitete wirken zu lassen.

---

*Erstellt: 2026-03-18 | Basierend auf: Masterarbeit Timo Ehrenberg (DHGS, 2025) + Handout "Zwischen den Zeilen des Lebens" (Ehrenberg, 2025)*
