// Smoke: router + shell + ilk page gerçekten render oluyor (05 §2.5 karşılığı, jsdom)
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createRouter, createMemoryHistory } from "@tanstack/react-router";
import { registerCoreBlocks } from "../src/components/content/registerBlocks";
import { rootRoute, docRoute } from "../src/app/router";
import { navigation, pages } from "../src/engine";

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

  it("kernel kategorisinden bir sayfa block'larıyla render olur", async () => {
    const kernelPage = pages.find((p) => p.categoryId === "kernel" && p.blocks.length > 5);
    expect(kernelPage).toBeTruthy();
    const [section, page] = kernelPage!.slug.split("/");
    renderAt(`/docs/${section}/${page}`);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: kernelPage!.title })).toBeTruthy();
    });
    // Özet callout'u (enrich.info -> ilk block) DOM'da
    expect(document.getElementById(kernelPage!.blocks[0].id)).toBeTruthy();
  });
});
