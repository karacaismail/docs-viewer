// Müfredat ilerleme özeti (UX-B6): edu.* checklist kayıtlarından toplam + ünite bazlı döküm.
// 60+ ilkesi: sayı + sözel açıklama birlikte; veri yoksa yol gösteren boş-durum metni.
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

type ListRow = { key: string; label: string; checked: number; total: number };
type Tally = { checked: number; total: number; rows: ListRow[] };

function labelOf(key: string): string {
  // checklist:edu.u07 -> "Ünite 07"; checklist:edu.prereq -> "Hazırlık"
  const stem = key.replace("checklist:edu.", "");
  if (stem === "prereq") return "Hazırlık";
  const m = stem.match(/^u(\d+)$/);
  return m ? `Ünite ${m[1]}` : stem;
}

function readTally(): Tally {
  const t: Tally = { checked: 0, total: 0, rows: [] };
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k?.startsWith("checklist:edu.")) continue;
      const v: unknown = JSON.parse(window.localStorage.getItem(k) ?? "null");
      let checked = 0;
      let total = 0;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const o = v as { checked?: unknown[]; total?: number };
        if (Array.isArray(o.checked) && typeof o.total === "number") {
          checked = o.checked.length;
          total = o.total;
        }
      } else if (Array.isArray(v) && v.length > 0) {
        // eski format: toplam bilinmiyor, işaretliler yine sayılır
        checked = v.length;
        total = v.length;
      }
      if (total > 0) {
        t.checked += checked;
        t.total += total;
        t.rows.push({ key: k, label: labelOf(k), checked, total });
      }
    }
  } catch {
    /* storage yoksa boş özet */
  }
  t.rows.sort((a, b) => a.label.localeCompare(b.label, "tr"));
  return t;
}

function readLast(): { slug: string; title: string } | null {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem("son-ziyaret") ?? "null");
    if (v && typeof v === "object" && "slug" in v && "title" in v)
      return v as { slug: string; title: string };
  } catch {
    /* yok say */
  }
  return null;
}

export function CurriculumProgress() {
  const t = useMemo(readTally, []);
  const last = useMemo(readLast, []);
  const continueLink = last?.slug.startsWith("egitim/") ? (
    <p>
      <Link to="/docs/$section/$page" params={{ section: "egitim", page: last.slug.split("/")[1] }}>
        Devam et: {last.title}
      </Link>
    </p>
  ) : null;
  if (t.rows.length === 0) {
    return (
      <aside className="callout callout--info" aria-label="Müfredat ilerlemen">
        <div className="callout__title">
          <i className="ph ph-flag-checkered" aria-hidden /> Müfredat ilerlemen
        </div>
        <p>
          Henüz işaretlenmiş madde yok. Her ünitenin sonundaki kontrol listesini işaretledikçe ilerlemen
          burada görünür — bu cihazda saklanır, hesap gerekmez.
        </p>
        {continueLink}
      </aside>
    );
  }
  const pct = t.total > 0 ? Math.round((t.checked / t.total) * 100) : 0;
  const done = t.rows.filter((r) => r.checked === r.total).length;
  return (
    <aside className="callout callout--tip curriculum-progress" aria-label="Müfredat ilerlemen">
      <div className="callout__title">
        <i className="ph ph-flag-checkered" aria-hidden /> Müfredat ilerlemen
      </div>
      <p>
        {t.rows.length} kontrol listesinde {t.checked}/{t.total} madde tamamlandı (%{pct}); {done} liste
        bitti. İlerleme bu cihazın tarayıcısında saklanır.
      </p>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Müfredat tamamlanma yüzdesi"
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <details>
        <summary>Liste bazında dökümü gör</summary>
        <ul className="curriculum-rows">
          {t.rows.map((r) => (
            <li key={r.key}>
              {r.label}: {r.checked}/{r.total}
              {r.checked === r.total ? " — tamam" : ""}
            </li>
          ))}
        </ul>
      </details>
      {continueLink}
    </aside>
  );
}
