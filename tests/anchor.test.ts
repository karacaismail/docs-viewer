// scrollToBlockAnchor birim testleri (08 §5): bulunamayan hash hata fırlatmaz
import { beforeAll, describe, expect, it, vi } from "vitest";
import { scrollToBlockAnchor } from "../src/engine/scrollToBlockAnchor";

beforeAll(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false } as MediaQueryList);
});

describe("scrollToBlockAnchor", () => {
  it("var olan block'a scroll eder ve highlight sınıfı ekler", () => {
    const el = document.createElement("div");
    el.id = "block-test-hedef";
    document.body.appendChild(el);
    scrollToBlockAnchor("#block-test-hedef");
    expect(el.scrollIntoView).toHaveBeenCalled();
    expect(el.classList.contains("anchor-highlight")).toBe(true);
  });

  it("bulunamayan hash sayfa başına gider, exception yok (03 §3)", () => {
    expect(() => scrollToBlockAnchor("#block-olmayan")).not.toThrow();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it("boş hash hiçbir şey yapmaz", () => {
    expect(() => scrollToBlockAnchor("")).not.toThrow();
  });
});
