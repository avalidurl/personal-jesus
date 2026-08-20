"use strict";

/* VGA-16 heavenly host. GeoCities GIF-parade layout, Ezekiel/Isaiah/Revelation
 * creatures drawn as TempleOS sprites. One canvas, integer pixels. */

var PAL = [
  "#000000", "#0000AA", "#00AA00", "#00AAAA",
  "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
  "#555555", "#5555FF", "#55FF55", "#55FFFF",
  "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF",
];

var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var TILE = 48;
var ROWS = 40;

function Host(cv) {
  this.cv = cv;
  this.ctx = cv.getContext("2d");
  this.cols = 0;
  this.rows = ROWS;
  this.cell = 4;
  this.px = null;
  this.f = 0;
  this.last = 0;
}

Host.prototype.resize = function () {
  var cssW = this.cv.clientWidth || this.cv.parentElement.clientWidth || 640;
  var cssH = this.cv.clientHeight || 160;
  var cell = Math.max(3, Math.floor(cssH / ROWS));
  var cols = Math.max(TILE, Math.floor(cssW / cell));
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  this.cell = cell;
  this.cols = cols;
  this.cv.width = Math.round(cols * cell * dpr);
  this.cv.height = Math.round(ROWS * cell * dpr);
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  this.px = new Uint8Array(cols * ROWS);
};

Host.prototype.clear = function () {
  this.px.fill(1); /* desktop BLUE */
};

Host.prototype.set = function (x, y, c) {
  if (x < 0 || y < 0 || x >= this.cols || y >= ROWS) return;
  this.px[y * this.cols + x] = c & 15;
};

Host.prototype.plot = function (x, y, ch, c) {
  if (ch === " " || ch === "") return;
  this.set(x, y, c);
};

Host.prototype.text = function (x, y, s, c) {
  for (var i = 0; i < s.length; i++) if (s[i] !== " ") this.set(x + i, y, c);
};

Host.prototype.rect = function (x, y, w, h, c) {
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c);
};

Host.prototype.blit = function () {
  var ctx = this.ctx;
  var cell = this.cell;
  var cols = this.cols;
  var px = this.px;
  ctx.fillStyle = PAL[1];
  ctx.fillRect(0, 0, cols * cell, ROWS * cell);
  var last = -1;
  for (var i = 0; i < px.length; i++) {
    var c = px[i];
    if (c === 1) continue;
    if (c !== last) { ctx.fillStyle = PAL[c]; last = c; }
    var x = (i % cols) * cell;
    var y = ((i / cols) | 0) * cell;
    ctx.fillRect(x, y, cell, cell);
  }
};

function hash(a, b, c) {
  var h = (a * 374761393 + b * 668265263 + (c || 0) * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h >>> 0) % 1000) / 1000;
}

function ring(h, cx, cy, r, n, t, ch, c) {
  for (var i = 0; i < n; i++) {
    var a = t + i * Math.PI * 2 / n;
    h.set(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r), c);
  }
}

/* Ezekiel 1 / 10 — wheel within a wheel, rims full of eyes. */
function ophanim(h, ox, oy, f) {
  var cx = ox + 23;
  var cy = oy + 18;
  var t = f * 0.12;
  ring(h, cx, cy, 14, 20, t, "*", 14);
  ring(h, cx, cy, 10, 14, -t * 1.4, "o", 7);
  ring(h, cx, cy, 6, 10, t * 1.7, "*", 15);
  h.set(cx, cy, 14);
  var i;
  for (i = 0; i < 12; i++) {
    var a = t + i * Math.PI * 2 / 12;
    var x = cx + Math.round(Math.cos(a) * 12);
    var y = cy + Math.round(Math.sin(a) * 12);
    h.set(x, y, (f + i) % 6 < 3 ? 15 : 14);
  }
}

/* Isaiah 6 — six wings, fire, face covered. */
function seraph(h, ox, oy, f) {
  var cx = ox + 23;
  var cy = oy + 18;
  var flap = ((f / 3) | 0) % 2;
  var w = flap ? 18 : 16;
  var i;
  for (i = 1; i <= w; i++) {
    h.set(cx - i, cy - 6 - (i % 3 === 0 ? 1 : 0), 15);
    h.set(cx + i, cy - 6 - (i % 3 === 0 ? 1 : 0), 15);
    h.set(cx - i, cy + 1, 11);
    h.set(cx + i, cy + 1, 11);
    h.set(cx - Math.ceil(i * 0.7), cy + 7, 7);
    h.set(cx + Math.ceil(i * 0.7), cy + 7, 7);
  }
  h.rect(cx - 2, cy - 3, 5, 7, 14);
  h.rect(cx - 1, cy - 2, 3, 5, (f % 4 < 2) ? 12 : 4);
  h.set(cx, cy, 15);
}

/* Exodus 3 — bush that burns and is not consumed. */
function bush(h, ox, oy, f) {
  var cx = ox + 23;
  var y, x, r;
  for (y = 8; y <= 28; y++) {
    var half = Math.floor((y - 6) / 3);
    for (x = -half; x <= half; x++) {
      r = hash(x + 40, y, 3);
      h.set(cx + x, oy + y, r < 0.2 ? 10 : 2);
    }
  }
  for (y = 4; y <= 22; y++) {
    for (x = -8; x <= 8; x++) {
      r = hash(x + 9, y, (f / 2) | 0);
      if (r > 0.55 - Math.abs(x) * 0.03) continue;
      var c = r < 0.18 ? 15 : (r < 0.32 ? 14 : ((f + x + y) % 3 ? 12 : 4));
      h.set(cx + x, oy + y, c);
    }
  }
}

