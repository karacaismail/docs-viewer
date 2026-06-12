// Müfredat ilerleme özeti (UX-B6): edu.* checklist kayıtlarından toplam ilerleme.
// 60+ ilkesi: sayı + sözel açıklama birlikte; veri yoksa yol gösteren boş-durum metni.
import { useMemo } from "react";

type Tally = { checked: number; total: number; lists: number };

function readTally(): Tally {
  const t: Tally = { checked: 0, total: 0, lists: 0 };
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k?.startsWith("checklist:edu.")) continue;
      const v: unknown = JSON.parse(window.localStorage.getItem(k) ?? "null");
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const o = v as { checked?: unknown[]; total?: number };
        if (Array.isArray(o.checked) && typeof o.total === "number") {
          t.checked += o.checked.length;
          t.total += o.total;
          t.lists += 1;
        }
      } else if (Array.isArray(v) && v.length > 0) {
        // eski format: toplam bilinmiyor, işaretliler yine sayılır
        t.checked += v.length;
        t.total += v.length;
        t.lists += 1;
      }
    }
  } catch {
    /* storage yoksa boş özet */
  }
  return t;
}

export function CurriculumProgress() {
  const t = useMemo(readTally, []);
  if (t.lists === 0) {
    return (
      <aside className="callout callout--info" aria-label="Müfredat ilerlemen">
        <div className="callout__title">
          <i className="ph ph-flag-checkered" aria-hidden /> Müfredat ilerlemen
        </div>
        <p>
          Henüz işaretlenmiş madde yok. Her ünitenin sonundaki kontrol listesini işaretledikçe ilerlemen
          burada görünür — bu cihazda saklanır, hesap gerekmez.
        </p>
      </aside>
    );
  }
  const pct = t.total > 0 ? Math.round((t.checked / t.total) * 100) : 0;
  return (
    <aside className="callout callout--tip curriculum-progress" aria-label="Müfredat ilerlemen">
      <div className="callout__title">
        <i className="ph ph-flag-checkered" aria-hidden /> Müfredat ilerlemen
      </div>
      <p>
        {t.lists} kontrol listesinde {t.checked}/{t.total} madde tamamlandı (%{pct}). İlerleme bu cihazın
        tarayıcısında saklanır.
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
    </aside>
  );
}
