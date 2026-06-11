// checklist.storageKey kalıcılık kontratı (07A §3 kapanışı)
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChecklistBlock } from "../src/components/content/blocks/listBlocks";
import type { Block } from "../src/schemas";

const seg = (text: string) => [{ type: "text" as const, text }];
const block = (storageKey?: string) =>
  ({
    id: "b-chk-1",
    type: "checklist",
    title: "Hazırlık",
    ...(storageKey ? { storageKey } : {}),
    items: [{ segments: seg("adım bir") }, { segments: seg("adım iki") }],
  }) as Extract<Block, { type: "checklist" }>;

describe("ChecklistBlock storageKey kalıcılığı", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("storageKey yoksa salt-okur liste: checkbox render edilmez", () => {
    render(<ChecklistBlock block={block()} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("storageKey varsa checkbox'lar render edilir ve işaretleme localStorage'a yazılır", () => {
    render(<ChecklistBlock block={block("edu-u01")} />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(2);
    fireEvent.click(boxes[1]);
    expect(JSON.parse(window.localStorage.getItem("checklist:edu-u01") ?? "[]")).toEqual([1]);
    expect(screen.getByRole("status").textContent).toContain("1/2");
  });

  it("önceki ilerleme mount'ta geri yüklenir; bozuk veri sessizce boşa düşer", () => {
    window.localStorage.setItem("checklist:edu-u01", JSON.stringify([0]));
    render(<ChecklistBlock block={block("edu-u01")} />);
    expect((screen.getAllByRole("checkbox")[0] as HTMLInputElement).checked).toBe(true);
    cleanup();
    window.localStorage.setItem("checklist:edu-u01", "{bozuk");
    render(<ChecklistBlock block={block("edu-u01")} />);
    expect(screen.getByRole("status").textContent).toContain("0/2");
  });
});
