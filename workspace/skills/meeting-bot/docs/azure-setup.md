# Azure Setup for Meeting Bot

Step-by-step guide to configure Azure for the meeting bot.

## 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `meeting-bot` (or any name)
3. Supported account types: **Accounts in this organizational directory only** (Single tenant)
4. Redirect URI: Leave blank
5. Click **Register**
6. Note the **Application (client) ID** and **Directory (tenant) ID**

## 2. Create Client Secret

1. In your app registration → **Certificates & secrets** → **New client secret**
2. Description: `meeting-bot-secret`
3. Expiry: Choose appropriate duration
4. Click **Add**
5. **Copy the secret value immediately** (it won't be shown again)

## 3. Configure API Permissions

1. In your app registration → **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Application permissions**
3. Add these permissions:
   - `Calls.JoinGroupCall.All` — Join group calls and meetings
   - `Calls.Initiate.All` — Initiate outgoing calls
   - `Calls.AccessMedia.All` — Access media streams in calls
4. Click **Grant admin consent for [your tenant]**
5. Verify all permissions show a green checkmark

## 4. Create Azure Bot Service

1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource** → Search **Azure Bot**
2. Click **Create**
3. Bot handle: `meeting-bot`
4. Subscription & Resource Group: Select yours
5. Type of App: **Multi Tenant** or **Single Tenant** (match your app registration)
6. Creation type: **Use existing app registration**
7. App ID: Paste your Application (client) ID from step 1
8. Click **Create**

## 5. Configure Bot Channel

1. In your Bot Service → **Channels** → **Microsoft Teams**
2. Enable the Teams channel
3. Under **Calling** tab:
   - Enable **Enable calling**
   - Webhook URL: `{callbackBaseUrl}/api/callback`
4. Click **Save**

## 6. Configure Messaging Endpoint

1. In your Bot Service → **Configuration**
2. Set **Messaging endpoint** to: `{callbackBaseUrl}/api/callback`
3. Click **Apply**

## 7. Set Up Tunnel for Local Development

For local development, you need a public URL that tunnels to your local callback server.

### Using ngrok

```bash
# Install ngrok (https://ngrok.com)
ngrok http 3978
```

Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok-free.app`).

### Using other tunnels

Any tunnel service that provides a public HTTPS URL forwarding to `localhost:3978` will work.

## 8. Configure meeting-bot

Add configuration to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "meeting-bot": {
        "config": {
          "azureTenantId": "your-tenant-id",
          "azureClientId": "your-client-id",
          "azureClientSecret": "your-client-secret",
          "callbackBaseUrl": "https://your-ngrok-url.ngrok-free.app"
        }
      }
    }
  }
}
```

Or set environment variables:

```bash
export MEETING_BOT_AZURE_TENANT_ID="your-tenant-id"
export MEETING_BOT_AZURE_CLIENT_ID="your-client-id"
export MEETING_BOT_AZURE_CLIENT_SECRET="your-client-secret"
export MEETING_BOT_CALLBACK_BASE_URL="https://your-ngrok-url.ngrok-free.app"
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

## 9. Test

```bash
# Check status (should return idle)
node dist/index.js status

# Join a test meeting
node dist/index.js join --url "https://teams.microsoft.com/l/meetup-join/..."

# In another terminal, stop and process
node dist/index.js stop
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| 403 Forbidden | Admin consent not granted. Go to API permissions and grant admin consent. |
| 404 Not Found | Meeting URL is invalid or meeting has ended. |
| Token acquisition failed | Check tenant ID, client ID, and client secret. |
| Bot not joining | Verify the messaging endpoint matches your callback URL. Check that Teams channel is enabled. |
| External participant blocked | The meeting organizer must allow external participants in meeting settings. |
