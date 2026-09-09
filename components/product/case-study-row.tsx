import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/ui/work-card";
import { getWorkProject } from "@/lib/work";

/**
 * Three case studies by slug, with a link to the full index. Server
 * component: no client JS beyond the cards' own reveal.
 */
export function CaseStudyRow({
  eyebrow = "Proof",
  title,
  intro,
  slugs,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  slugs: string[];
  className?: string;
}) {
  const projects = slugs
    .map((slug) => getWorkProject(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className={className ?? "container-edge py-24 md:py-36"}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">{title}</h2>
          </Reveal>
        </div>
        {intro && (
          <Reveal index={2}>
            <p className="text-body max-w-sm md:text-right">{intro}</p>
          </Reveal>
        )}
      </div>

      <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <StaggerItem key={project.slug}>
            <WorkCard project={project} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="mt-10 flex justify-center">
        <Button
          variant="ghostPill"
          size="pill-lg"
          data-cursor="hover"
          nativeButton={false}
          render={<Link href="/work" />}
        >
          View all work
          <ArrowUpRight />
        </Button>
      </Reveal>
    </section>
  );
}
