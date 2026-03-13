#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
REGISTRY="$SKILL_DIR/.state/registry.json"

# Ensure registry exists
if [[ ! -f "$REGISTRY" ]]; then
  mkdir -p "$(dirname "$REGISTRY")"
  echo '{"version":1,"sessions":[]}' > "$REGISTRY"
fi

# --- Helpers ---

die() { echo "ERROR: $*" >&2; exit 1; }

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

gen_uuid() {
  if command -v uuidgen &>/dev/null; then
    uuidgen | tr '[:upper:]' '[:lower:]'
  else
    python3 -c "import uuid; print(uuid.uuid4())"
  fi
}

gen_name_from_prompt() {
  local prompt="$1"
  # Take first 3 words, lowercase, join with dash, limit to 30 chars
  echo "$prompt" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | awk '{for(i=1;i<=3&&i<=NF;i++) printf "%s%s",$i,(i<3&&i<NF?"-":""); print ""}' | cut -c1-30 | sed 's/-$//'
}

# --- Registry helpers (all use sys.argv to avoid shell injection) ---

registry_read() {
  cat "$REGISTRY"
}

registry_write() {
  local json="$1"
  echo "$json" > "$REGISTRY"
}

registry_add_session() {
  local session_json="$1"
  # Write session JSON to temp file to avoid quoting issues
  local tmpfile
  tmpfile=$(mktemp)
  printf '%s' "$session_json" > "$tmpfile"

  python3 -c "
import json, sys, os
tmpfile, reg_file = sys.argv[1], sys.argv[2]
with open(reg_file, 'r') as f:
    reg = json.load(f)
with open(tmpfile, 'r') as f:
    session = json.load(f)
os.unlink(tmpfile)
# Deduplicate: remove non-active entries with same name
reg['sessions'] = [s for s in reg['sessions']
                   if s['name'] != session['name']
                   or s['status'] == 'active']
reg['sessions'].append(session)
with open(reg_file, 'w') as f:
    json.dump(reg, f, indent=2)
" "$tmpfile" "$REGISTRY"
}

registry_update_session() {
  local name="$1"
  local field="$2"
  local value="$3"
  python3 -c "
import json, sys
name, field, value, reg_file, updated_at = sys.argv[1:6]
with open(reg_file, 'r') as f:
    reg = json.load(f)
for s in reg['sessions']:
    if s['name'] == name:
        s[field] = value
        s['updatedAt'] = updated_at
        break
with open(reg_file, 'w') as f:
    json.dump(reg, f, indent=2)
" "$name" "$field" "$value" "$REGISTRY" "$(now_iso)"
}

registry_get_session() {
  local name="$1"
  python3 -c "
import json, sys
name, reg_file = sys.argv[1], sys.argv[2]
with open(reg_file, 'r') as f:
    reg = json.load(f)
# Find the most recent entry with this name
found = None
for s in reg['sessions']:
    if s['name'] == name:
        found = s
if found:
    print(json.dumps(found, indent=2))
else:
    print('null')
" "$name" "$REGISTRY"
}

ensure_gitignore_worktrees() {
  local repo="$1"
  local gitignore="$repo/.gitignore"
  if [[ -f "$gitignore" ]]; then
    if ! grep -qxF '.worktrees' "$gitignore" 2>/dev/null; then
      echo '.worktrees' >> "$gitignore"
    fi
  else
    echo '.worktrees' > "$gitignore"
  fi
}

tmux_session_alive() {
  local session_name="$1"
  tmux has-session -t "$session_name" 2>/dev/null
}

# Start a tmux session running claude, using a launcher script to avoid quoting issues.
# Args: tmux_session wt_path mode model prompt [extra_flags]
start_tmux_claude_session() {
  local tmux_session="$1"
  local wt_path="$2"
  local mode="$3"
  local model="$4"
  local prompt="$5"
  local extra_flags="${6:-}"

  # Write launcher script using printf %q for safe shell escaping
  local launcher="$wt_path/.cw-launcher.sh"
  {
    echo '#!/usr/bin/env bash'
    printf 'cd %q || exit 1\n' "$wt_path"

    local cmd_line="claude --dangerously-skip-permissions"
    [[ -n "$model" ]] && cmd_line+=" --model $(printf '%q' "$model")"
    [[ -n "$extra_flags" ]] && cmd_line+=" $extra_flags"

    if [[ "$mode" == "oneshot" ]]; then
      printf '%s -p %q\n' "$cmd_line" "$prompt"
      echo 'echo ""'
      echo 'echo "[DONE] Press Enter to close."'
      echo 'read'
    elif [[ -n "$prompt" ]]; then
      printf 'exec %s %q\n' "$cmd_line" "$prompt"
    else
      printf 'exec %s\n' "$cmd_line"
    fi
  } > "$launcher"
  chmod +x "$launcher"

  # Start tmux session with the launcher script as the command.
  # This avoids multi-level quoting issues entirely.
  tmux new-session -d -s "$tmux_session" "bash $(printf '%q' "$launcher")" \
    || die "Failed to create tmux session"

  # Keep window open if process exits, so errors can be diagnosed
  tmux set-option -t "$tmux_session" remain-on-exit on 2>/dev/null || true
}

