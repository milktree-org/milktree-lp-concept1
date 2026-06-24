/**
 * Apply CORS rules to the R2 bucket so browsers can load video assets.
 * Run once after creating the bucket: npm run setup:r2-cors
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const root = path.resolve(import.meta.dirname, "..");

loadEnvFile(path.join(root, ".env.local"));

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "milktree-media";

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

async function main() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error("Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to .env.local");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedHeaders: ["*"],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    }),
  );

  console.log(`CORS applied to bucket "${bucket}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
