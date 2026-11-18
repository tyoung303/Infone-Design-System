import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const Babel = require("../preview/runtime/babel.min.js");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const write = process.argv.includes("--write");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fenced(content, language) {
  const marker = "```" + language + "\n";
  const start = content.indexOf(marker);
  if (start < 0) return null;
  const bodyStart = start + marker.length;
  const end = content.indexOf("\n```", bodyStart);
  return end < 0 ? null : content.slice(bodyStart, end);
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function sourcePathForRecipe(recipePath) {
  const name = path.basename(recipePath, ".md");
  return `components/${name}/${name}.jsx`;
}

function importsFrom(source) {
  const names = [];
  const importPattern = /^import\s*\{([^}]+)\}\s*from\s*["']\.\/([^"']+)["'];?\s*$/gmu;
  for (const match of source.matchAll(importPattern)) {
    for (const specifier of match[1].split(",")) {
      const name = specifier.trim().replace(/^type\s+/u, "").split(/\s+as\s+/u).at(-1);
      if (name) names.push(name);
    }
  }
  return [...new Set(names)];
}

function compileModule(module) {
  const imports = importsFrom(module.source);
  const exportNames = [...new Set([
    ...module.source.matchAll(/\bexport\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gu),
  ].map((match) => match[1]))];
  const withoutImports = module.source.replace(
    /^import\s*\{[^}]+\}\s*from\s*["']\.\/[^"']+["'];?\s*$/gmu,
    "",
  );
  const compilable = withoutImports.replace(
    /\bexport\s+(?=(?:async\s+)?(?:function|const|let|class)\b)/gu,
    "",
  );
  const compiled = Babel.transform(compilable, {
    presets: [["react", { runtime: "classic" }]],
    comments: true,
    compact: false,
    filename: module.sourcePath,
  }).code;
  const dependencyBinding = imports.length > 0
    ? `const { ${imports.join(", ")} } = __ds_scope;\n`
    : "";
  return [
    `// ${module.sourcePath}`,
    "try { (() => {",
    dependencyBinding + compiled,
    `Object.assign(__ds_scope, { ${exportNames.join(", ")} });`,
    `})(); } catch (e) { __ds_ns.__errors.push({ path: ${JSON.stringify(module.sourcePath)}, error: String((e && e.message) || e) }); }`,
  ].join("\n");
}

function sortModules(modules, componentToModule) {
  const byPath = new Map(modules.map((module) => [module.recipePath, module]));
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];
  function visit(module) {
    if (visited.has(module.recipePath)) return;
    if (visiting.has(module.recipePath)) {
      throw new Error(`component recipe dependency cycle: ${module.recipePath}`);
    }
    visiting.add(module.recipePath);
    for (const dependency of importsFrom(module.source)) {
      const dependencyModule = componentToModule.get(dependency);
      if (!dependencyModule) {
        throw new Error(`${module.recipePath} imports unknown component: ${dependency}`);
      }
      visit(dependencyModule);
    }
    visiting.delete(module.recipePath);
    visited.add(module.recipePath);
    ordered.push(byPath.get(module.recipePath));
  }
  for (const module of modules) visit(module);
  return ordered;
}

function previewHtml(recipeHtml) {
  const withPaths = recipeHtml
    .replaceAll('href="../../tokens.css"', 'href="../../../tokens.css"')
    .replaceAll('href="../../fonts/', 'href="../../../fonts/')
    .replaceAll('src="../../assets/', 'src="../../../assets/')
    .replaceAll('src="../../preview/runtime/', 'src="../../runtime/');
  if (withPaths.includes("data-infone-theme-bootstrap")) return withPaths;
  return withPaths.replace(
    "<head>\n",
    '<head>\n<script data-infone-theme-bootstrap>if(new URLSearchParams(location.search).get("theme")==="dark")document.documentElement.setAttribute("data-theme","dark")</script>\n',
  );
}

