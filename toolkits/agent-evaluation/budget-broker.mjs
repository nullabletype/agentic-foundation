import { createServer } from "node:http";
import { open, readFile, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";

// Subscription model token ceilings, verified against the model page on 2026-10-17.
// https://developers.openai.com/api/docs/models/gpt-6-luna
export const baselinePolicy = Object.freeze({
  model: "gpt-6-luna",
  maximumInputTokens: 1_050_000,
  maximumOutputTokens: 128_000,
  maximumTokens: 2_000_000,
  maximumRequests: 512,
  totalMilliseconds: 45 * 60_000,
  invocationMilliseconds: 4 * 60_000,
});

export function tokensForUsage(inputTokens, outputTokens, policy = baselinePolicy) {
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || inputTokens > policy.maximumInputTokens
    || !Number.isSafeInteger(outputTokens) || outputTokens < 0 || outputTokens > policy.maximumOutputTokens) {
    throw new Error("invalid-provider-usage");
  }
  return inputTokens + outputTokens;
}

// This owner must live outside candidate-writable mounts. A crash leaves the lock
// in place deliberately: an operator must reconcile outstanding remote work.
export async function openBudgetLedger(path, { policy = baselinePolicy, now = () => Date.now(), monotonicNow = () => performance.now() } = {}) {
  const lock = await open(`${path}.lock`, "wx", 0o600);
  let state;
  let queue = Promise.resolve();
  let poisoned = false;
  async function persist() {
    const temporary = `${path}.pending`;
    const file = await open(temporary, "w", 0o600);
    try { await file.writeFile(`${JSON.stringify(state)}\n`); await file.sync(); } finally { await file.close(); }
    await rename(temporary, path);
    const directory = await open(dirname(path), "r");
    try { await directory.sync(); } finally { await directory.close(); }
  }
  try {
    try { state = JSON.parse(await readFile(path, "utf8")); } catch (error) {
      if (error.code !== "ENOENT") throw error;
      state = { schema: "dot-orbit-token-budget:v1", policy, startedAt: now(), entries: [] };
      await persist();
    }
    if (state.schema !== "dot-orbit-token-budget:v1" || JSON.stringify(state.policy) !== JSON.stringify(policy)
      || !Number.isSafeInteger(state.startedAt) || state.startedAt > now() || !Array.isArray(state.entries)
      || state.entries.length > policy.maximumRequests
      || state.entries.some((entry, index) => entry.id !== index + 1
        || !["reserved", "settled"].includes(entry.status)
        || !Number.isSafeInteger(entry.tokens) || entry.tokens < 0
        || entry.tokens > tokensForUsage(policy.maximumInputTokens, policy.maximumOutputTokens, policy))) {
      throw new Error("invalid-budget-ledger");
    }
    if (state.entries.reduce((sum, entry) => sum + entry.tokens, 0) > policy.maximumTokens) {
      throw new Error("invalid-budget-ledger");
    }
  } catch (error) {
    await lock.close(); await rm(`${path}.lock`); throw error;
  }
  const monotonicDeadline = monotonicNow() + Math.max(0, state.startedAt + policy.totalMilliseconds - now());
  const remainingMilliseconds = () => Math.max(0, Math.min(
    state.startedAt + policy.totalMilliseconds - now(), monotonicDeadline - monotonicNow()));
  const transaction = (operation) => {
    const next = queue.then(async () => {
      if (poisoned) throw new Error("budget-ledger-unavailable");
      try { const value = operation(); await persist(); return value; } catch (error) {
        if (!["budget-exhausted", "baseline-deadline"].includes(error.message)) poisoned = true;
        throw error;
      }
    });
    queue = next.catch(() => {});
    return next;
  };
  return {
    snapshot: () => structuredClone(state),
    remainingMilliseconds,
    canReserve: () => !poisoned && remainingMilliseconds() > 0
      && state.entries.length < policy.maximumRequests
      && state.entries.reduce((sum, entry) => sum + entry.tokens, 0)
        + tokensForUsage(policy.maximumInputTokens, policy.maximumOutputTokens, policy) <= policy.maximumTokens,
    reserve: () => transaction(() => {
      if (remainingMilliseconds() <= 0) throw new Error("baseline-deadline");
      if (state.entries.length >= policy.maximumRequests) throw new Error("budget-exhausted");
      const maximum = tokensForUsage(policy.maximumInputTokens, policy.maximumOutputTokens, policy);
      if (state.entries.reduce((sum, entry) => sum + entry.tokens, 0) + maximum > policy.maximumTokens) {
        throw new Error("budget-exhausted");
      }
      const id = state.entries.length + 1;
      state.entries.push({ id, status: "reserved", tokens: maximum });
      return id;
    }),
    settle: (id, usage) => transaction(() => {
      const entry = state.entries[id - 1];
      if (!entry || entry.status !== "reserved") throw new Error("invalid-reservation");
      const tokens = tokensForUsage(usage?.input_tokens, usage?.output_tokens, policy);
      entry.status = "settled"; entry.tokens = tokens;
    }),
    close: async () => { await queue; await lock.close(); await rm(`${path}.lock`, { force: true }); },
  };
}

