// 110 görsel varlığın deterministik üretimi (07B §1 kapanışı + katalog genişlemesi).
// Renkler 09A token değerleridir (SVG'ler <object> ile izole yüklendiği için hex gömülür).
// Üç şablon ailesi: 70 ürün kartı (stack/s-*) + 13 adlandırılmış diyagram + 27 paket kartı (cards/).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCT_GROUP_MAP, PRODUCT_GROUPS } from "../migrate/categories.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "public", "assets");

// 09A paleti
const C = {
  base: "#121417",
  surface: "#1a1d21",
  elevated: "#22262c",
  borderSubtle: "#2e333a",
  borderStrong: "#5d6774",
  text: "#e8eaed",
  text2: "#b6bcc6",
  muted: "#939ba7",
  accent: "#e0b45c",
  info: "#7fb3e3",
  tip: "#85c79e",
  warn: "#dcae53",
  danger: "#e2837b",
  tr: "#6bc4ba",
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FONT = `font-family="Roboto, system-ui, sans-serif"`;

function svg(title, body, w = 800, h = 450) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<rect width="${w}" height="${h}" rx="12" fill="${C.surface}" stroke="${C.borderSubtle}"/>
${body}</svg>\n`;
}
const box = (x, y, w, h, fill, stroke = C.borderStrong, rx = 8) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const txt = (x, y, s, { size = 16, fill = C.text, anchor = "middle", weight = 400 } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const arrow = (x1, y1, x2, y2, color = C.muted) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#ar)"/>`;
const DEFS = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.muted}"/></marker></defs>`;

function wrap(s, max = 26) {
  const words = String(s).split(" ");
  const lines = [""];
  for (const w of words) {
    if (`${lines[lines.length - 1]} ${w}`.trim().length > max) lines.push(w);
    else lines[lines.length - 1] = `${lines[lines.length - 1]} ${w}`.trim();
  }
  return lines.slice(0, 3);
}

// ---- Şablon A: ürün kartı (stack/s-*) ----
function productCard(stem, title) {
  const gid = PRODUCT_GROUP_MAP[stem] ?? "diger";
  const group = PRODUCT_GROUPS.find((g) => g.id === gid)?.label ?? "Diğer";
  const lines = wrap(title, 24);
  const t = lines
    .map((l, i) => txt(230, 150 + i * 34, l, { size: 26, weight: 500, anchor: "middle" }))
    .join("");
  const layers = [
    ["Kernel — L0", C.borderSubtle, 360],
    ["Scale Primitives", C.borderSubtle, 320],
    ["In-tree Core — L1", C.borderSubtle, 280],
  ]
    .map(
      ([label, _f, y]) =>
        box(480, y, 280, 34, C.elevated, C.borderSubtle, 6) +
        txt(620, y + 22, label, { size: 14, fill: C.text2 }),
    )
    .join("");
  const body = `
${box(40, 60, 380, 330, C.elevated)}
${txt(230, 100, "Layer 2 — Stack Ürünü", { size: 14, fill: C.accent, weight: 500 })}
${t}
${box(60, 300, 340, 56, C.surface, C.borderSubtle, 6)}
${txt(230, 334, group, { size: 16, fill: C.tr, weight: 500 })}
${box(480, 200, 280, 56, C.surface, C.accent)}
${txt(620, 234, wrap(title, 22)[0], { size: 16, fill: C.accent, weight: 500 })}
${layers}
${arrow(620, 256, 620, 276)}
${txt(620, 416, "Ortak altyapı: ürün kernel'e dokunmaz", { size: 13, fill: C.muted })}`;
  return svg(`${title} — kategori ve katman pozisyonu`, body);
}

