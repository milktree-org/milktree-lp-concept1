/**
 * Render social ad slideshows (9:16 story + 1:1 square) from lib/ads.json.
 *
 * Usage: npm run generate:ads
 *        npm run generate:ads -- flash-cut   (single ad)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import adsData from "../lib/ads.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
const adsDir = path.join(root, "public/ads");
const tmpDir = path.join(root, ".ad-render");
const soundsDir = path.join(adsDir, "sounds");
const fontBlack = path.join(root, "public/fonts/Satoshi-Black.woff2");
const fontBold = path.join(root, "public/fonts/Satoshi-Bold.woff2");
const fontMedium = path.join(root, "public/fonts/Satoshi-Medium.woff2");

const FORMATS = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

const FPS = 30;
const XFADE = 0.06;

if (!ffmpegPath) throw new Error("ffmpeg-static not found");

const onlyId = process.argv[2];
const ads = onlyId ? adsData.ads.filter((a) => a.id === onlyId) : adsData.ads;
if (onlyId && ads.length === 0) {
  throw new Error(`Unknown ad id: ${onlyId}`);
}

fs.mkdirSync(soundsDir, { recursive: true });
ensureSounds();

for (const ad of ads) {
  for (const [format, dims] of Object.entries(FORMATS)) {
    console.log(`\n▸ ${ad.title} (${format})`);
    await renderAd(ad, format, dims);
  }
}

console.log("\nDone.");

async function renderAd(ad, format, { width, height }) {
  const outDir = path.join(adsDir, format);
  const workDir = path.join(tmpDir, ad.id, format);
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });

  const segments = [];
  let timeline = 0;

  for (let i = 0; i < ad.slides.length; i++) {
    const slide = ad.slides[i];
    const png = path.join(workDir, `slide-${String(i).padStart(2, "0")}.png`);
    await renderSlide(slide, png, width, height);
    const seg = path.join(workDir, `seg-${String(i).padStart(2, "0")}.mp4`);
    renderSegment(png, seg, slide.duration, width, height, i % 2 === 0 ? "in" : "out");
    segments.push({ path: seg, duration: slide.duration, sfx: slide.sfx, at: timeline });
    timeline += slide.duration - (i > 0 ? XFADE : 0);
  }

  const silentVideo = path.join(workDir, "video-silent.mp4");
  concatSegments(segments.map((s) => s.path), silentVideo, width, height);

  const audio = path.join(workDir, "audio.aac");
  buildAudioTrack(segments, audio, timeline + 0.5);

  const outMp4 = path.join(outDir, `${ad.id}.mp4`);
  execFileSync(
    ffmpegPath,
    ["-y", "-i", silentVideo, "-i", audio, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outMp4],
    { stdio: "pipe" },
  );

  const posterPng = path.join(workDir, "poster.png");
  execFileSync(ffmpegPath, ["-y", "-i", outMp4, "-vframes", "1", posterPng], { stdio: "pipe" });
  await sharp(posterPng).webp({ quality: 82 }).toFile(path.join(outDir, `${ad.id}-poster.webp`));

  const size = fs.statSync(outMp4).size;
  console.log(`  → ${format}/${ad.id}.mp4 (${fmt(size)}, ${timeline.toFixed(1)}s)`);
}

async function renderSlide(slide, outPath, width, height) {
  const fontStyle = `
    @font-face { font-family: 'SatoshiBlack'; src: url('file://${fontBlack}') format('woff2'); font-weight: 900; }
    @font-face { font-family: 'SatoshiBold'; src: url('file://${fontBold}') format('woff2'); font-weight: 700; }
    @font-face { font-family: 'SatoshiMed'; src: url('file://${fontMedium}') format('woff2'); font-weight: 500; }
  `;

  if (slide.kind === "image" || slide.kind === "stat") {
    const src = path.join(root, "public", slide.src.replace(/^\//, ""));
    const resized = await sharp(src)
      .rotate()
      .resize(width, height, { fit: "cover", position: "centre" })
      .modulate({ brightness: slide.kind === "stat" ? 0.55 : 0.92 })
      .png()
      .toBuffer();

    const label = slide.kind === "stat" ? slide.label : slide.label;
    const overlay =
      slide.kind === "stat"
        ? statOverlay(fontStyle, width, height, slide.value, slide.label)
        : imageOverlay(fontStyle, width, height, label);

    await sharp(resized)
      .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
      .png()
      .toFile(outPath);
    return;
  }

  let svg = "";
  if (slide.kind === "hook" || slide.kind === "tagline") {
    svg = textSlide(fontStyle, width, height, slide.headline, slide.sub, slide.accentWord, slide.kind === "tagline");
  } else if (slide.kind === "cta") {
    svg = ctaSlide(fontStyle, width, height, slide.headline, slide.sub);
  }

  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

function textSlide(fontStyle, w, h, headline, sub, accentWord, compact) {
  const size = compact ? Math.round(w * 0.14) : Math.round(w * 0.115);
  const subSize = Math.round(w * 0.055);
  let text = escapeXml(headline);
  if (accentWord) {
    const re = new RegExp(`(${escapeRegex(accentWord)})`, "i");
    text = escapeXml(headline).replace(re, `<tspan fill="#FFEE02">$1</tspan>`);
  }
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <style>${fontStyle}</style>
    <rect width="100%" height="100%" fill="#000000"/>
    <rect x="${w * 0.08}" y="${h * 0.42}" width="${w * 0.08}" height="4" fill="#FFEE02"/>
    <text x="${w / 2}" y="${sub ? h * 0.46 : h * 0.5}" text-anchor="middle" fill="#FFFFFF"
      font-family="SatoshiBlack" font-size="${size}" font-weight="900" letter-spacing="-2">${text}</text>
    ${sub ? `<text x="${w / 2}" y="${h * 0.54}" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-family="SatoshiMed" font-size="${subSize}">${escapeXml(sub)}</text>` : ""}
  </svg>`;
}

function ctaSlide(fontStyle, w, h, headline, sub) {
  const headSize = Math.round(w * 0.1);
  const subSize = Math.round(w * 0.042);
  const pillW = Math.min(w * 0.78, sub.length * 14 + 80);
  const pillH = Math.round(w * 0.1);
  const pillX = (w - pillW) / 2;
  const pillY = h * 0.58;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <style>${fontStyle}</style>
    <rect width="100%" height="100%" fill="#000000"/>
    <text x="${w / 2}" y="${h * 0.38}" text-anchor="middle" fill="#FFFFFF" font-family="SatoshiBlack" font-size="${headSize}" font-weight="900">${escapeXml(headline)}</text>
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="#FFEE02"/>
    <text x="${w / 2}" y="${pillY + pillH * 0.68}" text-anchor="middle" fill="#000000" font-family="SatoshiBold" font-size="${subSize}" font-weight="700">${escapeXml(sub)}</text>
    <text x="${w / 2}" y="${h * 0.82}" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="SatoshiMed" font-size="${Math.round(w * 0.028)}">milktree.agency</text>
  </svg>`;
}

function statOverlay(fontStyle, w, h, value, label) {
  const valSize = Math.round(w * 0.22);
  const labSize = Math.round(w * 0.055);
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <style>${fontStyle}</style>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.75)"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="${w / 2}" y="${h * 0.48}" text-anchor="middle" fill="#FFEE02" font-family="SatoshiBlack" font-size="${valSize}" font-weight="900">${escapeXml(value)}</text>
    <text x="${w / 2}" y="${h * 0.56}" text-anchor="middle" fill="#FFFFFF" font-family="SatoshiBold" font-size="${labSize}">${escapeXml(label)}</text>
  </svg>`;
}

function imageOverlay(fontStyle, w, h, label) {
  if (!label) {
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0.6" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.55)"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
  }
  const labSize = Math.round(w * 0.042);
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <style>${fontStyle}</style>
    <defs><linearGradient id="g" x1="0" y1="0.55" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.8)"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="${w * 0.08}" y="${h * 0.86}" width="${w * 0.06}" height="3" fill="#FFEE02"/>
    <text x="${w * 0.08}" y="${h * 0.915}" fill="#FFFFFF" font-family="SatoshiBold" font-size="${labSize}">${escapeXml(label)}</text>
  </svg>`;
}

function renderSegment(png, out, duration, width, height, motion) {
  const frames = Math.max(1, Math.round(duration * FPS));
  const zoomExpr =
    motion === "in"
      ? `if(lte(zoom,1.0),1.08-0.08*on/${frames},1.08)`
      : `if(lte(zoom,1.0),1.0+0.08*on/${frames},1.08)`;
  execFileSync(
    ffmpegPath,
    [
      "-y",
      "-loop",
      "1",
      "-i",
      png,
      "-vf",
      `zoompan=z='${zoomExpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${FPS},format=yuv420p`,
      "-t",
      String(duration),
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      out,
    ],
    { stdio: "pipe" },
  );
}

function concatSegments(paths, out, width, height) {
  if (paths.length === 1) {
    fs.copyFileSync(paths[0], out);
    return;
  }

  let filter = `[0:v]fps=${FPS},format=yuv420p[v0]`;
  let last = "v0";
  let offset = 0;

  for (let i = 1; i < paths.length; i++) {
    filter += `;[${i}:v]fps=${FPS},format=yuv420p[v${i}]`;
  }

  offset = getDuration(paths[0]) - XFADE;
  for (let i = 1; i < paths.length; i++) {
    const outLabel = i === paths.length - 1 ? "vout" : `vx${i}`;
    filter += `;[${last}][v${i}]xfade=transition=fade:duration=${XFADE}:offset=${offset.toFixed(3)}[${outLabel}]`;
    last = outLabel;
    if (i < paths.length - 1) offset += getDuration(paths[i]) - XFADE;
  }

  const args = ["-y"];
  for (const p of paths) args.push("-i", p);
  args.push("-filter_complex", filter, "-map", "[vout]", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out);
  execFileSync(ffmpegPath, args, { stdio: "pipe" });
}

function buildAudioTrack(segments, out, totalDuration) {
  const inputs = [];
  const delays = [];
  let idx = 0;

  for (const seg of segments) {
    if (!seg.sfx) continue;
    const sfx = path.join(soundsDir, `${seg.sfx}.wav`);
    inputs.push("-i", sfx);
    delays.push(`[${idx}:a]adelay=${Math.round(seg.at * 1000)}|${Math.round(seg.at * 1000)},volume=0.85[a${idx}]`);
    idx++;
  }

  if (idx === 0) {
    execFileSync(ffmpegPath, ["-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", String(totalDuration), "-c:a", "aac", out], { stdio: "pipe" });
    return;
  }

  const mix = `${delays.join(";")};${Array.from({ length: idx }, (_, i) => `[a${i}]`).join("")}amix=inputs=${idx}:dropout_transition=0:normalize=0[aout]`;
  const args = ["-y", ...inputs, "-filter_complex", mix, "-map", "[aout]", "-t", String(totalDuration), "-c:a", "aac", "-b:a", "192k", out];
  execFileSync(ffmpegPath, args, { stdio: "pipe" });
}

function ensureSounds() {
  const defs = {
    hit: "sine=frequency=90:duration=0.18,afade=t=out:st=0.08:d=0.1,volume=2.5",
    tick: "sine=frequency=1200:duration=0.04,volume=1.2",
    whoosh: "anoisesrc=d=0.35:c=pink,volume=0.35,afade=t=in:st=0:d=0.08,afade=t=out:st=0.2:d=0.15,lowpass=f=900",
    rise: "sine=frequency=220:duration=0.55,asetrate=66000,aresample=48000,afade=t=out:st=0.35:d=0.2,volume=1.3",
  };

  for (const [name, filter] of Object.entries(defs)) {
    const out = path.join(soundsDir, `${name}.wav`);
    if (fs.existsSync(out)) continue;
    execFileSync(ffmpegPath, ["-y", "-f", "lavfi", "-i", filter, "-ar", "48000", "-ac", "1", out], { stdio: "pipe" });
  }
}

function getDuration(file) {
  try {
    execFileSync(ffmpegPath, ["-i", file, "-f", "null", "-"], { stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return 1;
}

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fmt(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
