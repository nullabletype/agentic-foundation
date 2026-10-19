import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const resultSchema = "agentic-foundation-agent-evaluation:v1";

function safeRelativePath(value, field) {
  if (typeof value !== "string" || value.length === 0 || isAbsolute(value)) {
    throw new Error(`${field}:relative-path-required`);
  }
  const normal = value.replaceAll("\\", "/");
  if (normal === ".." || normal.startsWith("../") || normal.includes("/../")) {
    throw new Error(`${field}:path-escape`);
  }
  return normal;
}

function checkDefinition(check, index) {
  if (!check || typeof check !== "object" || typeof check.id !== "string") {
    throw new Error(`checks[${index}]:invalid`);
  }
  if (!Number.isInteger(check.points) || check.points <= 0) {
    throw new Error(`checks[${index}]:positive-points-required`);
  }
  if (check.type === "file-contains" || check.type === "file-excludes") {
    safeRelativePath(check.path, `checks[${index}].path`);
    if (check.caseSensitive !== undefined && typeof check.caseSensitive !== "boolean") {
      throw new Error(`checks[${index}]:case-sensitive-boolean-required`);
    }
    if (!Array.isArray(check.fragments) || check.fragments.length === 0
      || check.fragments.some((fragment) => typeof fragment !== "string" || fragment.length === 0)) {
      throw new Error(`checks[${index}]:fragments-required`);
    }
  } else if (check.type === "command") {
    if (!Array.isArray(check.command) || check.command.length === 0
      || check.command.some((part) => typeof part !== "string" || part.length === 0)) {
      throw new Error(`checks[${index}]:command-required`);
    }
  } else if (check.type !== "scope") {
    throw new Error(`checks[${index}]:unsupported-type:${check.type}`);
  }
}

export function validateCase(definition) {
  for (const field of ["id", "category", "title", "prompt"]) {
    if (typeof definition?.[field] !== "string" || definition[field].trim().length === 0) {
      throw new Error(`${field}:required`);
    }
  }
  if (definition.schemaVersion !== 1) throw new Error("schemaVersion:unsupported");
  if (!definition.startingState || typeof definition.startingState.description !== "string"
    || !Array.isArray(definition.startingState.files) || definition.startingState.files.length === 0) {
    throw new Error("startingState:invalid");
  }
  definition.startingState.files.forEach((path, index) => safeRelativePath(path, `startingState.files[${index}]`));
  if (!Array.isArray(definition.allowedPaths) || definition.allowedPaths.length === 0) {
    throw new Error("allowedPaths:required");
  }
  definition.allowedPaths.forEach((path, index) => safeRelativePath(path, `allowedPaths[${index}]`));
  if (!Array.isArray(definition.expectedObservableResult) || definition.expectedObservableResult.length === 0
    || definition.expectedObservableResult.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new Error("expectedObservableResult:required");
  }
  if (!Array.isArray(definition.checks) || definition.checks.length === 0) throw new Error("checks:required");
  definition.checks.forEach(checkDefinition);
  const ids = new Set(definition.checks.map((check) => check.id));
  if (ids.size !== definition.checks.length) throw new Error("checks:duplicate-id");
  const total = definition.checks.reduce((sum, check) => sum + check.points, 0);
  if (!definition.rubric || definition.rubric.totalPoints !== total
    || !Number.isInteger(definition.rubric.passPoints)
    || definition.rubric.passPoints <= 0 || definition.rubric.passPoints > total) {
    throw new Error("rubric:invalid");
  }
  return definition;
}

export async function loadCases(casesRoot) {
  const entries = await readdir(casesRoot, { withFileTypes: true });
  const definitions = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((left, right) => left.name.localeCompare(right.name))) {
    const manifestPath = join(casesRoot, entry.name, "case.json");
    const definition = validateCase(JSON.parse(await readFile(manifestPath, "utf8")));
    if (definition.id !== entry.name) throw new Error(`${entry.name}:id-directory-mismatch`);
    definitions.push({ ...definition, manifestPath });
  }
  if (definitions.length < 1 || definitions.length > 10) throw new Error("case-count:expected-1-to-10");
  return definitions;
}

