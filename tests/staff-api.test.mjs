import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import ts from "typescript";

async function loadStaffApi(responses) {
  const source = await readFile(
    new URL("../src/lib/admin-api.ts", import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  const apiModule = { exports: {} };
  const calls = [];
  runInNewContext(outputText, {
    module: apiModule,
    exports: apiModule.exports,
    URLSearchParams,
    require(name) {
      if (name === "./constants") return { API_BASE: "http://api.test/api" };
      if (name === "./auth-api") return { refreshSession: async () => false };
      throw new Error(`Unexpected import: ${name}`);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      const response = responses.shift();
      if (!response) throw new Error("Unexpected extra API request");
      return {
        ok: !response.error,
        status: response.error ? 500 : 200,
        json: async () =>
          response.error
            ? { message: response.error }
            : {
                success: true,
                data: response.data,
                meta: { totalPages: response.totalPages },
              },
      };
    },
  });
  return { api: apiModule.exports, calls };
}

test("staff directory loads every page beyond the first hundred records", async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({
    id: String(index),
  }));
  const { api, calls } = await loadStaffApi([
    { data: firstPage, totalPages: 2 },
    { data: [{ id: "100" }], totalPages: 2 },
  ]);
  const staff = await api.fetchAllStaff();
  assert.equal(staff.length, 101);
  assert.equal(staff[100].id, "100");
  assert.match(calls[0].url, /page=1&limit=100/);
  assert.match(calls[1].url, /page=2&limit=100/);
  assert.equal(calls[1].options.credentials, "include");
});

test("staff directory handles an empty team and overlapping page boundaries", async () => {
  const empty = await loadStaffApi([{ data: [], totalPages: 0 }]);
  assert.equal((await empty.api.fetchAllStaff()).length, 0);
  assert.equal(empty.calls.length, 1);
  const overlap = await loadStaffApi([
    { data: [{ id: "1" }], totalPages: 2 },
    { data: [{ id: "1" }, { id: "2" }], totalPages: 2 },
  ]);
  assert.equal((await overlap.api.fetchAllStaff()).length, 2);
});

test("a later staff page failure is reported instead of showing partial totals", async () => {
  const { api } = await loadStaffApi([
    { data: [{ id: "1" }], totalPages: 2 },
    { error: "Failed to load staff" },
  ]);
  await assert.rejects(api.fetchAllStaff(), /Failed to load staff/);
});
