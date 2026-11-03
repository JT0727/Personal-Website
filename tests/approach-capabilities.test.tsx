import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Capabilities } from "@/components/sections/capabilities";
import { HowIWork } from "@/components/sections/how-i-work";

describe("approach and capabilities layout", () => {
  it("sizes the Approach title column to fit all five principle headings on one line at md+ without crushing sm descriptions", () => {
    const html = renderToStaticMarkup(<HowIWork />);
    expect(html).toContain("md:grid-cols-[2.5rem_15rem_1fr]");
    expect(html).toContain("md:gap-8");
    expect(html).not.toContain("sm:grid-cols-[4.5rem_minmax(0,11rem)_1fr]");
    expect(html).toMatch(/<p class="[^"]*\bmeasure\b[^"]*\btext-pretty\b/);
  });

  it("applies text-pretty to Capabilities item lists to avoid single-word orphans", () => {
    const html = renderToStaticMarkup(<Capabilities />);
    const paragraphs = [...html.matchAll(/<p class="([^"]*)"/g)].map(
      ([, cls]) => cls,
    );
    expect(paragraphs.length).toBeGreaterThan(0);
    for (const cls of paragraphs) {
      expect(cls).toContain("text-pretty");
    }
  });
});
