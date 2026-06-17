// Üretim Sözleşmesi üreticisi (16 boyut) — her sayfaya standart, yapısal bir
// "Üretim Sözleşmesi" bölümü + zenginleştirilmiş kopyalanabilir üretim prompt'u enjekte eder.
// Boyutlar AGENTS.md sözleşmesiyle hizalı; sayfaya özel derinlik tools/uretim/overlays/<stem>.json
// overlay'inden gelir (seven-questions.json deseni). Overlay yoksa cluster-temelli güvenli varsayılan.
// Kapı: tests/uretimSozlesmesi.test.ts. ADR-0007/0009 yasak kelimeleri ve yeni glossary terimi üretilmez.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseInline } from "./inline.mjs";

// ---- Overlay yükleme (deterministik) ----
export function loadUretimOverlays(rootDir) {
  const dir = join(rootDir, "tools", "uretim", "overlays");
  const map = {};
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    try {
      map[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(join(dir, f), "utf8"));
    } catch {
      // bozuk overlay sessizce atlanır; varsayılan devreye girer (migrate'i kırmaz)
    }
  }
  return map;
}

// ---- Çıktı-format blok kurucuları (nextId ile benzersiz id) ----
const mk = (nextId) => {
  const h = (level, text) => ({ id: nextId(`urs-h`), type: "heading", level, text });
  const p = (text) => ({ id: nextId("urs-p"), type: "paragraph", segments: seg(text) });
  const callout = (variant, title, text) => ({
    id: nextId("urs-co"),
    type: "callout",
    variant,
    ...(title ? { title } : {}),
    segments: seg(text),
  });
  const dl = (items) => ({
    id: nextId("urs-dl"),
    type: "definitionList",
    items: items.map((it) => ({
      term: it.name,
      definition: it.critical ? [{ type: "strong", text: "Kritik. " }, ...seg(it.desc)] : seg(it.desc),
    })),
  });
  const table = (caption, columns, rows) => ({
    id: nextId("urs-table"),
    type: "table",
    ...(caption ? { caption } : {}),
    columns,
    rows: rows.map((r) => r.map((c) => seg(c))),
  });
  const checklist = (title, items) => ({
    id: nextId("urs-chk"),
    type: "checklist",
    ...(title ? { title } : {}),
    items: items.map((label) => ({ segments: seg(label) })),
  });
  const code = (title, language, codeStr) => ({
    id: nextId("urs-code"),
    type: "codeBlock",
    ...(title ? { title } : {}),
    language,
    code: codeStr,
    copyEnabled: true,
  });
  const divider = () => ({ id: nextId("urs-div"), type: "divider" });
  return { h, p, callout, dl, table, checklist, code, divider };
};

// parseInline boş dizi döndürürse paragraph şeması kırılır — güvenli sarmalayıcı.
function seg(text) {
  const s = parseInline(String(text ?? ""));
  return s.length ? s : [{ type: "text", text: String(text ?? " ") }];
}

// ---- Sayfa sınıflandırma (cluster + granülerlik → çerçeveleme) ----
const BUILD_LEVEL = {
  kaya: "Module (Kaya)",
  "orta-tas": "View (Orta Taş)",
  "buyuk-tas": "ArcheType (Büyük Taş)",
};
const BUILD_EXCLUDE = new Set(["edu", "egitim", "sus", "kararlar", "dx", "meta", "atomic", "build", "genel"]);

function classify(data) {
  const c = data.cluster ?? "";
  const g = data.granularity ?? "";
  const buildable = !!BUILD_LEVEL[g] && !BUILD_EXCLUDE.has(c);
  let kind = "domain";
  if (buildable) kind = "buildable";
  else if (c === "kernel") kind = "kernel";
  else if (c === "backend" || c === "frontend") kind = c;
  else if (c === "crosscut") kind = "crosscut";
  else if (c === "sus") kind = "governance";
  else if (c === "kararlar") kind = "decision";
  else if (c === "edu" || c === "egitim") kind = "education";
  else if (c === "aday") kind = "candidate";
  else if (c === "scale") kind = "scale";
  else if (c === "data-intelligence") kind = "data";
  else if (c === "layer0" || c === "layer1") kind = "layer";
  else if (c === "dx" || c === "meta" || c === "atomic" || c === "vertical") kind = "meta";
  return { buildable, kind, level: BUILD_LEVEL[g] ?? null };
}

