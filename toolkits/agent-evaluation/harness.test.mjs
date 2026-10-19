import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { evaluateChecks, runEvaluation, runProcess, summarize, validateCase, versionInputs, loadCases } from "./harness.mjs";

// Nested Node test graders need their own runner context.
delete process.env.NODE_TEST_CONTEXT;
const exec = promisify(execFile);

test("excessive discarded output terminates the candidate and invalidates execution", async () => {
  const result = await runProcess(process.execPath, ["-e", "setInterval(()=>process.stdout.write('x'.repeat(65536)),1)"], {
    maximumOutputBytes: 1024, timeoutMilliseconds: 5000,
  });
  assert.equal(result.errorCode, "output-limit");
  assert.ok(result.outputBytes > 1024);
  assert.equal(result.timedOut, false);
});

function definition(overrides = {}) {
  return {
    schemaVersion: 1,
    id: "sample",
    category: "bounded-code-change",
    title: "Sample case",
    startingState: { description: "A safe synthetic fixture.", files: ["workspace/value.txt"] },
    allowedPaths: ["workspace/value.txt"],
    prompt: "Change workspace/value.txt to done.",
    expectedObservableResult: ["The value is done."],
    checks: [
      { id: "content", type: "file-contains", path: "workspace/value.txt", fragments: ["done"], points: 80 },
      { id: "scope", type: "scope", points: 20 },
    ],
    rubric: { totalPoints: 100, passPoints: 100 },
    ...overrides,
  };
}

async function initializeRepository(root) {
  await exec("git", ["init", "-q"], { cwd: root });
  await exec("git", ["config", "user.name", "Agent Evaluation Test"], { cwd: root });
  await exec("git", ["config", "user.email", "agent-evaluation@example.invalid"], { cwd: root });
}

test("validateCase rejects path escapes and unsupported graders", () => {
  assert.throws(
    () => validateCase(definition({ allowedPaths: ["../outside"] })),
    /path-escape/,
  );
  assert.throws(
    () => validateCase(definition({
      checks: [{ id: "unsafe", type: "shell", points: 100 }],
      rubric: { totalPoints: 100, passPoints: 100 },
    })),
    /unsupported-type/,
  );
  assert.throws(
    () => validateCase(definition({
      checks: [{ id: "content", type: "file-contains", path: "workspace/value.txt", fragments: ["done"], caseSensitive: "no", points: 100 }],
      rubric: { totalPoints: 100, passPoints: 100 },
    })),
    /case-sensitive-boolean-required/,
  );
});

test("evaluateChecks grades observable content and unrelated churn", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "agent-evaluation-grade-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await initializeRepository(root);
  await mkdir(join(root, "workspace"));
  await writeFile(join(root, "workspace/value.txt"), "todo\n");
  await exec("git", ["add", "."], { cwd: root });
  await exec("git", ["commit", "-qm", "fixture"], { cwd: root });
  const base = (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim();

  await writeFile(join(root, "workspace/value.txt"), "done\n");
  let grade = await evaluateChecks(validateCase(definition()), root, base);
  assert.equal(grade.passed, true);
  assert.equal(grade.unrelatedFileChurn, 0);

  await writeFile(join(root, "outside.txt"), "unrelated\n");
  grade = await evaluateChecks(validateCase(definition()), root, base);
  assert.equal(grade.passed, false);
  assert.equal(grade.unrelatedFileChurn, 1);
});

test("command graders distinguish failed checks from invalid execution", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "agent-evaluation-command-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await initializeRepository(root);
  await writeFile(join(root, "fixture.txt"), "synthetic");
  await exec("git", ["add", "."], { cwd: root });
  await exec("git", ["commit", "-qm", "fixture"], { cwd: root });
  for (const [command, passed, valid] of [
    [[process.execPath, "-e", "process.exitCode=0;"], true, true],
    [[process.execPath, "-e", "process.exitCode=1;"], false, true],
    [[join(root, "missing-grader")], false, false],
    [[process.execPath, "-e", "process.on('SIGTERM',()=>process.exit(0)); setInterval(()=>{},1000);"], false, false],
  ]) {
    const grade = await evaluateChecks(definition({
      checks: [{ id: "command", type: "command", command, timeoutMilliseconds: command.at(-1).includes("setInterval") ? 5_000 : 30_000, points: 100 }],
    }), root);
    assert.equal(grade.passed, passed);
    assert.equal(grade.executionValid, valid);
  }
});

