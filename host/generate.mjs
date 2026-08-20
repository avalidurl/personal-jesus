import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTraits, dnaOf } from "./traits.mjs";
import { FRAMES, PAL, renderFrame } from "./render.mjs";
import gifenc from "gifenc";
const { GIFEncoder } = gifenc;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out", "host");

function meta(t, sha, file) {
  return {
    name: `THE HOST #${t.id}`,
    description: `A vision from the Temple. ${t.choirName}. ${t.verse}. VGA-16, AfterEgypt, Personal Jesus.`,
    image: `ipfs://REPLACE_GIF_DIR/${file}`,
    animation_url: `ipfs://REPLACE_GIF_DIR/${file}`,
    attributes: [
      { trait_type: "Choir", value: t.choirName },
      { trait_type: "Subject", value: t.subject },
      { trait_type: "Verse", value: t.verse },
      { trait_type: "Motion", value: t.motion },
      { trait_type: "Accent", value: t.accent.name },
    ],
    compiler: "personal-jesus/host",
    sha256: sha,
  };
}

const traits = buildTraits();
const hashes = new Set();
const dnas = new Set();
const manifest = [];

await mkdir(join(outDir, "gifs"), { recursive: true });
await mkdir(join(outDir, "meta"), { recursive: true });

for (const t of traits) {
  const d = dnaOf(t);
  if (dnas.has(d)) throw new Error(`dna collision ${d}`);
  dnas.add(d);

  let seed = t.seed;
  let gif;
  let sha;
  for (let attempt = 0; attempt < 8; attempt++) {
    t.seed = (seed + attempt * 997) >>> 0;
    const frames = [];
    for (let f = 0; f < FRAMES; f++) frames.push(renderFrame(t, f));
    const enc = GIFEncoder();
    frames.forEach((frame, i) => {
      enc.writeFrame(frame, 128, 128, {
        palette: i === 0 ? PAL : undefined,
        delay: 120,
        repeat: 0,
      });
    });
    enc.finish();
    gif = Buffer.from(enc.bytes());
    sha = createHash("sha256").update(gif).digest("hex");
    if (!hashes.has(sha)) break;
  }
  if (hashes.has(sha)) throw new Error(`gif hash collision id ${t.id}`);
  hashes.add(sha);

  const file = `${String(t.id).padStart(3, "0")}.gif`;
  await writeFile(join(outDir, "gifs", file), gif);
  await writeFile(join(outDir, "meta", `${t.id}.json`), JSON.stringify(meta(t, sha, file), null, 2) + "\n");
  manifest.push({
    id: t.id,
    choir: t.choirName,
    subject: t.subject,
    verse: t.verse,
    motion: t.motion,
    accent: t.accent.name,
    seed: t.seed,
    dna: d,
    sha256: sha,
    file,
  });
  if (t.id % 37 === 0 || t.id === 333) process.stderr.write(`rendered ${t.id}/333\n`);
}

await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(
  join(outDir, "collection.json"),
  JSON.stringify(
    {
      name: "THE HOST",
      symbol: "HOST",
      description: "333 visions. VGA-16. AfterEgypt. Personal Jesus. 5% creator earnings on secondaries that honor EIP-2981.",
      seller_fee_basis_points: 500,
      fee_recipient: "REPLACE_ROYALTY_RECEIVER",
      image: "ipfs://REPLACE_GIF_DIR/001.gif",
    },
    null,
    2,
  ) + "\n",
);

process.stderr.write(`ok 333 unique gifs + metadata → ${outDir}\n`);
