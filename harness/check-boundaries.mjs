import path from "node:path";
import { fileURLToPath } from "node:url";

import { boundaryIssues, newFileIssues } from "./lib/boundaries.mjs";
import { addedFilesForScope, deletedFilesForScope, filesForScope } from "./lib/git-files.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
const scope = scopeArg?.slice("--scope=".length) || "working-tree";
const files = filesForScope(scope, root);
const issues = [
  ...boundaryIssues(files, {
    repository: scope === "full",
    deletedFiles: deletedFilesForScope(scope, root),
  }),
  ...newFileIssues(addedFilesForScope(scope, root)),
];

if (issues.length > 0) {
  console.error(`Design-spec boundary check failed (${issues.length}):`);
  for (const issue of issues) console.error(`- ${issue.file}: ${issue.message}`);
  process.exit(1);
}

console.log(`Design-spec boundary check passed (${scope}, ${files.length} files inspected)`);
