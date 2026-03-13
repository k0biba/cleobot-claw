import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface MeetingBotConfig {
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret: string;
  callbackBaseUrl: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  hfToken: string | null;
  outputDir: string;
  callbackPort: number;
}

const CONFIG_KEYS: Array<{
  key: keyof MeetingBotConfig;
  env: string;
  required: boolean;
  default?: string | number | null;
}> = [
  { key: "azureTenantId", env: "MEETING_BOT_AZURE_TENANT_ID", required: true },
  { key: "azureClientId", env: "MEETING_BOT_AZURE_CLIENT_ID", required: true },
  { key: "azureClientSecret", env: "MEETING_BOT_AZURE_CLIENT_SECRET", required: true },
  { key: "callbackBaseUrl", env: "MEETING_BOT_CALLBACK_BASE_URL", required: true },
  { key: "openaiApiKey", env: "OPENAI_API_KEY", required: true },
  { key: "anthropicApiKey", env: "ANTHROPIC_API_KEY", required: true },
  { key: "hfToken", env: "HF_TOKEN", required: false, default: null },
  { key: "outputDir", env: "MEETING_BOT_OUTPUT_DIR", required: false, default: join(homedir(), "openclaw-meetings") },
  { key: "callbackPort", env: "MEETING_BOT_CALLBACK_PORT", required: false, default: 3978 },
];

function loadOpenclawJson(): Record<string, unknown> {
  const configPath = join(homedir(), ".openclaw", "openclaw.json");
  try {
    let raw = readFileSync(configPath, "utf-8");
    // Strip single-line comments (// ...)
    raw = raw.replace(/\/\/.*$/gm, "");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getSkillConfig(root: Record<string, unknown>): Record<string, unknown> {
  try {
    const skills = root["skills"] as Record<string, unknown> | undefined;
    if (!skills) return {};
    const entries = skills["entries"] as Record<string, unknown> | undefined;
    if (!entries) return {};
    const meetingBot = entries["meeting-bot"] as Record<string, unknown> | undefined;
    if (!meetingBot) return {};
    return (meetingBot["config"] as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

export function loadConfig(): MeetingBotConfig {
  const root = loadOpenclawJson();
  const skillConfig = getSkillConfig(root);

  const missing: string[] = [];
  const result: Record<string, unknown> = {};

  for (const { key, env, required, default: defaultVal } of CONFIG_KEYS) {
    // Priority: openclaw.json skill config > env var > default
    const value = skillConfig[key] ?? process.env[env] ?? defaultVal;

    if (value === undefined || value === null) {
      if (required) {
        missing.push(`  - ${key} (env: ${env})`);
      } else {
        result[key] = defaultVal ?? null;
      }
    } else {
      result[key] = key === "callbackPort" ? Number(value) : value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration:\n${missing.join("\n")}\n\n` +
      `Set them in ~/.openclaw/openclaw.json under skills.entries["meeting-bot"].config\n` +
      `or as environment variables.`
    );
  }

  return Object.freeze(result as unknown as MeetingBotConfig);
}
