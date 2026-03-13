# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## iCloud Calendar (CalDAV)

- **Email:** boerner.jakub@gmail.com
- **CalDAV URL:** https://caldav.icloud.com/
- **Calendar Home:** https://p47-caldav.icloud.com:443/11770963512/calendars/
- **Password file:** ~/.config/caldav/icloud_password

### Calendars

| Name | Path |
|------|------|
| Privat | home |
| Arbeit | work |
| Sport | 3D43AA37-1581-46FB-95E1-721C59890961 |
| Uni | 5A673322-A386-48C4-9978-AE28B43F60C8 |
| Psychotherapie | 03525301-C15A-4CF5-BCB6-749F64C35D60 |
| Arzt | 65DBAE2E-6EB3-447E-A1E5-C6FEF337B6BD |

## Gmail Email-Scanner
- **Email:** (forwarding address to be configured)@gmail.com
- **IMAP Server:** imap.gmail.com:993 (SSL)
- **Password file:** ~/.config/email/gmail_app_password
- **Auth:** App-Passwort (Google-Konto > Sicherheit > 2FA > App-Passwoerter)
