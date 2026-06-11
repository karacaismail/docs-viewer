// GitHub Pages alt-dizin yayını (ADR-0003): uygulama-içi mutlak yollar BASE_URL ile öneklenir,
// router pathname'i base'den arındırılarak okunur. Kök yayında ikisi de no-op'tur.

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

/** "/assets/x.svg" → "<base>/assets/x.svg" (kökte değişmez). Göreli/dış URL'e dokunmaz. */
export function withBase(src: string): string {
  return src.startsWith("/") ? `${BASE}${src}` : src;
}

/** Router pathname'inden base önekini düşürür: "/docs-viewer/docs/a/b" → "/docs/a/b". */
export function stripBase(pathname: string): string {
  return BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || "/" : pathname;
}
