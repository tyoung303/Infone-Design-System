import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function directoryNames(relativePath) {
  return fs.readdirSync(path.join(root, relativePath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

const index = JSON.parse(read("rules/index.json"));
const recipesIndex = JSON.parse(read("recipes/index.json"));
const componentsManifest = JSON.parse(read("components.manifest.json"));
const manifest = JSON.parse(read("manifest.json"));
const design = read("DESIGN.md");
const usage = read("USAGE.md");
const componentsHtml = read("components.html");

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableJson(value[key])]),
  );
}

function sameJson(left, right) {
  return JSON.stringify(stableJson(left)) === JSON.stringify(stableJson(right));
}

function extractHtmlRecipe(relativePath) {
  const match = read(relativePath).match(/```html\n([\s\S]*?)\n```/);
  return match?.[1] ?? null;
}

function extractRecipeFence(relativePath, language) {
  const marker = "```" + language + "\n";
  const content = read(relativePath);
  const start = content.indexOf(marker);
  if (start < 0) return null;
  const bodyStart = start + marker.length;
  const end = content.indexOf("\n```", bodyStart);
  return end < 0 ? null : content.slice(bodyStart, end);
}

function normalizeComponentPreview(html) {
  return html
    .replace(/<script data-infone-theme-bootstrap>[\s\S]*?<\/script>\n/u, "")
    .replaceAll('href="../../../tokens.css"', 'href="../../tokens.css"')
    .replaceAll('href="../../../fonts/', 'href="../../fonts/')
    .replaceAll('src="../../../assets/', 'src="../../assets/')
    .replaceAll('src="../../runtime/', 'src="../../preview/runtime/')
    .trim();
}

function recipeSourcePath(recipePath) {
  const name = path.basename(recipePath, ".md");
  return `components/${name}/${name}.jsx`;
}

