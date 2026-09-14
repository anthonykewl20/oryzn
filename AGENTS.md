# AGENTS.md

Operating standard for AI coding agents (Claude Code, Codex, and others) in this repo.
GitHub Issues + GitHub Projects are the only PM tool — do not add a second board, tracker, or PM integration.

## Commands

This repo is a fresh start: there is no package manifest, no Makefile, and no CI yet, so there is nothing to install, build, test, or typecheck.

- Install: N/A — no dependencies are declared.
- Test: no test command exists yet. Do not invent or guess one.
- Typecheck: no typecheck command exists yet.
- CI: none configured (no `.github/workflows/`).

When the first build system or CI workflow lands, update this section in the same PR and list the exact commands here. If you are unsure what the commands are, check `.github/workflows/` — never invent a script that does not exist.

## Layout

- `AGENTS.md` — this file. Operating facts and rules for agents.
- `CLAUDE.md` — imports `AGENTS.md` (Claude Code entry point).
- `catalog.md` — table of available skills and their status.
- `skills/<name>/SKILL.md` — one file per skill; the instructions an agent loads and follows.
- `scripts/pickup.sh` — start work on an issue: creates the branch and worktree, prints the prompt to paste into an agent.
- `.agents/skills`, `.claude/skills` — symlinks to `skills/` so agent tooling can discover the skills.

## Rules

- One GitHub issue per run. No issue, no run.
- One human owner per issue. The owner reviews and merges.
- One worktree per run (`scripts/pickup.sh` creates it).
- One branch per run, named `{who}/{issue}-{slug}` (e.g. `tony/12-fix-login-flake`).
- One agent per run. Do not run parallel agents on the same issue.
- Never merge. Agents open draft PRs; only the human owner merges.
- Open a draft PR when the work is ready for review (`skills/pr-handoff`).
- If the task matches a skill in `catalog.md`, load that skill's `SKILL.md` and follow it.

## Skill map

| Task | Skill |
| ---- | ----- |
| Bug or failing test | `skills/debug` |
| Docs or runbook work | `skills/write-docs` |
| Opening or finishing a PR | `skills/pr-handoff` |

## Starting work on an issue

```
scripts/pickup.sh <issue> <who> <skill>
```

Fetches origin, creates the `{who}/{issue}-{slug}` branch and its worktree, and prints the exact prompt to paste into the agent. It never starts an agent itself.
