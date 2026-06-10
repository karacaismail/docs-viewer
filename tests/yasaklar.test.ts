// Yasak taraması (14 kabul #5, #12) — kaynak kodda dangerouslySetInnerHTML ve
// codeToHtml sıfır; yasak bağımlılıklar package.json'da yok.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx|mjs)$/.test(f) ? [p] : [];
  });
}

describe("yasaklar (01 §Yasaklar)", () => {
  it("dangerouslySetInnerHTML ve codeToHtml kaynak kodda yok", () => {
    const files = [...walk("src"), ...walk("tools")];
    const offenders = files.filter((f) => {
      if (f.endsWith("yasaklar.test.ts")) return false;
      const c = readFileSync(f, "utf8");
      return c.includes("dangerouslySetInnerHTML") || c.includes("codeToHtml");
    });
    expect(offenders).toEqual([]);
  });

  it("yasak bağımlılıklar yok: next, redux, flowbite, markdown renderer", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const banned = ["next", "redux", "@reduxjs/toolkit", "flowbite", "react-markdown", "marked", "markdown-it"];
    expect(deps.filter((d) => banned.includes(d))).toEqual([]);
  });
});
