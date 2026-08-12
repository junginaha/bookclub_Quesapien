# Collaboration safety rules

These rules are mandatory when Claude Code, Codex, or a human may work on this repository at the same time.

## Before changing files

1. Run `git status --short --branch` and `git fetch origin`.
2. Never discard, overwrite, stash, or commit changes that you did not create.
3. If the worktree is dirty and ownership is unclear, stop and report the changed file names.
4. Never implement work directly on `main`. Start from the latest `origin/main` on a task branch named `claude/YYYY-MM-DD-short-task`.
5. If another agent is already editing overlapping files, choose non-overlapping files or wait. Do not resolve the overlap by replacing the other agent's version.

## Before publishing

1. Confirm the current branch is not `main`.
2. Fetch `origin/main` again and compare the task branch with it.
3. Rebase or merge the latest `origin/main` only when the worktree is clean.
4. If a conflict occurs, stop and report every conflicted path. Do not choose `ours` or `theirs` automatically.
5. Run the relevant tests and build, then push the explicit task branch and open a pull request.
6. Do not merge while another agent has uncommitted overlapping work.
7. Production deployment follows the reviewed merge to `main`; do not deploy an unreviewed task branch as production.

## Prohibited operations

Never use force push, `git reset --hard`, `git clean -f`, or any command that rewrites or deletes another worker's history or uncommitted work. Never push directly to `main`.

## Non-Git state

Vercel environment variables, production database rows, and other runtime state cannot be protected by Git branches. Before changing them, explicitly identify the target environment and confirm that no other worker is changing the same resource.
