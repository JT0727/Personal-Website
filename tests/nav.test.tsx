import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";

let mockedPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
}));

import { Nav } from "@/components/nav";

describe("Nav active route and control states", () => {
  it("marks Work as the current nav item with an underline when viewing a case study route", () => {
    mockedPathname = "/work/tesla-energy-ai-product/";
    const html = renderToStaticMarkup(
      <Nav
        name={site.positioning.name}
        items={site.nav}
        resumeHref={site.contact.resumeHref}
        resumeFilename={site.contact.resumeFilename}
      />,
    );

    const workLink = [
      ...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),
    ].find(([, , inner]) => inner.trim() === "Work");

    expect(workLink).toBeDefined();
    expect(workLink?.[1]).toContain('aria-current="location"');
    expect(workLink?.[1]).toContain("underline");
    expect(workLink?.[1]).toContain("underline-offset-8");
  });

  it("does not mark any section link as current on the home route before scrolling", () => {
    mockedPathname = "/";
    const html = renderToStaticMarkup(
      <Nav
        name={site.positioning.name}
        items={site.nav}
        resumeHref={site.contact.resumeHref}
        resumeFilename={site.contact.resumeFilename}
      />,
    );

    expect(html).not.toContain('aria-current="location"');
  });

  it("gives the mobile menu toggle button a hover border transition matching other header controls", () => {
    mockedPathname = "/";
    const html = renderToStaticMarkup(
      <Nav
        name={site.positioning.name}
        items={site.nav}
        resumeHref={site.contact.resumeHref}
        resumeFilename={site.contact.resumeFilename}
      />,
    );

    const menuButton = html.match(
      /<button\b[^>]*aria-controls="mobile-nav"[^>]*>/,
    )?.[0];
    expect(menuButton).toBeDefined();
    expect(menuButton).toContain("hover:border-foreground/40");
    expect(menuButton).toContain("transition-colors");
  });
});