export function constrainRequest(body, policy = baselinePolicy) {
  if (!body || typeof body !== "object" || Array.isArray(body) || body.model !== policy.model) {
    throw new Error("model-not-allowed");
  }
  // Preserve only documented text Responses inputs and local tool definitions.
  // Unknown future API options fail closed rather than enabling another route or tool.
  const allowed = new Set(["model", "input", "instructions", "tools", "tool_choice", "parallel_tool_calls",
    "reasoning", "text", "stream", "store", "max_output_tokens", "service_tier", "include", "prompt_cache_key", "client_metadata"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) throw new Error("request-option-not-allowed");
  function validateLocalTools(tools) {
    if (!Array.isArray(tools)) throw new Error("hosted-tools-not-allowed");
    for (const tool of tools) {
      if (tool?.type === "namespace") validateLocalTools(tool.tools);
      else if (!["function", "custom"].includes(tool?.type)) throw new Error("hosted-tools-not-allowed");
    }
  }
  if (body.tools !== undefined) validateLocalTools(body.tools);
  if (body.tool_choice !== undefined) {
    const choice = body.tool_choice;
    const valid = typeof choice === "string" ? ["auto", "none", "required"].includes(choice)
      : choice && (["function", "custom"].includes(choice.type)
        || (choice.type === "allowed_tools" && Array.isArray(choice.tools)
          && choice.tools.every((tool) => ["function", "custom"].includes(tool?.type))));
    if (!valid) throw new Error("hosted-tool-choice-not-allowed");
  }
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    if (value.type === "additional_tools") validateLocalTools(value.tools);
    if (typeof value.type === "string" && /image|audio|video|file|computer|web_search|code_interpreter|item_reference/i.test(value.type)) {
      throw new Error("nontext-input-not-allowed");
    }
    for (const [key, child] of Object.entries(value)) {
      if (["image_url", "file_id", "file_data", "audio", "video", "external_web_access", "container"].includes(key)) {
        throw new Error("nontext-input-not-allowed");
      }
      inspect(child);
    }
  }
  inspect(body.input);
  // Codex 0.163 supplies local client metadata. It is not needed upstream.
  const { client_metadata: _clientMetadata, max_output_tokens: _outputLimit, service_tier: _serviceTier, ...forwarded } = body;
  return { ...forwarded, store: false, stream: true };
}

