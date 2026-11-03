import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../app/globals.css"),
  "utf8",
);
const body = css.match(/(?:^|\n)body\s*{[^}]*}/)?.[0] ?? "";

describe("type scale", () => {
  it("sets one body size, 18px, the same size prose renders at", () => {
    expect(body).toContain("font-size: 1.125rem");
  });

  it("leaves the old 17px tier out of the stylesheet", () => {
    expect(css).not.toContain("1.0625rem");
  });
});
