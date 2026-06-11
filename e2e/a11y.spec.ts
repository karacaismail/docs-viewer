// axe-core taraması — kritik/ciddi ihlal sıfır (14 §1.5, kabul #11)

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/docs/egitim/edu-overview", // eğitim: checklist + tablo + steps
  "/docs/kernel/kernel-authz", // code block + callout yoğun
  "/docs/genel/overview", // cardGrid + image fallback + kv
  "/docs/stack/stack-workspace", // aday katalog şablonu: paket kartı + kv-row + callout
  "/docs/stack/stack-editions", // KAVRAM kaydı: taksonomi kartı + 5'li kv-row + parse'lı paragraph
  "/docs/backend/be-kararlar", // KARAR şablonu: uzun definitionList + callout'lar + Rail 1 bölüm başlıkları
  "/docs/kernel/k-wbs", // wbsChart: canvas role=img + fallback listesi
];

test.describe("axe-core a11y taraması", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 900, "desktop taraması yeterli");

  for (const path of PAGES) {
    test(`kritik/ciddi ihlal yok: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("heading", { level: 1 }).waitFor();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node)`)).toEqual([]);
    });
  }

  test("explanation panel açıkken de ihlal yok", async ({ page }) => {
    await page.goto("/docs/kernel/kernel-authz");
    await page.locator(".term-chip").first().click();
    await page.getByRole("dialog").waitFor();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
