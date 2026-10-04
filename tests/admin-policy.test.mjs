import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
const context = { exports: {}, Object };
vm.runInNewContext(
  ts.transpile(readFileSync(new URL("../src/lib/admin/data-policy.ts", import.meta.url), "utf8"), {
    module: ts.ModuleKind.CommonJS,
  }),
  context,
);
const { assertReadAccess, assertScopedMutation } = context.exports;
test("roles cannot read unrelated private admin data", () => {
  for (const [role, allowed, denied] of [
    ["content_editor", "site_content", "contact_submissions"],
    ["analytics_viewer", "analytics_sessions", "profiles"],
    ["inquiry_manager", "inquiry_notes", "audit_logs"],
  ]) {
    assert.doesNotThrow(() => assertReadAccess(allowed, role));
    assert.throws(() => assertReadAccess(denied, role), /Forbidden/);
  }
  assert.throws(() => assertReadAccess("toString", "super_admin"), /Forbidden/);
  assert.throws(() => assertReadAccess("profiles", "unknown"), /Forbidden/);
});
test("super admin can read all approved collections", () => {
  for (const table of Object.keys(context.exports.READ_ROLES))
    assert.doesNotThrow(() => assertReadAccess(table, "super_admin"));
});
test("mass updates and deletions are blocked without record filters", () => {
  for (const op of ["update", "delete"]) {
    assert.throws(() => assertScopedMutation(op, []));
    assert.throws(() => assertScopedMutation(op));
    assert.throws(() => assertScopedMutation(op, [["id", undefined]]));
    assert.doesNotThrow(() => assertScopedMutation(op, [["id", "record-id"]]));
  }
  assert.doesNotThrow(() => assertScopedMutation("insert"));
});
