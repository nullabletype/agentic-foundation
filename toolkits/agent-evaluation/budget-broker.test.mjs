import assert from "node:assert/strict";
import { request } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { baselinePolicy, tokensForUsage, constrainRequest, openBudgetLedger, startBudgetBroker } from "./budget-broker.mjs";

async function temporary(t) {
  const directory = await mkdtemp(join(tmpdir(), "orbit-budget-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("concurrent admissions reserve before dispatch and cannot exceed the cap", async (t) => {
  const path = join(await temporary(t), "ledger.json");
  const ledger = await openBudgetLedger(path);
  t.after(() => ledger.close());
  const results = await Promise.allSettled(Array.from({ length: 100 }, () => ledger.reserve()));
  const maximum = tokensForUsage(1_050_000, 128_000);
  assert.equal(maximum, 1_178_000);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, Math.floor(2_000_000 / maximum));
  const durable = JSON.parse(await readFile(path, "utf8"));
  assert.ok(durable.entries.reduce((sum, entry) => sum + entry.tokens, 0) <= 2_000_000);
  assert.equal(durable.entries.every((entry) => entry.status === "reserved"), true);
  assert.equal(ledger.canReserve(), false);
});

test("ledger lock excludes a second broker and reopening retains unknown reservations", async (t) => {
  const path = join(await temporary(t), "ledger.json");
  let ledger = await openBudgetLedger(path);
  await ledger.reserve();
  await assert.rejects(openBudgetLedger(path), { code: "EEXIST" });
  await ledger.close();
  ledger = await openBudgetLedger(path);
  t.after(() => ledger.close());
  assert.equal(ledger.snapshot().entries[0].tokens, 1_178_000);
  await assert.rejects(ledger.reserve(), /budget-exhausted/);
});

test("settled zero-cost requests still consume the persisted admission count", async (t) => {
  const path = join(await temporary(t), "ledger.json");
  const policy = { ...baselinePolicy, maximumRequests: 2 };
  let ledger = await openBudgetLedger(path, { policy });
  await ledger.settle(await ledger.reserve(), { input_tokens: 0, output_tokens: 0 });
  await ledger.close();
  ledger = await openBudgetLedger(path, { policy });
  t.after(() => ledger.close());
  await ledger.settle(await ledger.reserve(), { input_tokens: 0, output_tokens: 0 });
  assert.equal(ledger.canReserve(), false);
  await assert.rejects(ledger.reserve(), /budget-exhausted/);
});

test("monetary ledgers cannot be reused as a fresh token budget", async (t) => {
  const path = join(await temporary(t), "ledger.json");
  await writeFile(path, JSON.stringify({ schema: "dot-orbit-budget:v1", policy: baselinePolicy,
    startedAt: Date.now(), entries: [] }));
  await assert.rejects(openBudgetLedger(path), /invalid-budget-ledger/);
  assert.equal(JSON.parse(await readFile(path, "utf8")).schema, "dot-orbit-budget:v1");
});

test("authoritative usage settles once; invalid usage fails closed", async (t) => {
  const ledger = await openBudgetLedger(join(await temporary(t), "ledger.json"));
  t.after(() => ledger.close());
  const id = await ledger.reserve();
  await ledger.settle(id, { input_tokens: 101, output_tokens: 5 });
  assert.equal(ledger.snapshot().entries[0].tokens, 106);
  const unknown = await ledger.reserve();
  await assert.rejects(ledger.settle(unknown, { input_tokens: -1, output_tokens: 1 }), /invalid-provider-usage/);
  assert.equal(ledger.snapshot().entries[1].tokens, 1_178_000);
  await assert.rejects(ledger.reserve(), /budget-ledger-unavailable/);
  assert.equal(ledger.canReserve(), false);
});

test("deadline persists across reopening and denies subsequent reservations", async (t) => {
  const path = join(await temporary(t), "ledger.json");
  let time = 1_000;
  let ledger = await openBudgetLedger(path, { now: () => time });
  await ledger.reserve(); await ledger.close();
  time += baselinePolicy.totalMilliseconds;
  ledger = await openBudgetLedger(path, { now: () => time });
  t.after(() => ledger.close());
  assert.equal(ledger.remainingMilliseconds(), 0);
  await assert.rejects(ledger.reserve(), /baseline-deadline/);
});

test("wall-clock rollback cannot extend the active monotonic deadline", async (t) => {
  let wall = 100_000;
  let monotonic = 0;
  const ledger = await openBudgetLedger(join(await temporary(t), "ledger.json"), {
    now: () => wall, monotonicNow: () => monotonic,
  });
  t.after(() => ledger.close());
  wall -= 50_000;
  monotonic = baselinePolicy.totalMilliseconds;
  assert.equal(ledger.remainingMilliseconds(), 0);
  await assert.rejects(ledger.reserve(), /baseline-deadline/);
});

