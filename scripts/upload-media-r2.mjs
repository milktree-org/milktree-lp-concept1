/**
 * Upload video assets to Cloudflare R2 (S3-compatible).
 *
 * Setup (one-time):
 * 1. Cloudflare Dashboard → R2 → Create bucket (e.g. milktree-media)
 * 2. R2 → Manage R2 API Tokens → Create token (Object Read & Write)
 * 3. Enable public access: bucket Settings → Public access → Allow, or attach custom domain
 * 4. Copy .env.example → .env.local and fill R2_* vars + NEXT_PUBLIC_MEDIA_CDN_URL
 *
 * Usage:
 *   npm run upload:media              # upload all tracked video paths
 *   npm run upload:media -- --dry-run # list files without uploading
 *   npm run upload:media -- --all     # include gitignored masters (hero source, cinematic)
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const root = path.resolve(import.meta.dirname, "..");

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "milktree-media";

const dryRun = process.argv.includes("--dry-run");
const includeAll = process.argv.includes("--all");

/** Paths relative to public/ — mirrors site URL structure on the CDN. */
const VIDEO_PATHS = [
  "work/hero-bg.mp4",
  "work/hero-poster.webp",
  "ads/square/flash-cut.mp4",
  "ads/square/full-stack.mp4",
  "ads/square/ooh-power.mp4",
  "ads/square/problem-proof.mp4",
  "ads/square/stats-strike.mp4",
  "ads/story/flash-cut.mp4",
  "ads/story/full-stack.mp4",
  "ads/story/ooh-power.mp4",
  "ads/story/problem-proof.mp4",
  "ads/story/stats-strike.mp4",
  "ads/cinematic/story/abstract-safe.mp4",
  "ads/cinematic/story/swatches-reel.mp4",
];

const OPTIONAL_MASTERS = [
  {
    local: "work/hero-bg-video/hf_20260616_025354_27380488-9ae8-4c42-a959-62db9fe8c2de.mp4",
    key: "work/hero-bg-master.mp4",
  },
  {
    local: "ads/cinematic/story/flash-cut.mp4",
    key: "ads/cinematic/story/flash-cut.mp4",
  },
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function contentType(filePath) {
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function collectFiles() {
  const entries = VIDEO_PATHS.map((rel) => ({ rel, key: rel.replace(/\\/g, "/") }));

  if (includeAll) {
    for (const master of OPTIONAL_MASTERS) {
      entries.push({ rel: master.local, key: master.key });
    }
  }

  const files = [];
  for (const { rel, key } of entries) {
    const abs = path.join(root, "public", rel);
    if (!existsSync(abs)) {
      console.warn(`  skip (missing): public/${rel}`);
      continue;
    }
    files.push({ rel, abs, key });
  }
  return files;
}

async function objectExists(client, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(client, { abs, key, rel }) {
  const size = statSync(abs).size;
  const type = contentType(abs);

  if (dryRun) {
    console.log(`  would upload public/${rel} → s3://${bucket}/${key} (${fmt(size)})`);
    return;
  }

  const exists = await objectExists(client, key);
  if (exists) {
    console.log(`  skip (exists): ${key}`);
    return;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(abs),
      ContentType: type,
      CacheControl: type.startsWith("video/") ? "public, max-age=31536000, immutable" : "public, max-age=86400",
    }),
  );
  console.log(`  uploaded: ${key} (${fmt(size)})`);
}

async function main() {
  const files = collectFiles();
  if (files.length === 0) {
    console.error("No video files found to upload.");
    process.exit(1);
  }

  console.log(`\nR2 upload → bucket: ${bucket}${dryRun ? " (dry run)" : ""}\n`);

  if (dryRun) {
    for (const file of files) await uploadFile(null, file);
    console.log(`\n${files.length} file(s). Set NEXT_PUBLIC_MEDIA_CDN_URL in Vercel after enabling public access.\n`);
    return;
  }

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error(
      "Missing R2 credentials in .env.local:\n" +
        "  R2_ACCESS_KEY_ID=...\n" +
        "  R2_SECRET_ACCESS_KEY=...\n\n" +
        "Create them: Cloudflare → R2 → Manage R2 API tokens → Create API token\n" +
        "(Object Read & Write, bucket: milktree-media)\n",
    );
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  for (const file of files) {
    await uploadFile(client, file);
  }

  const cdn = process.env.NEXT_PUBLIC_MEDIA_CDN_URL ?? "(set NEXT_PUBLIC_MEDIA_CDN_URL)";
  console.log(`\nDone. Add to Vercel:\n  NEXT_PUBLIC_MEDIA_CDN_URL=${cdn}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
