import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { InstagramGrid } from "@/components/sections/instagram-grid";
import { getInstagramFeed } from "@/lib/instagram";
import { instagram } from "@/lib/site";

/**
 * Instagram social proof — one row of three top-performing posts from the
 * last 30 days (Liquid Death kept as a fixture), synced via
 * `npm run sync:instagram`. Each tile links to the real post.
 *
 * Placed after the FAQ, and deliberately without a pill-button CTA: outbound
 * links compete with the funnel, so the only yellow-adjacent action near this
 * section stays "Get started". Follows are a byproduct, not the goal.
 */
export async function InstagramSection() {
  const feed = await getInstagramFeed();
  const followers = feed.followers || instagram.followers;
  const posts = feed.posts.slice(0, 3);

  return (
    <section
      id="instagram"
      className="theme-light scroll-mt-28 bg-background py-24 text-foreground md:py-32"
    >
      <div className="container-edge">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Instagram</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">
              {/* highlighter mark — echoes the yellow marks in the posts */}
              <span className="box-decoration-clone bg-brand px-2 text-brand-ink">
                <CountUp value={followers} suffix="+" />
              </span>
              <span className="mt-1 block sm:mt-0 sm:inline sm:before:content-['_']">
                follow the work.
              </span>
            </h2>
          </Reveal>
          <Reveal index={2}>
            <p className="text-body-lg mt-5 max-w-lg">
              The latest from the studio, brand and design in the open. Follow{" "}
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                @{feed.handle}
              </a>{" "}
              for more.
            </p>
          </Reveal>
        </div>

        <InstagramGrid posts={posts} />

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
