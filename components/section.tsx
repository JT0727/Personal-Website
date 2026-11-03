import { cn } from "@/lib/cn";

export function Section({
  id,
  children,
  className,
  contained = true,
  compact = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  contained?: boolean;
  /**
   * Tighter vertical padding for a section whose content is a single row.
   * A padding variant cannot come through `className`: `cn` only joins, so
   * `py-16` and `py-12` would both ship and `py-16` would win on source order.
   */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-border scroll-mt-24 border-t",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
    >
      {contained ? (
        <div className="mx-auto max-w-5xl px-5 sm:px-8">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-10 max-w-2xl sm:mb-12">
      <h2 className="font-display text-[2rem] leading-tight tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {children}
    </div>
  );
}
