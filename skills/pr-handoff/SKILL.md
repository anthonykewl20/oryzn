---
name: pr-handoff
description: Open and hand off a draft PR for human review. Use when work on an issue is complete and tested, or when finishing a PR that is already open.
metadata:
  version: "1.0"
---

# pr-handoff

1. Push the branch.
2. Open a **draft** PR with `gh` if it is available:

   ```bash
   gh pr create --draft --title "<short title> (#<issue>)" --body "<see below>"
   ```

   If `gh` is not available, print the exact `git push` command and the PR-creation URL for the human instead.
3. Title and body must include the issue number.
4. Body sections, in order: **Summary**, **Test plan**, **Skill used**, **Risk**.
5. Do not merge. The human owner reviews, promotes, and merges.
6. Move the work to Review: comment on the issue with the PR URL so the board reflects the handoff.

   ```bash
   gh issue comment <issue> --body "PR: <url> — moved to Review"
   ```