const PAGE_PAGER_STYLE = `<style>
html,body{height:auto!important;min-height:100%;overflow-y:auto!important}
.infone-page-pager{position:fixed;z-index:2147483646;right:20px;bottom:20px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:20px;min-width:min(520px,calc(100vw - 40px));padding:12px 16px;border:1px solid #e2e5ea;border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 10px 30px rgba(22,24,28,.14);backdrop-filter:blur(12px);font:13px/1.4 var(--th-font-ui,system-ui,sans-serif);color:#16181c}
.infone-page-pager a{display:grid;gap:2px;color:#16181c;text-decoration:none}.infone-page-pager a span{color:#676e7c;font-size:11px}.infone-page-pager-next{text-align:right}.infone-page-pager-count{color:#676e7c;white-space:nowrap}
@media(max-width:720px){.infone-page-pager{right:12px;bottom:12px;grid-template-columns:1fr auto 1fr;min-width:calc(100vw - 24px);padding:10px 12px}.infone-page-pager a strong{display:none}}
</style>`;

const PAGE_PAGER_SCRIPT = `<script>(()=>{const pager=document.querySelector(".infone-page-pager");if(!pager)return;const previous=pager.querySelector(".infone-page-pager-previous");const next=pager.querySelector(".infone-page-pager-next");const canScrollInDirection=(target,deltaY)=>{let element=target instanceof Element?target:null;while(element&&element!==document.documentElement){const overflowY=getComputedStyle(element).overflowY;if(/^(auto|scroll|overlay)$/.test(overflowY)&&element.scrollHeight>element.clientHeight){if(deltaY>0?element.scrollTop+element.clientHeight<element.scrollHeight-1:element.scrollTop>1)return true}element=element.parentElement}const scrollingElement=document.scrollingElement;if(!scrollingElement)return false;return deltaY>0?scrollingElement.scrollTop+scrollingElement.clientHeight<scrollingElement.scrollHeight-1:scrollingElement.scrollTop>1};let accumulatedDelta=0;let resetTimer=0;let navigating=false;addEventListener("wheel",event=>{if(navigating||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||canScrollInDirection(event.target,event.deltaY))return;const candidate=event.deltaY>0?next:previous;if(!candidate)return;event.preventDefault();const multiplier=event.deltaMode===WheelEvent.DOM_DELTA_LINE?16:event.deltaMode===WheelEvent.DOM_DELTA_PAGE?innerHeight:1;accumulatedDelta+=event.deltaY*multiplier;clearTimeout(resetTimer);resetTimer=window.setTimeout(()=>{accumulatedDelta=0},180);if(Math.abs(accumulatedDelta)<48)return;const destination=accumulatedDelta>0?next:previous;if(!destination){accumulatedDelta=0;return}navigating=true;location.assign(destination.href)},{passive:false})})();</script>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageSlug(pattern) {
  return path.basename(pattern.patternPath, ".md");
}

function pageLabel(pattern) {
  return pattern.title.replace(/^InfOne 页面模式：\s*/u, "");
}

function pagePager(patterns, index) {
  const previous = patterns[index - 1];
  const next = patterns[index + 1];
  const previousLink = previous
    ? `<a class="infone-page-pager-previous" href="../${pageSlug(previous)}/index.html"><span>上一个</span><strong>${escapeHtml(pageLabel(previous))}</strong></a>`
    : "<span></span>";
  const nextLink = next
    ? `<a class="infone-page-pager-next" href="../${pageSlug(next)}/index.html"><span>下一个</span><strong>${escapeHtml(pageLabel(next))}</strong></a>`
    : "<span></span>";
  return `${PAGE_PAGER_STYLE}<nav class="infone-page-pager" aria-label="页面模式切换" title="上下滚动切换页面">${previousLink}<span class="infone-page-pager-count">${index + 1} / ${patterns.length}</span>${nextLink}</nav>${PAGE_PAGER_SCRIPT}`;
}

function pagePreviewHtml(recipeHtml, patterns, index) {
  if (!recipeHtml.includes('<script src="./support.js"></script>')) {
    throw new Error(`${patterns[index].patternPath} HTML recipe is missing ./support.js`);
  }
  if (!recipeHtml.includes('<script src="./ds-base.js"></script>')) {
    throw new Error(`${patterns[index].patternPath} HTML recipe is missing ./ds-base.js`);
  }
  const runtimeResources = [
    '<link rel="stylesheet" href="../../../fonts/fonts.css">',
    '<link rel="stylesheet" href="../../../tokens.css">',
    '<script src="../../runtime/ds-bundle.js"></script>',
  ].join("\n");
  const withResources = recipeHtml
    .replace('<script src="./support.js"></script>', '<script src="../../page-runtime/support.js"></script>')
    .replace('<script src="./ds-base.js"></script>', runtimeResources)
    .replaceAll(
      "https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css",
      "../../../fonts/remixicon.css",
    )
    .replaceAll("../../assets/", "../../../assets/");
  const closingBody = withResources.lastIndexOf("</body>");
  if (closingBody < 0) {
    throw new Error(`${patterns[index].patternPath} HTML recipe is missing </body>`);
  }
  return withResources.slice(0, closingBody)
    + pagePager(patterns, index)
    + "\n"
    + withResources.slice(closingBody);
}

function replaceComponentCatalogHeights(html, components) {
  let result = html;
  for (const component of components) {
    const recipe = fenced(read(component.recipePath), "html");
    const height = recipe?.match(/@dsCard[^\n]*\bcatalogHeight="(\d+)"/u)?.[1];
    if (!height) continue;
    const escapedName = component.name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const pattern = new RegExp(`(<article[^>]*id="${escapedName}"[^>]*>[\\s\\S]*?<iframe[^>]*style="[^\"]*height:)\\d+(px)`, "u");
    result = result.replace(pattern, (_match, before, unit) => before + height + unit);
  }
  return result;
}