export async function runProcess(command, args, options = {}) {
  const startedAt = Date.now();
  return await new Promise((resolvePromise) => {
    let settled = false;
    let outputBytes = 0;
    let outputExceeded = false;
    let timedOut = false;
    let timer;
    let forceTimer;
    let settleTimer;
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      detached: true,
      shell: false,
      stdio: [options.stdin === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(forceTimer);
      clearTimeout(settleTimer);
      resolvePromise({ ...value, elapsedMilliseconds: Date.now() - startedAt, outputBytes, timedOut });
    };
    const recordOutput = (chunk) => {
      outputBytes += chunk.length;
      if (!outputExceeded && outputBytes > (options.maximumOutputBytes ?? Infinity)) {
        outputExceeded = true;
        terminate("SIGKILL");
        settleTimer = setTimeout(() => {
          child.stdout.destroy(); child.stderr.destroy();
          finish({ exitCode: null, signal: "SIGKILL", errorCode: "output-limit" });
        }, options.terminationGraceMilliseconds ?? 2_000);
      }
    };
    child.stdout.on("data", recordOutput);
    child.stderr.on("data", recordOutput);
    child.on("error", (error) => finish({ exitCode: null, errorCode: error.code ?? "spawn-error" }));
    child.on("close", (code, signal) => finish({ exitCode: code, signal: signal ?? null,
      ...(outputExceeded ? { errorCode: "output-limit" } : {}) }));
    if (options.stdin !== undefined) child.stdin.end(options.stdin);
    const terminate = (signal) => {
      if (child.pid === undefined) return;
      try {
        if (process.platform === "win32") {
          if (signal === "SIGKILL") {
            const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
              shell: false,
              stdio: "ignore",
            });
            killer.unref();
          } else {
            child.kill(signal);
          }
        } else {
          process.kill(-child.pid, signal);
        }
      } catch {
        try { child.kill(signal); } catch { /* best effort; bounded settlement still applies */ }
      }
    };
    const grace = options.terminationGraceMilliseconds ?? 2_000;
    timer = setTimeout(() => {
      timedOut = true;
      terminate("SIGTERM");
      forceTimer = setTimeout(() => terminate("SIGKILL"), grace);
      settleTimer = setTimeout(() => {
        child.stdout.destroy();
        child.stderr.destroy();
        finish({ exitCode: null, signal: "SIGKILL", errorCode: "timeout" });
      }, grace * 2);
    }, options.timeoutMilliseconds ?? 600_000);
  });
}

async function git(repoRoot, args, options = {}) {
  const result = await runProcess("git", args, { cwd: repoRoot, ...options });
  if (result.exitCode !== 0) throw new Error(`git-${args[0]}-failed:${result.errorCode ?? result.exitCode}`);
  return result;
}

