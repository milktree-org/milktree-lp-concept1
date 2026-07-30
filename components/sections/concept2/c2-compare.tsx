"use client";

import { Reveal } from "@/components/motion/reveal";
import { getComparison } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";

/** Three-way comparison per the concept spec: Freelancer / In-house / Milktree. */
const COLUMN_INDICES = [0, 1, 3] as const;

/**
 * Why Milktree — editorial comparison table on the off-white surface.
 * The Milktree column header sits on the warm-black ink block.
 */
export function C2Compare() {
  const comparison = getComparison(useCurrency());
  const columns = COLUMN_INDICES.map((i) => comparison.columns[i]);
  const rows = comparison.rows.map((row) => ({
    label: row.label,
    values: COLUMN_INDICES.map((i) => row.values[i]),
  }));
  return (
    <section id="why">
      <div className="container-edge py-24 md:py-36">
        <Reveal className="max-w-3xl">
          <p className="c2-label">(Why Milktree)</p>
          <h2 className="text-h2 mt-6 text-foreground">
            Better than the alternatives.
          </h2>
        </Reveal>

        <Reveal className="mt-16 overflow-x-auto md:mt-20">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[16%] pb-4" aria-label="Criteria" />
                {columns.map((column, i) => (
                  <th
                    key={column}
                    scope="col"
                    className={
                      i === columns.length - 1
                        ? "rounded-t-[14px] bg-ink px-5 pb-4 pt-4 text-[0.95rem] font-bold tracking-tight text-ink-foreground"
                        : "px-5 pb-4 pt-4 text-[0.95rem] font-bold tracking-tight text-foreground"
                    }
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                  <tr key={row.label} className="border-t border-border">
                  <th
                    scope="row"
                    className="py-5 pr-4 align-top text-[0.8rem] font-bold uppercase tracking-[0.14em] text-faint"
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td
                      key={i}
                      className={
                        i === row.values.length - 1
                          ? `bg-ink/[0.04] px-5 py-5 align-top text-[0.95rem] font-bold text-foreground${rowIndex === rows.length - 1 ? " rounded-b-[14px]" : ""}`
                          : "px-5 py-5 align-top text-[0.95rem] font-medium text-muted-foreground"
                      }
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