// ---- Varsayılan içerik blokları (overlay ile ezilir) ----
function featureDefaults(title, kind) {
  const map = {
    buildable: [
      {
        name: `${title} — çekirdek yetenek`,
        desc: "Bu birimin sahibi olduğu birincil iş yeteneği; bildirimsel tanım + projekte eden Surface.",
        critical: true,
      },
      {
        name: "Alan bayrakları",
        desc: "Para=Money (Decimal), kişisel veri=`pii`(+retention), tarihçeli=`bitemporal`, her şey audit'li.",
      },
      {
        name: "Sözleşmeli sınır",
        desc: "Dış erişim yalnız Contract (API kapısı) üzerinden; doğrudan tablo erişimi yok.",
      },
    ],
    governance: [
      {
        name: "Politika yüzeyi",
        desc: "Bu sayfanın tanımladığı kural/kapı; deny-by-default ve kanıtlanabilir uygulama.",
        critical: true,
      },
      { name: "Kapı koşulu", desc: "İhlalde işi reddeden deterministik kontrol (CI veya runtime)." },
    ],
    decision: [
      {
        name: "Karar kapsamı",
        desc: "ADR'nin bağladığı invariant; alternatifler ve seçilen yön.",
        critical: true,
      },
      { name: "Uygulama etkisi", desc: "Bu kararın kod/şema/test üzerindeki bağlayıcı sonucu." },
    ],
    education: [
      {
        name: "Öğrenme hedefi",
        desc: "Bu birimin okuyucuya kazandırdığı bağlayıcı yetkinlik.",
        critical: true,
      },
      { name: "Uygulanabilir çıktı", desc: "Dersin sonunda üretilen çalıştırılabilir/denetlenebilir eser." },
    ],
    candidate: [
      {
        name: "Ürünleşme vaadi",
        desc: "Aday paketin alıcı profili ve değer önermesi (ADAY).",
        critical: true,
      },
      { name: "Asgari kapsam", desc: "Pazara çıkış için zorunlu en küçük yetenek kümesi." },
    ],
  };
  return (
    map[kind] ?? [
      {
        name: `${title} — birincil yetenek`,
        desc: "Bu sayfanın tanımladığı temel iş/teknik yetenek; sahiplik ve sınır.",
        critical: true,
      },
      {
        name: "Sözleşmeli sınır",
        desc: "Yetenek dışarıya Contract/Surface üzerinden açılır; tenant ve yetki bağlamı zorunlu.",
      },
      { name: "Gözlemlenebilirlik", desc: "Audit, yapılandırılmış log ve SLO bütçesi birinci sınıf." },
    ]
  );
}

function integrationDefault(kind) {
  const base = {
    kernel:
      "Kernel kimliği, ArcheType engine, tenancy (RLS) ve audit'i sağlar; SDK/AI kernel iç API'sine dokunamaz ({{ref:k-tenancy}}).",
    core: "App başına tek, değişmez core; bu birim core sözleşmelerine uyar, core'u değiştirmez.",
    modules:
      "Diğer modüllerin tablosuna dokunmaz; yalnız Contract (API kapısı) üzerinden konuşur, capability deny-by-default.",
    apps: "Tüm app'ler paylaşılan ArcheType'larla (ör. Party) varsayılan entegre gelir; bu birim aynı sözleşmeyi izler.",
    shouldIntegrate:
      "Evet — kernel ile zorunlu (kimlik/tenancy/audit), modüller arası yalnız Contract üzerinden.",
  };
  if (kind === "kernel")
    base.shouldIntegrate = "Evet — bu birim kernel yüzeyinin parçası; tüm app/modüller bundan türer.";
  if (kind === "decision" || kind === "education")
    base.shouldIntegrate =
      "Dolaylı — bu sayfa kararı/bilgiyi tanımlar; entegrasyon onu uygulayan birimlerde gerçekleşir.";
  return base;
}

function ecaDefault(title) {
  return `# Olay-Koşul-Eylem (deklaratif, no-code) — ${title}
trigger:
  event: archetype.updated        # kaynak: ArcheType / Workflow / zamanlayıcı
  when: "tenant_scoped AND payload.changed"
condition:
  all:
    - actor.capability >= "write"  # etkin yetki = kullanıcı ∩ capability ∩ tool_scope
    - not loop_detected            # döngü/yan-tenant/derinlik>6 koruması
action:
  - emit: domain.event            # outbox üzerinden idempotent
  - notify: ["surface"]
guards:
  max_depth: 6
  idempotency_key: "{tenant}:{entity}:{event}"
  external_effects: step_up_required   # dış etki allowlist + out-of-band onay
`;
}