function replaceEmbeddedCatalog(componentsHtml, catalog) {
  const pattern = /(<script type="application\/json" data-od-component-catalog>\n)[\s\S]*?(\n<\/script>)/u;
  if (!pattern.test(componentsHtml)) {
    throw new Error("components.html is missing its embedded component catalog");
  }
  return componentsHtml.replace(
    pattern,
    (_match, openingTag, closingTag) => openingTag + JSON.stringify(catalog, null, 2) + closingTag,
  );
}

const COMPONENT_CATALOG_NAVIGATION = `<script data-infone-component-navigation>
(()=>{
  const navigation=document.querySelector('.component-nav');
  if(!navigation)return;
  navigation.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if(!target)return;
    event.preventDefault();
    target.scrollIntoView({block:'start'});
    if(matchMedia('(max-width: 840px)').matches)scrollBy({top:-navigation.offsetHeight,left:0});
    try{history.replaceState(null,'',link.hash)}catch{}
  });
})();
</script>`;

function replaceComponentCatalogNavigation(componentsHtml) {
  const pattern = /\n<script data-infone-component-navigation>[\s\S]*?<\/script>(?=\n<\/body>)/u;
  if (pattern.test(componentsHtml)) {
    return componentsHtml.replace(pattern, "\n" + COMPONENT_CATALOG_NAVIGATION);
  }
  const closingBody = componentsHtml.lastIndexOf("</body>");
  if (closingBody < 0) {
    throw new Error("components.html is missing </body>");
  }
  return componentsHtml.slice(0, closingBody)
    + COMPONENT_CATALOG_NAVIGATION
    + "\n"
    + componentsHtml.slice(closingBody);
}

function sync(relativePath, expected) {
  const absolutePath = path.join(root, relativePath);
  const actual = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
  const normalizedExpected = expected.endsWith("\n") ? expected : expected + "\n";
  if (actual === normalizedExpected) return;
  if (write) {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, normalizedExpected);
  } else {
    errors.push(`${relativePath} is not synchronized with its recipe`);
  }
}

