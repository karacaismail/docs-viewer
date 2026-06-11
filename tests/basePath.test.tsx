// Pages alt-dizin yayını (ADR-0003): mutlak varlık yolları BASE_URL ile öneklenir.
// Canlıda yakalanan hata: /assets/... base'siz istek -> 404 -> görsel fallback'i.
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageBlock } from "../src/components/content/blocks/basicBlocks";
import { stripBase, withBase } from "../src/engine";

describe("base path (kök yayında no-op)", () => {
  it("withBase: mutlak yol korunur, göreli/dış URL'e dokunulmaz", () => {
    // test ortamında BASE_URL "/" -> no-op; sözleşme: "/" ile başlamayan değişmez
    expect(withBase("/assets/x.svg")).toBe("/assets/x.svg");
    expect(withBase("https://a.b/c.svg")).toBe("https://a.b/c.svg");
  });

  it("stripBase: kökte pathname aynen döner", () => {
    expect(stripBase("/docs/urunler/s-crm")).toBe("/docs/urunler/s-crm");
  });

  it("ImageBlock object.data withBase'ten geçer (kökte src birebir)", () => {
    const { container } = render(
      <ImageBlock
        block={{ id: "b-t-img2", type: "image", src: "/assets/stack/s-crm.svg", alt: "alt metin" }}
      />,
    );
    expect(container.querySelector("object")?.getAttribute("data")).toBe("/assets/stack/s-crm.svg");
  });
});
