/** VGA-16 128×128 vision renderer. Deterministic from trait + frame. */

export const PAL = [
  [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170],
  [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
  [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255],
  [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255],
];

export const W = 128;
export const H = 128;
export const FRAMES = 12;

export function hash(a, b, c) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1274126177)) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h >>> 0) % 1000) / 1000;
}

function Grid() {
  this.px = new Uint8Array(W * H);
  this.px.fill(1);
}
Grid.prototype.set = function (x, y, c) {
  if ((x | 0) !== x || (y | 0) !== y) return;
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  this.px[y * W + x] = c & 15;
};
Grid.prototype.rect = function (x, y, w, h, c) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
};

function ph(t, f, kind) {
  const p = f / FRAMES;
  switch (kind) {
    case "spin":
    case "turn":
      return p * Math.PI * 2;
    case "pulse":
    case "breathe":
      return Math.sin(p * Math.PI * 2);
    case "rise":
      return Math.round((1 - ((f % FRAMES) / FRAMES)) * 6);
    case "rain":
      return f % 8;
    case "drift":
      return Math.round(Math.sin(p * Math.PI * 2) * 3);
    case "hush":
      return 0;
    default:
      return f;
  }
}

function ring(g, cx, cy, r, n, ang, c) {
  for (let i = 0; i < n; i++) {
    const a = ang + (i * Math.PI * 2) / n;
    g.set(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r), c);
  }
}

function starfield(g, seed, f) {
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(seed, i, 1) * W);
    const y = Math.floor(hash(seed, i, 2) * H);
    const on = ((f + i) % 7) > 2;
    g.set(x, y, on ? 15 : 8);
  }
}

function lamp(g, cx, cy, f, ac, mot) {
  const flick = mot === "flicker" || mot === "pulse" ? (f % 3) : 0;
  g.rect(cx - 2, cy + 4, 5, 8, 6);
  g.rect(cx - 1, cy + 4, 3, 6, 7);
  g.set(cx, cy + 2 - flick, ac);
  g.set(cx, cy + 1 - flick, 14);
  g.set(cx, cy - flick, 15);
}

function coal(g, cx, cy, f, ac) {
  g.rect(cx - 3, cy, 7, 4, 8);
  g.set(cx, cy, (f % 4 < 2) ? 12 : ac);
  g.set(cx + 1, cy - 1, 14);
}

function eye(g, cx, cy, f, ac) {
  ring(g, cx, cy, 5, 16, 0, 15);
  ring(g, cx, cy, 4, 12, 0, ac);
  g.set(cx + ((f % 3) - 1), cy, 0);
}

function spark(g, cx, cy, f, ac, seed) {
  const n = 6 + (seed % 5);
  for (let i = 0; i < n; i++) {
    const a = (f * 0.5) + i * (Math.PI * 2 / n);
    const r = 2 + (i % 3) + (f % 2);
    g.set(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r), i % 2 ? 14 : ac);
  }
  g.set(cx, cy, 15);
}

function flame(g, cx, cy, f, ac) {
  for (let y = 0; y < 18; y++) {
    for (let x = -4; x <= 4; x++) {
      const r = hash(x + 9, y, f);
      if (r > 0.55 - Math.abs(x) * 0.06 - y * 0.01) continue;
      g.set(cx + x, cy - y, r < 0.2 ? 15 : (r < 0.35 ? 14 : ac));
    }
  }
}

function bush(g, cx, cy, f, ac) {
  for (let y = 0; y < 22; y++) {
    const half = Math.floor(y / 3) + 1;
    for (let x = -half; x <= half; x++) {
      g.set(cx + x, cy + 8 - y, hash(x, y, 3) < 0.2 ? 10 : 2);
    }
  }
  flame(g, cx, cy - 2, f, ac === 2 ? 12 : ac);
}

