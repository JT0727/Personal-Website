import { ArrowDownRight } from "lucide-react";
import { site } from "@/content/site";
import { btnGhost, btnPrimary } from "@/lib/ui";

export function Hero() {
  return (
    <section
      id="top"
      className="flex flex-col justify-start pt-8 pb-12 sm:pt-16 sm:pb-16"
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <h1 className="font-display text-[2.25rem] leading-[1.1] tracking-tight sm:text-5xl">
          {site.positioning.name}
        </h1>
        <p className="measure mt-5 text-lg leading-relaxed text-pretty">
          {site.positioning.headline}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#work" className={btnPrimary}>
            Selected work
            <ArrowDownRight
              className="size-[16px] shrink-0"
              aria-hidden="true"
            />
          </a>
          <a href="#contact" className={btnGhost}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