test("summarize records every required aggregate metric", () => {
  assert.deepEqual(summarize([
    { passed: true, checksPassed: true, executionValid: true, firstPassPassed: true, correctionCycles: 0, unrelatedFileChurn: 0, elapsedMilliseconds: 10, toolFailures: 0, independentReview: "approved" },
    { passed: false, checksPassed: false, executionValid: false, firstPassPassed: false, correctionCycles: 1, unrelatedFileChurn: 2, elapsedMilliseconds: 25, toolFailures: 1, independentReview: "unavailable" },
  ]), {
    totalRuns: 2,
    passed: false,
    checksPassedRuns: 1,
    validExecutionRuns: 1,
    invalidExecutionRuns: 1,
    successfulRuns: 1,
    repeatedTrialSuccessRate: 0.5,
    firstPassGateRate: 0.5,
    correctionCycles: 1,
    unrelatedFileChurn: 2,
    elapsedMilliseconds: 35,
    toolFailures: 1,
    independentReview: { approved: 1, rejected: 0, unavailable: 1, errored: 0 },
  });
});

test("runProcess force-terminates a child that ignores graceful timeout", async () => {
  const startedAt = Date.now();
  const result = await runProcess(process.execPath, [
    "-e",
    "process.on('SIGTERM',()=>{}); setInterval(()=>{}, 1000);",
  ], {
    timeoutMilliseconds: 50,
    terminationGraceMilliseconds: 100,
  });
  assert.equal(result.timedOut, true);
  assert.ok(Date.now() - startedAt < 2_000);
});


test("version inputs cover repository guidance and every non-baseline suite input", () => {
  const selected = versionInputs([
    "AGENTS.md",
    "CONTEXT.md",
    "README.md",
    "docs/product/brief.md",
    "docs/design/style-guide.md",
    "docs/adr/0001-example.md",
    ".github/HANDOFF_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/agent-ready.yml",
    ".github/workflows/build.yml",
    "evaluations/agent-loop/harness.mjs",
    "evaluations/agent-loop/cases/sample/workspace/verification.md",
    "evaluations/agent-loop/baselines/old.json",
  ]);
  assert.deepEqual(selected.instructionRelativePaths, [
    "AGENTS.md",
    "CONTEXT.md",
    "README.md",
    "docs/product/brief.md",
    "docs/design/style-guide.md",
    "docs/adr/0001-example.md",
    ".github/HANDOFF_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/agent-ready.yml",
    "evaluations/agent-loop/cases/sample/workspace/verification.md",
  ]);
  assert.deepEqual(selected.harnessRelativePaths, [
    ".github/workflows/build.yml",
    "evaluations/agent-loop/cases/sample/workspace/verification.md",
  ]);
});

