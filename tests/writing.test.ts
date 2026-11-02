import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchSubstackPosts,
  formatPostDate,
  isOwnWritingUrl,
  isSubstackUrl,
  loadWriting,
  parseFeed,
  WRITING_BLURB_MAX_CHARS,
  WRITING_FEED_TIMEOUT_MS,
  WRITING_POST_LIMIT,
  type SubstackConfig,
} from "@/lib/writing";
import {
  WRITING_FIXTURE_LONG_BLURB,
  WRITING_FIXTURE_SECRET_BODY,
  WRITING_FIXTURE_TITLES,
} from "./fixtures/writing/titles";

const fixtures = path.join(__dirname, "fixtures/writing");
const threeXml = readFileSync(path.join(fixtures, "three-posts.xml"), "utf8");
const sixXml = readFileSync(path.join(fixtures, "six-posts.xml"), "utf8");
const emptyXml = readFileSync(path.join(fixtures, "empty.xml"), "utf8");

const ownFeed: SubstackConfig = {
  name: "",
  url: "https://jarrodtran.substack.com",
  feedUrl: "https://jarrodtran.substack.com/feed",
};

function stubFeed(body: string, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok,
        status: ok ? 200 : 503,
        text: async () => body,
      }),
  );
}

describe("isSubstackUrl", () => {
  it("accepts only Substack hosts", () => {
    expect(isSubstackUrl("https://jarrodtran.substack.com")).toBe(true);
    expect(isSubstackUrl("https://example.com")).toBe(false);
    expect(isSubstackUrl("not-a-url")).toBe(false);
  });
});

describe("isOwnWritingUrl", () => {
  it("keeps only https links on jarrodtran.substack.com", () => {
    expect(isOwnWritingUrl("https://jarrodtran.substack.com/p/aurora")).toBe(
      true,
    );
    expect(isOwnWritingUrl("http://jarrodtran.substack.com/p/aurora")).toBe(
      false,
    );
    expect(isOwnWritingUrl("https://other.substack.com/p/aurora")).toBe(false);
    expect(isOwnWritingUrl("https://substack.com/p/aurora")).toBe(false);
  });
});

describe("parseFeed", () => {
  it("reads a 3-post fixture newest-capable, strips HTML, caps blurbs, and drops foreign or http links", () => {
    const posts = parseFeed(threeXml);
    expect(posts.map((post) => post.title)).toEqual([
      ...WRITING_FIXTURE_TITLES,
    ]);
    expect(posts).toHaveLength(3);
    expect(posts[0]?.href).toBe("https://jarrodtran.substack.com/p/zxq-aurora");
    expect(posts[0]?.summary).toBe(
      WRITING_FIXTURE_LONG_BLURB.slice(0, WRITING_BLURB_MAX_CHARS).trimEnd(),
    );
    expect(posts[0]?.summary.length).toBeLessThanOrEqual(
      WRITING_BLURB_MAX_CHARS,
    );
    expect(posts[0]?.summary).not.toContain("<");
    expect(posts[1]?.summary).toBe("Beacon note after HTML is gone.");
    expect(posts[2]?.summary).toBe("");
    expect(
      posts.some((post) => post.summary.includes(WRITING_FIXTURE_SECRET_BODY)),
    ).toBe(false);
    expect(posts.some((post) => post.href.includes("other.substack.com"))).toBe(
      false,
    );
    expect(posts.some((post) => post.href.startsWith("http://"))).toBe(false);
  });

  it("reads Atom entries on the own host and ignores entry bodies", () => {
    const atom = `<?xml version="1.0"?>
<feed>
  <entry>
    <title>Atom essay</title>
    <link href="https://jarrodtran.substack.com/p/atom"/>
    <published>2026-03-03T12:00:00Z</published>
    <summary>From Atom.</summary>
    <content>ZXQ_WRITING_FIXTURE_SECRET_BODY</content>
  </entry>
</feed>`;
    expect(parseFeed(atom)).toEqual([
      {
        title: "Atom essay",
        href: "https://jarrodtran.substack.com/p/atom",
        date: "2026-03-03T12:00:00.000Z",
        summary: "From Atom.",
      },
    ]);
  });
});

