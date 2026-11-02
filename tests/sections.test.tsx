import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyBody } from "@/components/sections/case-study";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Writing } from "@/components/sections/writing";
import { nextSelectedWork, site } from "@/content/site";
import { btnGhost } from "@/lib/ui";
import { formatPostDate, parseFeed } from "@/lib/writing";
import { WRITING_FIXTURE_TITLES } from "./fixtures/writing/titles";

const entities: Record<string, string> = {
  "&amp;": "&",
  "&#x27;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
};

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|#x27|quot|lt|gt);/g, (entity) => entities[entity])
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(attributes: string, name: string): string | undefined {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function links(html: string) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(
    ([, attributes, inner]) => ({
      href: attribute(attributes, "href"),
      text: textOf(inner),
      download: attribute(attributes, "download"),
      target: attribute(attributes, "target"),
    }),
  );
}

function headings(html: string, tag: string): string[] {
  return [
    ...html.matchAll(new RegExp(`<${tag}\\b[^>]*>(.*?)</${tag}>`, "g")),
  ].map(([, inner]) => textOf(inner));
}

const { email, linkedin, resumeHref, resumeFilename } = site.contact;

describe("hero", () => {
  const html = renderToStaticMarkup(<Hero />);

  it("shows name and pitch only", () => {
    const { name, headline } = site.positioning;
    expect(textOf(html)).toBe(`${name} ${headline}`);
  });

  it("does not invent posts, links, or a subscribe placeholder", () => {
    expect(links(html)).toEqual([]);
    expect(html).not.toMatch(/substack/i);
    expect(html).not.toMatch(/subscribe/i);
    expect(html).not.toMatch(/coming soon/i);
  });

  it("sizes the pitch at 18px", () => {
    expect(html).toContain("text-lg");
    expect(html).not.toContain("text-[1.0625rem]");
  });
});

const EMPTY_WRITING =
  "Nothing published yet. Subscribe and the first post will land in your inbox.";
const threeXml = readFileSync(
  path.join(__dirname, "fixtures/writing/three-posts.xml"),
  "utf8",
);

describe("writing", () => {
  it("shows the intro, empty-state copy, and subscribe link when there are 0 posts", () => {
    const html = renderToStaticMarkup(<Writing posts={[]} />);
    const text = textOf(html);
    expect(text).toContain(site.sections.writing.title);
    expect(text).toContain("01 / Essays");
    expect(text).toContain("Posts from my Substack.");
    expect(text).toContain(EMPTY_WRITING);
    expect(text).not.toContain("First post soon");
    expect(text).not.toContain("All writing");
    expect(html).not.toMatch(/<ol\b/);
    expect(html).not.toMatch(/skeleton|card|placeholder/i);
    expect(links(html)).toEqual([
      {
        href: "https://jarrodtran.substack.com",
        text: "Subscribe on Substack",
        target: "_blank",
      },
    ]);
    expect(html).toMatch(/rel="noreferrer"/);
    expect(html).toContain(btnGhost);
    expect(html).toContain("size-[16px]");
    expect(html).toMatch(/max-w-2xl[\s\S]*Subscribe on Substack/);
    expect(html).toMatch(
      /mt-6[\s\S]*Subscribe on Substack|Subscribe on Substack[\s\S]*mt-6/,
    );
  });

  it("lists three fixture posts newest first with Chicago dates, then subscribe", () => {
    const fixturePosts = parseFeed(threeXml);
    expect(fixturePosts.map((post) => post.title)).toEqual([
      ...WRITING_FIXTURE_TITLES,
    ]);
    const html = renderToStaticMarkup(<Writing posts={fixturePosts} />);
    const text = textOf(html);
    expect(text).toContain("Posts from my Substack.");
    const aurora = text.indexOf(WRITING_FIXTURE_TITLES[0]);
    const beacon = text.indexOf(WRITING_FIXTURE_TITLES[1]);
    const cedar = text.indexOf(WRITING_FIXTURE_TITLES[2]);
    expect(aurora).toBeGreaterThan(-1);
    expect(beacon).toBeGreaterThan(aurora);
    expect(cedar).toBeGreaterThan(beacon);
    expect(text).toContain(formatPostDate("2026-11-02T18:00:00.000Z"));
    expect(text).toContain("2 Nov 2026");
    expect(text).toContain("1 Nov 2026");
    expect(text).toContain("15 Oct 2026");
    expect(html).toMatch(
      /<time[^>]*dateTime="2026-11-02T18:00:00.000Z"[^>]*>2 Nov 2026<\/time>/,
    );
    expect(html).toMatch(
      /<time[^>]*dateTime="2026-11-02T05:00:00.000Z"[^>]*>1 Nov 2026<\/time>/,
    );
    expect(html).toContain("line-clamp-2");
    expect(html).toContain("(opens Substack)");
    expect(html).toContain("size-[16px]");
    expect(html).toMatch(
      /<ol\b[^>]*>[\s\S]*<a\b[^>]*\bno-underline\b[^>]*\bhover:underline\b/,
    );
    expect(html).not.toContain("All writing");
    expect(html).not.toContain("First post soon");
    expect(links(html)).toEqual([
      {
        href: "https://jarrodtran.substack.com/p/zxq-aurora",
        text: `${WRITING_FIXTURE_TITLES[0]} (opens Substack)`,
        target: "_blank",
      },
      {
        href: "https://jarrodtran.substack.com/p/zxq-beacon",
        text: `${WRITING_FIXTURE_TITLES[1]} (opens Substack)`,
        target: "_blank",
      },
      {
        href: "https://jarrodtran.substack.com/p/zxq-cedar",
        text: `${WRITING_FIXTURE_TITLES[2]} (opens Substack)`,
        target: "_blank",
      },
      {
        href: "https://jarrodtran.substack.com",
        text: "Subscribe on Substack",
        target: "_blank",
      },
    ]);
  });
});

