import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const targetHooksPath = ".githooks";

function git(args, options = {}) {
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    ...options,
  });
}

const repository = git(["rev-parse", "--show-toplevel"]);
if (repository.status !== 0) {
  console.error(repository.stderr || "Unable to locate the Git repository.");
  process.exit(1);
}
if (path.resolve(repository.stdout.trim()) !== root) {
  console.error(`Hook installer must run from repository root: ${root}`);
  process.exit(1);
}

const configured = git(["config", "--get", "core.hooksPath"]);
const currentHooksPath = configured.status === 0 ? configured.stdout.trim() : "";
const acceptedPaths = new Set([
  targetHooksPath,
  path.join(root, targetHooksPath),
]);
if (currentHooksPath && !acceptedPaths.has(currentHooksPath)) {
  console.error(
    `Refusing to replace existing core.hooksPath=${currentHooksPath}. Merge its hooks with ${targetHooksPath} manually.`,
  );
  process.exit(1);
}

if (!currentHooksPath) {
  const legacyHookPath = git(["rev-parse", "--git-path", "hooks/pre-commit"]);
  if (legacyHookPath.status === 0) {
    const resolvedLegacyHook = path.resolve(root, legacyHookPath.stdout.trim());
    if (fs.existsSync(resolvedLegacyHook)) {
      console.error(
        `Refusing to bypass existing pre-commit hook at ${resolvedLegacyHook}. Merge it with ${targetHooksPath}/pre-commit manually.`,
      );
      process.exit(1);
    }
  }
}

const hookPath = path.join(root, targetHooksPath, "pre-commit");
if (!fs.existsSync(hookPath)) {
  console.error(`Versioned pre-commit hook is missing: ${hookPath}`);
  process.exit(1);
}
fs.chmodSync(hookPath, 0o755);

const update = git(["config", "core.hooksPath", targetHooksPath]);
if (update.status !== 0) {
  console.error(update.stderr || "Unable to configure core.hooksPath.");
  process.exit(1);
}

console.log(`Git hooks enabled: core.hooksPath=${targetHooksPath}`);