test("request policy preserves subscription route and strips API-only options", () => {
  const body = { model: baselinePolicy.model, input: "synthetic", max_output_tokens: 999_999,
    service_tier: "priority", store: true, tools: [{ type: "function", name: "local" }] };
  const safe = constrainRequest(body);
  assert.equal(Object.hasOwn(safe, "max_output_tokens"), false);
  assert.equal(Object.hasOwn(safe, "service_tier"), false);
  assert.equal(safe.stream, true);
  assert.equal(safe.store, false);
  assert.equal(Object.hasOwn(constrainRequest({ ...body, client_metadata: { synthetic: "discard-me" } }), "client_metadata"), false);
  assert.throws(() => constrainRequest({ ...body, model: "another-model" }), /model-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, tools: [{ type: "web_search" }] }), /hosted-tools-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, tool_choice: { type: "web_search" } }), /hosted-tool-choice-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, tool_choice: { type: "allowed_tools", tools: [{ type: "web_search" }] } }), /hosted-tool-choice-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, input: [{ type: "input_image", image_url: "secret" }] }), /nontext-input-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, input: [{ type: "item_reference", id: "opaque" }] }), /nontext-input-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, previous_response_id: "opaque" }), /request-option-not-allowed/);
  assert.doesNotThrow(() => constrainRequest({ ...body, input: [{ type: "additional_tools", tools: [
    { type: "namespace", name: "local", tools: [{ type: "function", name: "execute" }] },
  ] }] }));
  assert.throws(() => constrainRequest({ ...body, input: [{ type: "additional_tools", tools: [
    { type: "namespace", name: "hidden", tools: [{ type: "web_search" }] },
  ] }] }), /hosted-tools-not-allowed/);
  assert.throws(() => constrainRequest({ ...body, input: [{ type: "additional_tools", tools: "opaque" }] }), /hosted-tools-not-allowed/);
});

function post(socketPath, body, path = "/v1/responses") {
  return new Promise((resolve, reject) => {
    const req = request({ socketPath, path, method: "POST" }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, contentType: response.headers["content-type"], body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject); req.end(JSON.stringify(body));
  });
}

test("broker pins upstream and settles buffered SSE without disclosing provider errors", async (t) => {
  const directory = await temporary(t);
  const ledger = await openBudgetLedger(join(directory, "ledger.json"));
  const socketPath = join(directory, "broker.sock");
  let calls = 0;
  const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account", beforeDispatch: async () => true, fetchImpl: async (url, options) => {
    calls += 1;
    assert.equal(url, "https://chatgpt.com/backend-api/codex/responses");
    assert.equal(options.redirect, "error");
    assert.equal(options.signal.aborted, false);
    assert.equal(options.headers.authorization, "Bearer synthetic-token");
    assert.equal(Object.hasOwn(JSON.parse(options.body), "max_output_tokens"), false);
    assert.equal(options.headers["ChatGPT-Account-ID"], "synthetic-account");
    if (calls === 1) return new Response('data: {"type":"response.completed","response":{"usage":{"input_tokens":100,"output_tokens":10}}}\n\n',
      { headers: { "content-type": "text/event-stream" } });
    if (calls === 2) throw new Error("synthetic-token must never be serialized");
    return new Response('{"output":[]}', { headers: { "content-type": "application/json" } });
  } });
  t.after(async () => { await broker.close(); await ledger.close(); });
  const body = { model: baselinePolicy.model, input: "synthetic", stream: true };
  assert.equal((await post(socketPath, body, "/forbidden")).status, 403);
  assert.equal(calls, 0);
  assert.equal((await post(socketPath, body)).status, 200);
  assert.equal(ledger.snapshot().entries[0].tokens, 110);
  const failed = await post(socketPath, body);
  assert.equal(failed.status, 502);
  assert.equal(failed.body.includes("synthetic-token"), false);
  assert.equal(ledger.snapshot().entries[1].tokens, 1_178_000);
  assert.equal((await post(socketPath, body)).status, 429);
  assert.equal(calls, 2);
});

test("broker recognises completed SSE by framing when its content type is missing or inaccurate", async (t) => {
  for (const contentType of [undefined, "text/plain", "application/octet-stream"]) {
    const directory = await temporary(t);
    const ledger = await openBudgetLedger(join(directory, "ledger.json"));
    const socketPath = join(directory, "broker.sock");
    const payload = 'event: response.completed\r\ndata:{"type":"response.completed",\r\ndata: "response":{"usage":{"input_tokens":100,"output_tokens":10}}}\r\n\r\ndata: [DONE]\r\n\r\n';
    const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account",
      beforeDispatch: async () => true,
      fetchImpl: async () => new Response(Buffer.from(payload), { headers: contentType ? { "content-type": contentType } : {} }) });
    t.after(async () => { await broker.close(); await ledger.close(); });
    const result = await post(socketPath, { model: baselinePolicy.model, input: "synthetic" });
    assert.equal(result.status, 200);
    assert.equal(result.contentType, "text/event-stream");
    assert.equal(result.body, payload);
    assert.deepEqual(ledger.snapshot().entries, [{ id: 1, status: "settled", tokens: 110 }]);
  }
});

