// Smoke: router + shell + ilk page gerçekten render oluyor (05 §2.5 karşılığı, jsdom)

import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { docRoute, rootRoute } from "../src/app/router";
import { registerCoreBlocks } from "../src/components/content/registerBlocks";
import { loadPageBlocks, navigation, pagesIndex } from "../src/engine";

beforeAll(() => {
  registerCoreBlocks();
  // jsdom scroll API'lerini implement etmez
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

function renderAt(path: string) {
  const router = createRouter({
    routeTree: rootRoute.addChildren([docRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router as never} />);
}

describe("uygulama smoke", () => {
  it("ilk navigasyon hedefi render olur (h1 + landmark'lar)", async () => {
    const first = navigation.categories[0].groups[0].items[0];
    renderAt(`/docs/${first.slug}`);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: first.title })).toBeTruthy();
    });
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
  });

  it("bilinmeyen slug fallback ekranı gösterir, exception yok (08 §4)", async () => {
    renderAt("/docs/yok/boyle-sayfa");
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Sayfa bulunamadı" })).toBeTruthy();
    });
  });

  it("kernel kategorisinden bir sayfa lazy gövdesiyle render olur", async () => {
    const entry = pagesIndex.find((p) => p.categoryId === "kernel");
    expect(entry).toBeTruthy();
    const full = await loadPageBlocks(entry!.id.slice(5));
    expect(full!.blocks.length).toBeGreaterThan(3);
    const [section, page] = entry!.slug.split("/");
    renderAt(`/docs/${section}/${page}`);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: entry!.title })).toBeTruthy();
    });
    // Lazy gövde geldi: ilk block DOM'da (özet callout'u)
    await waitFor(() => {
      expect(document.getElementById(full!.blocks[0].id)).toBeTruthy();
    });
  });
});
