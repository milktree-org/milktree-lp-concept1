"use client";

import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import type { InstagramPost } from "@/lib/instagram-types";
import { formatEngagementCount } from "@/lib/instagram-types";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  return (
    <StaggerGroup className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-14 md:gap-5 lg:gap-6">
      {posts.map((post) => (
        <StaggerItem key={post.shortcode}>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            aria-label={`${post.caption || "Instagram post"} — ${formatEngagementCount(post.likes)} likes, ${formatEngagementCount(post.comments)} comments`}
            className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-border bg-card transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-foreground/25 motion-reduce:transform-none"
          >
            <Image
              src={post.image}
              alt={post.caption || "Milktree on Instagram"}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105 motion-reduce:transform-none"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-16 transition-opacity duration-300">
              <div className="flex items-center gap-4 text-sm font-bold text-white">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="size-4 fill-current text-white/90" aria-hidden />
                  {formatEngagementCount(post.likes)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="size-4" aria-hidden />
                  {formatEngagementCount(post.comments)}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-[opacity,background-color] duration-300 group-hover:bg-black/25 group-hover:opacity-100">
              <InstagramIcon className="size-8 text-white" />
            </div>
          </a>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
