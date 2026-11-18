import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  designPackages,
  packageContractIssues,
  repositoryPath,
  validateContract,
} from "../../harness/lib/contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

test("Harness contract registers complete design-spec packages with required principles", async () => {
  const contract = JSON.parse(await readFile(path.join(root, "harness/contract.json"), "utf8"));
  assert.equal(contract.schemaVersion, 2);
  assert.equal(contract.packages.length > 0, true);

  for (const designPackage of contract.packages) {
    const packageRoot = path.join(root, designPackage.root);
    const principlesPath = path.join(packageRoot, designPackage.canonical.principlesFile);
    assert.equal((await stat(principlesPath)).isFile(), true);
    assert.equal((await readFile(principlesPath, "utf8")).trim().length > 0, true);
    assert.equal(
      designPackage.canonical.files.includes(designPackage.canonical.principlesFile),
      true,
      `${designPackage.id} principles must be canonical`,
    );
    assert.equal(
      designPackage.canonical.files.includes(designPackage.canonical.usageFile),
      true,
      `${designPackage.id} usage guide must be canonical`,
    );

    for (const file of designPackage.canonical.files) {
      assert.equal((await stat(path.join(packageRoot, file))).isFile(), true, `${file} must be a file`);
    }
    for (const directory of designPackage.canonical.roots) {
      assert.equal(
        (await stat(path.join(packageRoot, directory))).isDirectory(),
        true,
        `${directory} must be a directory`,
      );
    }
    for (const directory of [
      ...designPackage.hygiene.imageRoots,
      ...designPackage.hygiene.fontRoots,
    ]) {
      assert.equal(
        designPackage.canonical.roots.includes(directory),
        true,
        `${directory} must be a canonical root`,
      );
    }
    assert.equal(
      designPackage.canonical.roots.includes(designPackage.ownership.componentRecipeRoot),
      true,
    );
    assert.equal(
      designPackage.canonical.roots.includes(designPackage.ownership.pageRecipeRoot),
      true,
    );
    assert.equal(
      designPackage.canonical.files.includes(designPackage.ownership.recipeIndex),
      true,
    );
    for (const file of designPackage.ownership.catalogSources) {
      assert.equal(designPackage.canonical.files.includes(file), true, `${file} must be canonical`);
    }
    for (const file of designPackage.ownership.generatorSources) {
      assert.equal((await stat(path.join(packageRoot, file))).isFile(), true);
    }
    for (const directory of [
      designPackage.derived.componentPreviewRoot,
      designPackage.derived.pagePreviewRoot,
    ]) {
      assert.equal((await stat(path.join(packageRoot, directory))).isDirectory(), true);
    }
    for (const file of [
      designPackage.derived.runtimeBundle,
      ...designPackage.derived.supportFiles,
      ...designPackage.derived.catalogFiles,
      designPackage.maintenance.syncScript,
      designPackage.maintenance.validateScript,
    ]) {
      assert.equal((await stat(path.join(packageRoot, file))).isFile(), true);
    }
  }
});

test("contract path resolution supports additional package roots", () => {
  assert.equal(designPackages.length > 0, true);
  assert.equal(
    repositoryPath({ root: "future-design" }, "recipes/pages/"),
    "future-design/recipes/pages/",
  );
});

test("packages must declare generated-output ownership and maintenance scripts", () => {
  assert.throws(() => validateContract({
    schemaVersion: 2,
    packages: [{
      id: "principles-only",
      root: "principles-only",
      canonical: {
        principlesFile: "DESIGN.md",
        usageFile: "USAGE.md",
        files: ["DESIGN.md", "USAGE.md"],
        roots: [],
      },
      maintenance: { validateScript: "scripts/validate.mjs" },
    }],
  }), /derived\.componentPreviewRoot/u);
});

