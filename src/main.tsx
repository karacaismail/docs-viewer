import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-mono/400.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./app/router";
import { registerCoreBlocks } from "./components/content/registerBlocks";
import glossaryJson from "./data/glossary.json";
import navigationJson from "./data/navigation.json";
import pagesIndexJson from "./data/pages-index.json";

registerCoreBlocks();

// Fail loudly — dev'de açılış doğrulaması (08 §1); zod prod bundle'a girmez
if (import.meta.env.DEV) {
  const { validateStaticData } = await import("./engine/validateStaticData");
  const issues = validateStaticData(navigationJson, pagesIndexJson, glossaryJson);
  if (issues.length > 0) {
    console.error("İçerik doğrulama hataları:", issues);
    document.getElementById("app")!.textContent =
      `İçerik doğrulama hatası (${issues.length}): ${issues[0].where} — ${issues[0].message}`;
    throw new Error("validateStaticData failed");
  }
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
