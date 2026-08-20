/** Deterministic 333 unique HOST recipes. Seeded; do not shuffle by Math.random. */

export const CHOIR = {
  stars: { name: "Stars of heaven", count: 111 },
  vessels: { name: "Vessels", count: 89 },
  living: { name: "Living creatures", count: 67 },
  thrones: { name: "Thrones", count: 44 },
  unutterable: { name: "Unutterable", count: 22 },
};

export const ACCENTS = [
  { id: 2, name: "GREEN" },
  { id: 3, name: "CYAN" },
  { id: 4, name: "RED" },
  { id: 5, name: "PURPLE" },
  { id: 6, name: "BROWN" },
  { id: 7, name: "LTGRAY" },
  { id: 8, name: "DKGRAY" },
  { id: 9, name: "LTBLUE" },
  { id: 10, name: "LTGREEN" },
  { id: 11, name: "LTCYAN" },
  { id: 12, name: "LTRED" },
  { id: 13, name: "LTPURPLE" },
  { id: 14, name: "YELLOW" },
  { id: 15, name: "WHITE" },
];

export const MOTIONS = ["flicker", "spin", "pulse", "drift", "turn", "breathe", "rise", "rain"];

const STAR_SUBJECTS = [
  "lamp", "coal", "eye", "twin-eye", "spark", "ember", "wick", "manna",
  "dew", "star", "cluster", "flame", "watch", "mote", "cinder", "gleam",
  "taper", "oil-drop", "grain", "hail", "incense-spark", "mustard", "pearl", "mite",
];

const STAR_VERSES = [
  "Genesis 15:5", "Genesis 22:17", "Deuteronomy 4:19", "Judges 5:20",
  "Job 38:7", "Psalm 8:3", "Psalm 19:1", "Psalm 147:4",
  "Isaiah 40:26", "Daniel 12:3", "Matthew 2:2", "1 Corinthians 15:41",
];

const VESSEL_SUBJECTS = [
  "bush", "sword", "rod", "altar", "lampstand", "ark", "trumpet", "scroll",
  "bowl", "censer", "laver", "horn", "staff", "tablets", "jar", "yoke",
  "plow", "net", "ephod", "showbread", "pitcher", "millstone", "tent-peg", "cruse",
  "ram-horn", "bronze-serpent", "pot", "snuffers", "tongs", "mercy-seat",
];

const VESSEL_VERSES = [
  "Exodus 3:2", "Genesis 3:24", "Exodus 4:2", "Exodus 27:1",
  "Exodus 25:31", "Exodus 25:10", "Joshua 6:4", "Ezekiel 2:9",
  "Revelation 16:1", "Revelation 8:3", "Exodus 30:18", "1 Samuel 16:13",
  "Numbers 17:8", "Exodus 32:15", "1 Kings 17:12", "Matthew 11:29",
  "Luke 9:62", "Matthew 13:47", "Exodus 28:4", "Exodus 25:30",
  "Judges 7:16", "Matthew 18:6", "Judges 4:21", "1 Kings 17:16",
  "Leviticus 25:9", "Numbers 21:9", "2 Kings 4:2", "Exodus 25:38",
  "Isaiah 6:6", "Exodus 25:17",
];

const LIVING_SUBJECTS = [
  "ophanim", "ophanim-inner", "seraph", "seraph-covered", "cherub-man",
  "cherub-lion", "cherub-ox", "cherub-eagle", "tetramorph", "full-of-eyes",
  "four-wings", "six-wings", "calf-feet", "straight-leg", "living-rev4",
  "wheel-rim", "cherub-fire", "seraph-coal",
];

const LIVING_VERSES = [
  "Ezekiel 1:16", "Ezekiel 1:18", "Ezekiel 1:10", "Ezekiel 10:12",
  "Isaiah 6:2", "Isaiah 6:3", "Revelation 4:6", "Revelation 4:8",
  "Genesis 3:24", "Exodus 25:20", "Ezekiel 1:7", "Ezekiel 1:9",
];

const THRONE_SUBJECTS = [
  "rainbow-throne", "merkabah", "seven-lamps", "sapphire-pavement",
  "chariot-fire", "seat-of-glory", "lightning-throne", "crystal-before",
  "empty-seat", "wheel-throne", "cloud-throne", "voice-from-throne",
];

