import { site } from "@/content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="flex flex-col justify-start pt-8 pb-12 sm:pt-16 sm:pb-16"
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <p className="text-muted-foreground font-mono-label mb-4 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-accent size-1.5 rounded-full"
          />
          {site.positioning.status}
        </p>
        <h1 className="font-display text-[2.25rem] leading-[1.1] tracking-tight sm:text-5xl">
          {site.positioning.name}
        </h1>
        <p className="measure mt-5 text-lg leading-relaxed text-pretty">
          {site.positioning.headline}
        </p>
      </div>
    </section>
  );
}
