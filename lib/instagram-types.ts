export type InstagramPost = {
  shortcode: string;
  timestamp: string;
  likes: number;
  comments: number;
  engagement: number;
  /** Local path under /public, e.g. /instagram/DX19Z9sjKcs.webp */
  image: string;
  permalink: string;
  caption: string;
};

export type InstagramFeed = {
  syncedAt: string;
  handle: string;
  followers: number;
  posts: InstagramPost[];
  scannedPosts?: number;
  source?: "graph-api" | "public-api";
};

/** Format engagement counts for display (e.g. 162 → "162", 2300 → "2.3k"). */
export function formatEngagementCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toLocaleString("en-GB");
}
