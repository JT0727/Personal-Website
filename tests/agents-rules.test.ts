import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");

/** Repo-relative file path named in an AGENTS.md Test cell. */
const NAMED_FILE = /(?:tests|scripts)\/[\w./-]+\.(?:ts|tsx|mjs|js)/g;
const UNTESTABLE = /\buntestable\b/i;
/** Stable id on a testable Rule | Test row, e.g. rule:tap-targets-44px. */
const RULE_ID = /rule:[a-z0-9]+(?:-[a-z0-9]+)*/g;

type RuleRow = { rule: string; test: string };

function cellsOf(line: string): string[] {
  if (!line.startsWith("|")) return [];
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/** First markdown table whose header is Rule | Test. */
function parseRuleRows(markdown: string): RuleRow[] {
  const lines = markdown.split(/\r?\n/);
  const rows: RuleRow[] = [];
  let seenHeader = false;
  let seenSep = false;

  for (const line of lines) {
    const cells = cellsOf(line);
    if (cells.length === 0) {
      if (seenSep) break;
      seenHeader = false;
      seenSep = false;
      continue;
    }

    if (!seenHeader) {
      const header = cells.map((cell) => cell.toLowerCase());
      if (header[0] === "rule" && header[header.length - 1] === "test") {
        seenHeader = true;
      }
      continue;
    }

    if (!seenSep) {
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) {
        seenSep = true;
      }
      continue;
    }

    rows.push({ rule: cells[0] ?? "", test: cells[cells.length - 1] ?? "" });
  }

  return rows;
}

function idsIn(text: string): string[] {
  return text.match(RULE_ID) ?? [];
}

/** Contents of the files a row names. Other test files are never consulted. */
type NamedFiles = Map<string, string | null>;

function loadNamedFiles(rels: string[]): NamedFiles {
  const files: NamedFiles = new Map();
  for (const rel of rels) {
    const file = path.join(root, rel);
    files.set(rel, existsSync(file) ? readFileSync(file, "utf8") : null);
  }
  return files;
}

function rowErrors(row: RuleRow, files?: NamedFiles): string[] {
  const named = row.test.match(NAMED_FILE) ?? [];
  const untestable = UNTESTABLE.test(row.test);
  const errors: string[] = [];
  const loaded = files instanceof Map ? files : loadNamedFiles(named);

  if (!untestable && named.length === 0) {
    errors.push(
      `Rule row has neither a test file path nor an untestable marker: ${row.rule}`,
    );
  }

  for (const rel of named) {
    if (!loaded.has(rel) || loaded.get(rel) === null) {
      errors.push(`Rule row "${row.rule}" names missing path ${rel}`);
    }
  }

  if (untestable) {
    return errors;
  }

  const ids = [...new Set(idsIn(`${row.rule} ${row.test}`))];
  if (ids.length === 0) {
    errors.push(
      `Rule row lacks a stable id (expected rule:kebab-case): ${row.rule}`,
    );
    return errors;
  }

  for (const id of ids) {
    for (const rel of named) {
      const text = loaded.get(rel);
      if (text == null) continue;
      if (!text.includes(id)) {
        errors.push(`Rule id ${id} is missing from ${rel}`);
      }
    }
  }

  return errors;
}

function duplicateIdErrors(rows: RuleRow[]): string[] {
  const seen = new Map<string, number>();
  for (const row of rows) {
    if (UNTESTABLE.test(row.test)) continue;
    for (const id of new Set(idsIn(`${row.rule} ${row.test}`))) {
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
  }
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => `Rule id ${id} is duplicated`);
}

function table(body: string): string {
  return `| Rule | Test |\n| --- | --- |\n${body}`;
}

describe("AGENTS.md rule rows", () => {
  it("binds each testable row to a unique id mentioned by its named tests", () => {
    const markdown = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    const rows = parseRuleRows(markdown);
    expect(
      rows.length,
      "expected a Rule | Test table in AGENTS.md",
    ).toBeGreaterThan(0);

    const errors = [
      ...rows.flatMap((row) => rowErrors(row)),
      ...duplicateIdErrors(rows),
    ];
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }
  });

  it("fails when a testable row has no rule id", () => {
    const rows = parseRuleRows(
      table("| Live site is jarrodtran.com. | `tests/base-path.test.ts` |"),
    );
    expect(rows.flatMap((row) => rowErrors(row)).join("\n")).toMatch(
      /lacks a stable id \(expected rule:kebab-case\)/,
    );
  });

  it("fails when a named test file does not mention the row id", () => {
    const files: NamedFiles = new Map([
      ["tests/named.test.ts", "it('covers something else', () => {});"],
    ]);
    const rows = parseRuleRows(
      table("| `rule:example-id` Example rule. | `tests/named.test.ts` |"),
    );
    expect(rows.flatMap((row) => rowErrors(row, files)).join("\n")).toMatch(
      /rule:example-id is missing from tests\/named\.test\.ts/,
    );
  });

  it("does not accept a rule id that appears only in an unrelated test file", () => {
    const files: NamedFiles = new Map([
      ["tests/named.test.ts", "it('covers something else', () => {});"],
      ["tests/other.test.ts", "// rule:example-id\nit('unrelated', () => {});"],
    ]);
    const rows = parseRuleRows(
      table("| `rule:example-id` Example rule. | `tests/named.test.ts` |"),
    );
    expect(rows.flatMap((row) => rowErrors(row, files)).join("\n")).toMatch(
      /rule:example-id is missing from tests\/named\.test\.ts/,
    );
  });

  it("fails the live files when the id is only in a test the row does not name", () => {
    const rows = parseRuleRows(
      table(
        "| `rule:no-photo` Do not ship a photo. | `tests/contrast.test.ts` |",
      ),
    );
    expect(rows.flatMap((row) => rowErrors(row)).join("\n")).toMatch(
      /rule:no-photo is missing from tests\/contrast\.test\.ts/,
    );
  });

  it("fails when two testable rows share an id", () => {
    const rows = parseRuleRows(
      table(
        [
          "| `rule:shared-palette` Palette colors stay shared. | `tests/palette.test.ts` |",
          "| `rule:shared-palette` Palette again. | `tests/palette.test.ts` |",
        ].join("\n"),
      ),
    );
    expect(duplicateIdErrors(rows).join("\n")).toMatch(
      /rule:shared-palette is duplicated/,
    );
  });

  it("accepts a testable row only when the named test itself mentions the id", () => {
    const files: NamedFiles = new Map([
      [
        "tests/named.test.ts",
        "// rule:example-id\nit('covers the rule', () => {});",
      ],
    ]);
    const rows = parseRuleRows(
      table("| `rule:example-id` Example rule. | `tests/named.test.ts` |"),
    );
    expect(rows.flatMap((row) => rowErrors(row, files))).toEqual([]);
  });

  it("skips id checks for untestable rows", () => {
    const rows = parseRuleRows(
      table(
        "| Do not invent career facts. | untestable: only Jarrod can confirm employers, titles, and dates |",
      ),
    );
    expect(rows.flatMap((row) => rowErrors(row))).toEqual([]);
    expect(duplicateIdErrors(rows)).toEqual([]);
  });
});
