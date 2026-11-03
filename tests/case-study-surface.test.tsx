import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyBody } from "@/components/sections/case-study";
import { SelectedWork } from "@/components/sections/selected-work";
import { selectedWorkSlugs, site } from "@/content/site";

const root = path.resolve(__dirname, "..");

const TAGS = [
  "AI Product",
  "Organizational Design",
  "Executive Alignment",
  "Capital Allocation",
  "Decision Models",
  "0→1 Launch",
  "Geographic Strategy",
  "Cross-Functional Delivery",
  "Operating Model",
  "Executive Cadence",
  "Decision Systems",
] as const;

const TEAM_BULLETS = [
  "Forward-deployed engineers embedded with Energy teams",
  "Product managers sequencing the use-case backlog",
  "Business sponsors who owned training the trainers",
  "Finance partners stress-testing cost and return assumptions",
  "Site and program leads accountable for execution",
  "Leadership sponsors who enforced the kill list",
  "Operations and quality partners closest to the work",
  "Commercial and planning stakeholders sizing demand",
  "Leadership reviewers on stage gates",
  "Engineering Operations partners who ran the cadence",
  "Function leads accountable for their slice of the plan",
  "Senior leaders who consumed the shared scoreboard",
] as const;

const TAG_ROW =
  /<div class="[^"]*flex-wrap[^"]*gap-x-3[^"]*">\s*(?:<span class="text-muted-foreground font-mono-label">[^<]+<\/span>\s*)+<\/div>/;
const TEAM_HEADING = /<p class="text-accent font-mono-label mb-3">Team<\/p>/;

function assertNoTagsOrTeam(html: string, label: string) {
  expect(html, `${label} has a tag row`).not.toMatch(TAG_ROW);
  expect(html, `${label} has a Team heading`).not.toMatch(TEAM_HEADING);
  for (const tag of TAGS) {
    expect(html, `${label} still shows tag ${tag}`).not.toContain(
      `>${tag}<`,
    );
  }
  for (const bullet of TEAM_BULLETS) {
    expect(html, `${label} still shows Team copy`).not.toContain(bullet);
  }
}

describe("case study cards and pages drop tags and Team", () => {
  it("covers every selected-work card and case study", () => {
    expect(selectedWorkSlugs()).toEqual([
      "tesla-energy-ai-product",
      "tesla-energy-portfolio",
      "apple-iphone-india",
      "waymo-engineering-ops",
    ]);
    expect(site.selectedWork).toHaveLength(4);
  });

  it("renders no tag row on Selected Work cards", () => {
    assertNoTagsOrTeam(renderToStaticMarkup(<SelectedWork />), "cards");
  });

  it("renders no tag row and no Team block on each case study page", () => {
    for (const item of site.selectedWork) {
      assertNoTagsOrTeam(
        renderToStaticMarkup(<CaseStudyBody item={item} />),
        item.slug,
      );
    }
  });

  it("keeps tags and Team out of the built home and case study HTML when out/ exists", () => {
    const home = path.join(root, "out/index.html");
    if (!existsSync(home)) return;

    assertNoTagsOrTeam(readFileSync(home, "utf8"), "out/index.html");
    for (const slug of selectedWorkSlugs()) {
      const file = path.join(root, `out/work/${slug}/index.html`);
      expect(existsSync(file), file).toBe(true);
      assertNoTagsOrTeam(readFileSync(file, "utf8"), `out/work/${slug}/`);
    }
  });
});
