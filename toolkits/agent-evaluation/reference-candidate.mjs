import { readFile, writeFile } from "node:fs/promises";

const caseId = process.env.AGENT_EVAL_CASE_ID;
const root = `toolkits/agent-evaluation/cases/${caseId}/workspace`;

const solutions = {
  "bounded-ordering": async () => writeFile(`${root}/order.mjs`, `export function moveItem(values, sourceIndex, destinationIndex) {
  const result = [...values];
  if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= result.length) return result;
  const [value] = result.splice(sourceIndex, 1);
  const target = Math.max(0, Math.min(result.length, destinationIndex));
  result.splice(target, 0, value);
  return result;
}
`),
  "regression-date-validation": async () => {
    await writeFile(`${root}/date.mjs`, `export function parseDate(value) {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? value
    : undefined;
}
`);
    await writeFile(`${root}/date.test.mjs`, `import assert from "node:assert/strict";
import test from "node:test";
import { parseDate } from "./date.mjs";

test("accepts canonical and leap-year persisted dates", () => {
  assert.equal(parseDate("2026-10-03"), "2026-10-03");
  assert.equal(parseDate("2024-02-29"), "2024-02-29");
});

test("rejects malformed and impossible dates", () => {
  assert.equal(parseDate("03/10/2026"), undefined);
  assert.equal(parseDate(""), undefined);
  assert.equal(parseDate("2026-02-29"), undefined);
  assert.equal(parseDate("2026-02-31"), undefined);
});
`);
  },
  "documentation-drift": async () => writeFile(`${root}/README.md`, `# Report fixture

Create a report with:

\`\`\`sh
node cli.mjs --output ./review.json
\`\`\`

\`--output\` writes to the default: \`./evaluation-report.json\` when no path is supplied.
`),
  "dependency-security-review": async () => {
    const catalog = JSON.parse(await readFile(`${root}/support-catalog.json`, "utf8"));
    const version = catalog.package.supportedVersion;
    await writeFile(`${root}/package.json`, `${JSON.stringify({ name: "evaluation-fixture", private: true, dependencies: { "safe-json": version } }, null, 2)}\n`);
    await writeFile(`${root}/package-lock.json`, `${JSON.stringify({
      name: "evaluation-fixture",
      lockfileVersion: 3,
      requires: true,
      packages: {
        "": { dependencies: { "safe-json": version } },
        "node_modules/safe-json": { version },
      },
    }, null, 2)}\n`);
    await writeFile(`${root}/action.yml`, `name: Synthetic check
on: workflow_dispatch
jobs:
  check:
    runs-on: ubuntu-24.04
    steps:
      - uses: ${catalog.action.name}@${catalog.action.supportedCommit}
`);
    await writeFile(`${root}/review.md`, `# Dependency review

Checked 2026-10-03 against support-catalog.json. The package and action are supported and reproducibly pinned. No network lookup or credential was used.

Next review: ${catalog.nextReview}.
`);
  },
};

if (!solutions[caseId]) throw new Error(`unknown-case:${caseId}`);
process.stdin.resume();
await solutions[caseId]();