# Build session JSON safely, passing prompt via temp file
build_session_json() {
  local id="$1" name="$2" repo="$3" branch="$4" wt_branch="$5"
  local wt_path="$6" tmux_session="$7" model="$8" mode="$9"
  local prompt="${10}" ts="${11}"

  local prompt_file
  prompt_file=$(mktemp)
  printf '%s' "$prompt" > "$prompt_file"

  python3 -c "
import json, sys, os
prompt_file = sys.argv[1]
with open(prompt_file, 'r') as f:
    prompt = f.read()
os.unlink(prompt_file)
print(json.dumps({
    'id': sys.argv[2],
    'name': sys.argv[3],
    'status': 'active',
    'repo': sys.argv[4],
    'baseBranch': sys.argv[5],
    'worktreeBranch': sys.argv[6],
    'worktreePath': sys.argv[7],
    'tmuxSession': sys.argv[8],
    'model': sys.argv[9],
    'mode': sys.argv[10],
    'prompt': prompt,
    'createdAt': sys.argv[11],
    'updatedAt': sys.argv[11]
}))
" "$prompt_file" "$id" "$name" "$repo" "$branch" "$wt_branch" \
    "$wt_path" "$tmux_session" "$model" "$mode" "$ts"
}

# --- Commands ---

cmd_start() {
  local repo="" prompt="" name="" model="" branch="" mode="interactive"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo)    repo="$2"; shift 2 ;;
      --prompt)  prompt="$2"; shift 2 ;;
      --name)    name="$2"; shift 2 ;;
      --model)   model="$2"; shift 2 ;;
      --branch)  branch="$2"; shift 2 ;;
      --mode)    mode="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  # Validate
  [[ -z "$repo" ]] && die "--repo is required"
  [[ -z "$prompt" ]] && die "--prompt is required"
  [[ -d "$repo/.git" ]] || die "$repo is not a git repository"
  command -v tmux &>/dev/null || die "tmux not found in PATH"
  command -v claude &>/dev/null || die "claude not found in PATH"

  # Generate name if not provided
  if [[ -z "$name" ]]; then
    name=$(gen_name_from_prompt "$prompt")
  fi

  # Collision check: verify no truly active session with this name
  local active_check
  active_check=$(python3 -c "
import json, sys, subprocess
reg_file, name = sys.argv[1], sys.argv[2]
with open(reg_file, 'r') as f:
    reg = json.load(f)
changed = False
active = False
for s in reg['sessions']:
    if s['name'] == name and s['status'] == 'active':
        result = subprocess.run(['tmux', 'has-session', '-t', s['tmuxSession']], capture_output=True)
        if result.returncode == 0:
            active = True
        else:
            s['status'] = 'completed'
            changed = True
if changed:
    with open(reg_file, 'w') as f:
        json.dump(reg, f, indent=2)
print('active' if active else 'ok')
" "$REGISTRY" "$name")

  if [[ "$active_check" == "active" ]]; then
    die "Session '$name' is already active. Use a different name or cleanup first."
  fi

  # Determine base branch
  if [[ -z "$branch" ]]; then
    branch=$(git -C "$repo" rev-parse --abbrev-ref HEAD)
  fi

  # Create worktrees dir + gitignore
  mkdir -p "$repo/.worktrees"
  ensure_gitignore_worktrees "$repo"

  local wt_path="$repo/.worktrees/$name"
  local wt_branch="cw/$name"
  local tmux_session="cw-$name"

  # Create worktree
  git -C "$repo" worktree add -b "$wt_branch" "$wt_path" "$branch" 2>&1 || die "Failed to create worktree"

  # Start tmux session with claude (via launcher script)
  start_tmux_claude_session "$tmux_session" "$wt_path" "$mode" "$model" "$prompt"

  # Registry entry (safe JSON construction)
  local ts
  ts=$(now_iso)
  local session_json
  session_json=$(build_session_json \
    "$(gen_uuid)" "$name" "$repo" "$branch" "$wt_branch" \
    "$wt_path" "$tmux_session" "$model" "$mode" "$prompt" "$ts")
  registry_add_session "$session_json"

  echo "Session '$name' started."
  echo ""
  echo "  tmux session:  $tmux_session"
  echo "  worktree:      $wt_path"
  echo "  branch:        $wt_branch"
  echo "  mode:          $mode"
  echo "  model:         ${model:-default}"
  echo ""
  echo "Attach with:"
  echo "  tmux attach -t $tmux_session"
}

