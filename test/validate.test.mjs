import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmail, normalizeEmail, honeypotFilled } from "../src/validate.js";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  contact@gokhan.vc "), "contact@gokhan.vc");
});

test("isEmail accepts a normal address", () => {
  assert.equal(isEmail("contact@gokhan.vc"), true);
});

test("isEmail rejects empty, spaces, and oversize", () => {
  assert.equal(isEmail(""), false);
  assert.equal(isEmail("not-an-email"), false);
  assert.equal(isEmail("a@" + "b".repeat(260) + ".com"), false);
});

test("honeypotFilled is true only when offering is non-empty", () => {
  assert.equal(honeypotFilled(""), false);
  assert.equal(honeypotFilled(undefined), false);
  assert.equal(honeypotFilled("http://spam"), true);
});
