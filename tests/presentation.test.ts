import test from "node:test";
import assert from "node:assert/strict";
import { display, valueAt } from "../lib/presentation";
import { ADMIN_SECTIONS } from "../contracts/admin-v1";
import { sections } from "../lib/presentation";
test("every versioned section has a presentation and missing data is never represented as a real zero", () => {
  for (const key of ADMIN_SECTIONS) assert.ok(sections[key]);
  assert.equal(display(null), "—");
  assert.equal(display(false, "livemode"), "Teste");
  assert.equal(display(true, "livemode"), "Produção");
  assert.equal(display("2026-11-08T02:00:00Z"), "07/11/2026, 23:00");
  assert.equal(valueAt({ plan: null }, "plan.plan"), undefined);
});
