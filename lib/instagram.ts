import fs from "node:fs";
import path from "node:path";
import type { InstagramFeed } from "@/lib/instagram-types";

const FEED_PATH = path.join(process.cwd(), "data/instagram-feed.json");

/** Load the synced Instagram feed written by `npm run sync:instagram`. */
export async function getInstagramFeed(): Promise<InstagramFeed> {
  const raw = fs.readFileSync(FEED_PATH, "utf8");
  return JSON.parse(raw) as InstagramFeed;
}
