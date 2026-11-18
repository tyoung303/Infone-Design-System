import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { boundaryIssues, isDerivedFile, newFileIssues } from "./lib/boundaries.mjs";
import {
  contract,
  loadContract,
  packageContractIssues,
  repositoryPath,
} from "./lib/contract.mjs";
import {
  addedFilesForScope,
  ciChangedFiles,
  createStagedSnapshot,
  deletedFilesForScope,
  filesForScope,
  hasStagedChanges,
  unstagedFiles,
} from "./lib/git-files.mjs";
import { dedupeFindings, printFindings, writeReports } from "./lib/report.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const fix = process.argv.includes("--fix");
const selfTests = process.argv.includes("--self-tests");
const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
const scope = scopeArg?.slice("--scope=".length) || "working-tree";
const reportArg = process.argv.find((arg) => arg.startsWith("--report="));
const reportPath = reportArg?.slice("--report=".length);

function finding(category, code, file, message, suggestion, details) {
  return { category, code, file, message, suggestion, details };
}

function commandFindings(category, code, label, result) {
  if (result.status === 0) return [];
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  const explicit = output.split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("ERROR ") || / is not synchronized with /u.test(line));
  const messages = explicit.length > 0 ? explicit.map((line) => line.replace(/^ERROR\s+/u, "")) : [
    `${label} 未通过，退出码 ${result.status ?? 1}。`,
  ];
  return messages.map((message, index) => finding(
    category,
    explicit.length > 1 ? `${code}-${index + 1}` : code,
    label,
    message,
    "按错误说明修正后重新提交。",
    output,
  ));
}