// ---- Ana üretici ----
export function buildProductionContract(stem, data, nextId, overlay = {}) {
  const title = data.title ?? stem;
  const { kind, level } = classify(data);
  const o = overlay ?? {};
  const { h, p, callout, dl, table, checklist, code, divider } = mk(nextId);
  const out = [];

  out.push(divider());
  out.push(h(2, "Üretim Sözleşmesi"));
  out.push(
    p(
      `Bu bölüm "${title}" birimini üretirken AI ajanın ve geliştiricinin uyması gereken 16 boyutu bağlar. ` +
        "Kanonik sözleşme {{ref:k-surface}}, {{ref:be-sdk}} ve {{ref:k-terminoloji}}; sıralama testler ÖNCE, küçük PR + kanıt.",
    ),
  );

  // 1) Feature tanımları
  out.push(h(3, "1. Özellik tanımları"));
  out.push(
    dl(Array.isArray(o.featureDefs) && o.featureDefs.length ? o.featureDefs : featureDefaults(title, kind)),
  );

  // 2+12) Güvenlik önlemleri + OWASP Top 10:2025
  out.push(h(3, "2. Güvenlik önlemleri — OWASP Top 10:2025"));
  out.push(
    table(
      "OWASP Top 10:2025 → bu birimde karşılığı",
      ["Risk (2025)", "Bu birimde önlem"],
      [
        [
          "A01 Broken Access Control",
          "Tenant-scoped RLS + capability deny-by-default; negatif/komşu-tenant testi zorunlu.",
        ],
        ["A02 Security Misconfiguration", "Güvenli varsayılan; sır yönetimi; gereksiz yüzey kapalı."],
        [
          "A03 Software Supply Chain Failures",
          "Bağımlılık pinleme, SBOM, imzalı yapıt, manifest izin beyanı (WASM sandbox).",
        ],
        [
          "A04 Cryptographic Failures",
          "Aktarımda/duruşta şifreleme; `pii` alanları maskeli; anahtar rotasyonu.",
        ],
        ["A05 Injection", "Parametreli sorgu; girdi doğrulama (zod/pydantic); çıktı kodlama."],
        ["A06 Insecure Design", "Tehdit modeli; Rule of Two; en az yetki; kötüye-kullanım hikâyesi."],
        [
          "A07 Authentication Failures",
          "Kernel kimliği + OIDC federation; oturum/step-up; kaba-kuvvet limiti.",
        ],
        [
          "A08 Software or Data Integrity Failures",
          "İmzalı migration; outbox idempotency; değişmez audit zinciri.",
        ],
        [
          "A09 Security Logging and Alerting Failures",
          "Yapılandırılmış audit (aktör/tenant/correlation); alarm eşiği; {{ref:l1-audit}}.",
        ],
        [
          "A10 Mishandling of Exceptional Conditions",
          "Güvenli hata; kısmi yazma yok; telafi/saga; sızıntısız mesaj.",
        ],
      ],
    ),
  );
  out.push(
    callout(
      "warning",
      "Güvenlik optimizasyonu",
      (Array.isArray(o.securityNotes) && o.securityNotes.length
        ? o.securityNotes.join(" ")
        : "Saldırı yüzeyini küçült: en az yetki, kısa-ömürlü token, alan-düzeyi `pii` maskeleme. ") +
        " Standartlar: OWASP ASVS, OWASP Top 10:2025, NIST SSDF; sözleşme {{ref:adr-0017}}.",
    ),
  );

  // 3+4+5) Kod / güvenlik / performans optimizasyonu
  out.push(h(3, "3. Optimizasyon — kod, güvenlik, performans"));
  out.push(
    dl([
      {
        name: "Kod optimizasyonu",
        desc:
          o.perfNotes?.code ??
          "Tip-güvenli sınırlar, ölü kod yok, saf fonksiyon + Strategy; `if (type==...)` yasak — runtime dispatch.",
      },
      {
        name: "Güvenlik optimizasyonu",
        desc: "Deny-by-default, sır sızıntısı taraması, bağımlılık denetimi CI kapısı.",
      },
      {
        name: "Performans optimizasyonu",
        desc:
          o.perfNotes?.perf ??
          "Keyset (cursor) pagination — OFFSET yok; N+1 yok; `async def` içinde bloklama yok; p95 SLO bütçesi; gerekli indeks.",
      },
      {
        name: "Yük profili",
        desc: "Yüksek-hacimli ArcheType opt-in fiziksel tabloya terfi; aksi halde hibrit şema.",
      },
    ]),
  );

  // 6) Mobile APPS uyumluluğu
  out.push(h(3, "4. Çok-platform: iOS / Android / Chrome extension"));
  out.push(
    table(
      null,
      ["Hedef", "Uyum kuralı"],
      [
        [
          "iOS / Android (native)",
          "Contract/GraphQL üzerinden tüketim; offline-first kuyruk; token güvenli saklama; dokunma hedefi ≥44px ({{ref:fe-mobile}}).",
        ],
        [
          "Chrome extension",
          "Yalnız Contract'a; içerik betiği en az yetki; CSP sıkı; arka plan mesajlaşma doğrulanır.",
        ],
        ["PWA / responsive web", "Tek kod tabanı; 320px'e kadar akışkan; klavye + ekran okuyucu pariteli."],
      ],
    ),
  );

  // 7) WCAG 2.2 AAA
  out.push(h(3, "5. Erişilebilirlik — WCAG 2.2 AAA"));
  out.push(
    checklist("WCAG 2.2 AAA kontrol listesi (Surface taşıyan birimler)", [
      "1.4.6 Kontrast (Gelişmiş) — metinde 7:1 (büyük metin 4.5:1).",
      "2.1.3 Klavye (İstisnasız) — tüm işlevler klavyeyle, tuzak yok.",
      "2.2.6 Zaman aşımı — veri kaybı riski önceden uyarılır.",
      "2.3.3 Etkileşimden doğan animasyon — kapatılabilir (prefers-reduced-motion).",
      "2.4.9 Bağlantı amacı (yalnız bağlantı) — metinden anlaşılır.",
      "2.4.12/2.4.13 Odak gizlenmez + görünür odak göstergesi.",
      "2.5.5 Hedef boyutu (Gelişmiş) — 44×44 CSS px.",
      "3.1.5 Okuma düzeyi — sade dil veya alternatif.",
      "3.3.9 Erişilebilir kimlik doğrulama (Gelişmiş) — bilişsel test yok.",
      "Otomasyon: axe-core (Playwright) + manuel ekran okuyucu; {{ref:cc-a11y-backend}}.",
    ]),
  );

  // 8) Dağıtım: Swarm / Kubernetes / shared hosting
  out.push(h(3, "6. Dağıtım uyumluluğu — Swarm / Kubernetes / shared hosting"));
  out.push(
    table(
      "Taşıyıcı destek matrisi (v1 profili: Debian + Docker Compose)",
      ["Taşıyıcı", "Uyum / koşul"],
      [
        ["Docker Compose (v1)", "Birincil teslim profili; tek Postgres (kuyruk/outbox dahil)."],
        [
          "Docker Swarm",
          "Yatay ölçek opsiyonu; stateless servis + paylaşılan Postgres/obje deposu; secret/config Swarm yönetiminde.",
        ],
        [
          "Kubernetes",
          "Opsiyon; 12-faktör, sağlık probu, HPA, NetworkPolicy, dış sır yöneticisi; durum dışarıda.",
        ],
        [
          "Shared hosting (WordPress benzeri)",
          "Yalnız statik/headless dağıtım (bu site gibi) ya da yönetilen Postgres; uzun-süren worker/queue gerektiren özellik desteklenmez — açıkça beyan et.",
        ],
      ],
    ),
  );

  // 9) Otomatik ECA kuralları
  out.push(h(3, "7. Otomatik ECA kuralları"));
  out.push(
    p(
      "Deklaratif Olay-Koşul-Eylem (no-code) — güvenlik kapısı: döngü/yan-tenant/derinlik>6/idempotency; dış etki n8n allowlist + step-up ({{ref:adr-0019}}, {{ref:l1-workflow}}).",
    ),
  );
  out.push(
    code(
      `ECA kuralı — ${title}`,
      "yaml",
      typeof o.ecaExample === "string" && o.ecaExample.trim() ? o.ecaExample : ecaDefault(title),
    ),
  );

  // 10) Default AI ajan davranışı
  out.push(h(3, "8. Default AI ajan davranışı"));
  out.push(
    callout(
      "info",
      "Yetki tavanı (ADR-0015)",
      "AI ajan asla principal değildir; bir aktör adına çalışır. Etkin yetki = kullanıcı ∩ agent_capability ∩ tool_scope ∩ aksiyon_riski. " +
        "Planlama serbest, uygulama capability-gated; DisableProtection (RLS/PII/audit kapatma) hiçbir koşulda önerilemez; yüksek-riskli aksiyon out-of-band step-up ister ({{ref:sus-actions}}). " +
        "AI kendi çıktısını son onay sayamaz: bağımsız review + deterministik kapı + insan reviewer.",
    ),
  );

  // 11) Testler + döngüler
  out.push(h(3, "9. Test stratejisi ve döngüleri"));
  out.push(
    table(
      "Test katmanları ({{ref:edu-u16}})",
      ["Katman", "Kapsam / kapı"],
      [
        ["Unit", "Saf mantık, Atom kuralları, şema doğrulama; kırmızı-önce."],
        ["Contract / entegrasyon", "Module sınırı, RLS, negatif + komşu-tenant yetki testi."],
        ["E2E (Playwright)", "Ana akış + alternatif + hata akışı; AI-ajan destekli senaryo üretimi."],
        ["User journey", "Önkoşul→yetki→ana/alternatif/hata→invariant→audit→SLO→kabul testi."],
        ["A11y", "axe-core WCAG taraması (Playwright); klavye + ekran okuyucu."],
        [
          "Autonomous QA",
          "Ajan testi yazar/çalıştırır; testing loop: düzelene kadar **en fazla 6 kez**, 6'da düzelmezse otomatik durur ve raporlar.",
        ],
      ],
    ),
  );
  if (Array.isArray(o.testNotes) && o.testNotes.length)
    out.push(callout("tip", "Bu birime özel test notları", o.testNotes.join(" ")));

  // 13) Kernel / Core / Module entegrasyonu
  out.push(h(3, "10. Kernel / Core / Module entegrasyonu"));
  const integ = { ...integrationDefault(kind), ...(o.integration ?? {}) };
  out.push(
    dl([
      { name: "Entegre olmalı mı?", desc: integ.shouldIntegrate, critical: true },
      { name: "Kernel", desc: integ.kernel },
      { name: "Core", desc: integ.core },
      { name: "Modüller", desc: integ.modules },
      { name: "Diğer app'ler", desc: integ.apps },
    ]),
  );

  // 14) Module kullanımı (diğer app'ler)
  out.push(h(3, "11. Module kullanımı — diğer app'ler nasıl faydalanır"));
  const usage = Array.isArray(o.moduleUsage) && o.moduleUsage.length ? o.moduleUsage : null;
  if (usage) out.push({ id: nextId("urs-list"), type: "list", items: usage.map((u) => seg(u)) });
  else
    out.push(
      p(
        "Bu birim bir module ise: yetenekleri Contract üzerinden açar; tüketen app'ler paylaşılan ArcheType (ör. Party) ve capability talebiyle bağlanır; doğrudan tabloya değil API kapısına. " +
          "Module değilse (kernel/karar/eğitim): doğrudan tüketilmez, kendisini uygulayan modüllere kural/altyapı sağlar.",
      ),
    );

  // Zenginleştirilmiş kopyalanabilir üretim prompt'u (tek copyEnabled üret prompt'u)
  out.push(h(2, "Bu birimi üret — kopyalanabilir prompt"));
  out.push(code(`${level ?? "Birim"} üretim prompt'u`, "text", buildPromptBody(stem, title, kind, level)));

  return out;
}