function sword(g, cx, cy, f, ac, mot) {
  const a = mot === "turn" || mot === "spin" ? ph({} , f, mot) : 0;
  const dx = Math.round(Math.sin(a));
  for (let y = -20; y <= 16; y++) {
    g.set(cx + dx, cy + y, 7);
    g.set(cx + dx - 1, cy + y, 8);
    if (y < 0 && hash(y, f, 1) < 0.4) g.set(cx + dx + (f % 2 ? 1 : -1), cy + y, ac);
  }
  g.rect(cx + dx - 3, cy + 14, 7, 3, 6);
}

function rod(g, cx, cy, f, ac) {
  for (let y = -18; y <= 16; y++) g.set(cx, cy + y, 6);
  g.set(cx, cy - 18 - (f % 2), ac);
  if (f % 4 < 2) g.set(cx + 1, cy - 10, 10);
}

function altar(g, cx, cy, f, ac) {
  g.rect(cx - 10, cy + 6, 21, 8, 7);
  g.rect(cx - 8, cy + 2, 17, 5, 8);
  flame(g, cx, cy + 2, f, ac);
}

function lampstand(g, cx, cy, f, ac) {
  g.rect(cx - 1, cy - 4, 3, 22, 14);
  g.rect(cx - 6, cy + 16, 13, 3, 6);
  for (const ox of [-10, -6, 0, 6, 10, -8, 8]) {
    g.set(cx + ox, cy - 8 + Math.abs(ox) % 3, (f + ox) % 3 ? 14 : ac);
  }
}

function ark(g, cx, cy, f, ac) {
  g.rect(cx - 12, cy, 25, 10, 6);
  g.rect(cx - 11, cy + 1, 23, 8, 14);
  ring(g, cx - 8, cy, 4, 10, f * 0.2, ac);
  ring(g, cx + 8, cy, 4, 10, -f * 0.2, ac);
}

function trumpet(g, cx, cy, f, ac) {
  for (let i = 0; i < 18; i++) g.set(cx - 10 + i, cy + Math.floor(i / 6), 14);
  g.rect(cx + 8, cy - 2, 5, 7, 14);
  if (f % 2) spark(g, cx + 14, cy, f, ac, 3);
}

function scroll(g, cx, cy, f, ac) {
  g.rect(cx - 8, cy - 6, 16, 14, 15);
  g.rect(cx - 7, cy - 5, 14, 12, 7);
  for (let y = -3; y <= 4; y++) g.set(cx - 4 + ((f + y) % 3), cy + y, ac);
}

function bowl(g, cx, cy, f, ac) {
  for (let x = -8; x <= 8; x++) g.set(cx + x, cy + 4, 7);
  g.rect(cx - 6, cy, 13, 5, 8);
  g.set(cx, cy - 2 - (f % 3), ac);
}

function ophanim(g, cx, cy, f, ac, mot) {
  const t = mot === "hush" ? 0 : f * 0.2;
  for (let r = 4; r <= 22; r++) {
    ring(g, cx, cy, r, r * 3, t * (r % 2 ? 1 : -1), r > 16 ? ac : (r > 10 ? 14 : 15));
  }
  g.set(cx, cy, 15);
}

function seraph(g, cx, cy, f, ac) {
  const span = 18 + (f % 2);
  for (let i = 1; i <= span; i++) {
    g.set(cx - i, cy - 8, 15);
    g.set(cx + i, cy - 8, 15);
    g.set(cx - i, cy, 11);
    g.set(cx + i, cy, 11);
    g.set(cx - Math.ceil(i * 0.6), cy + 8, 7);
    g.set(cx + Math.ceil(i * 0.6), cy + 8, 7);
  }
  g.rect(cx - 3, cy - 4, 7, 9, 14);
  g.rect(cx - 2, cy - 3, 5, 7, ac);
  g.set(cx, cy, 15);
}