function shortHash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function normalizePagePreview(html) {
  return html
    .replace(
      /\n<style>\nhtml,body\{height:auto!important;[\s\S]*?<nav class="infone-page-pager"[\s\S]*?<\/script>\n(?=<\/body>)/,
      "\n",
    )
    .replace('../../page-runtime/support.js', './support.js')
    .replace(
      '<link rel="stylesheet" href="../../../fonts/fonts.css">\n<link rel="stylesheet" href="../../../tokens.css">\n<script src="../../runtime/ds-bundle.js"></script>',
      '<script src="./ds-base.js"></script>',
    )
    .replaceAll('../../../fonts/remixicon.css', 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css')
    .replaceAll('../../../assets/', '../../assets/')
    .trim();
}

if (index.schemaVersion !== "infone-design-rules/v1") {
  errors.push("rules/index.json schemaVersion 不正确");
}

if (recipesIndex.schemaVersion !== 1) {
  errors.push("recipes/index.json schemaVersion 不正确");
}

if (manifest.rulesIndex !== "rules/index.json") {
  errors.push("manifest.json 未声明 rules/index.json");
}

const ids = new Set();
const paths = new Set();

for (const rule of index.rules ?? []) {
  if (!rule.id || !rule.path || !rule.title || !rule.summary) {
    errors.push("规则索引缺少 id/path/title/summary");
    continue;
  }
  if (ids.has(rule.id)) errors.push("重复规则 id: " + rule.id);
  if (paths.has(rule.path)) errors.push("重复规则 path: " + rule.path);
  ids.add(rule.id);
  paths.add(rule.path);

  if (!exists(rule.path)) errors.push("规则文件不存在: " + rule.path);
  if (rule.path.startsWith("preview/") || rule.path.startsWith("recipes/")) {
    errors.push("规则索引不得指向 preview 或 recipes: " + rule.path);
  }
}

if (Buffer.byteLength(design, "utf8") > 24576) {
  errors.push("DESIGN.md 超过 24KB，当前 " + Buffer.byteLength(design, "utf8") + " bytes");
}

if (design.includes("本文件全文") || usage.includes("完整读取 DESIGN.md")) {
  errors.push("仍存在要求全文读取旧版大文档的表述");
}

if (design.includes(".th-nums 或 --th-font-mono")) {
  errors.push("数字字体仍允许 mono");
}

if (!usage.includes("preview/") || !usage.includes("不进入模型上下文")) {
  errors.push("USAGE.md 未明确排除 preview 模型上下文");
}

const embeddedCatalogMatch = componentsHtml.match(
  /<script type="application\/json" data-od-component-catalog>\s*([\s\S]*?)\s*<\/script>/,
);
let embeddedCatalog = null;
if (!embeddedCatalogMatch) {
  errors.push("components.html 缺少内嵌组件目录");
} else {
  try {
    embeddedCatalog = JSON.parse(embeddedCatalogMatch[1]);
  } catch {
    errors.push("components.html 内嵌组件目录不是有效 JSON");
  }
}

for (const [label, catalog] of [
  ["components.manifest.json", componentsManifest.catalog],
  ["components.html", embeddedCatalog],
]) {
  if (!catalog) continue;
  if (!sameJson(recipesIndex.components, catalog.components)) {
    errors.push(label + " 的组件目录与 recipes/index.json 不一致");
  }
  if (!sameJson(recipesIndex.pagePatterns, catalog.pagePatterns)) {
    errors.push(label + " 的页面模式目录与 recipes/index.json 不一致");
  }
  if (catalog.snippetIndex !== "recipes/index.json") {
    errors.push(label + " 的 snippetIndex 不正确");
  }
}

const catalogPaths = new Set();
for (const component of recipesIndex.components ?? []) {
  for (const key of ["recipePath", "apiPath", "reactPath", "htmlPath"]) {
    if (component[key]) catalogPaths.add(component[key]);
  }
}
for (const pattern of recipesIndex.pagePatterns ?? []) {
  if (!["D", "D+", "B", "C"].includes(pattern.shell)) {
    errors.push(pattern.name + " 缺少有效 shell（D/D+/B/C）");
  }
  for (const key of ["patternPath", "sourcePath"]) {
    if (pattern[key]) catalogPaths.add(pattern[key]);
  }
}
for (const snippet of recipesIndex.snippets ?? []) {
  if (snippet.path) catalogPaths.add(snippet.path);
}
for (const catalogPath of catalogPaths) {
  if (!exists(catalogPath)) errors.push("recipe 目录路径不存在: " + catalogPath);
}

for (const component of recipesIndex.components ?? []) {
  const declaration = extractRecipeFence(component.recipePath, "typescript") ?? "";
  const implementation = extractRecipeFence(component.recipePath, "jsx") ?? "";
  const exportedName = component.name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  if (!new RegExp(`export\\s+(?:declare\\s+)?function\\s+${exportedName}\\b`, "u").test(declaration)) {
    errors.push(component.recipePath + " 未声明目录组件: " + component.name);
  }
  if (!new RegExp(`export\\s+(?:function|const|class)\\s+${exportedName}\\b`, "u").test(implementation)) {
    errors.push(component.recipePath + " 未实现目录组件: " + component.name);
  }
}

const componentRecipeDir = path.join(root, "recipes/components");
const componentRecipeFiles = fs.readdirSync(componentRecipeDir).filter((file) => file.endsWith(".md"));
const catalogComponentNames = new Set(
  (recipesIndex.components ?? []).map((component) => component.name),
);
const indexedComponentRecipeFiles = new Set(
  (recipesIndex.components ?? []).map((component) => path.basename(component.recipePath)),
);
for (const name of duplicateValues((recipesIndex.components ?? []).map((component) => component.name))) {
  errors.push("重复组件目录名称: " + name);
}
for (const file of componentRecipeFiles) {
  if (!indexedComponentRecipeFiles.has(file)) {
    errors.push("组件 recipe 未登记到 recipes/index.json: recipes/components/" + file);
  }
}
const expectedComponentPreviewFolders = new Set(
  [...indexedComponentRecipeFiles].map((file) => path.basename(file, ".md")),
);
const actualComponentPreviewFolders = new Set(directoryNames("preview/component-cards"));
for (const folder of actualComponentPreviewFolders) {
  if (!expectedComponentPreviewFolders.has(folder)) {
    errors.push("组件预览未登记或缺少 recipe: preview/component-cards/" + folder);
  }
}
for (const folder of expectedComponentPreviewFolders) {
  if (!actualComponentPreviewFolders.has(folder)) {
    errors.push("组件 recipe 缺少预览目录: preview/component-cards/" + folder);
    continue;
  }
  const htmlFiles = fs.readdirSync(path.join(root, "preview/component-cards", folder))
    .filter((file) => file.endsWith(".html"));
  if (htmlFiles.length !== 1) {
    errors.push(`组件预览目录必须且只能包含一个 HTML: preview/component-cards/${folder}（当前 ${htmlFiles.length}）`);
  }
}
const staleComponentResources = [
  "../../styles.css",
  "../../_ds_bundle.js",
  "https://unpkg.com/react@",
  "https://unpkg.com/react-dom@",
  "https://unpkg.com/@babel/standalone@",
];
const resourcePattern = /<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g;

for (const file of componentRecipeFiles) {
  const relativePath = "recipes/components/" + file;
  const content = read(relativePath);
  for (const stale of staleComponentResources) {
    if (content.includes(stale)) errors.push(relativePath + " 仍引用旧资源: " + stale);
  }
  let match;
  while ((match = resourcePattern.exec(content))) {
    const target = match[1];
    if (/^(?:https?:|data:|#)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(path.join(root, relativePath)), target);
    if (!fs.existsSync(resolved)) errors.push(relativePath + " 本地运行资源不存在: " + target);
  }

  const jsx = extractRecipeFence(relativePath, "jsx");
  const html = extractHtmlRecipe(relativePath);
  if (!extractRecipeFence(relativePath, "typescript")) {
    errors.push(relativePath + " 缺少 TypeScript 组件声明");
  }
  if (!jsx) errors.push(relativePath + " 缺少 JSX recipe");
  if (!html) errors.push(relativePath + " 缺少 HTML recipe");
  for (const color of new Set(html?.match(
    /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklab|oklch|lab|lch)\([^()]*\)/gu,
  ) ?? [])) {
    errors.push(relativePath + " HTML 示例存在未绑定 token 的颜色: " + color);
  }

  if (jsx) {
    const withoutComments = jsx
      .replace(/\/\*[\s\S]*?\*\//gu, "")
      .replace(/\/\/.*$/gmu, "");
    const rawColors = withoutComments.match(
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklab|oklch|lab|lch)\([^()]*\)/gu,
    ) ?? [];
    for (const color of new Set(rawColors)) {
      errors.push(relativePath + " JSX 存在未绑定 token 的颜色: " + color);
    }
    if (/\bTokenHubDesignSystem[A-Za-z0-9_]*\b/u.test(withoutComments)) {
      errors.push(
        relativePath +
          " 组件生产源码不得访问预览全局对象 TokenHubDesignSystem_*，跨组件依赖须用 import { X } from \"./X\"（见 USAGE.md 模块化生产实现规范）",
      );
    }
    for (const imported of jsx.matchAll(
      /^import\s*\{([^}]+)\}\s*from\s*["']\.\/([^"']+)["'];?\s*$/gmu,
    )) {
      for (const specifier of imported[1].split(",")) {
        const name = specifier.trim().replace(/^type\s+/u, "").split(/\s+as\s+/u).at(-1);
        if (name && !catalogComponentNames.has(name)) {
          errors.push(relativePath + " 引用了未登记组件: " + name);
        }
      }
    }
  }

  const folder = path.basename(file, ".md");
  const previewDir = path.join(root, "preview/component-cards", folder);
  const previewFile = fs.existsSync(previewDir)
    ? fs.readdirSync(previewDir).find((candidate) => candidate.endsWith(".html"))
    : null;
  if (!previewFile) {
    errors.push(relativePath + " 缺少组件预览");
  } else if (html?.trim() !== normalizeComponentPreview(
    read(`preview/component-cards/${folder}/${previewFile}`),
  )) {
    errors.push(relativePath + " 与组件预览内容不一致");
  }
}

const bundle = read("preview/runtime/ds-bundle.js");
const bundleHeader = bundle.match(/^\/\* @ds-bundle: (.+) \*\/\n/);
if (!bundleHeader) {
  errors.push("preview/runtime/ds-bundle.js 缺少有效元数据");
} else {
  const bundleMeta = JSON.parse(bundleHeader[1]);
  const recipeNames = new Set((recipesIndex.components ?? []).map((component) => component.name));
  const bundleNames = new Set();
  for (const component of bundleMeta.components ?? []) {
    const name = typeof component === "string" ? component : component.name;
    bundleNames.add(name);
    if (!recipeNames.has(name)) errors.push("bundle 组件未登记到 recipes/index.json: " + name);
  }
  for (const name of recipeNames) {
    if (!bundleNames.has(name)) errors.push("recipe 组件未进入 bundle: " + name);
  }
  for (const recipePath of new Set(
    (recipesIndex.components ?? []).map((component) => component.recipePath),
  )) {
    const jsx = extractRecipeFence(recipePath, "jsx");
    if (!jsx) continue;
    const sourcePath = recipeSourcePath(recipePath);
    if (bundleMeta.sourceHashes?.[sourcePath] !== shortHash(jsx)) {
      errors.push("bundle 源码摘要未与 recipe 同步: " + sourcePath);
    }
  }
  const legacyHashes = Object.keys(bundleMeta.sourceHashes ?? {}).filter((key) => key.startsWith("ui_kits/"));
  if (legacyHashes.length) errors.push("bundle 元数据仍包含已删除 ui_kits 源码");
}
if (bundle.includes("ui_kits/")) {
  errors.push("bundle 仍包含已删除 ui_kits 的历史内容");
}

const componentNames = new Set(
  (recipesIndex.components ?? []).map((component) => component.name),
);
const shellComponents = {
  D: { required: ["NavRail"], forbidden: ["TopNav"] },
  "D+": { required: ["NavRail", "TopNav"], forbidden: [] },
  B: { required: ["TopNav"], forbidden: ["NavRail"] },
  C: { required: [], forbidden: ["NavRail", "TopNav"] },
};

const pageRecipeFiles = fs.readdirSync(path.join(root, "recipes/pages"))
  .filter((file) => file.endsWith(".md"));
const indexedPageRecipeFiles = new Set(
  (recipesIndex.pagePatterns ?? []).map((pattern) => path.basename(pattern.patternPath)),
);
for (const name of duplicateValues((recipesIndex.pagePatterns ?? []).map((pattern) => pattern.name))) {
  errors.push("重复页面模式名称: " + name);
}
for (const recipePath of duplicateValues(
  (recipesIndex.pagePatterns ?? []).map((pattern) => pattern.patternPath),
)) {
  errors.push("重复页面模式 recipe: " + recipePath);
}
for (const file of pageRecipeFiles) {
  if (!indexedPageRecipeFiles.has(file)) {
    errors.push("页面 recipe 未登记到 recipes/index.json: recipes/pages/" + file);
  }
}
const expectedPagePreviewFolders = new Set(
  [...indexedPageRecipeFiles].map((file) => path.basename(file, ".md")),
);
const actualPagePreviewFolders = new Set(directoryNames("preview/page-patterns"));
for (const folder of actualPagePreviewFolders) {
  if (!expectedPagePreviewFolders.has(folder)) {
    errors.push("页面预览未登记或缺少 recipe: preview/page-patterns/" + folder);
  }
}
for (const folder of expectedPagePreviewFolders) {
  if (!actualPagePreviewFolders.has(folder)) {
    errors.push("页面 recipe 缺少预览目录: preview/page-patterns/" + folder);
    continue;
  }
  const htmlFiles = fs.readdirSync(path.join(root, "preview/page-patterns", folder))
    .filter((file) => file.endsWith(".html"));
  if (htmlFiles.length !== 1 || htmlFiles[0] !== "index.html") {
    errors.push(`页面预览目录必须且只能包含 index.html: preview/page-patterns/${folder}`);
  }
}

for (const pattern of recipesIndex.pagePatterns ?? []) {
  const recipe = read(pattern.patternPath);
  const importedComponents = new Set(
    [...recipe.matchAll(/component-from-global-scope="[^"]+\.([A-Za-z][A-Za-z0-9]*)"/g)]
      .map((match) => match[1]),
  );
  for (const component of importedComponents) {
    if (!componentNames.has(component)) {
      errors.push(pattern.patternPath + " 引用了未登记组件: " + component);
    }
  }
  const shellContract = shellComponents[pattern.shell];
  if (shellContract) {
    for (const component of shellContract.required) {
      if (!importedComponents.has(component)) {
        errors.push(pattern.patternPath + " 的 " + pattern.shell + " 档骨架缺少 " + component);
      }
    }
    for (const component of shellContract.forbidden) {
      if (importedComponents.has(component)) {
        errors.push(pattern.patternPath + " 的 " + pattern.shell + " 档骨架不应包含 " + component);
      }
    }
  }
  const recipeHtml = extractHtmlRecipe(pattern.patternPath);
  if (!recipeHtml) {
    errors.push(pattern.patternPath + " 缺少 HTML recipe");
    continue;
  }
  const nativeControlRules = [
    { pattern: /<select\b/iu, component: "Select" },
    { pattern: /<input\b[^>]*\btype=["']checkbox["']/iu, component: "Checkbox" },
    { pattern: /<input\b[^>]*\btype=["']radio["']/iu, component: "RadioGroup" },
  ];
  for (const rule of nativeControlRules) {
    if (componentNames.has(rule.component) && rule.pattern.test(recipeHtml)) {
      errors.push(
        pattern.patternPath +
          " 使用原生控件重复已有组件，请改用 " +
          rule.component +
          "（组件优先复用，见 USAGE.md）",
      );
    }
  }
  const slug = path.basename(pattern.patternPath, ".md");
  const previewPath = "preview/page-patterns/" + slug + "/index.html";
  if (!exists(previewPath)) {
    errors.push("页面预览不存在: " + previewPath);
    continue;
  }
  if (recipeHtml.trim() !== normalizePagePreview(read(previewPath))) {
    errors.push(pattern.patternPath + " 与页面预览内容不一致");
  }
}

const markdownFiles = ["DESIGN.md", "USAGE.md", ...Array.from(paths)];
const linkPattern = /\]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = read(file);
  let match;
  while ((match = linkPattern.exec(content))) {
    const target = match[1];
    if (target.startsWith("#") || target.startsWith("http:") || target.startsWith("https:")) continue;
    const clean = target.split("#")[0];
    const resolved = path.resolve(path.dirname(path.join(root, file)), clean);
    if (!fs.existsSync(resolved)) errors.push(file + " 链接不存在: " + target);
  }
}

if (errors.length) {
  for (const error of errors) console.error("ERROR " + error);
  process.exit(1);
}

console.log("DESIGN.md: " + Buffer.byteLength(design, "utf8") + " bytes");
console.log("rules: " + index.rules.length);
console.log("components: " + recipesIndex.components.length);
console.log("page patterns: " + recipesIndex.pagePatterns.length);
console.log("documentation validation passed");