// Seviye/kind-eşli gövde + 16 boyutu dayatan görev sözleşmesi eki.
function buildPromptBody(stem, title, kind, level) {
  const common =
    "ÖNCE faz prompt'larını uygula (Gereksinim, Tasarım), sonra İnşa/Doğrulama. be-sdk sırası: testler ÖNCE (kırmızı) → yaml taslaklar → uygulama. Küçük PR + kanıt. Komşuluk kuralını ihlal etme.";
  let head;
  if (kind === "buildable" && level && level.startsWith("ArcheType"))
    head = `SEVİYE: ArcheType (Büyük Taş) · birim: ${title}\nROL: Veri mimarı. OKU: bu sayfa (${stem}), kernel ArcheType engine, k-granulerlik, k-surface, ilgili module.\nGÖREV: "${title}" için bildirimsel ArcheType(ler) + projekte eden Surface üret.\nKISIT: Alan bayrakları zorunlu — para=Money (Decimal; float yasak), kişisel veri=pii(+retention), tarihçeli=bitemporal, her şey audit'li. Kernel iç API'sine dokunma.`;
  else if (kind === "buildable" && level && level.startsWith("Module"))
    head = `SEVİYE: Module / Domain (Kaya) · birim: ${title}\nROL: Domain mimarı. OKU: bu sayfa (${stem}), ilgili app plan ağacı, core sözleşmeleri.\nGÖREV: "${title}" module sınırını, ArcheType'larını ve Contract (API kapısı) tanımını çıkar.\nKISIT: Başka module tablosuna dokunma; Contract üzerinden konuş. Capability deny-by-default.`;
  else if (kind === "buildable")
    head = `SEVİYE: View / Projection (Orta Taş) · birim: ${title}\nROL: Surface geliştirici. OKU: bu sayfa (${stem}), ilgili ArcheType + Surface.\nGÖREV: "${title}" için projeksiyon/liste + endpoint grubu üret.\nKISIT: Liste uçları keyset (cursor) pagination; OFFSET yok. Yetki/tenant filtresi zorunlu.`;
  else if (kind === "governance" || kind === "decision")
    head = `BAĞLAM: Yönetişim/karar · birim: ${title}\nROL: Güvenlik/mimari gözden geçiren. OKU: bu sayfa (${stem}) + ilgili ADR/sus sayfaları.\nGÖREV: Bu kuralı/kararı uygulayan birimlerde 16 boyutun nasıl zorlanacağını (kapı + test) tanımla.\nKISIT: Deny-by-default; DisableProtection önerme.`;
  else if (kind === "education")
    head = `BAĞLAM: Eğitim · birim: ${title}\nROL: Eğitmen + mimar. OKU: bu sayfa (${stem}) + ön koşul birimleri.\nGÖREV: Okuyucunun bu birimle ürettiği çalıştırılabilir eserde 16 boyutu uygula ve doğrula.\nKISIT: Araç adı kalite güvencesi değildir; test-önce.`;
  else
    head = `BAĞLAM: ${title}\nROL: Mimar. OKU: bu sayfa (${stem}), kernel sözleşmeleri (k-surface, be-sdk, k-terminoloji).\nGÖREV: "${title}" için en küçük uygulanabilir dilimi 16 boyutla üret.\nKISIT: Sözleşmeli sınır; kernel iç API'sine dokunma; tenant/yetki zorunlu.`;

  const req =
    "\n\nGÖREV SÖZLEŞMESİ — 16 boyutu ÇIKTIDA kanıtla (eksikse dur):\n" +
    "1) Özellik tanımları + non-goal.  2) Güvenlik önlemleri (OWASP Top 10:2025 her madde için karşılık).  " +
    "3) Kod optimizasyonu.  4) Güvenlik optimizasyonu (en az yetki, sır yönetimi).  5) Performans optimizasyonu (keyset pagination, p95 SLO).  " +
    "6) Mobil + Chrome extension uyumu (Contract, offline, ≥44px).  7) WCAG 2.2 AAA (axe-core kanıtı).  " +
    "8) Dağıtım: Docker Compose + Swarm + Kubernetes + shared-hosting beyanı.  9) Otomatik ECA kuralları (döngü/derinlik-6/idempotency kapısı).  " +
    "10) Default AI ajan davranışı (capability-gated, principal değil, step-up).  " +
    "11) Testler: unit + entegrasyon + e2e + user journey + a11y; AI-destekli Playwright; testing loop en fazla 6 kez, düzelmezse raporla; autonomous QA.  " +
    "12) OWASP + ASVS + NIST SSDF.  13) Kernel/Core/Module entegrasyonu (entegre olmalı mı, nasıl).  14) Module ise diğer app'ler nasıl tüketir.\n" +
    "ÇIKTI: testler önce (kırmızı→yeşil kanıt) → tanımlar/yaml → uygulama → değişen dosyalar + komut çıktısı + açık riskler. Testi/eşiği geçmek için gevşetme yapma.\n" +
    common;
  return head + req;
}
