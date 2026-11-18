# Design-spec engineering guardrails

Designers may describe changes in any form. Agents translate that intent into
the repository's source files. Keep the change narrow, do not refactor unrelated
code, and do not leave review or temporary output in the repository.

The repository gate checks engineering hygiene, generated-file ownership, and
source/catalog consistency. It does not judge design behavior, visual quality,
or whether a color, spacing value, component choice, or copy decision is correct.

Design-spec packages are registered in `harness/contract.json`. InfOne and its
independent InfOne Next draft are registered. The Harness must remain package-driven:
do not hardcode a package root in shared Harness code. Every registered package
must declare a non-empty key design-principles file, a usage guide, its
canonical and derived paths, and its maintenance scripts.

## Read first

Before changing a registered design-spec package, read these files in order:

1. Its package manifest (for InfOne: `infone/manifest.json`)
2. Its key design principles (for InfOne: `infone/DESIGN.md`)
3. Its usage guide (for InfOne: `infone/USAGE.md`)
4. The matching recipe or source file for the requested area

Do not recursively load every recipe or preview when the task has a narrower
target.

## Source-of-truth map

Current InfOne canonical sources:

- Product principles and routing: `infone/DESIGN.md`, `infone/USAGE.md`
- Design rules: `infone/rules/*.md`, catalogued by `infone/rules/index.json`
- Token values: `infone/tokens.css`
- Component and page implementations: `infone/recipes/components/*.md` and
  `infone/recipes/pages/*.md`
- Component/page catalog metadata: `infone/recipes/index.json`
- Package metadata and assets: `infone/manifest.json`, `infone/brand.json`,
  `infone/assets/`, and `infone/fonts/`

Current InfOne generated or source-backed outputs:

- `infone/preview/component-cards/**`
- `infone/preview/page-patterns/**`
- `infone/preview/runtime/ds-bundle.js`
- `infone/components.manifest.json`
- The embedded catalog inside `infone/components.html`

If the user points at a generated preview, trace it back to the matching recipe,
apply the change there, and regenerate. Never finish with a preview-only change.

## Required workflow

1. Resolve the smallest canonical source set that expresses the user's intent.
2. Make only the requested source change. Do not rename, reorganize, reformat,
   or refactor unrelated files.
3. Run `npm run verify:agent`. It regenerates recipe-backed outputs and checks
   generated-file boundaries and repository garbage.
4. Fix every failure before handing the result back to the designer.
5. Summarize the affected files and engineering-check result. Do not claim that
   the Harness approved the design itself.

The repository ships `.githooks/pre-commit`. Run `npm run setup:hooks` once per
clone (the npm `prepare` script also installs it). Every commit runs the staged
snapshot Harness tests and `verify:commit`; failures must block the commit.
Agents must not bypass this gate with `git commit --no-verify`.

Use `.tmp/` or `.harness-output/` for screenshots, comparison pages, traces, and
other review evidence. Do not commit `*.artifact.json`, root-level screenshots,
or one-off comparison/preview pages under `infone/`.
Open Design and AI conversation workspaces such as `.od-frames/`, `.od-skills/`,
and `od-design-system/` are local-only at any directory depth and must not be committed.

Each registered package declares image and font roots in `harness/contract.json`.
For InfOne, committed images belong under `infone/assets/` and committed font
files belong under `infone/fonts/`; placing either file type elsewhere in the
package must fail the Harness.

## Verification

- During an Agent turn: `npm run verify:agent`
- Before a commit: `npm run verify:commit`
- Full repository/CI gate: `npm run verify:ci`
- Repository gate: `npm run verify:repository:ci`
- Harness self-tests: `npm run test:harness`

No hosted CI or automatic publication is configured in this independent GitHub
copy. Repository checks produce engineering findings and do not render or inspect
previews.
