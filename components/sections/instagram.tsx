import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { buttonVariants } from "@/components/ui/button";
import { InstagramGrid } from "@/components/sections/instagram-grid";
import { getInstagramFeed } from "@/lib/instagram";
import { instagram } from "@/lib/site";
import { cn } from "@/lib/utils";

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

/**
 * Instagram social proof — top-performing posts from the last 12 months,
 * synced via `npm run sync:instagram`. Each tile links to the real post
 * and shows live engagement (likes + comments).
 */
export async function InstagramSection() {
  const feed = await getInstagramFeed();
  const followers = feed.followers || instagram.followers;

  return (
    <section
      id="instagram"
      className="scroll-mt-28 border-t border-border bg-surface/40 py-24 md:py-32"
    >
      <div className="container-edge">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>Instagram</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6 text-balance">
                <span className="text-brand">
                  <CountUp value={followers} suffix="+" />
                </span>
                <span className="mt-1 block sm:mt-0 sm:inline sm:before:content-['_']">
                  follow the work.
                </span>
              </h2>
            </Reveal>
            <Reveal index={2}>
              <p className="text-body-lg mt-5 max-w-lg">
                Our top-performing posts — brand and design in the open.
                Follow{" "}
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                >
                  @{feed.handle}
                </a>{" "}
                for more.
              </p>
            </Reveal>
          </div>

          <Reveal index={2} className="w-full shrink-0 sm:w-auto">
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className={cn(buttonVariants({ variant: "ghostPill", size: "pill" }), "w-full sm:w-auto")}
            >
              <InstagramIcon />
              Follow on Instagram
            </a>
          </Reveal>
        </div>

        <InstagramGrid posts={feed.posts} />

        <Reveal index={1}>
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="group mt-10 inline-flex min-h-11 items-center gap-1.5 py-2 text-sm font-bold uppercase tracking-[0.14em] text-faint transition-colors hover:text-foreground"
          >
            See more on @{feed.handle}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
