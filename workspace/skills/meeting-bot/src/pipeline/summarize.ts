import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Du bist ein Meeting-Assistent. Erstelle eine strukturierte Zusammenfassung des folgenden Meeting-Transkripts.

Verwende die Sprache des Transkripts für die Zusammenfassung.

Formatiere die Zusammenfassung als Markdown mit folgenden Abschnitten:

## Themen
- Besprochene Themen als Aufzählung

## Entscheidungen
- Getroffene Entscheidungen als Aufzählung

## Aktionspunkte
- [ ] Aufgabe (Verantwortlich: Speaker N)
- [ ] Weitere Aufgabe (Verantwortlich: Speaker N)

## Wichtige Punkte
- Kernaussagen und wichtige Informationen

## Teilnehmer
- Speaker N: ungefähre Redezeit, Hauptthemen`;

export async function summarize(
  apiKey: string,
  transcript: string,
): Promise<string> {
  const client = new Anthropic({ apiKey });

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Hier ist das Meeting-Transkript:\n\n${transcript}`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      console.error("[summarize] Summary generated");
      return textBlock.text;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        console.error("[summarize] Claude API failed, retrying...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw new Error(
    `Summarization failed after 2 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}
