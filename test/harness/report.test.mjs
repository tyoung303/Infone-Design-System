import assert from "node:assert/strict";
import test from "node:test";

import { dedupeFindings } from "../../harness/lib/report.mjs";

test("groups identical failures and preserves every affected file", () => {
  const result = dedupeFindings([
    { category: "工程验证", code: "unexpected-new-file", file: "a.html", message: "位置不合法" },
    { category: "工程验证", code: "unexpected-new-file", file: "b.html", message: "位置不合法" },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].file, "2 个文件");
  assert.deepEqual(result[0].files, ["a.html", "b.html"]);
});