// ---- Şablon A2: paket kartı (cards/ — aday stack/dist/modül; 15 §4) ----
function packageCard(title, kindLabel, accentColor) {
  const lines = wrap(title, 26);
  const t = lines.map((l, i) => txt(400, 170 + i * 36, l, { size: 26, weight: 500 })).join("");
  return svg(
    `${title} — ${kindLabel} kartı`,
    `${box(60, 70, 680, 310, C.elevated, accentColor)}
${txt(400, 115, kindLabel, { size: 15, fill: accentColor, weight: 700 })}
${t}
${box(280, 290, 240, 50, C.surface, C.borderSubtle, 6)}
${txt(400, 321, "ADAY KATALOG KAYDI", { size: 13, fill: C.muted })}
${txt(400, 416, "Kapsam ve katman pozisyonu sayfa içeriğinde", { size: 13, fill: C.muted })}`,
  );
}

// ---- Şablon B: adlandırılmış diyagramlar ----
const named = {
  "overview-layers.svg": () => {
    const layers = [
      "Atomik Tipler",
      "Kernel — Layer 0",
      "Scale Primitives",
      "In-tree Core — L1",
      "Stack Ürünleri — L2",
      "App (Dağ) — Ürün",
    ];
    const body = layers
      .map((l, i) => {
        const w = 640 - i * 80,
          x = (800 - w) / 2,
          y = 380 - i * 58;
        const fill = i === 5 ? C.elevated : C.elevated;
        const stroke = i >= 4 ? C.accent : C.borderStrong;
        return (
          box(x, y, w, 48, fill, stroke) + txt(400, y + 30, l, { size: 17, fill: i >= 4 ? C.accent : C.text })
        );
      })
      .join("");
    return svg(
      "6 katmanlı mimari haritası — atomdan ürün ailesine",
      body + txt(400, 40, "Her katman yalnız altındakini bilir", { size: 14, fill: C.muted }),
    );
  },
  "philosophy-compass.svg": () => {
    const ps = [
      "Declarative-first",
      "Agent-native",
      "Modüler monolit",
      "Test-first",
      "Multi-tenancy day-1",
      "TR uyum birinci sınıf",
      "Anti-stack defteri",
      "ArcheType = Diferansiyatör",
    ];
    const cx = 400,
      cy = 235,
      r = 150;
    const spokes = ps
      .map((p, i) => {
        const a = (Math.PI * 2 * i) / ps.length - Math.PI / 2;
        const x = cx + Math.cos(a) * r,
          y = cy + Math.sin(a) * r;
        const lx = cx + Math.cos(a) * (r + 34),
          ly = cy + Math.sin(a) * (r + 34);
        return (
          `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${C.borderSubtle}"/>` +
          `<circle cx="${x}" cy="${y}" r="5" fill="${C.accent}"/>` +
          txt(lx, ly + 5, p, { size: 13, fill: C.text2 })
        );
      })
      .join("");
    return svg(
      "Yedi ana prensip pusulası",
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.elevated}" stroke="${C.borderStrong}"/>${spokes}${txt(cx, cy + 6, "İlkeler", { size: 18, fill: C.accent, weight: 500 })}`,
    );
  },
  "curriculum-map.svg": () => {
    let b = "";
    for (let i = 0; i < 10; i += 1) {
      const col = i % 5,
        row = Math.floor(i / 5);
      const x = 60 + col * 142,
        y = 120 + row * 160;
      b +=
        box(x, y, 118, 70, C.elevated, C.borderStrong) +
        txt(x + 59, y + 42, `Ünite ${String(i + 1).padStart(2, "0")}`, { size: 15 });
      if (col < 4) b += arrow(x + 118, y + 35, x + 142, y + 35);
    }
    b += arrow(60 + 4 * 142 + 59, 190, 60 + 59, 280 - 0); // satır geçişi
    return svg(
      "10 üniteli müfredat haritası — üniteler birbirini besler",
      b +
        txt(400, 60, "Sırayla, küçük adımlarla — her ünite bir sonrakinin ön-koşulu", {
          size: 14,
          fill: C.muted,
        }),
    );
  },
  "k-schema-doctype.svg": () => {
    const outs = ["DB Tablosu", "REST API", "Form UI", "Audit", "Hook'lar"];
    const b = outs
      .map((o, i) => {
        const x = 60 + i * 145;
        return (
          box(x, 320, 120, 56, C.elevated, C.borderStrong) +
          txt(x + 60, 354, o, { size: 14 }) +
          arrow(400, 226, x + 60, 314)
        );
      })
      .join("");
    return svg(
      "ArcheType tanımından beş otomatik çıktı",
      `${DEFS}${box(280, 110, 240, 110, C.elevated, C.accent)}${txt(400, 155, "ArcheType Tanımı", { size: 19, fill: C.accent, weight: 500 })}${txt(400, 185, "alanlar + metadata flag'leri", { size: 13, fill: C.text2 })}${b}${txt(400, 60, "Tek kaynak — el yazımı CRUD yok", { size: 14, fill: C.muted })}`,
    );
  },
  "k-bus-flow.svg": () => {
    const subs = ["Stok Modülü", "E-posta Servisi", "Sadakat Puanı"];
    const b = subs
      .map((s, i) => {
        const y = 110 + i * 110;
        return (
          box(520, y, 220, 70, C.elevated, C.borderStrong) +
          txt(630, y + 42, s, { size: 15 }) +
          arrow(330, 245, 514, y + 35)
        );
      })
      .join("");
    return svg(
      "Olay yayını — bir duyuru, üç bağımsız tepki",
      `${DEFS}${box(80, 200, 250, 90, C.elevated, C.accent)}${txt(205, 238, "order.created", { size: 18, fill: C.accent, weight: 500 })}${txt(205, 266, "Event Bus (outbox'tan)", { size: 13, fill: C.text2 })}${b}${txt(400, 420, "Yayıncı kimin dinlediğini bilmez — gevşek bağlanma", { size: 13, fill: C.muted })}`,
    );
  },
  "outbox-pattern.svg": () => {
    const steps = [
      ["İş Verisi", C.text],
      ["Outbox Satırı", C.accent],
    ];
    const inner = steps
      .map(
        ([s, f], i) =>
          box(70, 150 + i * 64, 180, 50, C.surface, C.borderSubtle, 6) +
          txt(160, 182 + i * 64, s, { size: 14, fill: f }),
      )
      .join("");
    return svg(
      "Outbox pattern — defter ile kurye asla çelişmez",
      `${DEFS}
${box(50, 100, 220, 190, C.elevated, C.accent)}${txt(160, 130, "TEK TRANSACTION", { size: 13, fill: C.accent, weight: 700 })}${inner}
${box(330, 160, 140, 70, C.elevated, C.borderStrong)}${txt(400, 202, "Worker", { size: 16 })}
${box(530, 160, 140, 70, C.elevated, C.borderStrong)}${txt(600, 202, "Event Bus", { size: 16 })}
${arrow(270, 195, 324, 195)}${arrow(470, 195, 524, 195)}
${txt(400, 360, "Dual-write yok: mesaj önce DB'ye, sonra kuyruğa", { size: 14, fill: C.muted })}`,
    );
  },
  "roadmap-7-faz.svg": () => {
    let b = `<line x1="60" y1="240" x2="740" y2="240" stroke="${C.borderStrong}" stroke-width="3"/>`;
    for (let i = 0; i < 7; i += 1) {
      const x = 80 + i * 100;
      b +=
        `<circle cx="${x}" cy="240" r="9" fill="${i < 2 ? C.tip : C.elevated}" stroke="${C.accent}"/>` +
        txt(x, i % 2 ? 290 : 210, `Faz ${i + 1}`, { size: 14, fill: C.text2 });
    }
    return svg(
      "7 fazlı 60 aylık roadmap zaman çizelgesi",
      b +
        txt(400, 100, "Stage 0 → Kernel → Scale → Core → Ürünler", { size: 15, fill: C.muted }) +
        txt(400, 380, "60 ay · 70+ ürün hedefi", { size: 13, fill: C.muted }),
    );
  },
  "jurisdiction-6-axes.svg": () => {
    const axes = ["Dil / Locale", "Para / FX", "Vergi", "Data Residency", "Hukuk / DSR", "Kültürel UX"];
    const cx = 400,
      cy = 235,
      r = 145;
    const b = axes
      .map((a, i) => {
        const ang = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const x = cx + Math.cos(ang) * r,
          y = cy + Math.sin(ang) * r;
        return (
          `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${C.borderSubtle}"/>` +
          box(x - 70, y - 18, 140, 36, C.elevated, C.borderStrong, 6) +
          txt(x, y + 5, a, { size: 13, fill: C.text2 })
        );
      })
      .join("");
    return svg(
      "Altı bağımsız uluslararasılaşma ekseni",
      b +
        `<circle cx="${cx}" cy="${cy}" r="56" fill="${C.elevated}" stroke="${C.accent}"/>` +
        txt(cx, cy + 5, "Resolver", { size: 15, fill: C.accent, weight: 500 }),
    );
  },
  "sus-actions.svg": () =>
    svg(
      "AI ajanı tipli action katmanından geçer; ham SQL yasak",
      `${DEFS}
${box(60, 180, 160, 90, C.elevated, C.borderStrong)}${txt(140, 218, "AI Ajanı", { size: 16 })}${txt(140, 246, "MCP tool çağrısı", { size: 12, fill: C.text2 })}
${box(310, 160, 220, 130, C.elevated, C.accent)}${txt(420, 200, "Tipli Action Katmanı", { size: 15, fill: C.accent, weight: 500 })}${txt(420, 228, "validation + authz", { size: 13, fill: C.text2 })}${txt(420, 252, "action budget + audit", { size: 13, fill: C.text2 })}
${box(620, 180, 120, 90, C.elevated, C.borderStrong)}${txt(680, 230, "DB", { size: 16 })}
${arrow(220, 225, 304, 225)}${arrow(530, 225, 614, 225)}
<line x1="140" y1="300" x2="660" y2="300" stroke="${C.danger}" stroke-width="2" stroke-dasharray="6 4"/>
${txt(400, 330, "Doğrudan ham SQL erişimi yok", { size: 13, fill: C.danger })}`,
    ),
  "sus-bitemporal.svg": () =>
    svg(
      "Bitemporal kayıt — iki bağımsız zaman ekseni",
      `${DEFS}
${txt(120, 150, "valid_time", { size: 14, fill: C.info, anchor: "start" })}
<line x1="120" y1="170" x2="700" y2="170" stroke="${C.info}" stroke-width="2"/>
${[200, 380, 560].map((x) => `<circle cx="${x}" cy="170" r="6" fill="${C.info}"/>`).join("")}
${txt(120, 280, "system_time", { size: 14, fill: C.accent, anchor: "start" })}
<line x1="120" y1="300" x2="700" y2="300" stroke="${C.accent}" stroke-width="2"/>
${[260, 440, 620].map((x) => `<circle cx="${x}" cy="300" r="6" fill="${C.accent}"/>`).join("")}
${txt(400, 380, "Geçmiş asla silinmez — düzeltme yeni satırdır", { size: 14, fill: C.muted })}`,
    ),
  "sus-boundaries.svg": () =>
    svg(
      "Makine-zorlamalı modül sınırı — CI kapısı",
      `${DEFS}
${box(70, 170, 180, 110, C.elevated, C.borderStrong)}${txt(160, 215, "Modül A", { size: 16 })}
${box(540, 110, 200, 70, C.elevated, C.tip)}${txt(640, 152, "B.public API", { size: 15, fill: C.tip })}
${box(540, 260, 200, 70, C.elevated, C.danger)}${txt(640, 302, "B.internal", { size: 15, fill: C.danger })}
${arrow(250, 200, 534, 145)}${txt(390, 150, "izinli", { size: 13, fill: C.tip })}
<line x1="250" y1="250" x2="534" y2="295" stroke="${C.danger}" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#ar)"/>
${txt(390, 300, "import-linter: PR fail", { size: 13, fill: C.danger })}`,
    ),
  "sus-durable.svg": () => {
    let b = DEFS;
    const steps = ["Adım 1", "Adım 2", "Adım 3", "Adım 4"];
    steps.forEach((s, i) => {
      const x = 70 + i * 180;
      const ok = i < 2;
      b +=
        box(x, 170, 140, 80, C.elevated, ok ? C.tip : i === 2 ? C.danger : C.borderStrong) +
        txt(x + 70, 205, s, { size: 15 }) +
        txt(x + 70, 232, ok ? "checkpoint ✓" : i === 2 ? "çöküş" : "bekliyor", {
          size: 12,
          fill: ok ? C.tip : i === 2 ? C.danger : C.muted,
        });
      if (i < 3) b += arrow(x + 140, 210, x + 174, 210);
    });
    b +=
      `<path d="M 500 260 Q 420 330 480 340 Q 540 350 520 300" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#ar)"/>` +
      txt(400, 390, "Yeniden başlatma: 1-2 atlanır, 3'ten devam — DBOS checkpoint", {
        size: 14,
        fill: C.muted,
      });
    return svg("Durable execution — çöküşten checkpoint ile devam", b);
  },
  "sus-versioning.svg": () =>
    svg(
      "Tarih-tabanlı versiyonlama — çekirdek tek, müşteri pinli",
      `${DEFS}
${box(60, 180, 190, 90, C.elevated, C.accent)}${txt(155, 218, "Çekirdek API", { size: 16, fill: C.accent })}${txt(155, 246, "tek güncel sürüm", { size: 12, fill: C.text2 })}
${box(330, 180, 170, 90, C.elevated, C.borderStrong)}${txt(415, 218, "Transform", { size: 16 })}${txt(415, 246, "sürüm köprüleri", { size: 12, fill: C.text2 })}
${["2026-01", "2025-06", "2024-11"].map((v, i) => box(580, 110 + i * 90, 160, 60, C.elevated, C.borderSubtle, 6) + txt(660, 147 + i * 90, `Müşteri @ ${v}`, { size: 13, fill: C.text2 })).join("")}
${arrow(250, 225, 324, 225)}${[140, 230, 320].map((y) => arrow(500, 225, 574, y)).join("")}`,
    ),
};

