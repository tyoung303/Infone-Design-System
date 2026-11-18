import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ciChangedFiles,
  createStagedSnapshot,
  deletedFilesForScope,
  hasStagedChanges,
  stagedFiles,
  unstagedFiles,
  workingTreeFiles,
} from "../../harness/lib/git-files.mjs";

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test("unstaged scopes include new untracked files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "infone-harness-git-files-"));
  try {
    git(root, ["init", "--quiet"]);
    await writeFile(path.join(root, "tracked.txt"), "initial\n");
    git(root, ["add", "tracked.txt"]);
    await writeFile(path.join(root, "tracked.txt"), "changed\n");
    await writeFile(path.join(root, "untracked.txt"), "new\n");

    assert.deepEqual(unstagedFiles(root).sort(), ["tracked.txt", "untracked.txt"]);
    assert.deepEqual(workingTreeFiles(root).sort(), ["tracked.txt", "untracked.txt"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("staged snapshots materialize index content instead of working-tree content", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "infone-harness-index-snapshot-"));
  try {
    git(root, ["init", "--quiet"]);
    await writeFile(path.join(root, "recipe.md"), "staged\n");
    git(root, ["add", "recipe.md"]);
    await writeFile(path.join(root, "recipe.md"), "working tree\n");

    const snapshot = createStagedSnapshot(root);
    try {
      const { readFile } = await import("node:fs/promises");
      assert.equal(await readFile(path.join(snapshot.root, "recipe.md"), "utf8"), "staged\n");
    } finally {
      snapshot.cleanup();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("CI change scopes inspect the committed change when the tree is clean", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "infone-harness-ci-changes-"));
  try {
    git(root, ["init", "--quiet"]);
    await writeFile(path.join(root, "tracked.txt"), "initial\n");
    git(root, ["add", "tracked.txt"]);
    git(root, [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "--quiet", "-m", "baseline",
    ]);
    await writeFile(path.join(root, "tracked.txt"), "changed\n");
    git(root, ["add", "tracked.txt"]);
    git(root, [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "--quiet", "-m", "change",
    ]);
    assert.deepEqual(ciChangedFiles(root, {}), ["tracked.txt"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("change scopes include deletions and identify them separately", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "infone-harness-git-delete-"));
  try {
    git(root, ["init", "--quiet"]);
    await writeFile(path.join(root, "debug.log"), "stale output\n");
    git(root, ["add", "debug.log"]);
    git(root, [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "--quiet", "-m", "baseline",
    ]);

    await rm(path.join(root, "debug.log"));
    git(root, ["add", "--update"]);
    assert.equal(hasStagedChanges(root), true);
    assert.deepEqual(stagedFiles(root), ["debug.log"]);
    assert.deepEqual(workingTreeFiles(root), ["debug.log"]);
    assert.deepEqual(deletedFilesForScope("staged", root), ["debug.log"]);

    git(root, [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "--quiet", "-m", "remove stale output",
    ]);
    assert.deepEqual(ciChangedFiles(root, {}), ["debug.log"]);
    assert.deepEqual(deletedFilesForScope("full", root, {}), ["debug.log"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
