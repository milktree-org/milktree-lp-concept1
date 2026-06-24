import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(import.meta.dirname, "..");
const workDir = path.join(root, "public/work");
const heroDir = path.join(workDir, "hero");
const sourceVideo = path.join(
  workDir,
  "hero-bg-video/hf_20260616_025354_27380488-9ae8-4c42-a959-62db9fe8c2de.mp4",
);
const outVideo = path.join(workDir, "hero-bg.mp4");
const outPoster = path.join(workDir, "hero-poster.webp");

fs.mkdirSync(heroDir, { recursive: true });

const workImages = fs
  .readdirSync(workDir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort();

console.log(`Optimizing ${workImages.length} work images…`);

for (const file of workImages) {
  const src = path.join(workDir, file);
  const base = path.basename(file, path.extname(file));
  const dest = path.join(heroDir, `${base}.webp`);

  await sharp(src)
    .rotate()
    .resize({ height: 800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(dest);

  const inSize = fs.statSync(src).size;
  const outSize = fs.statSync(dest).size;
  console.log(`  ${file} → hero/${base}.webp (${fmt(inSize)} → ${fmt(outSize)})`);
}

if (!ffmpegPath) {
  throw new Error("ffmpeg-static binary not found");
}

console.log("\nCompressing hero background video…");

execFileSync(
  ffmpegPath,
  [
    "-y",
    "-i",
    sourceVideo,
    "-vf",
    "scale=1280:-2",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    "-t",
    "12",
    outVideo,
  ],
  { stdio: "inherit" },
);

const posterPng = path.join(workDir, "hero-poster.png");
execFileSync(
  ffmpegPath,
  ["-y", "-i", outVideo, "-vframes", "1", posterPng],
  { stdio: "pipe" },
);
await sharp(posterPng).webp({ quality: 80 }).toFile(outPoster);
fs.unlinkSync(posterPng);

const vidIn = fs.statSync(sourceVideo).size;
const vidOut = fs.statSync(outVideo).size;
console.log(`\nVideo: ${fmt(vidIn)} → hero-bg.mp4 (${fmt(vidOut)})`);
console.log(`Poster: hero-poster.webp (${fmt(fs.statSync(outPoster).size)})`);

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