cmd_list() {
  local filter="all"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --status) filter="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  python3 -c "
import json, subprocess, sys

reg_file, filt = sys.argv[1], sys.argv[2]
with open(reg_file, 'r') as f:
    reg = json.load(f)

if not reg['sessions']:
    print('No sessions found.')
    sys.exit(0)

# Update status for active sessions
for s in reg['sessions']:
    if s['status'] == 'active':
        try:
            result = subprocess.run(['tmux', 'has-session', '-t', s['tmuxSession']], capture_output=True)
            if result.returncode != 0:
                s['status'] = 'completed'
        except:
            s['status'] = 'orphaned'

# Save updated statuses
with open(reg_file, 'w') as f:
    json.dump(reg, f, indent=2)

# Filter
sessions = reg['sessions']
if filt != 'all':
    sessions = [s for s in sessions if s['status'] == filt]

if not sessions:
    print(f'No {filt} sessions found.')
    sys.exit(0)

# Print table
print(f\"{'NAME':<20} {'STATUS':<12} {'MODE':<12} {'MODEL':<10} {'BRANCH':<20} {'CREATED'}\")
print('-' * 100)
for s in sessions:
    created = s.get('createdAt', '')[:16].replace('T', ' ')
    print(f\"{s['name']:<20} {s['status']:<12} {s.get('mode','?'):<12} {s.get('model','default'):<10} {s.get('baseBranch','?'):<20} {created}\")
" "$REGISTRY" "$filter"
}

cmd_status() {
  local name=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) name="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -z "$name" ]] && die "--name is required"

  local session
  session=$(registry_get_session "$name")
  [[ "$session" == "null" ]] && die "Session '$name' not found in registry"

  local tmux_session="cw-$name"
  local wt_path
  wt_path=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['worktreePath'])")
  local repo
  repo=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['repo'])")
  local base_branch
  base_branch=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['baseBranch'])")

  echo "=== Session: $name ==="
  echo ""

  # tmux status
  if tmux_session_alive "$tmux_session"; then
    echo "tmux:      ALIVE ($tmux_session)"
  else
    echo "tmux:      DEAD ($tmux_session)"
    registry_update_session "$name" "status" "completed"
  fi

  # Worktree status
  if [[ -d "$wt_path" ]]; then
    echo "worktree:  EXISTS ($wt_path)"

    # Uncommitted changes
    local changes
    changes=$(git -C "$wt_path" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    echo "changes:   $changes uncommitted file(s)"

    # Commit count since base
    local commits
    commits=$(git -C "$wt_path" rev-list --count "$base_branch..HEAD" 2>/dev/null || echo "?")
    echo "commits:   $commits since $base_branch"
  else
    echo "worktree:  MISSING ($wt_path)"
  fi

  echo ""

  # Registry data
  echo "$session" | python3 -c "
import json, sys
s = json.load(sys.stdin)
print(f\"status:    {s['status']}\")
print(f\"mode:      {s.get('mode', '?')}\")
print(f\"model:     {s.get('model', 'default')}\")
print(f\"prompt:    {s.get('prompt', '?')}\")
print(f\"created:   {s.get('createdAt', '?')}\")
print(f\"updated:   {s.get('updatedAt', '?')}\")
"

  # tmux pane peek
  if tmux_session_alive "$tmux_session"; then
    echo ""
    echo "--- Last 5 lines of tmux output ---"
    tmux capture-pane -t "$tmux_session" -p 2>/dev/null | grep -v '^$' | tail -5
  fi
}

cmd_attach() {
  local name=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) name="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -z "$name" ]] && die "--name is required"

  local tmux_session="cw-$name"
  if tmux_session_alive "$tmux_session"; then
    echo "tmux attach -t $tmux_session"
  else
    die "tmux session '$tmux_session' is not running"
  fi
}

cmd_cancel() {
  local name=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) name="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -z "$name" ]] && die "--name is required"

  local tmux_session="cw-$name"

  if tmux_session_alive "$tmux_session"; then
    echo "Sending Ctrl-C to $tmux_session..."
    tmux send-keys -t "$tmux_session" C-c
    sleep 3

    if tmux_session_alive "$tmux_session"; then
      echo "Session still alive, killing..."
      tmux kill-session -t "$tmux_session"
    fi
  else
    echo "tmux session '$tmux_session' is not running."
  fi

  registry_update_session "$name" "status" "cancelled"
  echo "Session '$name' cancelled."
}

cmd_cleanup() {
  local name="" force=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name)  name="$2"; shift 2 ;;
      --force) force=true; shift ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -z "$name" ]] && die "--name is required"

  local session
  session=$(registry_get_session "$name")
  [[ "$session" == "null" ]] && die "Session '$name' not found in registry"

  local tmux_session="cw-$name"
  local wt_path
  wt_path=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['worktreePath'])")
  local repo
  repo=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['repo'])")
  local wt_branch="cw/$name"

  # Check if tmux is still running
  if tmux_session_alive "$tmux_session"; then
    if [[ "$force" == "true" ]]; then
      echo "Force: killing tmux session..."
      tmux kill-session -t "$tmux_session"
    else
      die "Session '$tmux_session' is still running. Cancel first or use --force."
    fi
  fi

  # Check for uncommitted changes
  if [[ -d "$wt_path" ]]; then
    local changes
    changes=$(git -C "$wt_path" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$changes" -gt 0 && "$force" != "true" ]]; then
      die "Worktree has $changes uncommitted file(s). Use --force to remove anyway."
    fi

    # Clean up launcher script if present
    rm -f "$wt_path/.cw-launcher.sh"

    # Remove worktree
    echo "Removing worktree at $wt_path..."
    git -C "$repo" worktree remove "$wt_path" --force 2>&1
  else
    echo "Worktree already removed."
  fi

  # Remove branch
  if git -C "$repo" rev-parse --verify "$wt_branch" &>/dev/null; then
    echo "Deleting branch $wt_branch..."
    git -C "$repo" branch -D "$wt_branch" 2>&1
  fi

  registry_update_session "$name" "status" "cleaned"
  echo "Session '$name' cleaned up."
}

