---
name: claude-worker
description: Spawnt isolierte Claude Code Sessions in Git-Worktrees via tmux. Tasks delegieren, per tmux attach beobachten. Triggers on "worker", "claude-worker", "spawn session", "coding task delegieren".
metadata: {"clawdbot":{"emoji":"🔧","os":["macos"],"requires":{"bins":["tmux","claude","git"]}}}
---

# Claude Worker

Spawnt isolierte Claude Code Sessions in Git-Worktrees innerhalb von tmux-Sessions.

## Usage

Alle Kommandos laufen über das Worker-Script:

```bash
/Users/kubilubi/.openclaw/workspace/skills/claude-worker/scripts/worker.sh <command> [options]
```

## Kommandos

### start — Neue Session spawnen

```bash
worker.sh start --repo /Users/kubilubi/ifbq.org --prompt "Fix the login bug" [--name fix-login] [--model opus] [--branch master] [--mode interactive|oneshot]
```

- `--repo`: Git-Repository-Pfad (required)
- `--prompt`: Aufgabe für Claude (required)
- `--name`: Session-Name (optional, wird aus Prompt generiert)
- `--model`: Claude-Modell (optional, default: keins = Claude default)
- `--branch`: Basis-Branch (optional, default: HEAD)
- `--mode`: `interactive` (default) oder `oneshot` (`-p` flag)

### list — Sessions auflisten

```bash
worker.sh list [--status active|completed|all]
```

### status — Detail-Status einer Session

```bash
worker.sh status --name fix-login
```

Zeigt: tmux-Status, Worktree-Status, uncommitted changes, Commit-Count, letzte 5 Zeilen tmux-Output.

### attach — An Session anhängen

```bash
worker.sh attach --name fix-login
```

### cancel — Session abbrechen

```bash
worker.sh cancel --name fix-login
```

Sendet Ctrl-C, wartet 3s, killt tmux-Session falls nötig.

### cleanup — Beendete Session aufräumen

```bash
worker.sh cleanup --name fix-login [--force]
```

Entfernt Worktree + Branch. Warnt bei uncommitted changes (ohne `--force`).

### resume — Session fortsetzen

```bash
worker.sh resume --name fix-login [--prompt "Continue where you left off"]
```

## Naming-Konventionen

| Element | Format | Beispiel |
|---------|--------|----------|
| tmux-Session | `cw-<name>` | `cw-fix-login` |
| Worktree-Branch | `cw/<name>` | `cw/fix-login` |
| Worktree-Pfad | `<repo>/.worktrees/<name>` | `.../ifbq.org/.worktrees/fix-login` |

## Registry

Session-State wird in `.state/registry.json` getrackt.
