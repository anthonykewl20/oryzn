#!/usr/bin/env bash
# pickup.sh — start work on one GitHub issue: one branch, one worktree, one prompt.
# Usage: scripts/pickup.sh <issue> <who> <skill>
set -euo pipefail

usage() {
  echo "Usage: scripts/pickup.sh <issue> <who> <skill>" >&2
  echo "  issue  GitHub issue number" >&2
  echo "  who    your name (branch prefix), e.g. tony" >&2
  echo "  skill  skill name from catalog.md, e.g. debug" >&2
  exit 2
}

[ "$#" -eq 3 ] || usage
issue="$1"
who="$2"
skill="$3"

[[ "$issue" =~ ^[0-9]+$ ]] || { echo "error: <issue> must be an issue number" >&2; exit 2; }
case "$who" in "" | . | .. | */*) echo "error: <who> must be a plain name, no slashes" >&2; exit 2 ;; esac
case "$skill" in "" | . | .. | */*) echo "error: <skill> must be a plain name, no slashes" >&2; exit 2 ;; esac

for tool in git gh; do
  command -v "$tool" >/dev/null 2>&1 || { echo "error: $tool is required but not installed" >&2; exit 1; }
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

skill_path="skills/$skill/SKILL.md"
[ -f "$skill_path" ] || { echo "error: no such skill: $skill_path (see catalog.md)" >&2; exit 1; }

reponame="$(basename "$repo_root")"
reponame="${reponame%.git}"

# Look up the issue; also verifies it exists and is visible to us.
title="$(gh issue view "$issue" --json title --jq '.title')"
url="$(gh issue view "$issue" --json url --jq '.url')"

# Slug from the issue title: lowercase, [a-z0-9-], max 40 chars, no edge dashes.
slug="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
slug="$(printf '%s' "$slug" | cut -c1-40 | sed -E 's/-+$//')"
slug="${slug:-task}"

branch="$who/$issue-$slug"
worktree="$repo_root/../$reponame.$issue-$slug"

git fetch origin
git remote set-head origin --auto >/dev/null 2>&1 || true

base=""
for ref in origin/HEAD origin/main origin/master; do
  if git show-ref --verify --quiet "refs/remotes/$ref"; then
    base="$ref"
    break
  fi
done
[ -n "$base" ] || { echo "error: no origin/HEAD, origin/main, or origin/master found" >&2; exit 1; }

if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo "error: branch '$branch' already exists" >&2
  exit 1
fi
if [ -e "$worktree" ]; then
  echo "error: worktree path already exists: $worktree" >&2
  exit 1
fi

git worktree add -b "$branch" "$worktree" "$base"

echo "Branch:   $branch (from $base)"
echo "Worktree: $worktree"
echo "Skill:    $skill_path"
echo
echo "Paste this prompt into your agent:"
echo
echo "----------------------------------------------------------------"
echo "Issue: $url"
echo "Follow skills/$skill."
echo "When done, follow skills/pr-handoff."
echo "Do not merge."
echo "----------------------------------------------------------------"
