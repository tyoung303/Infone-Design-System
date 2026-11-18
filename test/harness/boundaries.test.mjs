import assert from "node:assert/strict";
import test from "node:test";

import { boundaryIssues, isDerivedFile, newFileIssues } from "../../harness/lib/boundaries.mjs";
import { contract } from "../../harness/lib/contract.mjs";

test("rejects a component preview change without its recipe", () => {
  const issues = boundaryIssues([
    "infone/preview/component-cards/Button/button.html",
  ]);
  assert.deepEqual(issues.map((issue) => issue.code), ["component-preview-without-recipe"]);
});

test("does not allow full scans to disable generated-file ownership", () => {
  const issues = boundaryIssues(
    ["infone/preview/component-cards/Orphan/orphan.html"],
    { requireSourceForDerived: false },
  );
  assert.deepEqual(issues.map((issue) => issue.code), ["component-preview-without-recipe"]);
});

test("allows generator output changes but still rejects orphans in repository scans", () => {
  const files = [
    "infone/scripts/sync-recipes.mjs",
    "infone/preview/component-cards/Orphan/orphan.html",
  ];
  assert.deepEqual(boundaryIssues(files), []);
  assert.deepEqual(
    boundaryIssues(files, { repository: true }).map((issue) => issue.code),
    ["component-preview-without-recipe"],
  );
});

test("repository scans pair source-backed output ownership against the CI change set", () => {
  const repositoryFiles = [
    "infone/recipes/index.json",
    "infone/components.html",
  ];
  assert.deepEqual(boundaryIssues(repositoryFiles, { repository: true }), []);
  assert.deepEqual(
    boundaryIssues(["infone/components.html"]).map((issue) => issue.code),
    ["catalog-without-source"],
  );
});

test("accepts a component preview regenerated with its recipe", () => {
  const issues = boundaryIssues([
    "infone/recipes/components/Button.md",
    "infone/preview/component-cards/Button/button.html",
    "infone/preview/runtime/ds-bundle.js",
  ]);
  assert.deepEqual(issues, []);
});

test("rejects a page preview change without its page recipe", () => {
  const issues = boundaryIssues([
    "infone/preview/page-patterns/user-list/index.html",
  ]);
  assert.equal(issues[0]?.code, "page-preview-without-recipe");
});

test("rejects hand-edited runtime output", () => {
  const issues = boundaryIssues(["infone/preview/runtime/ds-bundle.js"]);
  assert.equal(issues[0]?.code, "runtime-without-recipe");
});

test("allows registered support files and rejects arbitrary files beside them", () => {
  const supportFile = "infone/preview/foundation-cards/colors-accent.html";
  assert.deepEqual(newFileIssues([supportFile]), []);
  assert.deepEqual(
    newFileIssues(["infone/preview/foundation-cards/random-review.html"])
      .map((issue) => issue.code),
    ["unexpected-new-file"],
  );
});

test("rejects Open Design artifact sidecars and package-root screenshots", () => {
  const issues = boundaryIssues([
    "infone/preview/components.html.artifact.json",
    "infone/button-after.png",
  ]);
  assert.deepEqual(
    issues.map((issue) => issue.code),
    ["forbidden-review-output", "forbidden-review-output"],
  );
});

test("rejects operating-system, log, backup, and temporary output", () => {
  const issues = boundaryIssues([
    "infone/.DS_Store",
    "debug.log",
    "infone/tokens.css.bak",
    ".harness-output/button-after.png",
    ".od-skills/session/tool.json",
    "infone/.od-frames/frame.json",
    "infone/od-design-system/gitlab-infone/output.html",
  ]);
  assert.deepEqual(
    issues.map((issue) => issue.code),
    [
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
    ],
  );
});

test("restricts package images and fonts to their declared roots", () => {
  const rejected = boundaryIssues([
    "infone/misc/dashboard.png",
    "infone/recipes/pages/logo.svg",
    "infone/assets/brand.woff2",
    "infone/fonts/wordmark.webp",
  ]);
  assert.deepEqual(
    rejected.map((issue) => issue.code),
    [
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
      "forbidden-review-output",
    ],
  );
  assert.deepEqual(boundaryIssues([
    "infone/assets/dashboard.png",
    "infone/assets/icons/logo.svg",
    "infone/fonts/brand.woff2",
  ]), []);
});

test("classifies generated outputs", () => {
  assert.equal(isDerivedFile("infone/preview/component-cards/Button/button.html"), true);
  assert.equal(isDerivedFile("infone/preview/page-patterns/user-list/index.html"), true);
  assert.equal(isDerivedFile("infone/preview/runtime/ds-bundle.js"), true);
  assert.equal(isDerivedFile("infone/preview/page-runtime/support.js"), false);
  assert.equal(isDerivedFile("infone/recipes/components/Button.md"), false);
});

test("allows deleting forbidden output while still checking generated deletions", () => {
  assert.deepEqual(boundaryIssues(["debug.log"], { deletedFiles: ["debug.log"] }), []);
  assert.deepEqual(
    boundaryIssues(
      ["infone/preview/component-cards/Button/button.html"],
      { deletedFiles: ["infone/preview/component-cards/Button/button.html"] },
    ).map((issue) => issue.code),
    ["component-preview-without-recipe"],
  );
});

test("applies the same ownership model to additional registered design specs", () => {
  const futurePackage = structuredClone(contract.packages[0]);
  futurePackage.id = "future-design";
  futurePackage.root = "future-design";
  const multiPackageContract = {
    ...contract,
    packages: [...contract.packages, futurePackage],
  };
  const preview = "future-design/preview/component-cards/Button/button.html";
  assert.equal(isDerivedFile(preview, multiPackageContract), true);
  assert.deepEqual(
    boundaryIssues([preview], { contract: multiPackageContract }).map((issue) => issue.file),
    [preview],
  );
  assert.deepEqual(boundaryIssues([
    "future-design/recipes/components/Button.md",
    preview,
  ], { contract: multiPackageContract }), []);
});

test("rejects new files outside declared repository paths", () => {
  assert.deepEqual(
    newFileIssues([
      "notes.md",
      "infone/debug.html",
      "infone/rules/debug.html",
      "infone/assets/debug.txt",
      "harness/screenshot.png",
      "infone/preview/foundation-cards/random-review.html",
      "infone/preview/page-runtime/random.js",
    ]).map((issue) => issue.code),
    [
      "unexpected-new-file",
      "unexpected-new-file",
      "unexpected-new-file",
      "unexpected-new-file",
      "unexpected-new-file",
      "unexpected-new-file",
      "unexpected-new-file",
    ],
  );
  assert.deepEqual(newFileIssues([
    "README.md",
    "harness/new-check.mjs",
    "test/harness/new-check.test.mjs",
    "infone/rules/new-rule.md",
    "infone/assets/new-logo.svg",
    "infone/preview/colors.html",
    "infone/preview/foundation-cards/colors-accent.html",
    "infone/preview/page-runtime/support.js",
    "infone/preview/runtime/LICENSE-React.txt",
    "infone/preview/runtime/react.production.min.js",
    "infone/preview/ui-kits/shared.css",
    "infone/system/kit.dark.html",
  ]), []);
});
