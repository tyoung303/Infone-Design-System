import fs from "node:fs";
import path from "node:path";

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Harness contract requires ${label}`);
  }
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`Harness contract requires ${label}`);
}

function requireDirectoryRoots(value, label) {
  requireArray(value, label);
  if (value.length === 0) throw new Error(`Harness contract requires non-empty ${label}`);
  for (const [index, root] of value.entries()) {
    requireString(root, `${label}[${index}]`);
    if (path.posix.isAbsolute(root) || root.split("/").includes("..") || !root.endsWith("/")) {
      throw new Error(`Harness contract requires ${label}[${index}] to be a relative directory root`);
    }
  }
}

function requireNewFileRules(value, label) {
  requireArray(value, label);
  if (value.length === 0) throw new Error(`Harness contract requires non-empty ${label}`);
  for (const [index, rule] of value.entries()) {
    requireString(rule?.root, `${label}[${index}].root`);
    if (path.posix.isAbsolute(rule.root) || rule.root.split("/").includes("..") || !rule.root.endsWith("/")) {
      throw new Error(`Harness contract requires ${label}[${index}].root to be a relative directory root`);
    }
    requireArray(rule.extensions, `${label}[${index}].extensions`);
    if (rule.extensions.length === 0) {
      throw new Error(`Harness contract requires non-empty ${label}[${index}].extensions`);
    }
    for (const extension of rule.extensions) {
      requireString(extension, `${label}[${index}].extensions[]`);
      if (!/^\.[a-z0-9]+$/u.test(extension)) {
        throw new Error(`Harness contract requires ${label}[${index}] extensions like .md`);
      }
    }
  }
}

function requireRelativeFiles(value, label) {
  requireArray(value, label);
  for (const [index, file] of value.entries()) {
    requireString(file, `${label}[${index}]`);
    if (path.posix.isAbsolute(file) || file.split("/").includes("..") || file.endsWith("/")) {
      throw new Error(`Harness contract requires ${label}[${index}] to be a relative file`);
    }
  }
}

export function validateContract(candidate) {
  if (candidate.schemaVersion !== 2) {
    throw new Error(`Unsupported Harness contract schemaVersion: ${candidate.schemaVersion}`);
  }
  if (!Array.isArray(candidate.packages) || candidate.packages.length === 0) {
    throw new Error("Harness contract must register at least one design-spec package");
  }

  const ids = new Set();
  const roots = new Set();
  for (const designPackage of candidate.packages) {
    requireString(designPackage.id, "packages[].id");
    requireString(designPackage.root, `${designPackage.id}.root`);
    requireString(
      designPackage.canonical?.principlesFile,
      `${designPackage.id}.canonical.principlesFile`,
    );
    requireString(designPackage.canonical?.usageFile, `${designPackage.id}.canonical.usageFile`);
    requireArray(designPackage.canonical?.files, `${designPackage.id}.canonical.files`);
    requireArray(designPackage.canonical?.roots, `${designPackage.id}.canonical.roots`);
    requireString(
      designPackage.derived?.componentPreviewRoot,
      `${designPackage.id}.derived.componentPreviewRoot`,
    );
    requireString(
      designPackage.derived?.pagePreviewRoot,
      `${designPackage.id}.derived.pagePreviewRoot`,
    );
    requireString(
      designPackage.derived?.runtimeBundle,
      `${designPackage.id}.derived.runtimeBundle`,
    );
    requireRelativeFiles(
      designPackage.derived?.supportFiles,
      `${designPackage.id}.derived.supportFiles`,
    );
    requireArray(designPackage.derived?.catalogFiles, `${designPackage.id}.derived.catalogFiles`);
    requireString(
      designPackage.ownership?.componentRecipeRoot,
      `${designPackage.id}.ownership.componentRecipeRoot`,
    );
    requireString(
      designPackage.ownership?.pageRecipeRoot,
      `${designPackage.id}.ownership.pageRecipeRoot`,
    );
    requireString(
      designPackage.ownership?.recipeIndex,
      `${designPackage.id}.ownership.recipeIndex`,
    );
    requireArray(
      designPackage.ownership?.catalogSources,
      `${designPackage.id}.ownership.catalogSources`,
    );
    requireArray(
      designPackage.ownership?.generatorSources,
      `${designPackage.id}.ownership.generatorSources`,
    );
    requireString(
      designPackage.maintenance?.syncScript,
      `${designPackage.id}.maintenance.syncScript`,
    );
    requireString(
      designPackage.maintenance?.validateScript,
      `${designPackage.id}.maintenance.validateScript`,
    );
    requireDirectoryRoots(
      designPackage.hygiene?.imageRoots,
      `${designPackage.id}.hygiene.imageRoots`,
    );
    requireDirectoryRoots(
      designPackage.hygiene?.fontRoots,
      `${designPackage.id}.hygiene.fontRoots`,
    );
    requireNewFileRules(
      designPackage.hygiene?.newFileRules,
      `${designPackage.id}.hygiene.newFileRules`,
    );
    const declaredRoots = new Set([
      ...designPackage.canonical.roots,
      designPackage.derived.componentPreviewRoot,
      designPackage.derived.pagePreviewRoot,
    ]);
    for (const rule of designPackage.hygiene.newFileRules) {
      if (!declaredRoots.has(rule.root)) {
        throw new Error(
          `Harness contract requires ${designPackage.id}.hygiene.newFileRules root to be canonical or derived: ${rule.root}`,
        );
      }
    }
    if (ids.has(designPackage.id)) {
      throw new Error(`Duplicate design-spec package id: ${designPackage.id}`);
    }
    if (roots.has(designPackage.root)) {
      throw new Error(`Duplicate design-spec package root: ${designPackage.root}`);
    }
    ids.add(designPackage.id);
    roots.add(designPackage.root);
  }
  return candidate;
}

export function loadContract(repositoryRoot) {
  return validateContract(JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "harness/contract.json"), "utf8"),
  ));
}

export const contract = validateContract(JSON.parse(
  fs.readFileSync(new URL("../contract.json", import.meta.url), "utf8"),
));
export const designPackages = contract.packages;

export function repositoryPath(designPackage, relativePath) {
  const joined = path.posix.join(designPackage.root, relativePath);
  return relativePath.endsWith("/") && !joined.endsWith("/") ? joined + "/" : joined;
}

export function packageContractIssues(repositoryRoot, packages = designPackages) {
  const issues = [];
  for (const designPackage of packages) {
    const requiredFiles = new Set([
      ...designPackage.canonical.files,
      designPackage.canonical.principlesFile,
      designPackage.canonical.usageFile,
      designPackage.maintenance.syncScript,
      designPackage.maintenance.validateScript,
      designPackage.derived.runtimeBundle,
      ...designPackage.derived.supportFiles,
      ...designPackage.derived.catalogFiles,
      ...designPackage.ownership.generatorSources,
    ].filter(Boolean));
    for (const relativePath of requiredFiles) {
      const repoPath = repositoryPath(designPackage, relativePath);
      const absolutePath = path.join(repositoryRoot, repoPath);
      if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
        issues.push({ file: repoPath, message: "Required design-spec file is missing." });
      }
    }
    const requiredDirectories = new Set([
      ...designPackage.canonical.roots,
      designPackage.derived.componentPreviewRoot,
      designPackage.derived.pagePreviewRoot,
      ...designPackage.hygiene.imageRoots,
      ...designPackage.hygiene.fontRoots,
    ]);
    for (const relativePath of requiredDirectories) {
      const repoPath = repositoryPath(designPackage, relativePath);
      const absolutePath = path.join(repositoryRoot, repoPath);
      if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
        issues.push({ file: repoPath, message: "Required design-spec directory is missing." });
      }
    }
    const principlesPath = repositoryPath(
      designPackage,
      designPackage.canonical.principlesFile,
    );
    const absolutePrinciplesPath = path.join(repositoryRoot, principlesPath);
    if (fs.existsSync(absolutePrinciplesPath)
      && fs.statSync(absolutePrinciplesPath).isFile()
      && fs.readFileSync(absolutePrinciplesPath, "utf8").trim() === "") {
      issues.push({ file: principlesPath, message: "Design principles file must not be empty." });
    }
  }
  return issues;
}
