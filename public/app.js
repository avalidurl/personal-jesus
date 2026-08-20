"use strict";

function turnstileToken() {
  var field = document.querySelector("[name=cf-turnstile-response]");
  if (field && field.value) return field.value;
  if (window.turnstile && typeof window.turnstile.getResponse === "function") {
    try { return window.turnstile.getResponse() || ""; }
    catch (_) { return ""; }
  }
  return "";
}

function setStatus(el, text, kind) {
  el.textContent = text;
  el.className = "status" + (kind ? " is-" + kind : "");
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("join");
  var email = document.getElementById("email");
  var status = document.getElementById("status");
  var btn = form.querySelector("button[type=submit]");
  if (!form || !email || !status) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!value) {
      setStatus(status, "REJECTED.", "err");
      email.focus();
      return;
    }

    btn.disabled = true;
    setStatus(status, "", null);

    fetch("/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: value,
        turnstile: turnstileToken(),
        offering: form.elements.offering ? form.elements.offering.value : "",
      }),
    })
      .then(function (r) { return r.json().then(function (data) { return { r: r, data: data }; }); })
      .then(function (out) {
        if (out.r.ok && out.data && out.data.already) {
          setStatus(status, "ALREADY ON FILE.", "dup");
          btn.disabled = false;
          return;
        }
        if (out.r.ok && out.data && out.data.ok) {
          setStatus(status, "ACCEPTED.", "ok");
          email.disabled = true;
          return;
        }
        setStatus(status, "REJECTED.", "err");
        btn.disabled = false;
      })
      .catch(function () {
        setStatus(status, "REJECTED.", "err");
        btn.disabled = false;
      });
  });
});
