import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Experience } from "@/components/sections/experience";
import { site } from "@/content/site";

function classes(html: string, token: string): string[] {
  return [
    ...html.matchAll(new RegExp(`class="([^"]*\\b${token}\\b[^"]*)"`, "g")),
  ].map(([, value]) => value);
}

describe("text measure", () => {
  it("keeps each role header on the same measure as its summary and bullets", () => {
    const html = renderToStaticMarkup(<Experience />);
    const headers = classes(html, "items-baseline");
    expect(headers).toHaveLength(
      site.experience.reduce(
        (count, employer) => count + employer.roles.length,
        0,
      ),
    );
    for (const header of headers) {
      expect(header).toContain("measure");
    }
  });
});
