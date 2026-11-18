import path from "node:path";

import { contract, repositoryPath } from "./contract.mjs";
const FORBIDDEN_BASENAMES = new Set([
  ".DS_Store",
  "Desktop.ini",
  "Thumbs.db",
]);
const FORBIDDEN_DIRECTORY_NAMES = new Set([
  ".od-frames",
  ".od-skills",
  "od-design-system",
]);
const FORBIDDEN_ROOTS = [
  ...contract.scratchRoots,
  "playwright-report/",
  "test-results/",
];
const IMAGE_EXTENSION = /\.(?:avif|bmp|gif|heic|heif|ico|jpe?g|png|svg|tiff?|webp)$/iu;
const FONT_EXTENSION = /\.(?:eot|otf|ttc|ttf|woff2?)$/iu;
const ROOT_FILE_ALLOWLIST = new Set([
  ".gitignore",
  ".gitlab-ci.yml",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package-lock.json",
  "package.json",
]);
const ROOT_DIRECTORY_RULES = [
  { root: ".githooks/", extensions: new Set([""]) },
  { root: "harness/", extensions: new Set([".json", ".md", ".mjs"]) },
  { root: "test/", extensions: new Set([".html", ".json", ".md", ".mjs"]) },
];

export function normalizeRepoPath(file) {
  return file.split(path.sep).join("/").replace(/^\.\//u, "");
}

function packageConfigsFor(contractValue) {
  const optionalPath = (designPackage, relativePath) => relativePath
    ? repositoryPath(designPackage, relativePath)
    : null;
  return contractValue.packages
    .map((designPackage) => ({
    id: designPackage.id,
    root: normalizeRepoPath(designPackage.root).replace(/\/$/u, ""),
    componentPreviewRoot: optionalPath(
      designPackage,
      designPackage.derived?.componentPreviewRoot,
    ),
    pagePreviewRoot: optionalPath(designPackage, designPackage.derived?.pagePreviewRoot),
    runtimeBundle: optionalPath(designPackage, designPackage.derived?.runtimeBundle),
    supportFiles: new Set(
      (designPackage.derived?.supportFiles ?? []).map(
        (file) => repositoryPath(designPackage, file),
      ),
    ),
    catalogFiles: new Set(
      (designPackage.derived?.catalogFiles ?? []).map(
        (file) => repositoryPath(designPackage, file),
      ),
    ),
    componentRecipeRoot: optionalPath(
      designPackage,
      designPackage.ownership?.componentRecipeRoot,
    ),
    pageRecipeRoot: optionalPath(designPackage, designPackage.ownership?.pageRecipeRoot),
    recipeIndex: optionalPath(designPackage, designPackage.ownership?.recipeIndex),
    catalogSources: new Set(
      (designPackage.ownership?.catalogSources ?? []).map(
        (file) => repositoryPath(designPackage, file),
      ),
    ),
    generatorSources: new Set(
      (designPackage.ownership?.generatorSources ?? []).map(
        (file) => repositoryPath(designPackage, file),
      ),
    ),
    imageRoots: (designPackage.hygiene?.imageRoots ?? []).map(
      (root) => repositoryPath(designPackage, root),
    ),
    fontRoots: (designPackage.hygiene?.fontRoots ?? []).map(
      (root) => repositoryPath(designPackage, root),
    ),
    allowedFiles: new Set([
      ...(designPackage.canonical?.files ?? []),
      ...(designPackage.derived?.catalogFiles ?? []),
      ...(designPackage.derived?.supportFiles ?? []),
      designPackage.derived?.runtimeBundle,
      designPackage.maintenance?.syncScript,
      designPackage.maintenance?.validateScript,
      ...(designPackage.ownership?.generatorSources ?? []),
    ].filter(Boolean).map((file) => repositoryPath(designPackage, file))),
    newFileRules: (designPackage.hygiene?.newFileRules ?? []).map((rule) => ({
      root: repositoryPath(designPackage, rule.root),
      extensions: new Set(rule.extensions.map((extension) => extension.toLowerCase())),
    })),
    }))
    .sort((left, right) => right.root.length - left.root.length);
}

function isAllowedNewFile(configs, file) {
  if (ROOT_FILE_ALLOWLIST.has(file)
    || ROOT_DIRECTORY_RULES.some((rule) => file.startsWith(rule.root)
      && rule.extensions.has(path.posix.extname(file).toLowerCase()))) return true;
  const config = configForPackageFile(configs, file);
  if (!config) return false;
  return config.allowedFiles.has(file)
    || config.newFileRules.some((rule) => file.startsWith(rule.root)
      && rule.extensions.has(path.posix.extname(file).toLowerCase()));
}

export function newFileIssues(inputFiles, contractValue = contract) {
  const configs = packageConfigsFor(contractValue);
  return [...new Set(inputFiles.map(normalizeRepoPath).filter(Boolean))]
    .filter((file) => !isAllowedNewFile(configs, file))
    .map((file) => ({
      code: "unexpected-new-file",
      file,
      message: "发现未登记到设计规范目录的新文件。",
    }));
}

const packageConfigs = packageConfigsFor(contract);

function isRecipeSource(config, file) {
  return (config.componentRecipeRoot && file.startsWith(config.componentRecipeRoot))
    || (config.pageRecipeRoot && file.startsWith(config.pageRecipeRoot))
    || (config.recipeIndex && file === config.recipeIndex);
}

function isCatalogSource(config, file) {
  return isRecipeSource(config, file) || config.catalogSources.has(file);
}

function derivedPackage(configs, file) {
  return configs.find((config) => (config.componentPreviewRoot
      && file.startsWith(config.componentPreviewRoot))
    || (config.pagePreviewRoot && file.startsWith(config.pagePreviewRoot))
    || (config.runtimeBundle && file === config.runtimeBundle)
    || config.catalogFiles.has(file));
}

export function isDerivedFile(file, contractValue = contract) {
  return Boolean(derivedPackage(packageConfigsFor(contractValue), normalizeRepoPath(file)));
}

function packageRelativePath(configs, file) {
  for (const config of configs) {
    const prefix = config.root + "/";
    if (file.startsWith(prefix)) return file.slice(prefix.length);
  }
  return null;
}

function configForPackageFile(configs, file) {
  return configs.find((config) => file.startsWith(config.root + "/")) ?? null;
}

function isWithinAnyRoot(file, roots) {
  return roots.some((root) => file.startsWith(root));
}

function forbiddenIssue(configs, file) {
  const basename = path.posix.basename(file);
  if (FORBIDDEN_BASENAMES.has(basename)) {
    return "Operating-system metadata must not be committed.";
  }
  if (FORBIDDEN_ROOTS.some((root) => file.startsWith(root))) {
    return "Temporary or test output must not be committed.";
  }
  if (file.split("/").some((part) => FORBIDDEN_DIRECTORY_NAMES.has(part))) {
    return "Open Design and AI conversation workspaces must not be committed.";
  }
  if (/\.(?:bak|log|orig|rej|temp|tmp)$/iu.test(file) || file.endsWith("~")) {
    return "Log, backup, and temporary files must not be committed.";
  }
  if (file.endsWith(".artifact.json")) {
    return "Open Design artifact sidecars are review output and must not be committed.";
  }
  const packageConfig = configForPackageFile(configs, file);
  if (packageConfig && IMAGE_EXTENSION.test(file)
    && !isWithinAnyRoot(file, packageConfig.imageRoots)) {
    return `Images must be stored under: ${packageConfig.imageRoots.join(", ")}.`;
  }
  if (packageConfig && FONT_EXTENSION.test(file)
    && !isWithinAnyRoot(file, packageConfig.fontRoots)) {
    return `Fonts must be stored under: ${packageConfig.fontRoots.join(", ")}.`;
  }
  const packageRelative = packageRelativePath(configs, file);
  if (packageRelative && !packageRelative.includes("/") && /\.(?:png|jpe?g)$/iu.test(packageRelative)) {
    return "Package-root screenshots are review evidence; move them to .harness-output/.";
  }
  if (packageRelative
    && !packageRelative.includes("/")
    && /-(?:comparison|preview)\.html$/iu.test(packageRelative)) {
    return "One-off comparison/preview pages belong in .harness-output/, not the package root.";
  }
  return null;
}

function componentRecipeForPreview(config, file) {
  if (!config.componentPreviewRoot
    || !config.componentRecipeRoot
    || !file.startsWith(config.componentPreviewRoot)) return null;
  const relative = file.slice(config.componentPreviewRoot.length);
  const component = relative.split("/")[0];
  return component ? `${config.componentRecipeRoot}${component}.md` : null;
}

function pageRecipeForPreview(config, file) {
  if (!config.pagePreviewRoot
    || !config.pageRecipeRoot
    || !file.startsWith(config.pagePreviewRoot)) return null;
  const relative = file.slice(config.pagePreviewRoot.length);
  const slug = relative.split("/")[0];
  return slug ? `${config.pageRecipeRoot}${slug}.md` : null;
}

export function boundaryIssues(inputFiles, options = {}) {
  const files = [...new Set(inputFiles.map(normalizeRepoPath).filter(Boolean))];
  const fileSet = new Set(files);
  const deletedFiles = new Set(
    (options.deletedFiles ?? []).map(normalizeRepoPath).filter(Boolean),
  );
  const issues = [];
  const configs = options.contract ? packageConfigsFor(options.contract) : packageConfigs;

  for (const file of files) {
    const forbidden = deletedFiles.has(file) ? null : forbiddenIssue(configs, file);
    if (forbidden) {
      issues.push({ code: "forbidden-review-output", file, message: forbidden });
    }

    const config = derivedPackage(configs, file);
    if (!config) continue;
    const generatorChanged = options.repository !== true
      && files.some((candidate) => config.generatorSources.has(candidate));

    const componentRecipe = componentRecipeForPreview(config, file);
    if (componentRecipe && !fileSet.has(componentRecipe) && !generatorChanged) {
      issues.push({
        code: "component-preview-without-recipe",
        file,
        message: `Generated component preview changed without ${componentRecipe}. Move the design change to the recipe and regenerate.`,
      });
      continue;
    }

    const pageRecipe = pageRecipeForPreview(config, file);
    if (pageRecipe && !fileSet.has(pageRecipe) && !generatorChanged) {
      issues.push({
        code: "page-preview-without-recipe",
        file,
        message: `Generated page preview changed without ${pageRecipe}. Move the design change to the page recipe and regenerate.`,
      });
      continue;
    }

    if (file === config.runtimeBundle
      && !files.some((candidate) => config.componentRecipeRoot
        && candidate.startsWith(config.componentRecipeRoot))
      && !generatorChanged) {
      issues.push({
        code: "runtime-without-recipe",
        file,
        message: "The runtime bundle is generated. Change a component recipe and run npm run sync instead of editing the bundle directly.",
      });
      continue;
    }

    if (config.catalogFiles.has(file)
      && !files.some((candidate) => isCatalogSource(config, candidate))
      && !generatorChanged) {
      issues.push({
        code: "catalog-without-source",
        file,
        message: "Generated catalog output changed without a recipe, token, index, or manifest source change.",
      });
    }
  }

  return issues;
}
