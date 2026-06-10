// Migration deterministiktir: ikinci çalıştırma diff üretmez (07 kabul, 14 kabul #14)
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { readdirSync } from "node:fs";

const hashAll = () => {
  const files = [
    ...readdirSync("src/data").filter((f) => f.endsWith(".json")).map((f) => `src/data/${f}`),
    ...readdirSync("src/data/pages").map((f) => `src/data/pages/${f}`),
  ].sort();
  return files.map((f) => createHash("sha256").update(readFileSync(f)).digest("hex"));
};

describe("migration determinizmi", () => {
  it("iki çalıştırma aynı çıktıyı üretir", () => {
    const before = hashAll();
    execSync("node tools/migrate/index.mjs", { stdio: "pipe" });
    const after = hashAll();
    expect(after).toEqual(before);
  }, 60_000);
});
