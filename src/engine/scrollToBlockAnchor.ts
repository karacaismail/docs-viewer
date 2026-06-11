// Hash -> block scroll + geçici highlight (08 §5, 13 §3).
// Bulunamayan hash: sayfa başı, hata yok (03 §3).
export function scrollToBlockAnchor(hash: string): void {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) {
    window.scrollTo({ top: 0 });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  el.classList.add("anchor-highlight");
  const tokenMs = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--anchor-highlight-ms"),
    10,
  );
  const ms = Number.isFinite(tokenMs) && tokenMs > 0 ? tokenMs : 1600; // token yoksa eski sabit (09A)
  window.setTimeout(() => el.classList.remove("anchor-highlight"), ms);
}
