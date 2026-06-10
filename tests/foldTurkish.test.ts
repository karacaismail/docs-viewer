// 13A §4 — fold birim testleri; İ/I combining-dot vakası dahil
import { describe, expect, it } from "vitest";
import { foldTurkish } from "../src/engine/foldTurkish";

describe("foldTurkish (13A §2 sözleşmesi)", () => {
  it("gerçek veri doğrulama tablosu", () => {
    expect(foldTurkish("İdempotency")).toBe("idempotency");
    expect(foldTurkish("Sürdürülebilirlik")).toBe("surdurulebilirlik");
    expect(foldTurkish("ILIŞKI")).toBe("iliski");
    expect(foldTurkish("ÇOK KİRACILIK")).toBe("cok kiracilik");
    expect(foldTurkish("IBAN")).toBe("iban");
    expect(foldTurkish("E-Belge")).toBe("e-belge");
  });

  it("İ/I lowercase tuzağı: 'id' asla 'ıd' olmaz, combining dot temizlenir", () => {
    expect(foldTurkish("ID")).toBe("id");
    expect(foldTurkish("İ")).toBe("i");
    expect(foldTurkish("İ").length).toBe(1); // U+0307 kalıntısı yok
    expect(foldTurkish("ı")).toBe("i");
  });

  it("diacritic varyantları aynı forma düşer (47 çift-yazım grubu)", () => {
    const variants = ["doküman", "döküman", "dokuman"];
    const folded = new Set(variants.map(foldTurkish));
    expect(folded.size).toBe(1);
    expect(foldTurkish("farklı")).toBe(foldTurkish("farkli"));
    expect(foldTurkish("açıklama")).toBe(foldTurkish("aciklama"));
  });

  it("pozisyon korunur: Türkçe karakterler 1:1 dönüşür", () => {
    const s = "Müşteri İlişkileri";
    expect(foldTurkish(s).length).toBe(s.length);
  });
});
