import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export interface WritingPost {
  title: string;
  href: string;
  date: string;
  summary: string;
}

export interface SubstackConfig {
  name: string;
  url: string;
  feedUrl: string;
}

export const WRITING_POST_LIMIT = 5;
export const WRITING_BLURB_MAX_CHARS = 220;
export const WRITING_FEED_TIMEOUT_MS = 10_000;
export const WRITING_DATE_TIME_ZONE = "America/Chicago";
export const WRITING_HOST = "jarrodtran.substack.com";

export function isSubstackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "substack.com" || host.endsWith(".substack.com");
  } catch {
    return false;
  }
}

export function isOwnWritingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === WRITING_HOST;
  } catch {
    return false;
  }
}

export function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function formatPostDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: WRITING_DATE_TIME_ZONE,
  }).format(date);
}

export function writingFeedFingerprint(posts: WritingPost[]): string {
  const normalized = posts.map((post) => ({
    title: post.title,
    href: post.href,
    date: post.date,
    summary: post.summary,
  }));
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

function warnFeed(message: string): void {
  console.warn(`::warning::Writing feed: ${message}`);
}

function decode(text: string): string {
  return oneLine(
    text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
  );
}

function capBlurb(text: string): string {
  if (text.length <= WRITING_BLURB_MAX_CHARS) return text;
  return text.slice(0, WRITING_BLURB_MAX_CHARS).trimEnd();
}

function tag(block: string, name: string): string {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return match ? decode(match[1]) : "";
}

function hrefOf(block: string): string {
  const rel = block.match(/<link\b[^>]*rel="alternate"[^>]*href="([^"]+)"/i);
  if (rel?.[1]) return rel[1];
  const any = block.match(/<link\b[^>]*href="([^"]+)"/i);
  if (any?.[1]) return any[1];
  return tag(block, "link") || tag(block, "guid");
}

function looksLikeFeed(xml: string): boolean {
  return /<(rss|feed|rdf:RDF)\b/i.test(xml);
}

function selectPosts(posts: WritingPost[]): WritingPost[] {
  return posts
    .filter((post) => isOwnWritingUrl(post.href))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, WRITING_POST_LIMIT);
}

export function parseFeed(xml: string): WritingPost[] {
  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(
    (match) => match[0],
  );
  const entries = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(
    (match) => match[0],
  );
  const blocks = items.length > 0 ? items : entries;

  const posts = blocks.flatMap((block) => {
    const title = tag(block, "title");
    const href = hrefOf(block);
    if (!title || !href || !isOwnWritingUrl(href)) return [];
    const rawDate =
      tag(block, "pubDate") || tag(block, "published") || tag(block, "updated");
    const parsed = rawDate ? new Date(rawDate) : null;
    return [
      {
        title,
        href,
        date:
          parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : "",
        summary: capBlurb(
          oneLine(tag(block, "description") || tag(block, "summary")),
        ),
      },
    ];
  });

  return posts;
}

export type WritingLoad =
  { ok: true; posts: WritingPost[] } | { ok: false; posts: []; reason: string };

function readFixturePosts(): WritingPost[] | null {
  const fixture = process.env.WRITING_FEED_PATH;
  if (!fixture) return null;
  return selectPosts(parseFeed(readFileSync(fixture, "utf8")));
}

export async function loadWritingResult(
  config: SubstackConfig,
): Promise<WritingLoad> {
  const fixture = readFixturePosts();
  if (fixture) return { ok: true, posts: fixture };

  const feedUrl = config.feedUrl.trim();
  if (!feedUrl) return { ok: true, posts: [] };

  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(WRITING_FEED_TIMEOUT_MS),
    });
    if (!response.ok) {
      const reason = `HTTP ${response.status}`;
      warnFeed(reason);
      return { ok: false, posts: [], reason };
    }
    const xml = await response.text();
    if (!looksLikeFeed(xml)) {
      const reason = "malformed feed XML";
      warnFeed(reason);
      return { ok: false, posts: [], reason };
    }
    return { ok: true, posts: selectPosts(parseFeed(xml)) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "fetch failed";
    warnFeed(reason);
    return { ok: false, posts: [], reason };
  }
}

export async function fetchSubstackPosts(
  config: SubstackConfig,
): Promise<WritingPost[]> {
  const result = await loadWritingResult(config);
  return result.posts;
}

export async function loadWriting(
  config: SubstackConfig,
): Promise<WritingPost[]> {
  const result = await loadWritingResult(config);
  return result.posts;
}