describe("formatPostDate", () => {
  it("formats a real date in en-GB", () => {
    expect(formatPostDate("2026-03-01T12:00:00.000Z")).toBe("1 Mar 2026");
  });

  it("uses America/Chicago so a UTC morning does not keep the UTC calendar day", () => {
    expect(formatPostDate("2026-11-02T05:00:00.000Z")).toBe("1 Nov 2026");
    expect(formatPostDate("2026-11-02T18:00:00.000Z")).toBe("2 Nov 2026");
  });

  it("returns an empty string when the date is unparseable", () => {
    expect(formatPostDate("not-a-date")).toBe("");
  });
});

describe("fetchSubstackPosts and loadWriting", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns [] when the feed URL is empty", async () => {
    expect(
      await fetchSubstackPosts({ name: "", url: "", feedUrl: "" }),
    ).toEqual([]);
  });

  it("returns [] and warns on non-200, throw, timeout, or malformed XML", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const timeout = vi.spyOn(AbortSignal, "timeout");

    stubFeed(threeXml, false);
    expect(await fetchSubstackPosts(ownFeed)).toEqual([]);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await fetchSubstackPosts(ownFeed)).toEqual([]);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("aborted"), { name: "TimeoutError" }),
        ),
    );
    expect(await fetchSubstackPosts(ownFeed)).toEqual([]);

    stubFeed("<html>not a feed</html>");
    expect(await fetchSubstackPosts(ownFeed)).toEqual([]);

    expect(timeout).toHaveBeenCalledWith(WRITING_FEED_TIMEOUT_MS);
    const warnings = warn.mock.calls.map((call) => String(call[0]));
    expect(warnings.length).toBeGreaterThanOrEqual(4);
    expect(warnings.every((message) => message.startsWith("::warning::"))).toBe(
      true,
    );
  });

  it("loads a live fixture newest first without inventing posts", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFeed(threeXml);
    const posts = await loadWriting(ownFeed);
    expect(posts.map((post) => post.title)).toEqual([
      ...WRITING_FIXTURE_TITLES,
    ]);
    expect(posts[0]?.date).toBe("2026-11-02T18:00:00.000Z");
    expect(posts[1]?.date).toBe("2026-11-02T05:00:00.000Z");
    expect(formatPostDate(posts[1]?.date ?? "")).toBe("1 Nov 2026");
    expect(warn).not.toHaveBeenCalled();
  });

  it("caps shown posts at 5 from a larger fixture", async () => {
    stubFeed(sixXml);
    const posts = await loadWriting(ownFeed);
    expect(WRITING_POST_LIMIT).toBe(5);
    expect(posts).toHaveLength(5);
    expect(posts.map((post) => post.title)).toEqual([
      "ZXQ Writing Fixture Aurora",
      "ZXQ Writing Fixture Beacon",
      "ZXQ Writing Fixture Cedar",
      "ZXQ Writing Fixture Drift",
      "ZXQ Writing Fixture Ember",
    ]);
  });

  it("treats a valid empty feed as zero posts and does not warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFeed(emptyXml);
    expect(await loadWriting(ownFeed)).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("daily deploy wiring", () => {
  it("keeps push and manual deploys and adds a daily schedule that can skip unchanged feeds", () => {
    const deploy = readFileSync(
      path.resolve(__dirname, "../.github/workflows/deploy.yml"),
      "utf8",
    );
    expect(deploy).toMatch(/push:\n\s+branches:\s*\[main\]/);
    expect(deploy).toContain("workflow_dispatch");
    expect(deploy).toMatch(/schedule:/);
    expect(deploy).toMatch(/cron:\s*["']\S+ \S+ \* \* \*["']/);
    expect(deploy).toContain("scripts/feed-changed.ts");
    expect(deploy).toContain("github.event_name == 'schedule'");
  });

  it("runs the writing-output check after the production build in CI and deploy", () => {
    const ci = readFileSync(
      path.resolve(__dirname, "../.github/workflows/ci.yml"),
      "utf8",
    );
    const deploy = readFileSync(
      path.resolve(__dirname, "../.github/workflows/deploy.yml"),
      "utf8",
    );
    expect(ci).toMatch(/pnpm test:tap\n\s+- run: pnpm test:writing-output/);
    expect(deploy).toContain("pnpm test:writing-output");
  });
});
