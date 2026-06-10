// E2e + a11y katmanı (05 §2.5) — build edilmiş ürün üzerinde koşar
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    // 320px sözleşmesi (01, 09): en dar desteklenen viewport
    { name: "mobile-320", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 740 }, hasTouch: true } },
  ],
});