function cherub(g, cx, cy, f, ac, face) {
  g.rect(cx - 4, cy - 2, 9, 12, 6);
  g.rect(cx - 3, cy - 1, 7, 10, 7);
  const faces = {
    man: () => { g.rect(cx - 2, cy - 8, 5, 5, 14); g.set(cx - 1, cy - 6, 1); g.set(cx + 1, cy - 6, 1); },
    lion: () => { g.rect(cx - 12, cy - 2, 6, 5, 6); g.set(cx - 11, cy, 14); g.set(cx - 8, cy, 14); },
    ox: () => { g.rect(cx + 7, cy - 1, 6, 5, 8); g.set(cx + 8, cy + 1, 0); g.set(cx + 11, cy + 1, 0); },
    eagle: () => { g.rect(cx - 2, cy + 10, 5, 4, 3); g.set(cx, cy + 9, 11); },
  };
  if (face === "tetramorph" || !face) {
    faces.man(); faces.lion(); faces.ox(); faces.eagle();
  } else {
    faces[face]();
    faces.man();
  }
  for (let i = 2; i < 16; i++) {
    g.set(cx - i, cy + 3, 15);
    g.set(cx + i, cy + 3, 15);
  }
}

function throne(g, cx, cy, f, ac) {
  const cols = [4, 12, 6, 14, 2, 3, ac, 5];
  for (let r = 20; r >= 12; r--) {
    for (let i = 0; i < 20; i++) {
      const a = Math.PI + (i * Math.PI) / 20;
      g.set(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r) - 8, cols[(20 - r + ((f / 2) | 0)) & 7]);
    }
  }
  g.rect(cx - 8, cy - 2, 17, 12, 14);
  g.rect(cx - 6, cy, 13, 8, 15);
  g.set(cx, cy + 3, 1);
}

function merkabah(g, cx, cy, f, ac) {
  ophanim(g, cx, cy + 6, f, ac, "spin");
  throne(g, cx, cy - 10, f, 14);
}

function sevenLamps(g, cx, cy, f, ac) {
  for (let i = 0; i < 7; i++) {
    const x = cx - 18 + i * 6;
    g.set(x, cy, (f + i) % 3 ? 14 : ac);
    g.set(x, cy + 1, 6);
    g.set(x, cy + 2, 6);
  }
  g.rect(cx - 20, cy + 4, 41, 2, 7);
}

function gate(g, cx, cy, f, ac, letter) {
  g.rect(cx - 12, cy - 16, 25, 4, 14);
  g.rect(cx - 12, cy - 16, 4, 36, 14);
  g.rect(cx + 9, cy - 16, 4, 36, 14);
  g.rect(cx - 8, cy + 16, 17, 4, 6);
  const on = f % 4 < 3;
  for (let i = 0; i < letter.length; i++) {
    g.rect(cx - 4 + i * 4, cy - 2, 3, 5, on ? ac : 8);
  }
}

function lamb(g, cx, cy, f, ac) {
  g.rect(cx - 6, cy, 14, 8, 15);
  g.rect(cx + 6, cy - 4, 6, 6, 15);
  g.set(cx + 10, cy - 2, 0);
  g.set(cx - 4, cy + 8, 7);
  g.set(cx + 4, cy + 8, 7);
  if (f % 4 < 2) g.set(cx + 2, cy + 2, ac);
}

function silence(g, cx, cy, f, ac) {
  g.px.fill(0);
  const on = f % FRAMES > FRAMES - 3;
  g.set(cx, cy, on ? ac : 8);
}

function voice(g, cx, cy, f, ac, mot) {
  const d = mot === "drift" ? ph({}, f, "drift") : 0;
  for (let i = 1; i < 20; i++) {
    const y = Math.round(Math.sin((f + i) * 0.4) * (3 + i / 5));
    g.set(cx + i + d, cy + y, ac);
    g.set(cx - i + d, cy - y, 15);
  }
}

function light(g, cx, cy, f, ac) {
  const r = 6 + Math.round((Math.sin((f / FRAMES) * Math.PI * 2) + 1) * 8);
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) g.set(cx + x, cy + y, (x * x + y * y < 9) ? 15 : ac);
    }
  }
}

function stone(g, cx, cy, f, ac) {
  const ox = Math.round((f / FRAMES) * 10);
  g.rect(cx - 10 + ox, cy, 16, 12, 8);
  g.rect(cx - 9 + ox, cy + 1, 14, 10, 7);
  g.rect(cx + 8, cy + 2, 6, 16, ac);
}

