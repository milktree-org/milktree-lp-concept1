/**
 * Seedance 2.0 cinematic ads — Higgsfield CLI
 *
 * WORKING PATTERN (from hero-bg Seedance job 27380488):
 *   • 5–9 portfolio refs via repeated --image (NOT --start-image)
 *   • Slow push-in prompt (no aggressive "sizzle reel" language)
 *   • 1080p, std mode, 12–14s, 9:16 for Stories
 *
 * IP FILTER: Raw client logos often trigger `ip_detected`. If that happens,
 * run with --composite to build GPT Image 2 keyframes first (cached in refs/).
 *
 * Credits: ~108 per 12s 1080p high / ~7 per GPT composite
 *
 *   npm run generate:cinematic
 *   npm run generate:cinematic -- flash-cut
 *   npm run generate:cinematic -- --composite
 *   npm run generate:cinematic -- --composite flash-cut
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const heroDir = path.join(root, "public/work/hero");
const workDir = path.join(root, "public/work");
const refDir = path.join(root, "public/ads/cinematic/refs");
const outDir = path.join(root, "public/ads/cinematic/story");

const useComposite = process.argv.includes("--composite");
const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const onlyId = args[0];

const HERO_MOTION_PROMPT =
  "Extremely slow, smooth cinematic push-in toward the artwork, almost imperceptible. Subtle parallax as foreground elements drift a fraction faster than the background. Soft, even studio light with a gentle light sweep passing once across the surface. Premium, calm, high-end agency mood. Locked, steady camera intent, shallow depth of field, subtle film grain, luxury commercial grade. No added text or logos.";

/** @type {Array<{ id: string; title: string; images: string[]; compositePrompt: string; duration: number }>} */
const ADS = [
  {
    id: "flash-cut",
    title: "Flash Cut",
    images: ["hampshire-billboard.webp", "eazyphone-cards.webp", "mint-keys.webp", "flexibuy.webp", "eazyphone-busstop.webp", "melt-pizza.webp"],
    compositePrompt:
      "One cinematic vertical 9:16 keyframe fusing out-of-home, identity, campaign and packaging from references. Black canvas, single yellow accent, photoreal, abstract all readable logos.",
    duration: 12,
  },
  {
    id: "problem-proof",
    title: "Problem → Proof",
    images: ["mint-broker.webp", "powerforce-turbine.webp", "ejw-builttolast.webp", "mailmans.webp", "alltrad-swatches.webp"],
    compositePrompt:
      "Vertical studio proof keyframe merging brand portrait, industrial campaign, signage and swatches from references. Premium, photoreal, fictional marks only.",
    duration: 13,
  },
  {
    id: "stats-strike",
    title: "Stats Strike",
    images: ["hampshire-lifestyle.webp", "powerforce-card.webp", "eazyphone-lanyards.webp", "mint-billboard.webp"],
    compositePrompt:
      "Vertical case-study composite: lifestyle, print, collateral, billboard from references. Cohesive agency board, black and yellow restraint.",
    duration: 12,
  },
  {
    id: "ooh-power",
    title: "OOH Power",
    images: ["hampshire-billboard.webp", "alltrad-billboard.webp", "eazyphone-busstop.webp", "mint-billboard.webp", "salesprout-billboard.webp"],
    compositePrompt:
      "Vertical out-of-home composite merging highway, rooftop, bus shelter and street posters from references. Urban dusk, photoreal, no legible copy.",
    duration: 14,
  },
  {
    id: "full-stack",
    title: "Full Stack",
    images: ["eazyphone-cards.webp", "alltrad-card.webp", "melt-pizza.webp", "flexibuy.webp", "hampshire-billboard.webp"],
    compositePrompt:
      "Vertical touchpoint composite: identity, print, packaging, campaign, OOH from references. One partnership story, luxury art direction.",
    duration: 15,
  },
];

const ads = onlyId ? ADS.filter((a) => a.id === onlyId) : ADS;
if (onlyId && ads.length === 0) throw new Error(`Unknown ad id: ${onlyId}`);

fs.mkdirSync(refDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

for (const ad of ads) {
  console.log(`\n▸ ${ad.title}`);
  let startImage = null;
  const imagePaths = ad.images.map((f) => resolveWorkImage(f));

  if (useComposite || process.argv.includes("--prep-only")) {
    const compositePath = path.join(refDir, `${ad.id}-composite.png`);
    if (!fs.existsSync(compositePath)) {
      console.log("  GPT Image 2 composite…");
      const gptArgs = [
        "generate", "create", "gpt_image_2",
        "--prompt", ad.compositePrompt,
        "--aspect_ratio", "9:16", "--quality", "high", "--resolution", "2k",
        "--wait", "--wait-timeout", "15m", "--json",
      ];
      for (const p of imagePaths) gptArgs.push("--image", p);
      const gptJob = JSON.parse(execFileSync("higgsfield", gptArgs, { encoding: "utf8" }))[0];
      if (gptJob.status !== "completed" || !gptJob.result_url) {
        throw new Error(`GPT failed: ${gptJob.status}`);
      }
      execFileSync("curl", ["-sL", gptJob.result_url, "-o", compositePath]);
      console.log(`  → refs/${ad.id}-composite.png`);
    }
    startImage = path.join(refDir, `${ad.id}-composite.png`);
    if (process.argv.includes("--prep-only")) continue;
  }

  console.log(`  Seedance 2.0 (${ad.duration}s 9:16 1080p)…`);
  const seedArgs = [
    "generate", "create", "seedance_2_0",
    "--prompt", startImage ? buildCompositeMotionPrompt(ad) : HERO_MOTION_PROMPT,
    "--duration", String(ad.duration),
    "--aspect_ratio", "9:16",
    "--resolution", "1080p",
    "--bitrate_mode", "high",
    "--mode", "std",
    "--genre", "drama",
    "--wait", "--wait-timeout", "25m", "--json",
  ];

  if (startImage) {
    seedArgs.push("--start-image", startImage);
  } else {
    for (const p of imagePaths) seedArgs.push("--image", p);
  }

  try {
    const job = JSON.parse(execFileSync("higgsfield", seedArgs, { encoding: "utf8" }))[0];
    if (job.status !== "completed" || !job.result_url) {
      console.warn(`  ⚠ ${job.status} — retry with: npm run generate:cinematic -- --composite ${ad.id}`);
      continue;
    }
    const outMp4 = path.join(outDir, `${ad.id}.mp4`);
    execFileSync("curl", ["-sL", job.result_url, "-o", outMp4]);
    console.log(`  → cinematic/story/${ad.id}.mp4 (${fmt(fs.statSync(outMp4).size)})`);
  } catch (e) {
    if (String(e.stderr || e.message).includes("not_enough_credits")) {
      console.error("\n✗ Not enough credits (~108 per 12s ad). Top up at higgsfield.ai");
      console.error("  Keyframes cached in public/ads/cinematic/refs/ if you used --composite");
      process.exit(1);
    }
    throw e;
  }
}

console.log("\nDone.");

function resolveWorkImage(file) {
  const hero = path.join(heroDir, file);
  if (fs.existsSync(hero)) return hero;
  const png = path.join(workDir, file.replace(/\.webp$/, ".png"));
  if (fs.existsSync(png)) return png;
  throw new Error(`Missing work image: ${file}`);
}

function buildCompositeMotionPrompt(ad) {
  return `${HERO_MOTION_PROMPT} Multi-shot agency montage energy for ${ad.title.toLowerCase()}.`;
}

function fmt(bytes) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
