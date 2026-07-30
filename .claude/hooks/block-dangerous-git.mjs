import { execFileSync } from "node:child_process";

let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;

let command = "";
try {
  command = JSON.parse(raw)?.tool_input?.command ?? "";
} catch {
  process.exit(0);
}

const containsGitPush =
  /(?:^|[\s;&|])(?:command\s+)?git(?:\s+-C\s+(?:"[^"]*"|'[^']*'|\S+))?\s+push(?:\s|$)/m.test(
    command,
  );

if (!containsGitPush) process.exit(0);

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

if (/(?:^|\s)(?:--force(?:-with-lease)?|-f)(?:=|\s|$)/m.test(command)) {
  deny("Force pushes are disabled for shared-repository safety.");
}

if (
  /(?:^|\s)(?:(?:HEAD|[^:\s]+):)?(?:refs\/heads\/)?(?:main|master)(?:\s|$)/m.test(
    command,
  )
) {
  deny("Direct pushes to main or master are disabled. Push a task branch and open a pull request.");
}

let branch = "";
try {
  branch = execFileSync(
    "git",
    ["-C", process.env.CLAUDE_PROJECT_DIR || process.cwd(), "branch", "--show-current"],
    { encoding: "utf8" },
  ).trim();
} catch {
  deny("The current Git branch could not be verified, so this push was blocked.");
}

if (!branch || branch === "main" || branch === "master") {
  deny(`Push blocked while the current branch is ${branch || "detached HEAD"}.`);
}