const THRONE_VERSES = [
  "Revelation 4:3", "Ezekiel 1:26", "Revelation 4:5", "Exodus 24:10",
  "2 Kings 2:11", "Isaiah 6:1", "Revelation 4:5", "Revelation 4:6",
  "Revelation 4:4", "Ezekiel 10:1", "Psalm 97:2", "Revelation 19:5",
];

const UNUTTERABLE = [
  { subject: "gate-judah", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-issachar", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-zebulun", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-reuben", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-simeon", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-gad", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-ephraim", verse: "Ezekiel 48:32", motion: "pulse" },
  { subject: "gate-manasseh", verse: "Ezekiel 48:32", motion: "pulse" },
  { subject: "gate-benjamin", verse: "Revelation 21:12", motion: "pulse" },
  { subject: "gate-dan", verse: "Ezekiel 48:32", motion: "pulse" },
  { subject: "gate-asher", verse: "Revelation 21:13", motion: "pulse" },
  { subject: "gate-naphtali", verse: "Revelation 21:13", motion: "pulse" },
  { subject: "lamb-as-slain", verse: "Revelation 5:6", motion: "breathe" },
  { subject: "silence-in-heaven", verse: "Revelation 8:1", motion: "hush" },
  { subject: "still-small-voice", verse: "1 Kings 19:12", motion: "drift" },
  { subject: "uncreated-light", verse: "John 1:5", motion: "pulse" },
  { subject: "rolled-stone", verse: "Mark 16:4", motion: "turn" },
  { subject: "cloud-by-day", verse: "Exodus 13:21", motion: "drift" },
  { subject: "pillar-of-fire", verse: "Exodus 13:21", motion: "rise" },
  { subject: "torn-veil", verse: "Matthew 27:51", motion: "rain" },
  { subject: "river-of-life", verse: "Revelation 22:1", motion: "rain" },
  { subject: "no-more-sea", verse: "Revelation 21:1", motion: "hush" },
];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function combos(subjects, verses, motions) {
  const out = [];
  for (const subject of subjects) {
    for (const verse of verses) {
      for (const motion of motions) {
        for (const accent of ACCENTS) {
          out.push({ subject, verse, motion, accent });
        }
      }
    }
  }
  return out;
}

export function dnaOf(t) {
  return [t.choir, t.subject, t.verse, t.motion, t.accent.name, t.variant].join("|");
}

export function buildTraits() {
  const rng = mulberry32(0x483054);
  const rows = [];

  function take(choir, pool, count) {
    const picked = shuffle(pool, rng);
    const seen = new Set();
    for (const p of picked) {
      if (rows.filter((r) => r.choir === choir).length >= count) break;
      const t = {
        choir,
        choirName: CHOIR[choir].name,
        subject: p.subject,
        verse: p.verse,
        motion: p.motion,
        accent: p.accent,
        variant: 0,
      };
      const d = dnaOf(t);
      if (seen.has(d)) continue;
      seen.add(d);
      rows.push(t);
    }
    const n = rows.filter((r) => r.choir === choir).length;
    if (n !== count) throw new Error(`choir ${choir} filled ${n} != ${count}`);
  }

  take("stars", combos(STAR_SUBJECTS, STAR_VERSES, MOTIONS), 111);
  take("vessels", combos(VESSEL_SUBJECTS, VESSEL_VERSES, MOTIONS), 89);
  take("living", combos(LIVING_SUBJECTS, LIVING_VERSES, MOTIONS), 67);
  take("thrones", combos(THRONE_SUBJECTS, THRONE_VERSES, MOTIONS), 44);

  const uSeen = new Set();
  for (let i = 0; i < UNUTTERABLE.length; i++) {
    const u = UNUTTERABLE[i];
    if (uSeen.has(u.subject)) throw new Error(`unutterable subject repeats: ${u.subject}`);
    uSeen.add(u.subject);
    rows.push({
      choir: "unutterable",
      choirName: CHOIR.unutterable.name,
      subject: u.subject,
      verse: u.verse,
      motion: u.motion,
      accent: ACCENTS[i % ACCENTS.length],
      variant: 0,
    });
  }

  if (rows.length !== 333) throw new Error(`expected 333, got ${rows.length}`);

  const dnas = new Set();
  rows.forEach((t, i) => {
    t.id = i + 1;
    t.seed = (Math.floor(rng() * 0xffffffff) ^ (t.id * 2654435761)) >>> 0;
    const d = dnaOf(t);
    if (dnas.has(d)) throw new Error(`dna collision ${d}`);
    dnas.add(d);
  });

  return rows;
}
