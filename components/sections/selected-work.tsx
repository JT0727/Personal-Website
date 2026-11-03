import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { tap, textAction } from "@/lib/ui";

function WorkMeta({ label, children }: { label: string; children: string }) {
  return (
    <div className="border-border grid gap-1 border-t py-3 first:border-t-0 first:pt-0 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <p className="text-accent font-mono-label pt-0.5">{label}</p>
      <p className="text-muted-foreground text-lg leading-relaxed">
        {children}
      </p>
    </div>
  );
}

/**
 * The first card is the featured one. When the cards after it come to an odd
 * number the last card also spans the row, so the two-column grid never ends
 * on a half-empty row.
 */
export function isWideCard(index: number, total: number): boolean {
  if (index === 0) return true;
  return index === total - 1 && total % 2 === 0;
}

export function SelectedWork() {
  const total = site.selectedWork.length;

  return (
    <Section id="work">
      <SectionHeading title={site.sections.work.title} />

      <div className="grid gap-6 sm:grid-cols-2">
        {site.selectedWork.map((item, index) => {
          const wide = isWideCard(index, total);
          const caseHref = `/work/${item.slug}/`;
          return (
            <article
              key={item.slug}
              className={cn(
                "reveal border-border bg-card flex min-w-0 flex-col overflow-hidden border",
                wide &&
                  "sm:col-span-2 sm:grid sm:grid-cols-2 sm:items-stretch",
              )}
            >
              <div
                className={cn(
                  "border-border bg-muted flex aspect-[3/2] w-full min-w-0 flex-col justify-between border-b p-5 sm:p-7",
                  wide &&
                    "sm:aspect-auto sm:h-full sm:min-h-[20rem] sm:border-r sm:border-b-0",
                )}
              >
                <p className="text-accent font-mono-label">
                  {item.panel.kicker}
                </p>
                <div>
                  <p className="tabular font-display text-5xl sm:text-6xl">
                    {item.panel.value}
                  </p>
                  <p className="text-muted-foreground mt-3 max-w-xs text-[0.9375rem] leading-snug">
                    {item.panel.label}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-7">
                <h3 className="font-display text-2xl leading-tight tracking-tight sm:text-[1.75rem]">
                  {item.title}
                </h3>
                <div className="mt-5">
                  <WorkMeta label="Problem">{item.problem}</WorkMeta>
                  <WorkMeta label="What I did">{item.contribution}</WorkMeta>
                  <WorkMeta label="Outcome">{item.outcome}</WorkMeta>
                </div>
                <div className="mt-auto flex flex-col gap-1 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link href={caseHref} className={textAction}>
                    Read the case study
                    <ArrowUpRight className="size-[16px] shrink-0" aria-hidden="true" />
                  </Link>
                  {item.link ? (
                    <a
                      href={item.link.href}
                      className={cn(
                        tap,
                        "gap-1 text-[0.9375rem] font-medium",
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.link.label}
                      <ArrowUpRight className="size-[16px] shrink-0" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