cmd_resume() {
  local name="" prompt=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name)   name="$2"; shift 2 ;;
      --prompt) prompt="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -z "$name" ]] && die "--name is required"

  local session
  session=$(registry_get_session "$name")
  [[ "$session" == "null" ]] && die "Session '$name' not found in registry"

  local wt_path
  wt_path=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin)['worktreePath'])")
  local model
  model=$(echo "$session" | python3 -c "import json,sys; print(json.load(sys.stdin).get('model',''))")

  [[ -d "$wt_path" ]] || die "Worktree does not exist at $wt_path. Cannot resume."

  local tmux_session="cw-$name"

  # Kill existing tmux session if any
  if tmux_session_alive "$tmux_session"; then
    die "Session '$tmux_session' is already running. Attach instead."
  fi

  # Start tmux session with claude --continue (via launcher script)
  if [[ -n "$prompt" ]]; then
    start_tmux_claude_session "$tmux_session" "$wt_path" "interactive" "$model" "$prompt" "--continue"
  else
    start_tmux_claude_session "$tmux_session" "$wt_path" "interactive" "$model" "" "--continue"
  fi

  registry_update_session "$name" "status" "active"
  echo "Session '$name' resumed."
  echo ""
  echo "Attach with:"
  echo "  tmux attach -t $tmux_session"
}

# --- Main ---

COMMAND="${1:-}"
shift || true

case "$COMMAND" in
  start)   cmd_start "$@" ;;
  list)    cmd_list "$@" ;;
  status)  cmd_status "$@" ;;
  attach)  cmd_attach "$@" ;;
  cancel)  cmd_cancel "$@" ;;
  cleanup) cmd_cleanup "$@" ;;
  resume)  cmd_resume "$@" ;;
  *)
    echo "Usage: worker.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start    Start a new Claude worker session"
    echo "  list     List all sessions"
    echo "  status   Show detailed status of a session"
    echo "  attach   Get tmux attach command"
    echo "  cancel   Cancel a running session"
    echo "  cleanup  Remove worktree and branch"
    echo "  resume   Resume a stopped session"
    exit 1
    ;;
esac
