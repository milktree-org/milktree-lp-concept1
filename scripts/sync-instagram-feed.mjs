#!/usr/bin/env node
/**
 * Syncs @milktreeagency Instagram feed:
 * - Fetches posts from the last 12 months
 * - Ranks by engagement (likes + comments)
 * - Keeps top 6, downloads images to /public/instagram
 * - Writes metadata to /data/instagram-feed.json
 *
 * Uses Instagram Graph API when INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID are set.
 * Otherwise falls back to Instagram's public profile endpoints (rate-limited).
 *
 * Run: npm run sync:instagram
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_PATH = path.join(ROOT, "data/instagram-feed.json");
const IMG_DIR = path.join(ROOT, "public/instagram");
const HANDLE = "milktreeagency";
const MONTHS = 12;
const TOP_N = 6;
const IG_APP_ID = "936619743392459";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const headers = {
  "x-ig-app-id": IG_APP_ID,
  "User-Agent": UA,
  Accept: "*/*",
  "Accept-Language": "en-GB,en;q=0.9",
  Referer: `https://www.instagram.com/${HANDLE}/`,
  Origin: "https://www.instagram.com",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

const cutoff = Date.now() - MONTHS * 30 * 24 * 60 * 60 * 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function engagement(likes, comments) {
  return (likes ?? 0) + (comments ?? 0);
}

function parseGraphNode(node) {
  const ts = new Date(node.timestamp).getTime();
  const likes = node.like_count ?? 0;
  const comments = node.comments_count ?? 0;
  return {
    shortcode: node.permalink?.split("/p/")[1]?.replace("/", "") ?? node.id,
    timestamp: new Date(ts).toISOString(),
    likes,
    comments,
    engagement: engagement(likes, comments),
    remoteImage: node.media_type === "VIDEO" ? node.thumbnail_url : node.media_url,
    permalink: node.permalink,
    caption: (node.caption ?? "").slice(0, 160),
    ts,
  };
}

function parseProfileEdge(node) {
  const ts = node.taken_at_timestamp * 1000;
  const likes = node.edge_liked_by?.count ?? 0;
  const comments = node.edge_media_to_comment?.count ?? 0;
  return {
    shortcode: node.shortcode,
    timestamp: new Date(ts).toISOString(),
    likes,
    comments,
    engagement: engagement(likes, comments),
    remoteImage: node.display_url,
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    caption: (node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "").slice(0, 160),
    ts,
  };
}

function parseFeedItem(item) {
  const ts =
    item.taken_at != null
      ? item.taken_at * 1000
      : item.device_timestamp > 1e12
        ? item.device_timestamp
        : item.device_timestamp * 1000;
  const likes = item.like_count ?? 0;
  const comments = item.comment_count ?? 0;
  let remoteImage = item.image_versions2?.candidates?.[0]?.url;
  if (!remoteImage && item.carousel_media?.[0]) {
    remoteImage = item.carousel_media[0].image_versions2?.candidates?.[0]?.url;
  }
  const code = item.code ?? item.shortcode;
  const caption =
    typeof item.caption === "object" ? (item.caption?.text ?? "") : (item.caption ?? "");
  return {
    shortcode: code,
    timestamp: new Date(ts).toISOString(),
    likes,
    comments,
    engagement: engagement(likes, comments),
    remoteImage,
    permalink: `https://www.instagram.com/p/${code}/`,
    caption: caption.slice(0, 160),
    ts,
  };
}

async function fetchJson(url, opts = {}, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...opts, headers: { ...headers, ...opts.headers } });
      if (res.ok) return res.json();
      if (attempt < retries && (res.status === 400 || res.status === 401 || res.status === 429)) {
        const wait = 1500 * (attempt + 1);
        console.warn(`  retry ${attempt + 1}/${retries} after HTTP ${res.status} (${wait}ms)`);
        await sleep(wait);
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt === retries) break;
      await sleep(1500 * (attempt + 1));
    }
  }

  return curlJson(url);
}

function curlJson(url) {
  const out = execFileSync(
    "curl",
    ["-sL", "-H", `x-ig-app-id: ${IG_APP_ID}`, "-H", `User-Agent: ${UA}`, url],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  return JSON.parse(out);
}

async function fetchViaGraphApi(token, userId) {
  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    "like_count",
    "comments_count",
  ].join(",");
  const posts = [];
  let url = `https://graph.facebook.com/v22.0/${userId}/media?fields=${fields}&limit=100&access_token=${token}`;

  while (url) {
    const data = await fetchJson(url);
    for (const node of data.data ?? []) {
      const post = parseGraphNode(node);
      if (post.ts < cutoff) continue;
      if (post.remoteImage) posts.push(post);
    }
    const oldest = (data.data ?? []).at(-1);
    if (oldest && new Date(oldest.timestamp).getTime() < cutoff) break;
    url = data.paging?.next ?? null;
    if (url) await sleep(200);
  }

  return { posts, source: "graph-api" };
}