// ---- main ----
const pagesDir = join(ROOT, "src", "data", "pages");
const { readdirSync, readFileSync } = await import("node:fs");
const images = new Map();
for (const f of readdirSync(pagesDir)) {
  const page = JSON.parse(readFileSync(join(pagesDir, f), "utf8")).page;
  for (const b of page.blocks) if (b.type === "image") images.set(b.src, { alt: b.alt, title: page.title });
}

mkdirSync(join(OUT, "stack"), { recursive: true });
let made = 0;
for (const [src, meta] of [...images.entries()].sort()) {
  const rel = src.replace(/^\/assets\//, "");
  let content;
  if (rel.startsWith("stack/")) {
    const stem = rel.replace("stack/s-", "").replace(".svg", "");
    content = productCard(stem, meta.title);
  } else if (rel.startsWith("cards/")) {
    const stem = rel.slice(6, -4);
    if (stem.startsWith("s-")) content = productCard(stem.slice(2), meta.title);
    else if (stem.startsWith("dist-"))
      content = packageCard(meta.title, "DISTRIBUTION — SEKTÖR PAKETİ", C.tr);
    else if (stem === "stack-editions") content = packageCard(meta.title, "KAVRAM — STACK VARYANTI", C.info);
    else if (stem.startsWith("edition-")) content = packageCard(meta.title, "EDITION — UI/UX PAKETİ", C.tip);
    else if (stem === "k-terminoloji") content = packageCard(meta.title, "KAVRAM — TERMİNOLOJİ", C.info);
    else content = packageCard(meta.title, "YATAY STACK — PAKET ÜRÜN", C.accent);
  } else if (named[rel]) {
    content = named[rel]();
  } else {
    content = svg(meta.alt, txt(400, 230, wrap(meta.alt, 50)[0], { size: 16, fill: C.text2 }));
    console.warn(`şablonsuz varlık (jenerik): ${rel}`);
  }
  writeFileSync(join(OUT, rel), content);
  made += 1;
}
console.log(`OK: ${made} SVG üretildi -> public/assets/`);
