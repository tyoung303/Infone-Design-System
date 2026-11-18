import fs from "node:fs";
import path from "node:path";

const CODE_LABELS = {
  "unexpected-new-file": "新增文件位置不合法",
  "forbidden-review-output": "禁止提交的临时文件",
  "unstaged-derived-output": "生成文件未暂存",
  "package-contract": "规范包结构不完整",
  "generated-drift": "生成内容未同步",
  "sync-write": "生成内容同步失败",
  "component-preview-without-recipe": "组件预览缺少来源",
  "page-preview-without-recipe": "页面预览缺少来源",
  "runtime-without-recipe": "运行包缺少来源",
  "catalog-without-source": "目录文件缺少来源",
  "documentation-consistency": "规范来源未同步",
};

function codeLabel(code) {
  return CODE_LABELS[code]
    || CODE_LABELS[String(code).replace(/-\d+$/u, "")]
    || code;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function findingText(finding) {
  const files = finding.files ?? (finding.file ? [finding.file] : []);
  const fileLines = files.length > 1
    ? [`涉及文件（${files.length}）：`, ...files.map((file) => `- ${file}`)]
    : [`文件：${files[0] || "仓库"}`];
  return [
    ...fileLines,
    `问题：${finding.message}`,
    finding.rule ? `违反：${finding.rule}` : null,
    finding.suggestion ? `建议：${finding.suggestion}` : null,
  ].filter(Boolean).join("\n");
}

export function printFindings(title, findings) {
  if (findings.length === 0) {
    console.log(`\n[${title}] 通过`);
    return;
  }
  console.error(`\n[${title}] 失败，共 ${findings.length} 个问题`);
  for (const finding of findings) {
    console.error(`\n[${finding.category}][${codeLabel(finding.code)}]`);
    console.error(findingText(finding));
  }
}

export function writeReports(basePath, title, findings) {
  if (!basePath) return;
  fs.mkdirSync(path.dirname(basePath), { recursive: true });
  const cases = findings.length > 0
    ? findings.map((finding, index) => [
      `  <testcase classname="${escapeXml(finding.category)}" name="${escapeXml(`${index + 1}. ${codeLabel(finding.code)}`)}">`,
      `    <failure message="${escapeXml(finding.message)}">${escapeXml(findingText(finding))}</failure>`,
      "  </testcase>",
    ].join("\n"))
    : [`  <testcase classname="${escapeXml(title)}" name="全部检查通过" />`];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuite name="${escapeXml(title)}" tests="${Math.max(findings.length, 1)}" failures="${findings.length}">`,
    ...cases,
    "</testsuite>",
    "",
  ].join("\n");
  fs.writeFileSync(basePath + ".xml", xml);

  const markdown = findings.length === 0
    ? `# ${title}\n\n全部检查通过。\n`
    : [
      `# ${title}`,
      "",
      `共发现 ${findings.length} 个问题。`,
      "",
      ...findings.flatMap((finding, index) => [
        `## ${index + 1}. [${finding.category}] ${codeLabel(finding.code)}`,
        "",
        findingText(finding),
        "",
      ]),
    ].join("\n");
  fs.writeFileSync(basePath + ".md", markdown);
}

export function dedupeFindings(findings) {
  const grouped = new Map();
  for (const finding of findings) {
    const key = [
      finding.category,
      finding.code,
      finding.message,
      finding.rule,
      finding.suggestion,
    ].join("\0");
    const existing = grouped.get(key);
    if (existing) {
      if (finding.file && !existing.files.includes(finding.file)) existing.files.push(finding.file);
      continue;
    }
    grouped.set(key, {
      ...finding,
      files: finding.files ? [...finding.files] : finding.file ? [finding.file] : [],
    });
  }
  return [...grouped.values()].map((finding) => ({
    ...finding,
    file: finding.files.length === 1 ? finding.files[0] : `${finding.files.length} 个文件`,
  }));
}
