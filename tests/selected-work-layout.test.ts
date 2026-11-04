import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { site } from "@/content/site";

const types: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

function withoutBasePath(pathname: string): string {
  if (!basePath) return pathname;
  if (pathname === basePath) return "/";
  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length);
  }
  return pathname;
}

if (!existsSync(join(process.cwd(), "out/index.html"))) {
  throw new Error("selected-work layout test needs a production build in out/");
}

// Measured on main ab14171 in this file's Playwright Chromium setup.
// 200% text is document.documentElement.style.fontSize = "200%", not browser zoom.
const MAIN_WORK_HEIGHT = {
  1280: { 100: 2152.8125, 200: 5320.65625 },
  320: { 100: 3345.3125, 200: 15005 },
  390: { 100: 3092.5, 200: 11628.5 },
} as const;

describe("selected work featured panel layout", () => {
  let origin = "";
  let close = async () => {};

  beforeAll(async () => {
    const server = createServer(async (request, response) => {
      const { pathname } = new URL(request.url ?? "/", "http://localhost");
      const stripped = withoutBasePath(pathname);
      const path = stripped.endsWith("/") ? `${stripped}index.html` : stripped;
      const file = join("out", normalize(decodeURIComponent(path)));
      try {
        const body = await readFile(file);
        response.writeHead(200, {
          "content-type": types[extname(file)] ?? "",
        });
        response.end(body);
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("test server did not bind");
    }
    origin = `http://127.0.0.1:${address.port}${basePath}`;
    close = () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
  });

  afterAll(async () => {
    await close();
  });

  async function openWork(
    width: number,
    height: number,
    textPercent: 100 | 200,
  ) {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width, height },
      colorScheme: "light",
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    if (textPercent === 200) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    }
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const done = () => requestAnimationFrame(() => resolve());
          if (document.fonts.status === "loaded") {
            done();
            return;
          }
          document.fonts.ready.then(done).catch(done);
        }),
    );
    await page.waitForTimeout(300);
    return { browser, page, errors };
  }

  async function measureWork(
    width: number,
    height: number,
    textPercent: 100 | 200,
  ) {
    const { browser, page, errors } = await openWork(
      width,
      height,
      textPercent,
    );
    const layout = await page.evaluate((panelValue) => {
      const work = document.getElementById("work");
      const articles = [...(work?.querySelectorAll("article") ?? [])];
      const featured = articles[0];
      const value = [...(featured?.querySelectorAll("p") ?? [])].find((node) =>
        (node.textContent ?? "").includes(panelValue),
      );
      let panel: Element | null | undefined = value;
      while (panel && panel.parentElement !== featured) {
        panel = panel.parentElement;
      }
      const text = featured?.querySelector("h3")?.parentElement;
      const row = articles
        .slice(1, 3)
        .map((article) => article.getBoundingClientRect().bottom);
      return {
        workHeight: work?.getBoundingClientRect().height ?? -1,
        panelTop: panel?.getBoundingClientRect().top ?? -1,
        textBottom: text?.getBoundingClientRect().bottom ?? -1,
        rowBottoms: row,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    }, site.selectedWork[0].panel.value);
    await browser.close();
    return { ...layout, errors };
  }

  it("stacks the featured panel under the featured text at 1280", async () => {
    for (const textPercent of [100, 200] as const) {
      const layout = await measureWork(1280, 800, textPercent);
      expect(
        layout.panelTop,
        `1280 ${textPercent}% panel top`,
      ).toBeGreaterThanOrEqual(layout.textBottom);
    }
  });

  it("shortens #work at 1280 versus main at 100% and 200% text", async () => {
    for (const textPercent of [100, 200] as const) {
      const layout = await measureWork(1280, 800, textPercent);
      expect(
        layout.workHeight,
        `1280 ${textPercent}% #work height`,
      ).toBeLessThan(MAIN_WORK_HEIGHT[1280][textPercent]);
    }
  });

  it("does not grow #work on phones versus main at 100% and 200% text", async () => {
    for (const [width, height] of [
      [320, 844],
      [390, 844],
    ] as const) {
      for (const textPercent of [100, 200] as const) {
        const layout = await measureWork(width, height, textPercent);
        expect(
          layout.workHeight,
          `${width} ${textPercent}% #work height`,
        ).toBeLessThanOrEqual(MAIN_WORK_HEIGHT[width][textPercent]);
      }
    }
  });

  it("keeps the two-column row bottoms equal at 768 and 1280", async () => {
    for (const width of [768, 1280] as const) {
      const layout = await measureWork(width, 800, 100);
      expect(layout.rowBottoms, `${width} row cards`).toHaveLength(2);
      expect(
        Math.abs(layout.rowBottoms[0] - layout.rowBottoms[1]),
        `${width} row bottom delta`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("does not scroll sideways at 320, 390, or 1280", async () => {
    for (const [width, height] of [
      [320, 844],
      [390, 844],
      [1280, 800],
    ] as const) {
      const layout = await measureWork(width, height, 100);
      expect(layout.overflow, `${width} overflow`).toBe(false);
    }
  });

  it("does not log console errors at 320, 390, or 1280", async () => {
    for (const [width, height] of [
      [320, 844],
      [390, 844],
      [1280, 800],
    ] as const) {
      const layout = await measureWork(width, height, 100);
      expect(layout.errors, `${width} console`).toEqual([]);
    }
  });
});