async function fetchViaPublicApi() {
  const profile = await fetchJson(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`,
  );
  const user = profile.data.user;
  const userId = user.id;
  const followers = user.edge_followed_by.count;
  const posts = [];
  const seen = new Set();

  const add = (post) => {
    if (!post.shortcode || seen.has(post.shortcode) || !post.remoteImage) return;
    seen.add(post.shortcode);
    if (post.ts >= cutoff) posts.push(post);
  };

  for (const edge of user.edge_owner_to_timeline_media.edges) {
    add(parseProfileEdge(edge.node));
  }

  let nextMaxId = user.edge_owner_to_timeline_media.page_info.end_cursor;
  let page = 0;
  let hitCutoff = false;

  while (nextMaxId && page < 100 && !hitCutoff) {
    page += 1;
    await sleep(page === 1 ? 400 : 900);
    let data;
    try {
      // Feed pagination is aggressively rate-limited on fetch(); curl is more reliable.
      data = curlJson(
        `https://www.instagram.com/api/v1/feed/user/${userId}/?count=50&max_id=${encodeURIComponent(nextMaxId)}`,
      );
    } catch (err) {
      console.warn(`  pagination stopped at page ${page}: ${err.message}`);
      break;
    }

    let oldest = null;
    for (const item of data.items ?? []) {
      const post = parseFeedItem(item);
      oldest = oldest == null ? post.ts : Math.min(oldest, post.ts);
      add(post);
    }

    if (oldest != null) {
      console.log(
        `  page ${page}: ${posts.length} posts in window (oldest ${new Date(oldest).toISOString().slice(0, 10)})`,
      );
      if (oldest < cutoff) hitCutoff = true;
    } else {
      console.log(`  page ${page}: no new posts`);
    }

    nextMaxId = data.more_available ? data.next_max_id : null;
  }

  return { posts, followers, source: "public-api" };
}

async function downloadImage(url, dest) {
  let buf;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`image ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  } catch {
    buf = execFileSync("curl", ["-sL", url], { maxBuffer: 15 * 1024 * 1024 });
  }
  await sharp(buf)
    .resize(1080, 1080, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(dest);
}

async function main() {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  console.log(`▸ Syncing @${HANDLE} — top ${TOP_N} posts, last ${MONTHS} months`);

  let result;
  if (token && userId) {
    console.log("  source: Instagram Graph API");
    result = await fetchViaGraphApi(token, userId);
    result.followers = await fetchFollowersGraph(token, userId);
  } else {
    console.log("  source: public API (set INSTAGRAM_ACCESS_TOKEN for full history)");
    result = await fetchViaPublicApi();
  }

  const ranked = [...result.posts].sort((a, b) => b.engagement - a.engagement);
  const top = ranked.slice(0, TOP_N);
  console.log(`  scanned ${ranked.length} posts in window → top ${top.length}`);

  // Clear old images
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (/\.webp$/i.test(f)) fs.unlinkSync(path.join(IMG_DIR, f));
  }

  const posts = [];
  for (const post of top) {
    const filename = `${post.shortcode}.webp`;
    const localPath = `/instagram/${filename}`;
    const dest = path.join(IMG_DIR, filename);
    process.stdout.write(`  ↓ ${post.shortcode} (${post.engagement} engagement)… `);
    try {
      await downloadImage(post.remoteImage, dest);
      console.log("ok");
    } catch (err) {
      console.log(`failed (${err.message})`);
      continue;
    }
    posts.push({
      shortcode: post.shortcode,
      timestamp: post.timestamp,
      likes: post.likes,
      comments: post.comments,
      engagement: post.engagement,
      image: localPath,
      permalink: post.permalink,
      caption: post.caption,
    });
  }

  const feed = {
    syncedAt: new Date().toISOString(),
    handle: HANDLE,
    followers: result.followers ?? 23000,
    scannedPosts: ranked.length,
    source: result.source,
    posts,
  };

  fs.writeFileSync(DATA_PATH, JSON.stringify(feed, null, 2));
  console.log(`✓ Wrote ${DATA_PATH} (${posts.length} posts, ${feed.followers.toLocaleString()} followers)`);
}

async function fetchFollowersGraph(token, userId) {
  const data = await fetchJson(
    `https://graph.facebook.com/v22.0/${userId}?fields=followers_count,username&access_token=${token}`,
  );
  return data.followers_count;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