test("packages must declare image and font placement roots", () => {
  const candidate = {
    schemaVersion: 2,
    packages: [structuredClone(designPackages[0])],
  };
  delete candidate.packages[0].hygiene;
  assert.throws(() => validateContract(candidate), /hygiene\.imageRoots/u);

  const emptyRoots = {
    schemaVersion: 2,
    packages: [structuredClone(designPackages[0])],
  };
  emptyRoots.packages[0].hygiene.imageRoots = [];
  assert.throws(() => validateContract(emptyRoots), /non-empty infone\.hygiene\.imageRoots/u);

  const escapingRoot = {
    schemaVersion: 2,
    packages: [structuredClone(designPackages[0])],
  };
  escapingRoot.packages[0].hygiene.fontRoots = ["../fonts/"];
  assert.throws(() => validateContract(escapingRoot), /relative directory root/u);

  const missingNewFileRules = {
    schemaVersion: 2,
    packages: [structuredClone(designPackages[0])],
  };
  delete missingNewFileRules.packages[0].hygiene.newFileRules;
  assert.throws(() => validateContract(missingNewFileRules), /hygiene\.newFileRules/u);
});

test("package contracts require non-empty key design principles", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "infone-harness-principles-"));
  const futurePackage = {
    id: "future-design",
    root: "future-design",
    canonical: {
      principlesFile: "DESIGN.md",
      usageFile: "USAGE.md",
      files: ["DESIGN.md", "USAGE.md"],
      roots: [],
    },
    derived: {
      componentPreviewRoot: "preview/components/",
      pagePreviewRoot: "preview/pages/",
      runtimeBundle: "preview/runtime.js",
      supportFiles: [],
      catalogFiles: [],
    },
    ownership: {
      componentRecipeRoot: "recipes/components/",
      pageRecipeRoot: "recipes/pages/",
      recipeIndex: "recipes/index.json",
      catalogSources: [],
      generatorSources: [],
    },
    maintenance: {
      syncScript: "scripts/sync.mjs",
      validateScript: "scripts/validate.mjs",
    },
    hygiene: {
      imageRoots: ["assets/"],
      fontRoots: ["fonts/"],
      newFileRules: [
        { root: "recipes/components/", extensions: [".md"] },
      ],
    },
  };
  try {
    for (const directory of [
      "future-design/scripts",
      "future-design/recipes/components",
      "future-design/recipes/pages",
      "future-design/preview/components",
      "future-design/preview/pages",
      "future-design/assets",
      "future-design/fonts",
    ]) {
      await mkdir(path.join(fixtureRoot, directory), { recursive: true });
    }
    await writeFile(path.join(fixtureRoot, "future-design/DESIGN.md"), "\n");
    await writeFile(path.join(fixtureRoot, "future-design/USAGE.md"), "# Usage\n");
    await writeFile(path.join(fixtureRoot, "future-design/scripts/sync.mjs"), "\n");
    await writeFile(path.join(fixtureRoot, "future-design/scripts/validate.mjs"), "\n");
    await writeFile(path.join(fixtureRoot, "future-design/recipes/index.json"), "{}\n");
    await writeFile(path.join(fixtureRoot, "future-design/preview/runtime.js"), "\n");
    assert.deepEqual(
      packageContractIssues(fixtureRoot, [futurePackage]).map((issue) => issue.message),
      ["Design principles file must not be empty."],
    );
    await writeFile(path.join(fixtureRoot, "future-design/DESIGN.md"), "# Principles\n");
    assert.deepEqual(packageContractIssues(fixtureRoot, [futurePackage]), []);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("Claude instructions import the AGENTS source", async () => {
  const body = await readFile(path.join(root, "CLAUDE.md"), "utf8");
  assert.match(body, /^@AGENTS\.md/mu);
});

test("Harness verification iterates registered packages and uses staged snapshots", async () => {
  const body = await readFile(path.join(root, "harness/verify.mjs"), "utf8");
  assert.equal(body.includes("for (const designPackage of activePackages)"), true);
  assert.equal(body.includes("createStagedSnapshot(root)"), true);
  assert.equal(body.includes("loadContract(verificationRoot)"), true);
});

test("repository ships an executable commit-blocking hook and automatic installer", async () => {
  const hookPath = path.join(root, ".githooks/pre-commit");
  const hookStat = await stat(hookPath);
  assert.notEqual(hookStat.mode & 0o111, 0, "pre-commit hook must be executable");
  assert.match(await readFile(hookPath, "utf8"), /npm run verify:commit/u);
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(packageJson.scripts["setup:hooks"], "node harness/install-hooks.mjs");
  assert.equal(packageJson.scripts.prepare, "node harness/install-hooks.mjs");
});
