import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTraits, dnaOf, CHOIR } from "./traits.mjs";

test("333 unique DNA, choir counts, unutterable subjects never repeat", () => {
  const a = buildTraits();
  const b = buildTraits();
  assert.equal(a.length, 333);
  assert.deepEqual(
    a.map((t) => t.dna ?? dnaOf(t)),
    b.map((t) => dnaOf(t)),
  );

  const dnas = new Set(a.map(dnaOf));
  assert.equal(dnas.size, 333);

  for (const [k, v] of Object.entries(CHOIR)) {
    assert.equal(a.filter((t) => t.choir === k).length, v.count, k);
  }

  const u = a.filter((t) => t.choir === "unutterable").map((t) => t.subject);
  assert.equal(new Set(u).size, 22);
  assert.equal(a[0].id, 1);
  assert.equal(a[332].id, 333);
});
