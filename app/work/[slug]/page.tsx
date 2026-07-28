import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { StartButton } from "@/components/layout/start-button";
import { getNextWorkProject, getWorkProject, workProjects, type GalleryImage } from "@/lib/work";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { ViewContentTracker } from "@/components/analytics/view-content";
import { workBreadcrumbJsonLd, workCreativeWorkJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return workProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const project = getWorkProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.category}`,
    description: project.seoDescription,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} — ${project.category} — Milktree`,
      description: project.seoDescription,
      url: `/work/${project.slug}`,
      images: [{ url: project.hero }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — ${project.category} — Milktree`,
      description: project.seoDescription,
      images: [project.hero],
    },
  };
}

/**
 * Case study page — structured after the milktreeagency.com project pages:
 * full-bleed hero, yellow display headline + intro, stacked gallery split by
 * a giant wordmark moment, then the conversion band and next-project link.
 */
export default async function WorkProjectPage({ params }: { params: Params }) {
  const project = getWorkProject((await params).slug);
  if (!project) notFound();

  const next = getNextWorkProject(project.slug);
  const midpoint = Math.ceil(project.gallery.length / 2);
  const galleryTop = project.gallery.slice(0, midpoint);
  const galleryBottom = project.gallery.slice(midpoint);

  return (
    <article>
      <JsonLd data={[workBreadcrumbJsonLd(project), workCreativeWorkJsonLd(project)]} />
      <ViewContentTracker
        contentName={project.title}
        contentCategory={project.category}
        contentId={project.slug}
      />
      {/* Full-bleed hero */}
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden md:h-[78vh]">
        <Image
          src={project.hero}
          alt={`${project.title} — ${project.category}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />
      </div>

      {/* Headline + intro */}
      <div className="container-edge py-20 md:py-28">
        <Reveal>
          <Eyebrow>{project.category}</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h1 className="mt-8 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em] text-brand">
            {project.headline}
          </h1>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_minmax(0,2fr)] md:gap-16">
          <Reveal index={2}>
            <ul className="space-y-2">
              {project.services.map((s) => (
                <li
                  key={s}
                  className="text-sm font-bold uppercase tracking-[0.14em] text-faint"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={3}>
            <p className="text-body max-w-2xl text-lg leading-relaxed">{project.intro}</p>
          </Reveal>
        </div>

        {/* Challenge / Approach / Outcome narrative */}
        <div className="mt-16 grid gap-12 border-t border-border pt-16 md:mt-20 md:grid-cols-3 md:gap-10 md:pt-20">
          {(
            [
              ["The challenge", project.challenge],
              ["The approach", project.approach],
              ["The outcome", project.outcome],
            ] as const
          ).map(([label, body], i) => (
            <Reveal key={label} index={i}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {label}
              </h2>
              <p className="text-body mt-4 leading-relaxed">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Gallery — first run */}
      <GalleryRows rows={galleryTop} />

      {/* Giant wordmark moment */}
      <div className="overflow-hidden border-y border-border bg-surface py-16 md:py-24">
        <Reveal>
          <p
            aria-hidden
            className="whitespace-nowrap text-center text-[clamp(4rem,16vw,14rem)] font-bold uppercase leading-none tracking-[-0.04em] text-foreground/95"
          >
            {project.title}
          </p>
        </Reveal>
      </div>

      {/* Gallery — second run */}
      <GalleryRows rows={galleryBottom} />

      {/* Conversion band */}
      <div className="border-y border-border bg-surface">
        <div className="container-edge flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <Reveal>
            <h2 className="max-w-[20ch] text-balance text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em]">
              Want work like this on your brand?
            </h2>
            <p className="text-body mt-3 max-w-md">
              One subscription, every kind of design. Your first request could be
              back this week.
            </p>
          </Reveal>
          <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
            <StartButton size="pill-lg" magnetic source={`Case study — ${project.title}`}>
              Get started
            </StartButton>
            <p className="text-sm font-medium text-faint">{site.trustLine}</p>
          </Reveal>
        </div>
      </div>

      {/* Next project */}
      <Link
        href={`/work/${next.slug}`}
        data-cursor="hover"
        className="group block"
      >
        <div className="container-edge flex items-center justify-between gap-6 py-16 md:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
              Next project
            </p>
            <p className="mt-3 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.025em] transition-colors duration-300 group-hover:text-brand">
              {next.title}
            </p>
            <p className="mt-1 text-sm font-medium text-faint">{next.category}</p>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-white/5 transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
            <ArrowUpRight className="size-6" />
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Stacked gallery: single-image rows go full width, pairs split side by side. */
function GalleryRows({ rows }: { rows: GalleryImage[][] }) {
  if (rows.length === 0) return null;
  return (
    <div className="container-edge flex flex-col gap-5 py-5 md:gap-6 md:py-6">
      {rows.map((row) =>
        row.length === 1 ? (
          <Reveal key={row[0].src}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border md:aspect-[16/10]">
              <Image
                src={row[0].src}
                alt={row[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 90vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : (
          <StaggerGroup
            key={row.map((img) => img.src).join()}
            className="grid gap-5 md:grid-cols-2 md:gap-6"
          >
            {row.map((img) => (
              <StaggerItem key={img.src}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border md:aspect-[4/4.5]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ),
      )}
    </div>
  );
}