const recipeIndex = JSON.parse(read("recipes/index.json"));
const uniqueRecipePaths = [...new Set(recipeIndex.components.map((component) => component.recipePath))];
const modules = uniqueRecipePaths.map((recipePath) => {
  const content = read(recipePath);
  const source = fenced(content, "jsx");
  if (!source) throw new Error(`${recipePath} is missing a jsx recipe`);
  return {
    recipePath,
    source,
    sourcePath: sourcePathForRecipe(recipePath),
  };
});
const moduleByRecipe = new Map(modules.map((module) => [module.recipePath, module]));
const componentToModule = new Map(
  recipeIndex.components.map((component) => [component.name, moduleByRecipe.get(component.recipePath)]),
);

for (const recipePath of uniqueRecipePaths) {
  const recipeHtml = fenced(read(recipePath), "html");
  if (!recipeHtml) throw new Error(`${recipePath} is missing an html recipe`);
  const folder = path.basename(recipePath, ".md");
  const previewDir = path.join(root, "preview/component-cards", folder);
  const previewFile = fs.existsSync(previewDir)
    ? fs.readdirSync(previewDir).find((file) => file.endsWith(".html"))
    : null;
  if (!previewFile) throw new Error(`${recipePath} has no component preview`);
  sync(`preview/component-cards/${folder}/${previewFile}`, previewHtml(recipeHtml));
}

for (const [index, pattern] of recipeIndex.pagePatterns.entries()) {
  const recipeHtml = fenced(read(pattern.patternPath), "html");
  if (!recipeHtml) throw new Error(`${pattern.patternPath} is missing an html recipe`);
  const slug = pageSlug(pattern);
  sync(`preview/page-patterns/${slug}/index.html`, pagePreviewHtml(recipeHtml, recipeIndex.pagePatterns, index));
}

const manifestCatalog = {
  components: recipeIndex.components,
  pagePatterns: recipeIndex.pagePatterns,
  snippetIndex: "recipes/index.json",
};
const componentsManifest = JSON.parse(read("components.manifest.json"));
componentsManifest.catalog = manifestCatalog;
sync("components.manifest.json", JSON.stringify(componentsManifest, null, 2));

const embeddedCatalog = {
  snippetIndex: "recipes/index.json",
  components: recipeIndex.components,
  pagePatterns: recipeIndex.pagePatterns,
};
sync(
  "components.html",
  replaceComponentCatalogNavigation(replaceComponentCatalogHeights(replaceEmbeddedCatalog(read("components.html"), embeddedCatalog), recipeIndex.components)),
);

const orderedModules = sortModules(modules, componentToModule);
const components = recipeIndex.components.map((component) => ({
  name: component.name,
  sourcePath: sourcePathForRecipe(component.recipePath),
}));
const sourceHashes = Object.fromEntries(
  orderedModules.map((module) => [module.sourcePath, hash(module.source)]),
);
const metadata = {
  format: 4,
  namespace: "TokenHubDesignSystem_019e20",
  components,
  sourceHashes,
  inlinedExternals: [],
  unexposedExports: [],
};
const runtime = [
  `/* @ds-bundle: ${JSON.stringify(metadata)} */`,
  "",
  "(() => {",
  "",
  "const __ds_ns = (window.TokenHubDesignSystem_019e20 = window.TokenHubDesignSystem_019e20 || {});",
  "const __ds_scope = {};",
  "(__ds_ns.__errors = __ds_ns.__errors || []);",
  "",
  orderedModules.map(compileModule).join("\n\n"),
  "",
  ...recipeIndex.components.map(
    (component) => `__ds_ns.${component.name} = __ds_scope.${component.name};`,
  ),
  "",
  "})();",
].join("\n");
sync("preview/runtime/ds-bundle.js", runtime);

if (errors.length > 0) {
  for (const error of errors) console.error("ERROR " + error);
  process.exit(1);
}

console.log(
  write
    ? "recipe previews, catalogs, and runtime synchronized"
    : "recipe previews, catalogs, and runtime are synchronized",
);
