import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MetricText } from "@/components/metric-text";

describe("MetricText", () => {
  it("highlights the metric when it appears in the text", () => {
    const html = renderToStaticMarkup(
      <MetricText text="Built 1,000+ tools" metric="1,000+" />,
    );
    expect(html).toContain("<span");
    expect(html).toContain("1,000+");
  });

  it("does not duplicate the metric when it is not found in the text", () => {
    const html = renderToStaticMarkup(
      <MetricText text="No figure here" metric="999" />,
    );
    expect(html).not.toContain("999");
    expect(html).toContain("No figure here");
  });

  it("renders plain text when no metric is provided", () => {
    const html = renderToStaticMarkup(<MetricText text="Plain text" />);
    expect(html).toBe("Plain text");
  });
});