/* Ezekiel 1 — four faces: man, lion, ox, eagle. */
function cherub(h, ox, oy, f) {
  var cx = ox + 23;
  var cy = oy + 18;
  h.rect(cx - 3, cy - 2, 7, 9, 6);
  h.rect(cx - 2, cy - 1, 5, 7, 7);
  /* human */
  h.rect(cx - 1, cy - 6, 3, 3, 14);
  h.set(cx - 1, cy - 5, 1);
  h.set(cx + 1, cy - 5, 1);
  /* lion */
  h.rect(cx - 8, cy - 2, 4, 3, 6);
  h.set(cx - 8, cy - 1, 14);
  h.set(cx - 5, cy - 1, 14);
  /* ox */
  h.rect(cx + 5, cy - 1, 4, 3, 8);
  h.set(cx + 5, cy, 0);
  h.set(cx + 8, cy, 0);
  /* eagle */
  h.rect(cx - 1, cy + 7, 3, 3, 3);
  h.set(cx, cy + 6, 11);
  var i;
  for (i = 2; i < 14; i++) {
    h.set(cx - i, cy + 2, 15);
    h.set(cx + i, cy + 2, 15);
  }
  if (f % 8 < 4) {
    h.set(cx - 4, cy - 3, 15);
    h.set(cx + 4, cy - 3, 15);
  }
}

/* Genesis 3:24 — flaming sword that turned every way. */
function sword(h, ox, oy, f) {
  var cx = ox + 23;
  var spin = ((f / 2) | 0) % 8;
  var y, c;
  for (y = 4; y <= 30; y++) {
    h.set(cx, oy + y, 7);
    h.set(cx - 1, oy + y, 8);
  }
  h.rect(cx - 3, oy + 28, 7, 3, 6);
  for (y = 4; y <= 18; y++) {
    c = ((f + y) % 4 === 0) ? 15 : (((f + y) % 3) ? 14 : 12);
    h.set(cx + ((spin % 2) ? 1 : -1), oy + y, c);
    if (hash(y, f, 1) < 0.35) h.set(cx + ((spin < 4) ? 2 : -2), oy + y - 1, 4);
  }
}

/* Revelation 4 — rainbow around the throne. */
function throne(h, ox, oy, f) {
  var cx = ox + 23;
  var cy = oy + 20;
  var cols = [4, 12, 6, 14, 2, 3, 1, 5];
  var r, i, a;
  for (r = 14; r >= 10; r--) {
    for (i = 0; i < 18; i++) {
      a = Math.PI + i * Math.PI / 18;
      h.set(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r) - 6, cols[(14 - r + ((f / 4) | 0)) & 7]);
    }
  }
  h.rect(cx - 5, cy - 2, 11, 8, 14);
  h.rect(cx - 4, cy - 1, 9, 6, 15);
  h.set(cx, cy + 1, 1);
}

function stars(h, f) {
  var x, y, r;
  for (y = 0; y < 10; y++) {
    for (x = 0; x < h.cols; x++) {
      r = hash(x, y, 9);
      if (r > 0.045) continue;
      var on = ((f + (x * 3)) % 8) > (r * 8);
      h.set(x, y, on ? 15 : 8);
    }
  }
}

function firebar(h, f) {
  var x, r, c;
  for (x = 0; x < h.cols; x++) {
    r = hash(x, (f / 2) | 0, 17);
    c = r < 0.2 ? 15 : (r < 0.45 ? 14 : (r < 0.75 ? 12 : 4));
    h.set(x, ROWS - 1, c);
    if (r < 0.55) h.set(x, ROWS - 2, r < 0.25 ? 14 : 12);
    if (r < 0.22) h.set(x, ROWS - 3, 14);
    if (hash(x, f, 21) < 0.08) h.set(x, ROWS - 4, 15);
  }
}

var SPRITES = [ophanim, seraph, bush, cherub, sword, throne];

Host.prototype.draw = function (f) {
  this.clear();
  stars(this, f);
  var n = SPRITES.length;
  var shift = REDUCED ? 0 : ((f / 2) | 0) % (TILE * n);
  var i, x, fn;
  var start = -TILE;
  var end = this.cols + TILE;
  for (x = start; x < end; x += TILE) {
    i = Math.floor((x + shift) / TILE);
    fn = SPRITES[((i % n) + n) % n];
    fn(this, x - (shift % TILE), 2, f + i * 7);
  }
  firebar(this, f);
  this.blit();
};

function mountHost() {
  var cv = document.getElementById("host");
  if (!cv) return;
  var host = new Host(cv);
  host.resize();
  host.draw(0);
  window.addEventListener("resize", function () {
    host.resize();
    host.draw(host.f);
  });
  if (REDUCED) return;
  function tick(now) {
    if (now - host.last > 80) {
      host.last = now;
      host.f++;
      host.draw(host.f);
    }
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", mountHost);
