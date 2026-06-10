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

  it("engine → UI import yasağı (08 §Kabul): engine, components'ten import edemez", () => {
    const engineFiles = walk("src/engine");
    const offenders: string[] = [];
    for (const f of engineFiles) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/^import\s[^;]*?from\s+["']([^"']+)["']/gm)) {
        const spec = m[1];
        if (spec.includes("components")) offenders.push(`${f} -> ${spec}`);
        if (spec === "react" || spec.startsWith("react-")) {
          // React referansı yalnız registry'de ve yalnız type-only olabilir (08 §2-3)
          const typeOnly = m[0].startsWith("import type");
          if (!f.endsWith("blockRegistry.ts") || !typeOnly) offenders.push(`${f} -> ${spec} (type-only/registry dışı)`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("yasak bağımlılıklar yok: next, redux, flowbite, markdown renderer", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const banned = ["next", "redux", "@reduxjs/toolkit", "flowbite", "react-markdown", "marked", "markdown-it"];
    expect(deps.filter((d) => banned.includes(d))).toEqual([]);
  });
});
