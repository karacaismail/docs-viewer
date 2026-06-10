// Geçici build çıktısını build/ içine senkronlar. Önce temizlik dener (bayat
// hash'li chunk'lar size-limit ölçümünü şişirir); unlink kısıtlı mount'ta
// üzerine-yazma fallback'i ile devam eder.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const TMP = process.env.VITE_OUT ?? "/tmp/docs-viewer-build";
if (!existsSync(TMP)) {
  console.error(`Geçici build çıktısı yok: ${TMP}`);
  process.exit(1);
}
try {
  rmSync("build", { recursive: true, force: true });
} catch {
  console.warn("build/ temizlenemedi (mount unlink kısıtı) — üzerine yazılıyor; size ölçümünü CI'a bırak");
}
mkdirSync("build", { recursive: true });
cpSync(TMP, "build", { recursive: true });
console.log(`build/ güncellendi (${TMP} -> build/)`);