async function gitText(repoRoot, args) {
  return await new Promise((resolvePromise, reject) => {
    const child = spawn("git", args, { cwd: repoRoot, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.resume();
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolvePromise(stdout.trim()) : reject(new Error(`git-${args[0]}-failed:${code}`)));
  });
}

function allowed(path, allowedPaths) {
  return allowedPaths.some((candidate) => {
    const normalized = candidate.replaceAll("\\", "/");
    return normalized.endsWith("/") ? path.startsWith(normalized) : path === normalized;
  });
}

export async function changedPaths(worktree, baseRef = "HEAD") {
  const [tracked, untracked] = await Promise.all([
    gitText(worktree, ["diff", "--name-only", baseRef]),
    gitText(worktree, ["ls-files", "--others", "--exclude-standard"]),
  ]);
  return [...new Set([...tracked.split("\n"), ...untracked.split("\n")].filter(Boolean))].sort();
}

function completedProcess(result) {
  return result.exitCode !== null && !result.timedOut && !result.errorCode && !result.signal;
}

function successfulProcess(result) {
  return completedProcess(result) && result.exitCode === 0;
}

export async function evaluateChecks(definition, worktree, baseRef = "HEAD", commandRunner = runProcess) {
  const paths = await changedPaths(worktree, baseRef);
  const results = [];
  let executionValid = true;
  for (const check of definition.checks) {
    let passed = false;
    if (check.type === "scope") {
      passed = paths.length > 0 && paths.every((path) => allowed(path, definition.allowedPaths));
    } else if (check.type === "file-contains" || check.type === "file-excludes") {
      let content;
      try {
        content = await readFile(resolve(worktree, check.path), "utf8");
      } catch {
        content = undefined;
      }
      if (content !== undefined && check.caseSensitive === false) content = content.toLocaleLowerCase("en-US");
      const fragments = check.caseSensitive === false
        ? check.fragments.map((fragment) => fragment.toLocaleLowerCase("en-US"))
        : check.fragments;
      passed = content !== undefined && (check.type === "file-contains"
        ? fragments.every((fragment) => content.includes(fragment))
        : fragments.every((fragment) => !content.includes(fragment)));
    } else if (check.type === "command") {
      const [command, ...args] = check.command;
      const result = await commandRunner(command, args, { cwd: worktree, timeoutMilliseconds: check.timeoutMilliseconds ?? 120_000 });
      executionValid &&= completedProcess(result);
      passed = successfulProcess(result);
    }
    results.push({ id: check.id, passed, points: passed ? check.points : 0, maximumPoints: check.points });
  }
  const points = results.reduce((sum, check) => sum + check.points, 0);
  const unrelatedPaths = paths.filter((path) => !allowed(path, definition.allowedPaths));
  return {
    passed: points >= definition.rubric.passPoints,
    executionValid,
    points,
    maximumPoints: definition.rubric.totalPoints,
    checks: results,
    changedPathCount: paths.length,
    unrelatedFileChurn: unrelatedPaths.length,
  };
}

export function summarize(runs) {
  const totalRuns = runs.length;
  const successfulRuns = runs.filter((run) => run.passed).length;
  const firstPassRuns = runs.filter((run) => run.firstPassPassed).length;
  return {
    totalRuns,
    passed: totalRuns > 0 && successfulRuns === totalRuns,
    checksPassedRuns: runs.filter((run) => run.checksPassed).length,
    validExecutionRuns: runs.filter((run) => run.executionValid).length,
    invalidExecutionRuns: runs.filter((run) => !run.executionValid).length,
    successfulRuns,
    repeatedTrialSuccessRate: totalRuns === 0 ? 0 : successfulRuns / totalRuns,
    firstPassGateRate: totalRuns === 0 ? 0 : firstPassRuns / totalRuns,
    correctionCycles: runs.reduce((sum, run) => sum + run.correctionCycles, 0),
    unrelatedFileChurn: runs.reduce((sum, run) => sum + run.unrelatedFileChurn, 0),
    elapsedMilliseconds: runs.reduce((sum, run) => sum + run.elapsedMilliseconds, 0),
    toolFailures: runs.reduce((sum, run) => sum + run.toolFailures, 0),
    independentReview: {
      approved: runs.filter((run) => run.independentReview === "approved").length,
      rejected: runs.filter((run) => run.independentReview === "rejected").length,
      unavailable: runs.filter((run) => run.independentReview === "unavailable").length,
      errored: runs.filter((run) => run.independentReview === "errored").length,
    },
  };
}

async function fingerprint(root, paths) {
  const hash = createHash("sha256");
  for (const path of [...paths].sort()) {
    const normalized = relative(root, path).replaceAll("\\", "/");
    hash.update(normalized);
    hash.update("\0");
    hash.update(await readFile(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function versionInputs(trackedPaths, caseDirectory = "evaluations/agent-loop/cases") {
  const historical = (path) => path.includes("/baselines/");
  return {
    instructionRelativePaths: trackedPaths.filter((path) => !historical(path)
      && (path.endsWith(".md") || path.startsWith(".github/ISSUE_TEMPLATE/"))),
    harnessRelativePaths: trackedPaths.filter((path) => !historical(path)
      && (path.startsWith(`${caseDirectory}/`) || path.startsWith(".github/workflows/"))),
  };
}

async function toolkitFiles(root, directory = root) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("toolkit-symlink-not-supported");
    if (entry.isDirectory()) paths.push(...await toolkitFiles(root, path));
    else if (entry.isFile()) paths.push(path);
  }
  return paths.sort();
}

function correctionPrompt(definition, failedChecks, cycle) {
  return `${definition.prompt}\n\nCorrection cycle ${cycle}: deterministic checks still failing: ${failedChecks.join(", ")}. Reinspect only the allowed scope, correct the result, and rerun the relevant local checks.`;
}

async function invokeCandidate({ candidateCommand, candidateArgs, definition, worktree, prompt, timeoutMilliseconds, processRunner = runProcess }) {
  return await processRunner(candidateCommand, candidateArgs, {
    cwd: worktree,
    stdin: prompt,
    timeoutMilliseconds,
    env: {
      ...process.env,
      AGENT_EVAL_CASE_ID: definition.id,
      AGENT_EVAL_WORKTREE: worktree,
      AGENT_EVAL_ALLOWED_PATHS: definition.allowedPaths.join(":"),
    },
  });
}

async function reviewRun({ reviewerCommand, reviewerArgs, definition, worktree, timeoutMilliseconds, processRunner = runProcess }) {
  if (!reviewerCommand) return "unavailable";
  const prompt = `Independently review case ${definition.id}. Inspect the uncommitted diff in the current worktree against ${definition.manifestRelativePath}. Exit 0 only when the observable result and deterministic checks are sufficient; otherwise exit non-zero. Do not edit files.`;
  const result = await processRunner(reviewerCommand, reviewerArgs, {
    cwd: worktree,
    stdin: prompt,
    timeoutMilliseconds,
    env: { ...process.env, AGENT_EVAL_CASE_ID: definition.id, AGENT_EVAL_WORKTREE: worktree },
  });
  if (!completedProcess(result)) return "errored";
  return result.exitCode === 0 ? "approved" : "rejected";
}

export async function runEvaluation(options) {
  const monotonicNow = options.monotonicNow ?? (() => performance.now());
  const deadline = options.maximumTotalMilliseconds === undefined ? Infinity : monotonicNow() + options.maximumTotalMilliseconds;
  if (options.maximumTotalMilliseconds !== undefined
    && (!Number.isSafeInteger(options.maximumTotalMilliseconds) || options.maximumTotalMilliseconds <= 0)) {
    throw new Error("positive-total-deadline-required");
  }
  let budgetExhausted = false;
  const boundedRunner = (runner, spendsBudget = false) => async (command, args, processOptions) => {
    const remaining = Math.floor(deadline - monotonicNow());
    if (remaining <= 0 || (spendsBudget && options.shouldStop?.())) {
      budgetExhausted = true;
      return { exitCode: null, errorCode: "baseline-deadline", timedOut: true, elapsedMilliseconds: 0, outputBytes: 0 };
    }
    const result = await runner(command, args, { ...processOptions,
      timeoutMilliseconds: Math.min(processOptions.timeoutMilliseconds ?? 600_000, remaining) });
    if (monotonicNow() >= deadline) budgetExhausted = true;
    return result;
  };
  const processRunner = boundedRunner(options.processRunner ?? runProcess, true);
  const commandRunner = boundedRunner(options.commandRunner ?? runProcess);
  const repoRoot = resolve(options.repoRoot);
  const casesRoot = resolve(options.casesRoot);
  const caseDirectory = relative(repoRoot, casesRoot).replaceAll("\\", "/");
  safeRelativePath(caseDirectory, "cases");
  if (!caseDirectory) throw new Error("cases-directory-required");
  const toolkitRoot = dirname(fileURLToPath(import.meta.url));
  const toolkitPaths = await toolkitFiles(toolkitRoot);
  const toolkitVersion = await fingerprint(toolkitRoot, toolkitPaths);
  const resultPath = resolve(options.resultPath);
  const before = {
    head: await gitText(repoRoot, ["rev-parse", "HEAD"]),
    branch: await gitText(repoRoot, ["branch", "--show-current"]),
    status: await gitText(repoRoot, ["status", "--porcelain"]),
  };
  if (before.status) throw new Error("source-worktree-must-be-clean");
  if (resultPath === repoRoot || resultPath.startsWith(`${repoRoot}${sep}`)) {
    throw new Error("result-path-must-be-outside-source-worktree");
  }
  const progressPath = options.progressPath === undefined ? undefined : resolve(options.progressPath);
  if (progressPath && (progressPath === repoRoot || progressPath.startsWith(`${repoRoot}${sep}`) || progressPath === resultPath)) {
    throw new Error("progress-path-must-be-outside-source-and-distinct-from-results");
  }

  const definitions = await loadCases(casesRoot);
  const trackedPaths = (await gitText(repoRoot, ["ls-files"]))
    .split("\n")
    .filter(Boolean);
  const { instructionRelativePaths, harnessRelativePaths } = versionInputs(trackedPaths, caseDirectory);
  const instructionPaths = instructionRelativePaths.map((path) => join(repoRoot, path));
  const harnessPaths = harnessRelativePaths.map((path) => join(repoRoot, path));
  for (const definition of definitions) {
    definition.manifestRelativePath = `${caseDirectory}/${definition.id}/case.json`;
    if (!trackedPaths.includes(definition.manifestRelativePath)
      || definition.startingState.files.some((path) => !trackedPaths.includes(path))) {
      throw new Error("case-inputs-must-be-tracked");
    }
  }
  const root = await mkdtemp(join(tmpdir(), "agent-evaluation-"));
  const runs = [];
  let abortReason;
  let progressCreated = false;
  const checkpoint = async () => {
    if (!progressPath) return;
    const path = progressCreated ? `${progressPath}.pending` : progressPath;
    const file = await open(path, "wx", 0o600);
    try {
      await file.writeFile(`${JSON.stringify({ schema: resultSchema, sourceCommit: before.head,
        completion: { complete: false, expectedRuns: options.trials * definitions.length, reason: "in-progress" },
        runs, aggregate: { ...summarize(runs), passed: false } })}\n`);
      await file.sync();
    } finally { await file.close(); }
    if (progressCreated) await rename(path, progressPath);
    const directory = await open(dirname(progressPath), "r");
    try { await directory.sync(); } finally { await directory.close(); }
    progressCreated = true;
  };
  try {
    await checkpoint();
    evaluation: for (let trial = 1; trial <= options.trials; trial += 1) {
      for (const definition of definitions) {
        if (monotonicNow() >= deadline || budgetExhausted || options.shouldStop?.()) {
          abortReason = "execution-budget-exhausted";
          break evaluation;
        }
        const worktree = join(root, `trial-${trial}`, definition.id);
        await mkdir(dirname(worktree), { recursive: true });
        await git(repoRoot, ["worktree", "add", "--detach", worktree, before.head], { timeoutMilliseconds: 120_000 });
        const startedAt = Date.now();
        let toolFailures = 0;
        let correctionCycles = 0;
        let candidate = await invokeCandidate({ ...options, processRunner, definition, worktree, prompt: definition.prompt });
        if (!successfulProcess(candidate)) toolFailures += 1;
        let grade = await evaluateChecks(definition, worktree, before.head, commandRunner);
        const firstPassPassed = grade.passed;
        const firstPassExecutionValid = toolFailures === 0 && grade.executionValid;
        let executionValid = firstPassExecutionValid;
        while (executionValid && !grade.passed && correctionCycles < options.maxCorrections) {
          if (budgetExhausted || monotonicNow() >= deadline || options.shouldStop?.()) {
            budgetExhausted = true;
            break;
          }
          correctionCycles += 1;
          const failedChecks = grade.checks.filter((check) => !check.passed).map((check) => check.id);
          candidate = await invokeCandidate({
            ...options,
            processRunner,
            definition,
            worktree,
            prompt: correctionPrompt(definition, failedChecks, correctionCycles),
          });
          if (!successfulProcess(candidate)) toolFailures += 1;
          grade = await evaluateChecks(definition, worktree, before.head, commandRunner);
          executionValid &&= toolFailures === 0 && grade.executionValid;
        }
        const independentReview = await reviewRun({ ...options, processRunner, definition, worktree });
        runs.push({
          caseId: definition.id,
          category: definition.category,
          trial,
          passed: grade.passed && executionValid
            && (independentReview === "approved" || independentReview === "unavailable"),
          checksPassed: grade.passed,
          executionValid,
          firstPassPassed,
          firstPassExecutionValid,
          points: grade.points,
          maximumPoints: grade.maximumPoints,
          checks: grade.checks,
          correctionCycles,
          unrelatedFileChurn: grade.unrelatedFileChurn,
          changedPathCount: grade.changedPathCount,
          elapsedMilliseconds: Date.now() - startedAt,
          toolFailures,
          candidateExitCode: candidate.exitCode,
          candidateTimedOut: candidate.timedOut,
          candidateOutputBytesDiscarded: candidate.outputBytes,
          independentReview,
        });
        await checkpoint();
        await git(repoRoot, ["worktree", "remove", "--force", worktree], { timeoutMilliseconds: 120_000 });
      }
    }
  } catch (error) {
    if (!options.retainPartialResults) throw error;
    abortReason = "evaluation-infrastructure-failure";
  } finally {
    await rm(root, { recursive: true, force: true });
    await git(repoRoot, ["worktree", "prune"]);
  }

  const after = {
    head: await gitText(repoRoot, ["rev-parse", "HEAD"]),
    branch: await gitText(repoRoot, ["branch", "--show-current"]),
    status: await gitText(repoRoot, ["status", "--porcelain"]),
  };
  if (after.head !== before.head || after.branch !== before.branch || after.status !== before.status) {
    throw new Error("source-worktree-mutated");
  }

  if (await fingerprint(toolkitRoot, await toolkitFiles(toolkitRoot)) !== toolkitVersion) {
    throw new Error("toolkit-mutated-during-evaluation");
  }
  const result = {
    schema: resultSchema,
    recordedAt: new Date().toISOString(),
    sourceCommit: before.head,
    instructionVersion: await fingerprint(repoRoot, instructionPaths),
    harnessVersion: await fingerprint(repoRoot, harnessPaths),
    toolkitVersion,
    configuration: {
      trials: options.trials,
      maximumCorrectionCycles: options.maxCorrections,
      caseCount: definitions.length,
      caseDirectory,
      independentReviewerConfigured: Boolean(options.reviewerCommand),
      candidateIdentity: options.candidateIdentity,
    },
    aggregate: summarize(runs),
    runs,
    limitations: [
      "Candidate stdout and stderr are discarded; toolFailures counts failed, timed-out, or unspawnable candidate invocations rather than internal tool-call errors.",
      options.reviewerCommand
        ? "Independent review is process-exit based; review prose and raw traces are not retained."
        : "No independent reviewer was configured; every run records independentReview as unavailable.",
      "The suite is a small regression signal for repository-agent behaviour, not a product-quality or model leaderboard score.",
      "instructionVersion hashes repository-owned instructions and templates only; external user instructions, installed skills, and model configuration are represented only by the manually supplied candidateIdentity.",
    ],
  };
  if (options.maximumTotalMilliseconds !== undefined || options.retainPartialResults) {
    result.completion = { complete: !abortReason && !budgetExhausted && runs.length === options.trials * definitions.length,
      expectedRuns: options.trials * definitions.length, reason: abortReason ?? (budgetExhausted ? "execution-budget-exhausted" : null) };
    result.aggregate.passed &&= result.completion.complete;
  }
  await mkdir(dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  return result;
}
