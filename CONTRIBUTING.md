# Contributing to Oryzn

Oryzn is read-only for the MVP. Do not add GitHub Project mutation, request write permission, implement rollback, or begin Phase-2 work until the MVP specification's rollback gate is satisfied.

## Issue-first development

Every work item must be a GitHub Issue. Implementation pull requests must use `Closes #<number>` to closing-link their issue.

## Issue hygiene (hard CI gate)

Before a pull request can merge, each linked issue must have exactly one milestone and exactly one approved `type:*` label: `type:feature`, `type:bug`, `type:docs`, `type:infra`, `type:test`, or `type:security`.

## Conventional commits

All commit messages and pull request titles must pass commitlint using `@commitlint/config-conventional`.

Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.

Allowed scopes are `acceptance`, `api`, `auth`, `baseline`, `ci`, `db`, `delivery`, `deps`, `docs`, `github`, `infra`, `ingestion`, `main`, `normalizer`, `persistence`, `phase-2`, `reconciliation`, `release`, `roadmap`, `schema`, `security`, `setup`, `test`, `timeline`, `ui`, and `webhook`. The `main` scope is allowed specifically for release-please's release PR.

## Documentation rule (hard CI gate)

Every pull request body must declare exactly one documentation decision:

- `Documentation updated: <paths>` must name concrete paths and the pull request must include an actual Markdown or documentation-file change.
- `No documentation change is needed: <rationale>` must provide a concrete rationale of at least 12 characters.

Reviewers may add the `docs-needed` label to require the documentation-updated path. This policy is declaration-based rather than path-inferred because path inference is noisy and gameable; documentation relevance is a human judgment that the gate merely forces contributors to make explicitly.

## Changelog is automated

Never edit `CHANGELOG.md` manually. Release-please owns it, and CI blocks manual edits. Conventional commits flow into the changelog automatically. Merging `feat` or `fix` commits to `main` causes release-please to open a release PR; merging that PR creates the tag, GitHub Release, and `CHANGELOG.md` entry, and bumps `version.txt`. Oryzn does not publish an npm package.

## Releases

release-please opens a `chore(main): release X.Y.Z` pull request whenever `feat` or `fix` commits land on `main`. Merging that pull request creates the tag, the GitHub Release (marked prerelease while on 0.x), the `CHANGELOG.md` entry, and bumps `version.txt`. v0.1.0 was the first such release.

Because branch protection requires the `commitlint` and `policy` checks and GitHub does not trigger workflows from events caused by the automatic `GITHUB_TOKEN`, a release PR opened with `GITHUB_TOKEN` cannot satisfy those checks on its own. To merge a release PR cleanly, choose one:

1. **Recommended — use a PAT.** Create a fine-grained PAT scoped to this repository with Contents read/write and Pull requests read/write, add it as the `RELEASE_PLEASE_TOKEN` repository secret, and change the `token:` line in `.github/workflows/release-please.yml` to `${{ secrets.RELEASE_PLEASE_TOKEN }}`. Release PRs then open as the PAT user and trigger the gates normally.
2. **Without a PAT — relax and restore.** Temporarily clear the required status check contexts on `main`, merge the release PR, then restore the `commitlint` and `policy` contexts.

## No double tracking

GitHub Issues track detailed work. [`docs/ROADMAP.md`](docs/ROADMAP.md) is milestone-level only. Do not duplicate issue state in the roadmap.

## Stale policy

The stale bot flags all inactive issues after 30 days and inactive pull requests after 45 days, then closes them 14 days later, regardless of milestone. Exempt labels are `phase-2`, `security`, `pinned`, and `stale-exempt` (and `autorelease: pending` for pull requests). Add the `stale-exempt` label to intentionally-parked work you do not want auto-closed.

## Phase-2 gate

Rollback work is blocked until all seven conditions below are met and recorded in [`docs/ROADMAP.md`](docs/ROADMAP.md):

- [ ] All MVP acceptance tests pass.
- [ ] Reconciliation consistently explains current-state drift.
- [ ] At least three pilot customers explicitly request restoration and are willing to grant Project write access.
- [ ] The proposed rollback UX includes a preview and confirmation.
- [ ] The mutation checks that the current GitHub value still equals the expected value.
- [ ] Every rollback produces a new audit event.
- [ ] Partial failures are visible and retryable.

The first rollback restores one field on one item. It is not a bulk rollback.

## Security and integrity

Never commit credentials, tokens, webhook secrets, installation tokens, or full private payloads. Preserve the MVP invariants:

- Store raw evidence before interpretation.
- Process each delivery at most once.
- Keep `audit_events` append-only.
- Persist each event and its current-state update atomically.
- Treat the baseline as current state, not history.
- Never fabricate history during reconciliation.
- Never mutate GitHub.
