import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const types = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function withoutBasePath(pathname) {
  if (!basePath) return pathname;
  if (pathname === basePath) return "/";
  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length);
  }
  return pathname;
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  const stripped = withoutBasePath(pathname);
  const path = stripped.endsWith("/") ? `${stripped}index.html` : stripped;
  const file = join("out", normalize(decodeURIComponent(path)));
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "" });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}${basePath}/`;

// Relative luminance, so the check is about paper legibility rather than a
// specific hex value.
function luminance([r, g, b]) {
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function parseRgb(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return [parts[0], parts[1], parts[2]];
}

const routes = ["", "work/tesla-energy-ai-product/"];
const browser = await chromium.launch();
console.log(`print: Chromium ${browser.version()}`);
const failures = [];

for (const route of routes) {
  for (const colorScheme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.emulateMedia({ media: "print", colorScheme });
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const report = await page.evaluate(() => {
      const computed = (selector, property) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element)[property] : null;
      };
      const reveal = document.querySelector(".reveal");
      return {
        bodyColor: computed("body", "color"),
        bodyBackground: computed("body", "backgroundColor"),
        h1Color: computed("h1", "color"),
        headerPosition: computed("header", "position"),
        headerButtons: [...document.querySelectorAll("header button")].filter(
          (button) => {
            const box = button.getBoundingClientRect();
            return box.width > 0 && box.height > 0;
          },
        ).length,
        mobileNav: computed("#mobile-nav", "display"),
        revealAnimation: reveal ? getComputedStyle(reveal).animationName : "none",
        scrollsSideways:
          document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
    await page.close();

    const label = `${route || "/"} ${colorScheme}`;
    const ink = parseRgb(report.bodyColor);
    const paper = parseRgb(report.bodyBackground);
    if (!ink || !paper) {
      failures.push(`${label}: could not read body colors`);
      continue;
    }
    if (luminance(paper) < 0.7) {
      failures.push(`${label}: paper background is ${report.bodyBackground}`);
    }
    if (luminance(ink) > 0.4) {
      failures.push(`${label}: body ink is ${report.bodyColor}`);
    }
    const headingInk = parseRgb(report.h1Color);
    if (!headingInk || luminance(headingInk) > 0.4) {
      failures.push(`${label}: heading ink is ${report.h1Color}`);
    }
    if (report.headerPosition !== "static") {
      failures.push(`${label}: header is ${report.headerPosition}, not static`);
    }
    if (report.headerButtons > 0) {
      failures.push(`${label}: ${report.headerButtons} header button(s) print`);
    }
    if (report.mobileNav && report.mobileNav !== "none") {
      failures.push(`${label}: the phone menu prints (${report.mobileNav})`);
    }
    if (report.revealAnimation !== "none") {
      failures.push(`${label}: reveal still animates (${report.revealAnimation})`);
    }
    if (report.scrollsSideways) {
      failures.push(`${label}: the page scrolls sideways on paper`);
    }
  }
}

await browser.close();
server.close();

if (failures.length > 0) {
  console.error("print: failed");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("print: all checks pass");
console.log("  dark-mode paper is white with #111 ink, headings included");
console.log("  the sticky bar is static and its buttons and the phone menu are hidden");
console.log("  reveal rows do not animate and nothing scrolls sideways on paper");
