// Bileşen kontrat testleri — DOM semantiği assert edilir, class değil (05 §2.3)
// dangerouslySetInnerHTML kullanılmadığının kanıtı ayrıca kaynak taramasıyla (yasaklar.test.ts)
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(cleanup);
import { HeadingBlock, CalloutBlock, ListBlock } from "../src/components/content/blocks/basicBlocks";
import { DefinitionListBlock, StepListBlock } from "../src/components/content/blocks/listBlocks";
import { TableBlock } from "../src/components/content/blocks/TableBlock";

const seg = (text: string) => [{ type: "text" as const, text }];

describe("block kontratları (semantik HTML — 11 §3)", () => {
  it("heading: gerçek h2-h4 + anchor id", () => {
    render(<HeadingBlock block={{ id: "block-t-h", type: "heading", level: 2, text: "Başlık" }} />);
    const h = screen.getByRole("heading", { level: 2, name: "Başlık" });
    expect(h.id).toBe("block-t-h");
  });

  it("callout: variant + title render edilir", () => {
    render(<CalloutBlock block={{ id: "block-t-c", type: "callout", variant: "danger", title: "Dikkat", segments: seg("Kritik durum") }} />);
    expect(screen.getByText("Dikkat")).toBeTruthy();
    expect(screen.getByText("Kritik durum")).toBeTruthy();
  });

  it("table: caption + th scope=col", () => {
    render(<TableBlock block={{ id: "block-t-tbl", type: "table", caption: "Karşılaştırma", columns: ["A", "B"], rows: [[seg("1"), seg("2")]] }} />);
    expect(screen.getByRole("table")).toBeTruthy();
    const ths = screen.getAllByRole("columnheader");
    expect(ths).toHaveLength(2);
    expect(ths[0].getAttribute("scope")).toBe("col");
  });

  it("stepList: ol listesi", () => {
    render(<StepListBlock block={{ id: "block-t-s", type: "stepList", steps: [{ title: "Adım", segments: seg("yap") }] }} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
  });

  it("definitionList: dt/dd çiftleri", () => {
    const { container } = render(<DefinitionListBlock block={{ id: "block-t-d", type: "definitionList", items: [{ term: "component", definition: seg("parça") }] }} />);
    expect(container.querySelector("dt")?.textContent).toBe("component");
    expect(container.querySelector("dd")?.textContent).toBe("parça");
  });

  it("list: ordered=true ol üretir", () => {
    render(<ListBlock block={{ id: "block-t-l", type: "list", ordered: true, items: [seg("bir")] }} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });
});