test("runEvaluation uses detached worktrees and leaves the source checkout unchanged", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "agent-evaluation-source-"));
  const resultPath = join(tmpdir(), `agent-evaluation-result-${process.pid}-${Date.now()}.json`);
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(resultPath, { force: true });
  });
  await initializeRepository(root);
  await mkdir(join(root, "docs/development"), { recursive: true });
  await writeFile(join(root, "AGENTS.md"), "# Test instructions\n");
  await writeFile(join(root, "docs/development/agent-loop.md"), "# Loop\n");
  await writeFile(join(root, "docs/development/definition-of-done.md"), "# Done\n");
  const casesRoot = join(root, "checks/cases");
  for (let index = 1; index <= 2; index += 1) {
    const id = `case-${index}`;
    const caseRoot = join(casesRoot, id);
    await mkdir(join(caseRoot, "workspace"), { recursive: true });
    const item = definition({
      id,
      startingState: { description: "A safe synthetic fixture.", files: [`checks/cases/${id}/workspace/value.txt`] },
      allowedPaths: [`checks/cases/${id}/workspace/value.txt`],
      checks: [
        { id: "content", type: "file-contains", path: `checks/cases/${id}/workspace/value.txt`, fragments: ["done"], points: 80 },
        { id: "scope", type: "scope", points: 20 },
      ],
    });
    await writeFile(join(caseRoot, "case.json"), `${JSON.stringify(item)}\n`);
    await writeFile(join(caseRoot, "workspace/value.txt"), "todo\n");
  }
  await exec("git", ["add", "."], { cwd: root });
  await exec("git", ["commit", "-qm", "evaluation source"], { cwd: root });
  const beforeHead = (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim();
  const candidate = `const fs=require('node:fs'); const p=process.env.AGENT_EVAL_ALLOWED_PATHS; fs.writeFileSync(p, 'done\\n'); process.stdin.resume();`;

  const options = {
    repoRoot: root,
    casesRoot,
    resultPath,
    candidateCommand: process.execPath,
    candidateArgs: ["-e", candidate],
    candidateIdentity: "test-candidate",
    trials: 2,
    maxCorrections: 0,
    timeoutMilliseconds: 30_000,
  };
  const result = await runEvaluation(options);

  assert.match(result.toolkitVersion, /^[a-f0-9]{64}$/);
  assert.equal(result.configuration.caseDirectory, "checks/cases");
  assert.equal(result.aggregate.totalRuns, 4);
  assert.equal(result.aggregate.successfulRuns, 4);
  assert.equal(result.aggregate.passed, true);
  assert.equal(summarize([]).passed, false);
  assert.equal(result.aggregate.independentReview.unavailable, 4);
  assert.equal((await exec("git", ["status", "--porcelain"], { cwd: root })).stdout, "");
  assert.equal((await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim(), beforeHead);
  assert.equal(JSON.parse(await readFile(resultPath, "utf8")).schema, "agentic-foundation-agent-evaluation:v1");

  await t.test("whole-run deadline retains completed evidence and blocks success", async () => {
    const path = `${resultPath}.deadline`;
    t.after(() => rm(path, { force: true }));
    let time = 0;
    let invocations = 0;
    const partial = await runEvaluation({ ...options, resultPath: path,
      maximumTotalMilliseconds: 100, monotonicNow: () => time,
      processRunner: async (_command, _args, invocation) => {
        invocations += 1;
        assert.equal(invocation.timeoutMilliseconds, 100);
        await writeFile(join(invocation.cwd, invocation.env.AGENT_EVAL_ALLOWED_PATHS), "done");
        time = 101;
        return { exitCode: 0, timedOut: false, elapsedMilliseconds: 101, outputBytes: 0 };
      } });
    assert.equal(invocations, 1);
    assert.equal(partial.runs.length, 1);
    assert.equal(partial.runs[0].firstPassPassed, true);
    assert.equal(partial.completion.complete, false);
    assert.equal(partial.completion.expectedRuns, 4);
    assert.equal(partial.aggregate.passed, false);
    assert.equal(JSON.parse(await readFile(path, "utf8")).runs.length, 1);
  });

  await t.test("infrastructure abort preserves partial results without raw error prose", async () => {
    const path = `${resultPath}.partial`;
    t.after(() => rm(path, { force: true }));
    const progressPath = `${path}.progress`;
    t.after(() => rm(progressPath, { force: true }));
    let invocations = 0;
    const partial = await runEvaluation({ ...options, resultPath: path, progressPath, retainPartialResults: true,
      processRunner: async (_command, _args, invocation) => {
        invocations += 1;
        if (invocations === 2) {
          const progress = JSON.parse(await readFile(progressPath, "utf8"));
          assert.equal(progress.runs.length, 1);
          assert.equal(progress.aggregate.passed, false);
          throw new Error("sensitive synthetic error");
        }
        await writeFile(join(invocation.cwd, invocation.env.AGENT_EVAL_ALLOWED_PATHS), "done");
        return { exitCode: 0, timedOut: false, elapsedMilliseconds: 0, outputBytes: 0 };
      } });
    assert.equal(partial.runs.length, 1);
    assert.equal(partial.completion.reason, "evaluation-infrastructure-failure");
    assert.equal(partial.aggregate.passed, false);
    assert.equal((await readFile(path, "utf8")).includes("sensitive synthetic error"), false);
  });

  const scenarios = [
    { name: "passing files then nonzero exit", suffix: "process.exitCode=7;", checksPassed: true, valid: false },
    { name: "passing files then timeout exiting zero", suffix: "process.on('SIGTERM',()=>process.exit(0)); setInterval(()=>{},1000);", timeout: 5_000, checksPassed: true, valid: false },
    { name: "review approved", reviewer: ["-e", "process.stdin.resume();"], checksPassed: true, valid: true, review: "approved" },
    { name: "review rejected", reviewer: ["-e", "process.stdin.resume(); process.exitCode=1;"], checksPassed: true, valid: true, review: "rejected" },
    { name: "review spawn error", reviewerCommand: join(root, "missing-reviewer"), checksPassed: true, valid: true, review: "errored" },
    { name: "review timeout exiting zero", reviewer: ["-e", "process.stdin.resume(); process.on('SIGTERM',()=>process.exit(0)); setInterval(()=>{},1000);"], timeout: 5_000, checksPassed: true, valid: true, review: "errored" },
    { name: "candidate spawn error", candidateCommand: join(root, "missing-candidate"), checksPassed: false, valid: false },
    { name: "valid correction", script: `const fs=require('node:fs'); const p=process.env.AGENT_EVAL_ALLOWED_PATHS; fs.writeFileSync(p, fs.readFileSync(p,'utf8').includes('retry')?'done':'retry'); process.stdin.resume();`, checksPassed: true, valid: true, corrections: 1, firstPass: false },
    { name: "correction bound", script: "process.stdin.resume();", checksPassed: false, valid: true, corrections: 1, firstPass: false },
    { name: "invalid initial attempt is not corrected", script: "process.stdin.resume(); process.exitCode=1;", checksPassed: false, valid: false },
    { name: "invalid correction cannot pass", script: `const fs=require('node:fs'); const p=process.env.AGENT_EVAL_ALLOWED_PATHS; const retry=fs.readFileSync(p,'utf8').includes('retry'); fs.writeFileSync(p,retry?'done':'retry'); if(retry)process.exitCode=1; process.stdin.resume();`, checksPassed: true, valid: false, corrections: 1, firstPass: false },
  ];
  for (const [index, scenario] of scenarios.entries()) {
    await t.test(scenario.name, async () => {
      const path = join(root, `../result-${process.pid}-${index}.json`);
      t.after(() => rm(path, { force: true }));
      const reviewed = scenario.reviewer !== undefined || scenario.reviewerCommand !== undefined;
      const current = await runEvaluation({
        ...options,
        resultPath: path,
        candidateCommand: scenario.candidateCommand ?? process.execPath,
        candidateArgs: ["-e", scenario.script ?? `${candidate} ${scenario.suffix ?? ""}`],
        maxCorrections: 1,
        timeoutMilliseconds: scenario.timeout ?? 30_000,
        reviewerCommand: scenario.reviewerCommand ?? (reviewed ? process.execPath : undefined),
        reviewerArgs: scenario.reviewer ?? [],
      });
      const passed = scenario.checksPassed && scenario.valid && (!reviewed || scenario.review === "approved");
      assert.equal(current.aggregate.passed, passed);
      assert.equal(current.aggregate.successfulRuns, passed ? 4 : 0);
      assert.equal(current.aggregate.checksPassedRuns, scenario.checksPassed ? 4 : 0);
      assert.equal(current.aggregate.invalidExecutionRuns, scenario.valid ? 0 : 4);
      for (const run of current.runs) {
        assert.equal(run.checksPassed, scenario.checksPassed);
        assert.equal(run.executionValid, scenario.valid);
        assert.equal(run.firstPassExecutionValid,
          scenario.name === "invalid correction cannot pass" || scenario.valid);
        assert.equal(run.firstPassPassed, scenario.firstPass ?? scenario.checksPassed);
        assert.equal(run.correctionCycles, scenario.corrections ?? 0);
        assert.equal(run.independentReview, scenario.review ?? "unavailable");
        if (scenario.name === "passing files then timeout exiting zero") {
          assert.equal(run.candidateTimedOut, true);
          assert.equal(run.candidateExitCode, 0);
          assert.equal(run.toolFailures, 1);
        }
      }
    });
  }

  await t.test("external toolkit content changes its identity without changing target inputs", async () => {
    const copy = await mkdtemp(join(tmpdir(), "evaluation-toolkit-copy-"));
    t.after(() => rm(copy, { recursive: true, force: true }));
    await cp(new URL("./", import.meta.url), copy, { recursive: true });
    const identities = [];
    for (let index = 0; index < 2; index += 1) {
      const path = `${resultPath}.identity-${index}`;
      t.after(() => rm(path, { force: true }));
      if (index) await writeFile(join(copy, "README.md"), "# Changed toolkit documentation\n");
      await exec(process.execPath, [join(copy, "run.mjs"), "--repo", root, "--cases", "checks/cases",
        "--candidate", process.execPath, "--candidate-arg", "-e", "--candidate-arg", candidate,
        "--candidate-identity", "synthetic-cli", "--max-corrections", "0", "--results", path]);
      identities.push(JSON.parse(await readFile(path, "utf8")));
    }
    assert.notEqual(identities[0].toolkitVersion, identities[1].toolkitVersion);
    assert.equal(identities[0].instructionVersion, identities[1].instructionVersion);
    assert.equal(identities[0].harnessVersion, identities[1].harnessVersion);
  });

  await t.test("review prompts use the target's custom manifest directory", async () => {
    const path = `${resultPath}.review-path`;
    t.after(() => rm(path, { force: true }));
    const current = await runEvaluation({ ...options, resultPath: path, reviewerCommand: "review-launcher",
      processRunner: async (command, _args, invocation) => {
        if (command === "review-launcher") {
          assert.match(invocation.stdin, /against checks\/cases\/case-[12]\/case.json/);
        } else {
          await writeFile(join(invocation.cwd, invocation.env.AGENT_EVAL_ALLOWED_PATHS), "done");
        }
        return { exitCode: 0, timedOut: false, elapsedMilliseconds: 0, outputBytes: 0 };
      } });
    assert.equal(current.aggregate.passed, true);
    assert.equal(current.aggregate.independentReview.approved, 4);
  });

  for (const [label, suffix, reviewer, expected] of [
    ["success", "", undefined, 0],
    ["candidate-failure", "process.exitCode=7;", undefined, 1],
    ["review-rejection", "", "process.stdin.resume(); process.exitCode=1;", 1],
  ]) {
    await t.test(`CLI ${label}`, async () => {
      const path = join(root, `../cli-${process.pid}-${label}.json`);
      t.after(() => rm(path, { force: true }));
      const args = [fileURLToPath(new URL("run.mjs", import.meta.url)),
        "--repo", root, "--cases", "checks/cases",
        "--candidate", process.execPath, "--candidate-arg", "-e",
        "--candidate-arg", `${candidate} ${suffix}`, "--candidate-identity", "synthetic-cli",
        "--max-corrections", "0", "--results", path];
      if (reviewer) args.push("--reviewer", process.execPath, "--reviewer-arg", "-e", "--reviewer-arg", reviewer);
      let output;
      let code = 0;
      try { output = (await exec(process.execPath, args)).stdout; }
      catch (error) { code = error.code; output = error.stdout; }
      assert.equal(code, expected);
      assert.match(output, new RegExp(`result=${expected === 0 ? "passed" : "failed"}`));
      assert.equal(JSON.parse(await readFile(path, "utf8")).aggregate.passed, expected === 0);
    });
  }

});


test("case packs allow one case and reject an empty pack", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "agent-evaluation-cases-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(loadCases(root), /case-count/);
  await mkdir(join(root, "sample"));
  await writeFile(join(root, "sample/case.json"), JSON.stringify(definition()));
  assert.equal((await loadCases(root)).length, 1);
});

test("custom case directories and all workflow inputs are fingerprinted", () => {
  const inputs = versionInputs(["checks/sample/case.json", "checks/sample/grade.mjs",
    ".github/workflows/checks.yml", "evaluations/agent-loop/baselines/old.json"], "checks");
  assert.deepEqual(inputs.harnessRelativePaths, ["checks/sample/case.json", "checks/sample/grade.mjs",
    ".github/workflows/checks.yml"]);
});
