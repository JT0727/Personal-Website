import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const css = readFileSync(path.join(root, "app/globals.css"), "utf8");

function printBlock(source: string): string {
  const start = source.indexOf("@media print");
  expect(start, "globals.css has a @media print block").toBeGreaterThan(-1);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error("unbalanced @media print block");
}

describe("print styles", () => {
  const print = printBlock(css);

  it("forces the light tokens on every theme selector a dark visitor can match", () => {
    expect(print).toMatch(/:root,?\s*\n?\s*\.dark,?\s*\n?\s*html:not\(\.light\)/);
    expect(print).toContain("--background: #ffffff");
    expect(print).toContain("--foreground: #111111");
    expect(print).toContain("color-scheme: light");
  });

  it("drops the sticky bar, its buttons, and the phone menu from the sheet", () => {
    expect(print).toMatch(/header\s*{[^}]*position:\s*static/);
    expect(print).toMatch(/header button,[\s\S]*#mobile-nav\s*{[^}]*display:\s*none/);
  });

  it("stops reveal rows from animating and keeps cards off page breaks", () => {
    expect(print).toMatch(/\.reveal\s*{[^}]*animation:\s*none/);
    expect(print).toMatch(/\.reveal,[\s\S]*break-inside:\s*avoid/);
    expect(print).toMatch(/h1,[\s\S]*break-after:\s*avoid/);
  });

  it("sets a paper margin", () => {
    expect(print).toMatch(/@page\s*{[^}]*margin:/);
  });
});
