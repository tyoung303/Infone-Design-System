import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../..");

function run(cwd, relativeScript, args = [], environment = process.env) {
  return spawnSync(process.execPath, [relativeScript, ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
    env: environment,
  });
}

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test("sync rebuilds page previews and both catalog projections", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "infone-harness-sync-"));
  try {
    await cp(path.join(repositoryRoot, "infone"), path.join(fixtureRoot, "infone"), { recursive: true });
    const recipePath = path.join(fixtureRoot, "infone/recipes/pages/user-list.md");
    const recipe = await readFile(recipePath, "utf8");
    const changedRecipe = recipe.replace("没有匹配的用户", "SYNC_PAGE_PROBE");
    assert.notEqual(changedRecipe, recipe);
    await writeFile(recipePath, changedRecipe);

    let result = run(fixtureRoot, "infone/scripts/sync-recipes.mjs", ["--write"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const preview = await readFile(
      path.join(fixtureRoot, "infone/preview/page-patterns/user-list/index.html"),
      "utf8",
    );
    assert.match(preview, /SYNC_PAGE_PROBE/u);
    assert.match(preview, /\.\.\/\.\.\/page-runtime\/support\.js/u);
    assert.match(preview, /14 \/ 14/u);

    const pagerScript = preview.match(/<script>\(\(\)=>\{const pager=[\s\S]*?<\/script>/u)?.[0];
    assert.ok(pagerScript);
    class MockElement {
      constructor({ parentElement = null, scrollHeight = 0, clientHeight = 0, scrollTop = 0 } = {}) {
        this.parentElement = parentElement;
        this.scrollHeight = scrollHeight;
        this.clientHeight = clientHeight;
        this.scrollTop = scrollTop;
      }
    }
    const documentElement = new MockElement();
    const scrollingElement = new MockElement({ scrollHeight: 100, clientHeight: 100 });
    const scrollable = new MockElement({ scrollHeight: 1000, clientHeight: 100, scrollTop: 50 });
    const next = { href: "../next/index.html" };
    let wheelHandler = null;
    let destination = null;
    const context = {
      Element: MockElement,
      WheelEvent: { DOM_DELTA_LINE: 1, DOM_DELTA_PAGE: 2 },
      addEventListener(type, handler) {
        if (type === "wheel") wheelHandler = handler;
      },
      clearTimeout() {},
      document: {
        documentElement,
        scrollingElement,
        querySelector() {
          return {
            querySelector(selector) {
              return selector.endsWith("next") ? next : null;
            },
          };
        },
      },
      getComputedStyle(element) {
        return { overflowY: element === scrollable ? "auto" : "visible" };
      },
      innerHeight: 800,
      location: { assign(value) { destination = value; } },
      window: { setTimeout() { return 1; } },
    };
    vm.runInNewContext(pagerScript.slice("<script>".length, -"</script>".length), context);
    let prevented = false;
    wheelHandler({
      target: scrollable,
      deltaX: 0,
      deltaY: 60,
      deltaMode: 0,
      ctrlKey: false,
      metaKey: false,
      preventDefault() { prevented = true; },
    });
    assert.equal(prevented, false);
    assert.equal(destination, null);

    scrollable.scrollTop = 900;
    wheelHandler({
      target: scrollable,
      deltaX: 0,
      deltaY: 60,
      deltaMode: 0,
      ctrlKey: false,
      metaKey: false,
      preventDefault() { prevented = true; },
    });
    assert.equal(prevented, true);
    assert.equal(destination, next.href);

    const indexPath = path.join(fixtureRoot, "infone/recipes/index.json");
    const index = JSON.parse(await readFile(indexPath, "utf8"));
    index.pagePatterns.at(-1).description = "SYNC_CATALOG_PROBE $10";
    await writeFile(indexPath, JSON.stringify(index, null, 2) + "\n");
    result = run(fixtureRoot, "infone/scripts/sync-recipes.mjs", ["--write"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const manifest = JSON.parse(await readFile(
      path.join(fixtureRoot, "infone/components.manifest.json"),
      "utf8",
    ));
    assert.deepEqual(manifest.catalog.components, index.components);
    assert.deepEqual(manifest.catalog.pagePatterns, index.pagePatterns);
    const componentsHtml = await readFile(path.join(fixtureRoot, "infone/components.html"), "utf8");
    const embedded = componentsHtml.match(
      /<script type="application\/json" data-od-component-catalog>\s*([\s\S]*?)\s*<\/script>/u,
    );
    assert.ok(embedded);
    const htmlCatalog = JSON.parse(embedded[1]);
    assert.deepEqual(htmlCatalog.components, index.components);
    assert.deepEqual(htmlCatalog.pagePatterns, index.pagePatterns);

    result = run(fixtureRoot, "infone/scripts/validate-docs.mjs");
    assert.equal(result.status, 0, result.stderr || result.stdout);

    await writeFile(path.join(fixtureRoot, "infone/recipes/pages/orphan.md"), "# orphan\n");
    await mkdir(path.join(fixtureRoot, "infone/preview/page-patterns/orphan"));
    await writeFile(
      path.join(fixtureRoot, "infone/preview/page-patterns/orphan/index.html"),
      "<!doctype html>\n",
    );
    result = run(fixtureRoot, "infone/scripts/validate-docs.mjs");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /页面 recipe 未登记/u);
    assert.match(result.stderr, /页面预览未登记/u);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("page runtime passes one imported component child as one React element", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "infone/preview/page-runtime/support.js"),
    "utf8",
  );
  const xImportSource = source.match(
    /function walkXImport\(el, host\) \{([\s\S]*?)\n  function contentKey/u,
  )?.[1];
  assert.ok(xImportSource);
  const expression = xImportSource.match(
    /const kids = hasContent \? ([\s\S]*?) : \[\];\n    const urlBindable/u,
  )?.[1];
  assert.ok(expression);

  const control = { nodeType: 1, nodeValue: null };
  const text = { nodeType: 3, nodeValue: "保存" };
  const selectChildren = new Function(
    "hasContent",
    "el",
    "host",
    "Node",
    "walk",
    `return ${expression};`,
  );
  const children = selectChildren(
    true,
    { childNodes: [{ nodeType: 3, nodeValue: "\n  " }, control, text, { nodeType: 3, nodeValue: "\n" }] },
    {},
    { TEXT_NODE: 3 },
    (node) => node,
  );

  assert.deepEqual(children, [control, text]);

  const assignment = xImportSource.match(
    /if \(kids\.length\) \{([\s\S]*?)\n      \}\n      return wrapper \? h\("div", wrapper, h\(C, props\)\)/u,
  )?.[1];
  assert.ok(assignment);
  const assignChildren = new Function(
    "kids",
    "vals",
    "ctx",
    "props",
    `${assignment}; return props.children;`,
  );
  const child = { type: "TextField" };
  assert.equal(assignChildren([() => child], {}, {}, {}), child);
  assert.deepEqual(assignChildren([() => control, () => text], {}, {}, {}), [control, text]);
});

test("verify staged validates index content when a recipe is partially staged", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "infone-harness-cli-"));
  try {
    await cp(path.join(repositoryRoot, "harness"), path.join(fixtureRoot, "harness"), { recursive: true });
    await cp(path.join(repositoryRoot, "infone"), path.join(fixtureRoot, "infone"), { recursive: true });
    await cp(path.join(repositoryRoot, ".gitignore"), path.join(fixtureRoot, ".gitignore"));
    git(fixtureRoot, ["init", "--quiet"]);
    git(fixtureRoot, ["add", ".gitignore", "harness", "infone"]);

    const recipePath = path.join(fixtureRoot, "infone/recipes/pages/user-list.md");
    const original = await readFile(recipePath, "utf8");
    const stagedDrift = original.replace("没有匹配的用户", "STAGED_ONLY_DRIFT");
    assert.notEqual(stagedDrift, original);
    await writeFile(recipePath, stagedDrift);
    git(fixtureRoot, ["add", "infone/recipes/pages/user-list.md"]);
    await writeFile(recipePath, original);

    const result = run(
      fixtureRoot,
      "harness/verify.mjs",
      ["--scope=staged"],
      { ...process.env, HARNESS_SKIP_SELF_TESTS: "1" },
    );
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /page-patterns\/user-list\/index\.html is not synchronized/u);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("installed pre-commit hook blocks invalid output and permits a valid commit", {
  skip: process.env.HARNESS_HOOK_TEST_CHILD === "1",
}, async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "infone-harness-hook-"));
  const packageRoots = JSON.parse(await readFile(
    path.join(repositoryRoot, "harness/contract.json"),
    "utf8",
  )).packages.map((designPackage) => designPackage.root);
  const copyTargets = [
    ".githooks",
    ".gitignore",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "harness",
    ...packageRoots,
    "package.json",
    "test",
  ];
  try {
    for (const target of copyTargets) {
      await cp(path.join(repositoryRoot, target), path.join(fixtureRoot, target), { recursive: true });
    }
    git(fixtureRoot, ["init", "--quiet"]);
    git(fixtureRoot, ["add", "-A"]);
    git(fixtureRoot, [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "--quiet", "--no-verify", "-m", "baseline",
    ]);

    let result = run(fixtureRoot, "harness/install-hooks.mjs");
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const configured = spawnSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    });
    assert.equal(configured.stdout.trim(), ".githooks");

    const previewPath = path.join(
      fixtureRoot,
      "infone/preview/component-cards/Button/button.html",
    );
    const originalPreview = await readFile(previewPath, "utf8");
    await writeFile(previewPath, originalPreview + "<!-- INVALID_PREVIEW_ONLY_CHANGE -->\n");
    git(fixtureRoot, ["add", "infone/preview/component-cards/Button/button.html"]);
    result = spawnSync("git", [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "-m", "invalid generated output",
    ], {
      cwd: fixtureRoot,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, HARNESS_HOOK_TEST_CHILD: "1" },
    });
    assert.notEqual(result.status, 0, "invalid commit must be blocked");
    assert.match(result.stdout + result.stderr, /component-preview-without-recipe|Generated component preview/u);

    await writeFile(previewPath, originalPreview);
    git(fixtureRoot, ["add", "infone/preview/component-cards/Button/button.html"]);
    const readmePath = path.join(fixtureRoot, "README.md");
    await writeFile(readmePath, await readFile(readmePath, "utf8") + "\nValid hook probe.\n");
    git(fixtureRoot, ["add", "README.md"]);
    result = spawnSync("git", [
      "-c", "user.name=Harness Test",
      "-c", "user.email=harness@example.invalid",
      "commit", "-m", "valid change",
    ], {
      cwd: fixtureRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, HARNESS_HOOK_TEST_CHILD: "1" },
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
