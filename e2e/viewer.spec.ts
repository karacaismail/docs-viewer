// Kabul kriterleri e2e kanıtları — 14 §2 listesinin otomasyonu
import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

const FIRST = "/docs/egitim/edu-overview";
const KERNEL = "/docs/kernel/kernel-authz"; // code block + tablo içeren temsilî sayfa

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "yatay scroll farkı (px)").toBeLessThanOrEqual(0);
}

test.describe("320px sözleşmesi (kabul #1)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 9999) > 320, "yalnız mobile-320 projesi");

  test("eğitim sayfası yatay scroll üretmez", async ({ page }) => {
    await page.goto(FIRST);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await noHorizontalScroll(page);
  });

  test("tablo + code block'lu kernel sayfası yatay scroll üretmez", async ({ page }) => {
    await page.goto(KERNEL);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await noHorizontalScroll(page);
  });

  test("mobile drawer açılır ve Escape ile kapanır", async ({ page }) => {
    await page.goto(FIRST);
    await page.getByRole("button", { name: "Kategoriler" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("klavye akışı (kabul #7, 13 §Overlay)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 900, "desktop akışı");

  test("Ctrl+K → sorgu → ok → Enter → block anchor'a iner; Escape kapatır", async ({ page }) => {
    await page.goto(FIRST);
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    await expect(input).toBeFocused();
    await input.fill("outbox");
    await expect(page.getByRole("option").first()).toBeVisible();
    // Glossary sonuçları tasarım gereği hash taşımaz (13 §Overlay 4);
    // block sonucuna inene kadar ok ile gez — klavye sözleşmesinin kendisi de böylece test edilir
    for (let i = 0; i < 10; i += 1) {
      const active = page.locator('[role="option"][aria-selected="true"]');
      if ((await active.getAttribute("data-kind")) === "block") break;
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#block-/);
    const hash = new URL(page.url()).hash.slice(1);
    await expect(page.locator(`[id="${hash}"]`)).toBeVisible();

    // Escape sözleşmesi
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("combobox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("combobox")).toBeHidden();
  });

  test("boş sonuç durumu duyurulur", async ({ page }) => {
    await page.goto(FIRST);
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("xqzwkvbnmasdf");
    await expect(page.getByRole("status")).toContainText("Sonuç bulunamadı");
  });
});

test.describe("explanation panel sözleşmesi (kabul #10, 12 §Etkileşim)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 900, "desktop akışı");

  test("panel açılır; Escape kapatır; focus tetikleyiciye döner; arka plan scroll kilitlenir", async ({
    page,
  }) => {
    await page.goto(KERNEL);
    const chip = page.locator(".term-chip").first();
    await chip.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Scroll kilidi (Radix body lock)
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe("hidden");

    // Focus trap: Tab dialog içinde kalır
    await page.keyboard.press("Tab");
    const inDialog = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(inDialog).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(chip).toBeFocused(); // focus dönüşü
  });

  test("inline term: !/? ikili kontrol sözleşmesi (12 §3)", async ({ page }) => {
    await page.goto("/docs/egitim/edu-u08-eventbus");
    const term = page.locator(".term-wrap").first();
    await term.scrollIntoViewIfNeeded();
    // `!` kısa açıklama popover'ı (tap/click ile — hover şartı yok)
    await term.getByRole("button", { name: /kısa açıklama/ }).click();
    await expect(page.locator(".tooltip")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".tooltip")).toBeHidden();
    // `?` uzun açıklama panelini açar; Escape kapatır
    await term.getByRole("button", { name: /panelini aç/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("checklist ilerlemesi localStorage'da kalıcıdır (07A §3 kapanışı)", async ({ page }) => {
    await page.goto("/docs/egitim/edu-u01-yazilim");
    const box = page.locator("ul.checklist input[type=checkbox]").first();
    await box.scrollIntoViewIfNeeded();
    await box.check();
    await expect(page.locator(".checklist__progress").first()).toContainText("1/");
    await page.reload();
    const after = page.locator("ul.checklist input[type=checkbox]").first();
    await after.scrollIntoViewIfNeeded();
    await expect(after).toBeChecked(); // ilerleme geri yüklendi
  });

  test("kod kopyalama panoya yazar + sr onayı (11 §code)", async ({ page, context, viewport }) => {
    test.skip((viewport?.width ?? 0) < 900, "pano izni desktop projesinde verilir");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(KERNEL);
    const block = page.locator(".codeblock").first();
    await block.scrollIntoViewIfNeeded();
    await block.getByRole("button", { name: "Kodu kopyala" }).click();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text.length).toBeGreaterThan(0);
    await expect(block.locator("[aria-live=polite]")).toHaveText("Kod panoya kopyalandı");
  });

  test("MD dışa aktarma: buton aktif, indirilen dosya adı ve içeriği sözleşmeye uyar", async ({ page }) => {
    await page.goto(KERNEL);
    const btn = page.getByRole("button", { name: "Sayfayı Markdown olarak dışa aktar" });
    await expect(btn).toBeEnabled();
    const [download] = await Promise.all([page.waitForEvent("download"), btn.click()]);
    expect(download.suggestedFilename()).toBe("kernel-authz.md");
    const path = await download.path();
    const body = path ? readFileSync(path, "utf8") : "";
    expect(body.startsWith("# ")).toBe(true);
    expect(body).toContain("Kaynak: ");
  });

  test("wbs ağacı render edilir — canvas veya erişilebilir fallback (k-wbs)", async ({ page }) => {
    await page.goto("/docs/kernel/k-wbs");
    const fig = page.locator(".wbs-chart");
    await fig.scrollIntoViewIfNeeded();
    await expect(fig.locator("canvas, ul").first()).toBeVisible({ timeout: 10000 });
  });

  test("highlightedLines satır vurgusu render edilir (11 §code)", async ({ page }) => {
    await page.goto("/docs/urunler/s-channel-hub");
    const hl = page.locator(".line--hl");
    await hl.first().scrollIntoViewIfNeeded();
    await expect(hl).toHaveCount(2);
  });

  test("rail navigasyonu yalnız klavye ile kullanılabilir (kabul: a11y §1)", async ({ page }) => {
    await page.goto(FIRST);
    // Açılışta focus h1'e taşınır (10 §Routing 4 — bilinçli tasarım); skip link çalışır durumda
    const skip = page.getByText("İçeriğe atla");
    await skip.focus();
    await expect(skip).toBeFocused();
    // Rail 1'deki bir kategoriye klavyeyle gidilebilir
    const kernelLink = page
      .getByRole("navigation", { name: "Ana kategoriler" })
      .getByRole("link", { name: /Kernel/ });
    await kernelLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/docs\/kernel\//);
    // Yeni sayfada focus h1'dedir — screen reader duyurusunun kanıtı
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("sıralı okuma gezgini: Sonraki bağlantısı bir sonraki sayfaya götürür (UX-A1)", async ({ page }) => {
    await page.goto(FIRST);
    const pager = page.getByRole("navigation", { name: "Sıralı okuma" });
    await pager.scrollIntoViewIfNeeded();
    const next = pager.getByRole("link", { name: /Sonraki/ });
    await expect(next).toBeVisible();
    const before = page.url();
    await next.click();
    await expect(page).not.toHaveURL(before);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("/sozluk dizini: filtre daraltır, ? düğmesi açıklama panelini açar (UX-C10)", async ({ page }) => {
    await page.goto("/sozluk");
    await expect(page.getByRole("heading", { level: 1, name: /Sözlük/ })).toBeVisible();
    const filter = page.getByLabel("Sözlükte terim süz");
    await filter.fill("archetype");
    const rows = page.locator(".glossary-list li");
    await expect(rows.first()).toBeVisible();
    const first = rows.first();
    await first.locator("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
