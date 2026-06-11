// Bileşen kontrat testleri — DOM semantiği assert edilir, class değil (05 §2.3)
// dangerouslySetInnerHTML kullanılmadığının kanıtı ayrıca kaynak taramasıyla (yasaklar.test.ts)

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

import { CalloutBlock, HeadingBlock, ListBlock } from "../src/components/content/blocks/basicBlocks";
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
    render(
      <CalloutBlock
        block={{
          id: "block-t-c",
          type: "callout",
          variant: "danger",
          title: "Dikkat",
          segments: seg("Kritik durum"),
        }}
      />,
    );
    expect(screen.getByText("Dikkat")).toBeTruthy();
    expect(screen.getByText("Kritik durum")).toBeTruthy();
  });

  it("table: caption + th scope=col", () => {
    render(
      <TableBlock
        block={{
          id: "block-t-tbl",
          type: "table",
          caption: "Karşılaştırma",
          columns: ["A", "B"],
          rows: [[seg("1"), seg("2")]],
        }}
      />,
    );
    expect(screen.getByRole("table")).toBeTruthy();
    const ths = screen.getAllByRole("columnheader");
    expect(ths).toHaveLength(2);
    expect(ths[0].getAttribute("scope")).toBe("col");
  });

  it("stepList: ol listesi", () => {
    render(
      <StepListBlock
        block={{ id: "block-t-s", type: "stepList", steps: [{ title: "Adım", segments: seg("yap") }] }}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
  });

  it("definitionList: dt/dd çiftleri", () => {
    const { container } = render(
      <DefinitionListBlock
        block={{
          id: "block-t-d",
          type: "definitionList",
          items: [{ term: "component", definition: seg("parça") }],
        }}
      />,
    );
    expect(container.querySelector("dt")?.textContent).toBe("component");
    expect(container.querySelector("dd")?.textContent).toBe("parça");
  });

  it("list: ordered=true ol üretir", () => {
    render(<ListBlock block={{ id: "block-t-l", type: "list", ordered: true, items: [seg("bir")] }} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });
});

describe("pedagojik block kontratları", () => {
  it("useCase: title + scenario + outcome", async () => {
    const { UseCaseBlock } = await import("../src/components/content/blocks/listBlocks");
    render(
      <UseCaseBlock
        block={{
          id: "block-t-uc",
          type: "useCase",
          title: "Persona",
          scenario: seg("bağlam"),
          outcome: seg("sonuç"),
        }}
      />,
    );
    expect(screen.getByText("Persona")).toBeTruthy();
    expect(screen.getByText("sonuç")).toBeTruthy();
  });

  it("caseStudy: title + story", async () => {
    const { CaseStudyBlock } = await import("../src/components/content/blocks/listBlocks");
    render(
      <CaseStudyBlock block={{ id: "block-t-cs", type: "caseStudy", title: "Vaka", story: seg("hikâye") }} />,
    );
    expect(screen.getByText("hikâye")).toBeTruthy();
  });

  it("cardGrid: kart başlıkları render edilir", async () => {
    const { CardGridBlock } = await import("../src/components/content/blocks/listBlocks");
    render(
      <CardGridBlock
        block={{ id: "block-t-cg", type: "cardGrid", cards: [{ title: "Kart 1", segments: seg("içerik") }] }}
      />,
    );
    expect(screen.getByText("Kart 1")).toBeTruthy();
  });

  it("checklist: title + liste yapısı", async () => {
    const { ChecklistBlock } = await import("../src/components/content/blocks/listBlocks");
    render(
      <ChecklistBlock
        block={{
          id: "block-t-chk",
          type: "checklist",
          title: "Hazırlık",
          items: [{ segments: seg("madde") }],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Hazırlık" })).toBeTruthy();
    expect(screen.getByRole("list").tagName).toBe("UL");
  });

  it("lessonHeader: ünite + hedefler", async () => {
    const { LessonHeaderBlock } = await import("../src/components/content/blocks/listBlocks");
    render(
      <LessonHeaderBlock
        block={{
          id: "block-t-lh",
          type: "lessonHeader",
          unit: "Ünite 01",
          title: "Başlık",
          level: "baslangic",
          durationMin: 45,
          prereq: [],
          goals: ["hedef bir"],
        }}
      />,
    );
    expect(screen.getByText("Ünite 01")).toBeTruthy();
    expect(screen.getByText("hedef bir")).toBeTruthy();
  });

  it("image: kayıp varlıkta erişilebilir fallback (07B §1)", async () => {
    const { ImageBlock } = await import("../src/components/content/blocks/basicBlocks");
    render(
      <ImageBlock
        block={{
          id: "block-t-img",
          type: "image",
          src: "/assets/yok.svg",
          alt: "alternatif metin",
          caption: "altyazı",
        }}
      />,
    );
    expect(screen.getAllByLabelText("alternatif metin").length).toBeGreaterThan(0);
    expect(screen.getByText("altyazı")).toBeTruthy();
  });

  it("codeBlock: highlightedLines satıra line--hl sınıfı verir (11 §code)", async () => {
    const { CodeBlock } = await import("../src/components/content/blocks/CodeBlock");
    const { container } = render(
      <CodeBlock
        block={{
          id: "block-t-code",
          type: "codeBlock",
          language: "text",
          code: "satır bir\nsatır iki\nsatır üç",
          highlightedLines: [2],
        }}
      />,
    );
    const hl = container.querySelectorAll(".line--hl");
    expect(hl.length).toBe(1);
    expect(hl[0].textContent).toContain("satır iki");
  });
});