function cloud(g, cx, cy, f, ac, mot) {
  const d = mot === "drift" ? ph({}, f, "drift") : (f % 3);
  for (let i = -16; i <= 16; i++) {
    for (let j = -6; j <= 6; j++) {
      if (hash(i + 20, j + 8, 2) < 0.55) g.set(cx + i + d, cy + j, j < 0 ? 15 : ac);
    }
  }
}

function pillar(g, cx, cy, f, ac) {
  const rise = ph({}, f, "rise");
  for (let y = 20; y >= -20 + rise; y--) {
    const w = 2 + ((20 - y) % 4 === 0 ? 1 : 0);
    for (let x = -w; x <= w; x++) g.set(cx + x, cy + y, (y + f) % 3 ? 12 : ac);
  }
}

function veil(g, cx, cy, f, ac) {
  for (let y = -24; y <= 24; y++) {
    const split = Math.min(8, f);
    for (let x = -10; x < 0; x++) g.set(cx + x - split, cy + y, 7);
    for (let x = 0; x <= 10; x++) g.set(cx + x + split, cy + y, 7);
    g.set(cx, cy + y, ac);
  }
}

function river(g, cx, cy, f, ac) {
  for (let x = -40; x <= 40; x++) {
    const y = Math.round(Math.sin((x + f) * 0.3) * 4);
    g.set(cx + x, cy + y, 11);
    g.set(cx + x, cy + y + 1, ac);
    g.set(cx + x, cy + y + 2, 3);
  }
}

function noSea(g, cx, cy, f, ac) {
  g.px.fill(9);
  for (let x = 0; x < W; x++) {
    g.set(x, 90 + Math.round(Math.sin((x + f) * 0.1) * 0), 14);
  }
  g.set(cx, cy, ac);
}

function tablets(g, cx, cy, f, ac) {
  g.rect(cx - 10, cy - 12, 8, 20, 7);
  g.rect(cx + 2, cy - 12, 8, 20, 7);
  for (let y = -8; y <= 4; y += 2) {
    g.set(cx - 7, cy + y, ac);
    g.set(cx + 5, cy + y, ac);
  }
}

function net(g, cx, cy, f, ac) {
  for (let i = -16; i <= 16; i += 4) {
    for (let j = -16; j <= 16; j += 4) {
      g.set(cx + i + (f % 2), cy + j, ac);
      g.set(cx + i, cy + j + 1, 7);
    }
  }
}

function jar(g, cx, cy, f, ac) {
  g.rect(cx - 5, cy - 4, 11, 16, 6);
  g.rect(cx - 3, cy - 8, 7, 5, 6);
  if (f % 3) g.set(cx, cy - 10, ac);
}

const GATES = {
  "gate-judah": "J", "gate-issachar": "I", "gate-zebulun": "Z", "gate-reuben": "R",
  "gate-simeon": "S", "gate-gad": "G", "gate-ephraim": "E", "gate-manasseh": "M",
  "gate-benjamin": "B", "gate-dan": "D", "gate-asher": "A", "gate-naphtali": "N",
};

