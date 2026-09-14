# Runbook: re-verify the agent standard on main

Run this after changing `scripts/pickup.sh`, `skills/`, or `AGENTS.md`, or whenever a pickup run behaves unexpectedly.
Last verified: 2026-09-14 on `main` @ `2ee3c40` (issue #35) — all checks passed, no defects found.

## Symptoms

Run this procedure when:

- `scripts/pickup.sh` errors out, creates a wrong branch or worktree name, or prints a malformed prompt.
- Skills or the `.agents/skills` / `.claude/skills` symlinks are missing or broken in a fresh worktree.
- The standard itself changed (script, skills, `AGENTS.md`, symlinks) and needs re-verification on `main`.

## Checks

From the main checkout (the repo itself, not a worktree):

1. `bash -n scripts/pickup.sh` — syntax is clean.
2. `scripts/pickup.sh <open-issue> <who> debug` — must create branch `<who>/<issue>-<slug>` from `origin/HEAD` (falling back to `origin/main` / `origin/master`), worktree `../<reponame>.<issue>-<slug>`, and print the four-line prompt: Issue URL / `Follow skills/<skill>.` / `When done, follow skills/pr-handoff.` / `Do not merge.`
3. Inside the new worktree: `git rev-parse HEAD` matches `origin/main`; `test -x scripts/pickup.sh` succeeds; `readlink -f .claude/skills/debug/SKILL.md` resolves inside the worktree; `cat CLAUDE.md` prints `@AGENTS.md`; each `skills/*/SKILL.md` has `name`, `description`, and `metadata.version: "1.0"` frontmatter.
4. Guards fail cleanly with no side effects (`git worktree list` unchanged): unknown skill → exit 1; re-running the same issue → "branch already exists", exit 1; unknown issue → `gh` error, exit 1; no args → usage, exit 2.
5. Clean up a throwaway verification run only (not real work): `git worktree remove ../<reponame>.<issue>-<slug> && git branch -D <who>/<issue>-<slug>`.

## Fix

No defects were found on 2026-09-14; nothing in `scripts/` or `skills/` needed changing. If a check fails now, follow `skills/debug` (failing repro → root cause → fix the cause), change only the standard or the script, and re-run this runbook.

## Escalation

Owner: Anthony Garces. If the standard is broken on `main` and the fix is unclear, open a GitHub issue containing the failing check's full output and assign the owner.
