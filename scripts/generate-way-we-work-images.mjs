/**
 * Regenerate "Way we work" panel mockups via Higgsfield CLI (gpt_image_2).
 *
 * Prerequisites:
 *   npm i -g @higgsfield/cli   (or use existing `higgsfield` on PATH)
 *   higgsfield auth login
 *
 * Usage:
 *   node scripts/generate-way-we-work-images.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public/work/way-we-work");

const PROMPT_BASE =
  "Premium dark-mode SaaS product UI screenshot, creative agency dashboard, true black background, warm near-black cards, electric yellow #FFDC04 accent used sparingly on one element only, heavily rounded 36px corners, clean modern sans-serif typography, subtle rgba white borders, Framer-quality product design, photorealistic screen capture, no real brand logos, fictional UI";

const PANELS = [
  {
    file: "01-queue",
    prompt: `${PROMPT_BASE}. Design request queue titled Your queue with four task rows and status pills: Q3 launch deck In progress yellow badge, Instagram set June In review, Pricing page redesign Delivered, Cold email templates Queued. Window chrome dots top right.`,
  },
  {
    file: "02-library",
    prompt: `${PROMPT_BASE}. Brand asset library titled Brand library, 2x3 grid of rounded tiles: Logo suite, Colour with yellow swatch, Type, Templates, Icons, Guidelines. Each tile has subtle icon placeholder.`,
  },
  {
    file: "03-speed",
    prompt: `${PROMPT_BASE}. Turnaround dashboard titled Turnaround, large bold 48h in electric yellow, subtitle Average delivery, three numbered steps vertically: Brief received, Senior designer assigned, Delivered and in review.`,
  },
  {
    file: "04-review",
    prompt: `${PROMPT_BASE}. Design review screen titled In review, large rounded preview area with abstract dark gradient mockup, comment thread with avatar initials JD, comment text Love it can we make the logo 10 percent larger, yellow Approve pill button and muted Comment button.`,
  },
];

fs.mkdirSync(outDir, { recursive: true });

for (const panel of PANELS) {
  console.log(`Generating ${panel.file}…`);
  const raw = execFileSync(
    "higgsfield",
    [
      "generate",
      "create",
      "gpt_image_2",
      "--prompt",
      panel.prompt,
      "--aspect_ratio",
      "3:4",
      "--quality",
      "high",
      "--resolution",
      "2k",
      "--wait",
      "--wait-timeout",
      "10m",
      "--json",
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );

  const [{ result_url: url }] = JSON.parse(raw);
  const pngPath = path.join(outDir, `${panel.file}.png`);
  const webpPath = path.join(outDir, `${panel.file}.webp`);

  execFileSync("curl", ["-sL", url, "-o", pngPath]);
  await sharp(pngPath)
    .resize({ width: 920, withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toFile(webpPath);
  fs.unlinkSync(pngPath);

  console.log(`  → ${panel.file}.webp`);
}

console.log("Done.");