function drawSubject(g, t, f) {
  const cx = 64 + (t.motion === "drift" ? ph({}, f, "drift") : 0);
  const cy = 64 + (t.motion === "rise" ? ph({}, f, "rise") - 3 : 0);
  const ac = t.accent.id;
  const s = t.subject;
  const mot = t.motion;

  if (GATES[s]) return gate(g, cx, cy, f, ac, GATES[s]);
  if (s === "lamb-as-slain") return lamb(g, cx, cy, f, ac);
  if (s === "silence-in-heaven") return silence(g, cx, cy, f, ac);
  if (s === "still-small-voice") return voice(g, cx, cy, f, ac, mot);
  if (s === "uncreated-light") return light(g, cx, cy, f, ac);
  if (s === "rolled-stone") return stone(g, cx, cy, f, ac);
  if (s === "cloud-by-day") return cloud(g, cx, cy, f, ac, mot);
  if (s === "pillar-of-fire") return pillar(g, cx, cy, f, ac);
  if (s === "torn-veil") return veil(g, cx, cy, f, ac);
  if (s === "river-of-life") return river(g, cx, cy, f, ac);
  if (s === "no-more-sea") return noSea(g, cx, cy, f, ac);

  if (s.startsWith("ophanim") || s === "wheel-rim") return ophanim(g, cx, cy, f, ac, mot);
  if (s.startsWith("seraph") || s === "six-wings") return seraph(g, cx, cy, f, ac);
  if (s === "cherub-man") return cherub(g, cx, cy, f, ac, "man");
  if (s === "cherub-lion") return cherub(g, cx, cy, f, ac, "lion");
  if (s === "cherub-ox") return cherub(g, cx, cy, f, ac, "ox");
  if (s === "cherub-eagle") return cherub(g, cx, cy, f, ac, "eagle");
  if (s === "tetramorph" || s === "full-of-eyes" || s === "living-rev4" || s === "cherub-fire") {
    return cherub(g, cx, cy, f, ac, "tetramorph");
  }
  if (s === "four-wings" || s === "calf-feet" || s === "straight-leg") return cherub(g, cx, cy, f, ac, "man");

  if (s.includes("throne") || s === "seat-of-glory" || s === "empty-seat" || s === "sapphire-pavement" || s === "crystal-before" || s === "lightning-throne" || s === "voice-from-throne" || s === "cloud-throne") {
    return throne(g, cx, cy, f, ac);
  }
  if (s === "merkabah" || s === "chariot-fire" || s === "wheel-throne") return merkabah(g, cx, cy, f, ac);
  if (s === "seven-lamps") return sevenLamps(g, cx, cy, f, ac);

  if (s === "bush") return bush(g, cx, cy, f, ac);
  if (s === "sword" || s === "bronze-serpent") return sword(g, cx, cy, f, ac, mot);
  if (s === "rod" || s === "staff" || s === "tent-peg") return rod(g, cx, cy, f, ac);
  if (s === "altar") return altar(g, cx, cy, f, ac);
  if (s === "lampstand" || s === "snuffers" || s === "tongs") return lampstand(g, cx, cy, f, ac);
  if (s === "ark" || s === "mercy-seat") return ark(g, cx, cy, f, ac);
  if (s === "trumpet" || s === "horn" || s === "ram-horn") return trumpet(g, cx, cy, f, ac);
  if (s === "scroll") return scroll(g, cx, cy, f, ac);
  if (s === "bowl" || s === "censer" || s === "laver" || s === "pot" || s === "cruse" || s === "pitcher") return bowl(g, cx, cy, f, ac);
  if (s === "tablets") return tablets(g, cx, cy, f, ac);
  if (s === "net") return net(g, cx, cy, f, ac);
  if (s === "jar" || s === "yoke" || s === "plow" || s === "millstone" || s === "ephod" || s === "showbread") return jar(g, cx, cy, f, ac);

  if (s === "lamp" || s === "taper" || s === "wick" || s === "watch") return lamp(g, cx, cy, f, ac, mot);
  if (s === "coal" || s === "ember" || s === "cinder") return coal(g, cx, cy, f, ac);
  if (s === "eye" || s === "twin-eye") {
    eye(g, cx, cy, f, ac);
    if (s === "twin-eye") eye(g, cx + 14, cy, f, ac);
    return;
  }
  if (s === "flame") return flame(g, cx, cy, f, ac);
  if (s === "cluster") {
    spark(g, cx - 10, cy, f, ac, t.seed);
    spark(g, cx + 10, cy + 4, f + 3, ac, t.seed + 1);
    spark(g, cx, cy - 8, f + 6, 14, t.seed + 2);
    return;
  }
  spark(g, cx, cy, f, ac, t.seed);
}

export function renderFrame(t, f) {
  const g = new Grid();
  starfield(g, t.seed, f);
  drawSubject(g, t, f);
  return g.px;
}
