import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/chunk-recovery.ts", import.meta.url), "utf8");
const moduleContext = { exports: {} };
vm.runInNewContext(ts.transpile(source, { module: ts.ModuleKind.CommonJS }), moduleContext);
const script = moduleContext.exports.chunkRecoveryScript;

function browser({ online = true, stored = null, blocked = false } = {}) {
  let listener;
  let reloads = 0;
  let prevented = 0;
  const context = {
    navigator: { onLine: online },
    sessionStorage: {
      getItem: () => {
        if (blocked) throw Error("blocked");
        return stored;
      },
      setItem: (_, value) => {
        stored = value;
      },
    },
    window: {
      addEventListener: (name, fn) => {
        assert.equal(name, "vite:preloadError");
        listener = fn;
      },
      location: { reload: () => reloads++ },
    },
  };
  vm.runInNewContext(script, context);
  return {
    fail: () => listener({ preventDefault: () => prevented++ }),
    result: () => ({ reloads, prevented, stored }),
  };
}

test("a stale module refreshes once and duplicate failures do not loop", () => {
  const page = browser();
  page.fail();
  page.fail();
  assert.equal(page.result().reloads, 1);
  assert.equal(page.result().prevented, 1);
  const refreshedPage = browser({ stored: page.result().stored });
  refreshedPage.fail();
  assert.equal(refreshedPage.result().reloads, 0);
});

test("offline or unavailable storage keeps the normal error instead of looping", () => {
  for (const options of [{ online: false }, { blocked: true }]) {
    const page = browser(options);
    page.fail();
    assert.equal(page.result().reloads, 0);
    assert.equal(page.result().prevented, 0);
  }
});
