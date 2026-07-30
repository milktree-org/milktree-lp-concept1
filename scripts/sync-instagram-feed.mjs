#!/usr/bin/env node
/**
 * Syncs @milktreeagency Instagram feed:
 * - Fetches posts from the last 30 days
 * - Picks the 3 best by engagement (likes + comments)
 * - Always keeps the Liquid Death post (Da0OnjUlB1Q) and refreshes its counts
 * - Downloads images to /public/instagram
 * - Writes metadata to /data/instagram-feed.json
 *
 * Uses Instagram Graph API when INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID are set.
 * Otherwise falls back to Instagram's public profile + GraphQL pagination.
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
/** Always surface this post; refresh likes/comments on every sync. */
const KEEP_SHORTCODE = "Da0OnjUlB1Q";
const DAYS = 30;
const TOP_N = 3;
const GRAPHQL_DOC_ID = "7950326061742207";
const IG_APP_ID = "936619743392459";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const headers = {
  "x-ig-app-id": IG_APP_ID,
  "User-Agent": UA,
  Accept: "*/*",
  "Accept-Language": "en-GB,en;q=0.9",
  Referer: `https://www.instagram.com/${HANDLE}/`,
  Origin: "https://www.instagram.com",
};

const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;

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
  const likes = node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0;
  const comments =
    node.edge_media_to_comment?.count ?? node.edge_media_to_parent_comment?.count ?? 0;
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
    } catch {
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
  let url = `https://graph.facebook.com/v22.0/${userId}/media?fields=${fields}&limit=25&access_token=${token}`;
  let pages = 0;
  while (url && pages < 6) {
    const data = await fetchJson(url);
    for (const node of data.data ?? []) {
      const post = parseGraphNode(node);
      if (!post.remoteImage) continue;
      if (post.ts >= cutoff || post.shortcode === KEEP_SHORTCODE) posts.push(post);
    }
    url = data.paging?.next ?? null;
    pages++;
    if (posts.some((p) => p.ts < cutoff) && posts.some((p) => p.shortcode === KEEP_SHORTCODE)) {
      break;
    }
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
  const posts = new Map();

  const add = (post) => {
    if (!post.shortcode || !post.remoteImage) return;
    if (post.ts < cutoff && post.shortcode !== KEEP_SHORTCODE) return;
    posts.set(post.shortcode, post);
  };

  for (const edge of user.edge_owner_to_timeline_media.edges) {
    add(parseProfileEdge(edge.node));
  }

  let cursor = user.edge_owner_to_timeline_media.page_info.end_cursor;
  let hasNext = user.edge_owner_to_timeline_media.page_info.has_next_page;
  let pages = 0;
  while (hasNext && pages < 6) {
    const url = `https://www.instagram.com/graphql/query/?doc_id=${GRAPHQL_DOC_ID}&variables=${encodeURIComponent(
      JSON.stringify({ id: userId, first: 12, after: cursor }),
    )}`;
    const data = await fetchJson(url);
    const media = data?.data?.user?.edge_owner_to_timeline_media;
    if (!media?.edges?.length) break;
    for (const edge of media.edges) add(parseProfileEdge(edge.node));
    hasNext = media.page_info.has_next_page;
    cursor = media.page_info.end_cursor;
    pages++;
    const oldest = Math.min(...[...posts.values()].map((p) => p.ts));
    if (oldest < cutoff && posts.has(KEEP_SHORTCODE)) break;
  }

  return { posts: [...posts.values()], followers, source: "public-api" };
}

function selectFeatured(posts) {
  const keep = posts.find((p) => p.shortcode === KEEP_SHORTCODE);
  const ranked = [...posts]
    .filter((p) => p.ts >= cutoff)
    .sort((a, b) => b.engagement - a.engagement);

  const selected = [];
  const used = new Set();

  if (keep) {
    selected.push(keep);
    used.add(keep.shortcode);
  }

  for (const post of ranked) {
    if (selected.length >= TOP_N) break;
    if (used.has(post.shortcode)) continue;
    selected.push(post);
    used.add(post.shortcode);
  }

  return selected.sort((a, b) => b.engagement - a.engagement);
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
    .resize(1080, 1440, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(dest);
}

async function main() {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  console.log(
    `▸ Syncing @${HANDLE} — top ${TOP_N} by engagement (last ${DAYS}d, keep ${KEEP_SHORTCODE})`,
  );

  let result;
  if (token && userId) {
    console.log("  source: Instagram Graph API");
    result = await fetchViaGraphApi(token, userId);
    result.followers = await fetchFollowersGraph(token, userId);
  } else {
    console.log("  source: public API (set INSTAGRAM_ACCESS_TOKEN for Graph API)");
    result = await fetchViaPublicApi();
  }

  const featured = selectFeatured(result.posts);
  console.log(`  scanned ${result.posts.length} posts → ${featured.length} featured`);
  for (const post of featured) {
    const tag = post.shortcode === KEEP_SHORTCODE ? " (kept)" : "";
    console.log(
      `    ${post.shortcode}  ${post.likes} likes · ${post.comments} comments · eng ${post.engagement}${tag}`,
    );
  }

  if (!featured.some((p) => p.shortcode === KEEP_SHORTCODE)) {
    console.warn(`  ⚠ kept post ${KEEP_SHORTCODE} was not found in the scan`);
  }

  const keepFiles = new Set(featured.map((p) => `${p.shortcode}.webp`));
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (/\.webp$/i.test(f) && !keepFiles.has(f)) fs.unlinkSync(path.join(IMG_DIR, f));
  }

  const posts = [];
  for (const post of featured) {
    const filename = `${post.shortcode}.webp`;
    const localPath = `/instagram/${filename}`;
    const dest = path.join(IMG_DIR, filename);
    process.stdout.write(`  ↓ ${post.shortcode} (${post.engagement} engagement)… `);
    try {
      await downloadImage(post.remoteImage, dest);
      console.log("ok");
    } catch (err) {
      if (fs.existsSync(dest)) {
        console.log(`reuse existing (${err.message})`);
      } else {
        console.log(`failed (${err.message})`);
        continue;
      }
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
    followers: result.followers ?? 25166,
    scannedPosts: result.posts.length,
    source: result.source,
    selection: "top-engagement-30d-keep-liquid-death",
    posts,
  };

  fs.writeFileSync(DATA_PATH, JSON.stringify(feed, null, 2));
  console.log(
    `✓ Wrote ${DATA_PATH} (${posts.length} posts, ${feed.followers.toLocaleString()} followers)`,
  );
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
