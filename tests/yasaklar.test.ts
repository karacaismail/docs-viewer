// Yasak taraması (14 kabul #5, #12) — kaynak kodda dangerouslySetInnerHTML ve
// codeToHtml sıfır; yasak bağımlılıklar package.json'da yok.
import { readdirSync, readFileSync, statSync } from "node:fs";
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
          if (!f.endsWith("blockRegistry.ts") || !typeOnly)
            offenders.push(`${f} -> ${spec} (type-only/registry dışı)`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("yasak bağımlılıklar yok: next, redux, flowbite, markdown renderer", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const banned = [
      "next",
      "redux",
      "@reduxjs/toolkit",
      "flowbite",
      "react-markdown",
      "marked",
      "markdown-it",
    ];
    expect(deps.filter((d) => banned.includes(d))).toEqual([]);
  });
});

// ADR-0009 sağlaması: "doctype" kelimesi projede yaşamaz — kavramın adı ArcheType'tır.
// Muaf: slug/dosya-yolu token'ları (link kararlılığı) ve ADR-0009'un kendisi (tarihî kayıt).
it("yasak kelime: doctype — içerik/doc/src'de geçmez (ADR-0009 kapısı)", () => {
  const PROTECTED = ["edu-u25-doctype-vs-ddd", "edu-u03-doctype", "k-schema-doctype"];
  const scan = (dir: string, exts: string[], skip: (f: string) => boolean = () => false): string[] => {
    const hits: string[] = [];
    for (const f of readdirSync(dir, { recursive: true }) as string[]) {
      const full = join(dir, f);
      if (!exts.some((e) => f.endsWith(e)) || skip(f)) continue;
      let body = readFileSync(full, "utf8");
      for (const t of PROTECTED) body = body.replaceAll(t, "");
      if (/doctype/i.test(body)) hits.push(full);
    }
    return hits;
  };
  const hits = [
    ...scan("content-source", [".json"]),
    ...scan("docs", [".md"], (f) => f.includes("01I-adr-0009")),
    ...scan("src", [".ts", ".tsx"], (f) => f.startsWith("data")),
    ...scan("tools/migrate", [".mjs", ".json"]),
    ...scan("tools/assets", [".mjs"]),
  ];
  expect(hits).toEqual([]);
});
