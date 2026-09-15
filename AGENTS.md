# Repository collaboration policy

This repository may be edited concurrently by Claude Code, Codex, and humans. Protect existing work first.

## Required workflow

- Do not edit, commit to, or push directly to `main`.
- Begin every task by checking the worktree and fetching `origin/main`.
- Use a dedicated branch: `agent/<task>` for Codex, `claude/<date>-<task>` for Claude Code, or `feature/<task>` for human work.
- Preserve all pre-existing or unowned changes. Never reset, clean, replace, or silently include them in a commit.
- Before publishing, fetch again, compare against the latest `origin/main`, and list overlapping paths.
- If conflicts exist, stop and report them. Never auto-select one side of a conflict.
- Push only the explicit task branch and use a pull request. Merge only after relevant build/tests and preview checks pass.
- Never force-push shared branches or use destructive Git commands.

## GitHub connector writes

When changing an existing GitHub file through an API or connector, fetch its latest blob SHA immediately before the write and use optimistic concurrency. If the SHA is stale, refetch and reconcile; do not overwrite.

## Production state

Git protects source files only. Treat production database content, Vercel environment variables, domains, and deployment settings as separately shared resources. Identify the exact environment before mutation and do not change the same resource concurrently with another worker.

## Deployment rule

Production is sourced from reviewed `main`. A task branch may be used for preview verification but must not replace production before merge.
