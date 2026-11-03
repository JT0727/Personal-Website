import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  SelectedWork,
  spansFullRow,
} from "@/components/sections/selected-work";
import { site, type SelectedWorkItem } from "@/content/site";

function spans(html: string): number {
  return (html.match(/sm:col-span-2/g) ?? []).length;
}

function withSelectedWork<T>(items: SelectedWorkItem[], run: () => T): T {
  const original = site.selectedWork;
  site.selectedWork = items;
  try {
    return run();
  } finally {
    site.selectedWork = original;
  }
}

describe("selected work grid", () => {
  it("spans the featured card and, on an odd tail, the last card", () => {
    expect([0, 1, 2, 3].map((index) => spansFullRow(index, 4))).toEqual([
      true,
      false,
      false,
      true,
    ]);
    expect([0, 1, 2, 3, 4].map((index) => spansFullRow(index, 5))).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
    expect([0, 1, 2].map((index) => spansFullRow(index, 3))).toEqual([
      true,
      false,
      false,
    ]);
    expect([0, 1].map((index) => spansFullRow(index, 2))).toEqual([true, true]);
  });

  it("renders two full-row cards for the four shipped case studies", () => {
    const html = renderToStaticMarkup(<SelectedWork />);
    expect(site.selectedWork).toHaveLength(4);
    expect(spans(html)).toBe(2);
    expect(html.slice(html.lastIndexOf("<article"))).toContain("sm:col-span-2");
  });

  it("leaves the grid even rather than forcing a span", () => {
    expect(
      withSelectedWork(site.selectedWork.slice(0, 3), () =>
        spans(renderToStaticMarkup(<SelectedWork />)),
      ),
    ).toBe(1);
    expect(
      withSelectedWork(site.selectedWork.slice(0, 2), () =>
        spans(renderToStaticMarkup(<SelectedWork />)),
      ),
    ).toBe(2);
  });
});
