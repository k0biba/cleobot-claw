import { ConfidentialClientApplication } from "@azure/msal-node";
import type { MeetingBotConfig } from "../config.js";

let msalClient: ConfidentialClientApplication | null = null;

function getClient(config: MeetingBotConfig): ConfidentialClientApplication {
  if (!msalClient) {
    msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: config.azureClientId,
        clientSecret: config.azureClientSecret,
        authority: `https://login.microsoftonline.com/${config.azureTenantId}`,
      },
    });
  }
  return msalClient;
}

export async function getToken(config: MeetingBotConfig): Promise<string> {
  const client = getClient(config);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await client.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"],
      });
      if (!result?.accessToken) {
        throw new Error("MSAL returned no access token");
      }
      return result.accessToken;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        console.error("[auth] Token acquisition failed, retrying...");
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(
    `Failed to acquire token after 2 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}\n` +
    `Check your azureTenantId, azureClientId, and azureClientSecret.`
  );
}
