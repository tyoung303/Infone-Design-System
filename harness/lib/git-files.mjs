import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function runGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || `exit ${result.status}`;
    throw new Error(`git ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout.split("\0").filter(Boolean);
}

function unique(files) {
  return [...new Set(files)];
}

export function repositoryFiles(cwd) {
  return runGit(["ls-files", "-z"], cwd);
}

export function stagedFiles(cwd) {
  return runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMRD", "-z"], cwd);
}

export function hasStagedChanges(cwd) {
  return runGit(["diff", "--cached", "--name-only", "-z"], cwd).length > 0;
}

export function unstagedFiles(cwd) {
  return unique([
    ...runGit(["diff", "--name-only", "--diff-filter=ACMRD", "-z"], cwd),
    ...runGit(["ls-files", "--others", "--exclude-standard", "-z"], cwd),
  ]);
}

export function workingTreeFiles(cwd) {
  return unique([
    ...stagedFiles(cwd),
    ...unstagedFiles(cwd),
  ]);
}

export function ciChangedFiles(cwd, environment = process.env) {
  const mergeRequestBase = environment.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  if (mergeRequestBase && !/^0+$/u.test(mergeRequestBase)) {
    return runGit([
      "diff",
      "--name-only",
      "--diff-filter=ACMRD",
      "-z",
      mergeRequestBase,
      "HEAD",
    ], cwd);
  }
  const workingFiles = workingTreeFiles(cwd);
  if (workingFiles.length > 0) return workingFiles;
  return runGit([
    "diff-tree",
    "--root",
    "--no-commit-id",
    "--name-only",
    "--diff-filter=ACMRD",
    "-r",
    "-z",
    "HEAD",
  ], cwd);
}

export function ciAddedFiles(cwd, environment = process.env) {
  const mergeRequestBase = environment.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  if (mergeRequestBase && !/^0+$/u.test(mergeRequestBase)) {
    return runGit([
      "diff",
      "--name-only",
      "--diff-filter=AR",
      "-z",
      mergeRequestBase,
      "HEAD",
    ], cwd);
  }
  const workingFiles = workingTreeFiles(cwd);
  const addedFiles = unique([
    ...runGit(["diff", "--cached", "--name-only", "--diff-filter=AR", "-z"], cwd),
    ...runGit(["diff", "--name-only", "--diff-filter=AR", "-z"], cwd),
    ...runGit(["ls-files", "--others", "--exclude-standard", "-z"], cwd),
  ]);
  if (workingFiles.length > 0) return addedFiles;
  return runGit([
    "diff-tree",
    "--root",
    "--no-commit-id",
    "--name-only",
    "--diff-filter=AR",
    "-r",
    "-z",
    "HEAD",
  ], cwd);
}

export function ciDeletedFiles(cwd, environment = process.env) {
  const mergeRequestBase = environment.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  if (mergeRequestBase && !/^0+$/u.test(mergeRequestBase)) {
    return runGit([
      "diff",
      "--name-only",
      "--diff-filter=D",
      "-z",
      mergeRequestBase,
      "HEAD",
    ], cwd);
  }
  const workingFiles = workingTreeFiles(cwd);
  const deletedFiles = unique([
    ...runGit(["diff", "--cached", "--name-only", "--diff-filter=D", "-z"], cwd),
    ...runGit(["diff", "--name-only", "--diff-filter=D", "-z"], cwd),
  ]);
  if (workingFiles.length > 0) return deletedFiles;
  return runGit([
    "diff-tree",
    "--root",
    "--no-commit-id",
    "--name-only",
    "--diff-filter=D",
    "-r",
    "-z",
    "HEAD",
  ], cwd);
}

export function addedFilesForScope(scope, cwd, environment = process.env) {
  if (scope === "full") return ciAddedFiles(cwd, environment);
  if (scope === "staged") {
    return runGit(["diff", "--cached", "--name-only", "--diff-filter=AR", "-z"], cwd);
  }
  if (scope === "working-tree") {
    return unique([
      ...runGit(["diff", "--name-only", "--diff-filter=AR", "-z"], cwd),
      ...runGit(["ls-files", "--others", "--exclude-standard", "-z"], cwd),
    ]);
  }
  throw new Error(`unknown verification scope: ${scope}`);
}

export function deletedFilesForScope(scope, cwd, environment = process.env) {
  if (scope === "full") return ciDeletedFiles(cwd, environment);
  if (scope === "staged") {
    return runGit(["diff", "--cached", "--name-only", "--diff-filter=D", "-z"], cwd);
  }
  if (scope === "working-tree") {
    return unique([
      ...runGit(["diff", "--cached", "--name-only", "--diff-filter=D", "-z"], cwd),
      ...runGit(["diff", "--name-only", "--diff-filter=D", "-z"], cwd),
    ]);
  }
  throw new Error(`unknown verification scope: ${scope}`);
}

export function createStagedSnapshot(cwd) {
  const root = mkdtempSync(path.join(os.tmpdir(), "infone-harness-index-"));
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  try {
    runGit(["checkout-index", "--all", `--prefix=${prefix}`], cwd);
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
  return {
    root,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export function filesForScope(scope, cwd) {
  if (scope === "full") return repositoryFiles(cwd);
  if (scope === "staged") return stagedFiles(cwd);
  if (scope === "working-tree") return workingTreeFiles(cwd);
  throw new Error(`unknown verification scope: ${scope}`);
}
