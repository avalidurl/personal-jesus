/** Email / honeypot helpers. Pure; imported by the Worker and by node:test. */

export function normalizeEmail(s) {
  return String(s ?? "").trim().toLowerCase();
}

export function isEmail(s) {
  return typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function honeypotFilled(offering) {
  return String(offering ?? "").length > 0;
}