function run(label, relativeScript, args = [], cwd = root) {
  console.log(`\n[${label}]`);
  const result = spawnSync(process.execPath, [relativeScript, ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

function runHarnessTests(cwd) {
  const testsRoot = path.join(cwd, "test/harness");
  const testFiles = fs.readdirSync(testsRoot)
    .filter((file) => file.endsWith(".test.mjs"))
    .sort()
    .map((file) => path.join(testsRoot, file));
  if (testFiles.length === 0) {
    return [finding(
      "工程验证",
      "missing-harness-tests",
      "test/harness/",
      "没有找到 Harness 自测文件。",
      "恢复 test/harness/*.test.mjs。",
    )];
  }
  console.log(`\n[harness self-tests: ${testFiles.length} files]`);
  const result = spawnSync(process.execPath, ["--test", ...testFiles], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, HARNESS_SKIP_SELF_TESTS: "1" },
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status === 0) return [];
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const failedTests = [...output.matchAll(/^not ok \d+ - (.+)$/gmu)].map((match) => match[1]);
  return (failedTests.length > 0 ? failedTests : ["Harness 自测未通过"]).map((message, index) => finding(
    "工程验证",
    `harness-self-test-${index + 1}`,
    "test/harness/",
    message,
    "修复 Harness 自测报告中的失败项。",
    output,
  ));
}

function verify() {
  const findings = [];
  if (fix && scope !== "working-tree") {
    findings.push(finding(
      "工程验证",
      "invalid-fix-scope",
      "harness/verify.mjs",
      "--fix 只能用于 working-tree 范围。",
      "移除 --fix，或改用 --scope=working-tree。",
    ));
    return findings;
  }

  let files = filesForScope(scope, root);
  let deletedFiles = deletedFilesForScope(scope, root);
  const snapshot = scope === "staged" && hasStagedChanges(root)
    ? createStagedSnapshot(root)
    : null;
  const verificationRoot = snapshot?.root || root;
  try {
    let activeContract;
    try {
      activeContract = snapshot ? loadContract(verificationRoot) : contract;
    } catch (error) {
      findings.push(finding(
        "工程验证",
        "invalid-contract",
        "harness/contract.json",
        error.message,
        "补齐或修正 Harness package contract。",
      ));
      return findings;
    }
    const activePackages = activeContract.packages;
    let issues = boundaryIssues(files, {
      contract: activeContract,
      repository: scope === "full",
      deletedFiles,
    });
    let fullScopeChanges = [];
    if (scope === "full") {
      fullScopeChanges = ciChangedFiles(root);
      for (const issue of boundaryIssues(fullScopeChanges, {
        contract: activeContract,
        deletedFiles,
      })) {
        if (!issues.some((candidate) => candidate.code === issue.code && candidate.file === issue.file)) {
          issues.push(issue);
        }
      }
    }
    issues.push(...newFileIssues(addedFilesForScope(scope, root), activeContract));

    if (scope === "staged") {
      for (const file of unstagedFiles(root).filter((file) => isDerivedFile(file, activeContract))) {
        issues.push({
          code: "unstaged-derived-output",
          file,
          message: "Generated output is not staged. Run npm run sync, review it, and stage it with its source change.",
        });
      }
    }

    findings.push(...issues.map((issue) => finding(
      "工程验证",
      issue.code,
      issue.file,
      issue.message,
      issue.code === "unexpected-new-file"
        ? "无关文件请删除；正式规范文件请由维护者登记对应目录后再提交。"
        : "把正式内容放入 contract 声明的目录；临时或评审产物放入 .harness-output/。",
    )));
    console.log(`\n[design-spec boundaries] ${issues.length ? "failed" : "passed"} (${scope}, ${files.length} files inspected${scope === "full" ? `, ${fullScopeChanges.length} changed files` : ""})`);

    const contractIssues = packageContractIssues(verificationRoot, activePackages);
    findings.push(...contractIssues.map((issue) => finding(
      "工程验证",
      "package-contract",
      issue.file,
      issue.message,
      "恢复 contract 要求的文件或目录。",
    )));
    console.log(`[design-spec package contract] ${contractIssues.length ? "failed" : "passed"} (${activePackages.length} packages)`);

    if ((selfTests || scope === "staged") && process.env.HARNESS_SKIP_SELF_TESTS !== "1") {
      findings.push(...runHarnessTests(verificationRoot));
    }

    if (fix) {
      for (const designPackage of activePackages) {
        if (!designPackage.maintenance.syncScript) continue;
        const label = `${designPackage.id}: sync generated outputs`;
        const result = run(
          label,
          repositoryPath(designPackage, designPackage.maintenance.syncScript),
          ["--write"],
        );
        findings.push(...commandFindings("工程验证", "sync-write", label, result));
      }
      files = filesForScope(scope, root);
      deletedFiles = deletedFilesForScope(scope, root);
      const postSyncIssues = boundaryIssues(files, {
        contract: activeContract,
        repository: false,
        deletedFiles,
      });
      findings.push(...postSyncIssues.map((issue) => finding(
        "工程验证",
        `post-sync-${issue.code}`,
        issue.file,
        issue.message,
        "修正源文件后重新运行 npm run verify:agent。",
      )));
    }

    for (const designPackage of activePackages) {
      if (designPackage.maintenance.syncScript) {
        const label = `${designPackage.id}: generated output drift`;
        const result = run(
          label,
          repositoryPath(designPackage, designPackage.maintenance.syncScript),
          [],
          verificationRoot,
        );
        findings.push(...commandFindings("工程验证", "generated-drift", label, result));
      }
      const label = `${designPackage.id}: documentation consistency`;
      const result = run(
        label,
        repositoryPath(designPackage, designPackage.maintenance.validateScript),
        [],
        verificationRoot,
      );
      findings.push(...commandFindings("规范一致性", "documentation-consistency", label, result));
    }
  } finally {
    snapshot?.cleanup();
  }
  return dedupeFindings(findings);
}

let findings;
try {
  findings = verify();
} catch (error) {
  findings = [finding(
    "工程验证",
    "unexpected-verifier-error",
    "harness/verify.mjs",
    error.stack || error.message,
    "修复校验器异常后重试。",
  )];
}
printFindings("工程验证", findings);
writeReports(reportPath, "工程验证", findings);
if (findings.length > 0) process.exitCode = 1;
