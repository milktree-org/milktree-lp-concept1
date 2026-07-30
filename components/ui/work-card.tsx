import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkProject } from "@/lib/work";
import { cn } from "@/lib/utils";

/**
 * Case-study card shared by the homepage proof grid and the /work index —
 * poster image, category + title overlay, arrow chip that flips to yellow
 * on hover.
 */
export function WorkCard({ project }: { project: WorkProject }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="hover"
      className={cn(
        "group relative block overflow-hidden rounded-[2rem] border border-border bg-card",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]",
        "motion-reduce:transform-none motion-reduce:transition-none",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.poster}
          alt={`${project.title} — ${project.category}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-faint">
              {project.category}
            </p>
            <h3 className="mt-1 text-xl font-bold uppercase tracking-tight text-foreground">
              {project.title}
            </h3>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
