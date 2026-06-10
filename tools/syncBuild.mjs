// Geçici build çıktısını build/ içine kopyalar (üzerine yazma; unlink gerekmez).
import { cpSync, existsSync, mkdirSync } from "node:fs";

const TMP = process.env.VITE_OUT ?? "/tmp/docs-viewer-build";
if (!existsSync(TMP)) {
  console.error(`Geçici build çıktısı yok: ${TMP}`);
  process.exit(1);
}
mkdirSync("build", { recursive: true });
cpSync(TMP, "build", { recursive: true });
console.log(`build/ güncellendi (${TMP} -> build/)`);