function extractUsage(text) {
  // Identify structured framing rather than trusting a proxy's MIME header.
  try { return { usage: JSON.parse(text).usage, contentType: "application/json" }; } catch { /* Try SSE. */ }
  let data = [];
  let terminal;
  for (const line of text.split(/\r\n|\r|\n/)) {
    if (line === "") {
      if (data.length === 0) continue;
      const payload = data.join("\n"); data = [];
      if (payload === "[DONE]") continue;
      let event; try { event = JSON.parse(payload); } catch { return undefined; }
      if (["response.completed", "response.failed", "response.incomplete", "error"].includes(event?.type)) {
        if (terminal) return undefined;
        terminal = event;
      }
      continue;
    }
    if (line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator < 0 ? line : line.slice(0, separator);
    let value = separator < 0 ? "" : line.slice(separator + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "data") data.push(value);
    else if (!["event", "id", "retry"].includes(field)) return undefined;
  }
  // An unfinished frame or ambiguous/failed terminal response cannot settle.
  if (data.length || terminal?.type !== "response.completed") return undefined;
  return { usage: terminal.response?.usage, contentType: "text/event-stream" };
}

// The only upstream destination is fixed. Neither credentials nor upstream error
// prose are returned to callers. Request/response bodies are memory-only.
export async function startBudgetBroker({ socketPath, ledger, accessToken, accountId, beforeDispatch, onStop,
  policy = baselinePolicy, fetchImpl = fetch }) {
  if (typeof accessToken !== "string" || !accessToken || typeof accountId !== "string" || !accountId) {
    throw new Error("subscription-auth-required");
  }
  if (typeof beforeDispatch !== "function") throw new Error("subscription-quota-check-required");
  let closing = false;
  let stopped = false;
  let active;
  const shutdown = new AbortController();
  const stop = async (reason) => {
    stopped = true;
    await onStop?.(reason);
  };
  const server = createServer(async (request, response) => {
    const fail = (status) => { if (!response.headersSent) response.writeHead(status); response.end('{"error":"restricted-broker-denied"}'); };
    if (request.method !== "POST" || request.url !== "/v1/responses") { fail(403); return; }
    if (closing || stopped || active) { fail(429); return; }
    let finish;
    active = new Promise((resolve) => { finish = resolve; });
    let phase = "request";
    try {
      let size = 0; const chunks = [];
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 2 * 1024 * 1024) { await stop("request-size-exceeded"); fail(413); return; }
        chunks.push(chunk);
      }
      const body = constrainRequest(JSON.parse(Buffer.concat(chunks).toString("utf8")), policy);
      const timeout = Math.floor(Math.min(policy.invocationMilliseconds, ledger.remainingMilliseconds()));
      if (timeout <= 0) { await stop("baseline-deadline"); fail(429); return; }
      const signal = AbortSignal.any([AbortSignal.timeout(timeout), shutdown.signal]);
      phase = "quota";
      if (await beforeDispatch({ signal }) !== true) throw new Error("subscription-quota-unavailable");
      phase = "budget";
      const id = await ledger.reserve();
      phase = "upstream";
      const upstream = await fetchImpl("https://chatgpt.com/backend-api/codex/responses", {
        method: "POST", redirect: "error", signal,
        headers: { authorization: `Bearer ${accessToken}`, "ChatGPT-Account-ID": accountId, "content-type": "application/json",
          "user-agent": "codex_cli_rs/0.163.0", originator: "codex_cli_rs", accept: "text/event-stream" },
        body: JSON.stringify(body),
      });
      let outputSize = 0; const output = [];
      for await (const chunk of upstream.body) {
        outputSize += chunk.length;
        if (outputSize > 16 * 1024 * 1024) throw new Error("provider-response-too-large");
        output.push(chunk);
      }
      if (!upstream.ok) { await stop(`subscription-upstream-rejected-${upstream.status}`); fail(502); return; }
      const bytes = Buffer.concat(output);
      const parsed = extractUsage(bytes.toString("utf8"));
      phase = "usage";
      // Missing usage retains the reservation and prevents further dispatch.
      if (!parsed?.usage) { await stop("subscription-usage-unavailable"); fail(502); return; }
      await ledger.settle(id, parsed.usage);
      response.writeHead(200, { "content-type": parsed.contentType }); response.end(bytes);
    } catch (error) {
      await stop(`broker-${phase}-failure`).catch(() => {});
      fail(["budget-exhausted", "baseline-deadline", "budget-ledger-unavailable"].includes(error.message) ? 429 : 502);
    } finally {
      active = undefined;
      finish();
    }
  });
  server.maxConnections = 32;
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  await new Promise((resolve, reject) => {
    server.once("error", reject); server.listen(socketPath, resolve);
  });
  let closePromise;
  return { close: () => {
    if (closePromise) return closePromise;
    closing = true;
    shutdown.abort();
    const inFlight = active;
    closePromise = new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    }).then(async () => { await inFlight; });
    return closePromise;
  } };
}
