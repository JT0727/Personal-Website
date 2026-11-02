import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { site } from "../content/site.ts";
import { loadWritingResult, writingFeedFingerprint } from "../lib/writing.ts";

const HASH_PATH = ".cache/writing-feed.sha";

function writeDeployOutput(deploy: boolean): void {
  const dest = process.env.GITHUB_OUTPUT;
  if (dest) writeFileSync(dest, `deploy=${deploy}\n`, { flag: "a" });
  console.log(
    deploy
      ? "Writing feed changed or this is the first scheduled snapshot; deploy."
      : "Writing feed unchanged or unavailable; skip scheduled deploy.",
  );
}

const mode = process.argv[2] ?? "check";

if (mode === "check") {
  const previous = existsSync(HASH_PATH)
    ? readFileSync(HASH_PATH, "utf8").trim()
    : "";
  const result = await loadWritingResult(site.substack);
  if (!result.ok) {
    writeDeployOutput(false);
  } else {
    writeDeployOutput(writingFeedFingerprint(result.posts) !== previous);
  }
} else if (mode === "remember") {
  const result = await loadWritingResult(site.substack);
  if (!result.ok) {
    console.warn("::warning::Writing feed: could not remember fingerprint");
  } else {
    mkdirSync(".cache", { recursive: true });
    writeFileSync(HASH_PATH, `${writingFeedFingerprint(result.posts)}\n`);
  }
} else {
  console.error(`Unknown mode ${mode}`);
  process.exit(1);
}