test("subscription quota failure blocks dispatch and missing usage stops further requests", async (t) => {
  for (const quotaAllowed of [false, true]) {
    const directory = await temporary(t);
    const ledger = await openBudgetLedger(join(directory, "ledger.json"));
    const socketPath = join(directory, "broker.sock");
    let calls = 0;
    const reasons = [];
    const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account",
      beforeDispatch: async () => quotaAllowed,
      onStop: async (reason) => { reasons.push(reason); },
      fetchImpl: async () => {
        calls += 1;
        return new Response('data: {"type":"response.completed","response":{"output":[]}}\n\n',
          { headers: { "content-type": "text/event-stream" } });
      } });
    t.after(async () => { await broker.close(); await ledger.close(); });
    const body = { model: baselinePolicy.model, input: "synthetic" };
    assert.equal((await post(socketPath, body)).status, 502);
    assert.equal((await post(socketPath, body)).status, 429);
    assert.equal(calls, quotaAllowed ? 1 : 0);
    assert.deepEqual(reasons, [quotaAllowed ? "subscription-usage-unavailable" : "broker-quota-failure"]);
    assert.equal(ledger.snapshot().entries.length, quotaAllowed ? 1 : 0);
    if (quotaAllowed) assert.equal(ledger.snapshot().entries[0].tokens, 1_178_000);
  }
});

test("broker recognises whole JSON usage despite an inaccurate stream header", async (t) => {
  const directory = await temporary(t);
  const ledger = await openBudgetLedger(join(directory, "ledger.json"));
  const socketPath = join(directory, "broker.sock");
  const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account",
    beforeDispatch: async () => true,
    fetchImpl: async () => new Response('{"usage":{"input_tokens":100,"output_tokens":10}}', { headers: { "content-type": "text/event-stream" } }) });
  t.after(async () => { await broker.close(); await ledger.close(); });
  const result = await post(socketPath, { model: baselinePolicy.model, input: "synthetic" });
  assert.equal(result.status, 200);
  assert.equal(result.contentType, "application/json");
  assert.equal(ledger.snapshot().entries[0].tokens, 110);
});

test("unstructured, unfinished, ambiguous and invalid usage cannot release a reservation", async (t) => {
  const completed = 'data: {"type":"response.completed","response":{"usage":{"input_tokens":100,"output_tokens":10}}}\n\n';
  for (const payload of [
    `<html>${completed}</html>`,
    completed.trimEnd(),
    completed + completed,
    'data: {"type":"response.failed"}\n\n' + completed,
    'data: {"type":"response.completed","response":{}}\n\n',
    completed.replace('"output_tokens":10', '"output_tokens":-1'),
  ]) {
    const directory = await temporary(t);
    const ledger = await openBudgetLedger(join(directory, "ledger.json"));
    const socketPath = join(directory, "broker.sock");
    const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account",
      beforeDispatch: async () => true, fetchImpl: async () => new Response(payload) });
    t.after(async () => { await broker.close(); await ledger.close(); });
    const body = { model: baselinePolicy.model, input: "synthetic" };
    assert.equal((await post(socketPath, body)).status, 502);
    assert.equal((await post(socketPath, body)).status, 429);
    assert.deepEqual(ledger.snapshot().entries, [{ id: 1, status: "reserved", tokens: 1_178_000 }]);
  }
});

test("concurrent ingress is denied and shutdown awaits upstream abort without releasing its reservation", async (t) => {
  const directory = await temporary(t);
  const ledger = await openBudgetLedger(join(directory, "ledger.json"));
  const socketPath = join(directory, "broker.sock");
  let started;
  const upstreamStarted = new Promise((resolve) => { started = resolve; });
  let aborted = false;
  let calls = 0;
  const broker = await startBudgetBroker({ socketPath, ledger, accessToken: "synthetic-token", accountId: "synthetic-account", beforeDispatch: async () => true, fetchImpl: async (_url, options) => {
    calls += 1;
    started();
    return await new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        aborted = true;
        reject(new Error("synthetic upstream aborted"));
      }, { once: true });
    });
  } });
  t.after(async () => { await broker.close(); await ledger.close(); });
  const body = { model: baselinePolicy.model, input: "synthetic", stream: true };
  const pending = post(socketPath, body).catch((error) => ({ error: error.code }));
  await upstreamStarted;
  const concurrent = await post(socketPath, body);
  assert.equal(concurrent.status, 429);
  assert.equal(calls, 1);
  await broker.close();
  await pending;
  assert.equal(aborted, true);
  assert.equal(ledger.snapshot().entries.length, 1);
  assert.equal(ledger.snapshot().entries[0].status, "reserved");
  assert.equal(ledger.snapshot().entries[0].tokens, 1_178_000);
});