describe("body text size", () => {
  it("uses 18px body text and does not keep a 17px empty-state exception", () => {
    const root = path.resolve(__dirname, "..");
    const leftovers: string[] = [];

    for (const dir of ["components", "app"]) {
      for (const file of readdirSync(path.join(root, dir), {
        recursive: true,
        encoding: "utf8",
      })) {
        if (!/\.(tsx|ts)$/.test(file)) continue;
        const relative = `${dir}/${file}`;
        if (relative === "app/globals.css") continue;
        const source = readFileSync(path.join(root, dir, file), "utf8");
        for (const [index, line] of source.split("\n").entries()) {
          if (!line.includes("text-[1.0625rem]")) continue;
          leftovers.push(`${relative}:${index + 1}`);
        }
      }
    }

    expect(leftovers).toEqual([]);
  });
});

describe("experience", () => {
  const html = renderToStaticMarkup(<Experience />);
  const companies = site.experience.map((employer) => employer.company);

  it("lists each employer once", () => {
    expect(headings(html, "h3")).toEqual(companies);
    expect(new Set(companies).size).toBe(companies.length);
  });

  it("nests each role, with its dates, under its employer", () => {
    const starts = companies.map((company) => html.indexOf(`>${company}<`));
    site.experience.forEach((employer, index) => {
      const entry = html.slice(starts[index], starts[index + 1]);
      expect(headings(entry, "h4")).toEqual(
        employer.roles.map((role) => role.title),
      );
      for (const role of employer.roles) {
        expect(textOf(entry)).toContain(role.dates);
      }
      if (employer.note) {
        expect(textOf(entry)).toContain(employer.note);
      }
    });
  });
});

describe("contact", () => {
  const html = renderToStaticMarkup(<Contact />);

  it("names all four audiences Jarrod is talking to", () => {
    const text = textOf(html);
    for (const audience of [
      "Growth-stage tech",
      "consulting",
      "early-stage startups",
      "VC-adjacent operator seat",
    ]) {
      expect(text).toContain(audience);
    }
  });

  it("offers email with a copy button, LinkedIn, a speaking invite, the résumé, and the calendar when set, and no form", () => {
    const { calendar } = site.contact;
    expect(links(html)).toEqual([
      { href: `mailto:${email}`, text: email },
      {
        href: linkedin,
        text: expect.stringMatching(/^linkedin\.com\/in\/[^/]+$/),
        target: "_blank",
      },
      {
        href: `mailto:${email}?subject=Speaking%20invitation`,
        text: "Invite me to speak",
      },
      {
        href: resumeHref,
        text: "Résumé",
        download: resumeFilename,
      },
      ...(calendar
        ? [{ href: calendar, text: "Book a call", target: "_blank" }]
        : []),
    ]);
    expect(html).toMatch(/<button\b[^>]*>Copy email<\/button>/);
    expect(html).not.toMatch(/<(form|input|textarea)\b/);
  });

  it("adds a calendar link when one is configured", () => {
    const configured = site.contact.calendar;
    site.contact.calendar = "https://example.com/book";
    try {
      expect(links(renderToStaticMarkup(<Contact />))).toContainEqual({
        href: "https://example.com/book",
        text: "Book a call",
        target: "_blank",
      });
    } finally {
      site.contact.calendar = configured;
    }
  });
});

describe("case study", () => {
  const item = site.selectedWork[0];
  const html = renderToStaticMarkup(<CaseStudyBody item={item} />);
  const next = nextSelectedWork(item.slug);

  it("lets a reader skim the problem, see the proof, and reach the next link", () => {
    const text = textOf(html);
    expect(text.indexOf(item.problem)).toBeGreaterThan(-1);
    expect(text.indexOf(item.panel.value)).toBeGreaterThan(
      text.indexOf(item.problem),
    );
    expect(next).toBeDefined();
    expect(text.indexOf(`Next: ${next!.title}`)).toBeGreaterThan(
      text.indexOf(item.panel.value),
    );
    expect(html).toMatch(new RegExp(`/work/${next!.slug}/?`));
  });
});
