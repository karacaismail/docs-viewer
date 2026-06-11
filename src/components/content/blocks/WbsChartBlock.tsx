// WBS görselleştirmesi (ADR-0008/0010): Dağ'dan Atom'a soldan-sağa kırılım — ECharts tree (LR).
// echarts yalnız burada ve dinamik import'la yüklenir (eager bütçeye girmez, 14 #15).
// jsdom/canvas yoksa erişilebilir iç içe liste fallback'i render edilir (07B fallback ilkesi).
import { useEffect, useRef, useState } from "react";
import type { Block } from "../../../schemas";

type WbsNode = { name: string; meta?: string; collapsed?: boolean; children?: WbsNode[] };

// Örnek veri — iki örnek app (HRMS, CRM); kolonlar: Dağ → Kaya → ArcheType(BT) → Fragment(KT) → Alan(Kum) → Toz → Atom
export const WBS_SAMPLE: WbsNode = {
  name: "App Portföyü (örnek)",
  meta: "kernel — tek panel, default entegre",
  children: [
    {
      name: "HRMS · Dağ (34+)",
      meta: "Application — Workday clone",
      children: [
        {
          name: "Çalışanlar · Kaya (21)",
          meta: "Domain / core module",
          children: [
            {
              name: "Employee · ArcheType (13)",
              meta: "Büyük Taş — screen + service group üretir",
              children: [
                {
                  name: "Adresler · Fragment (5)",
                  meta: "Küçük Taş — child satırlar, ana kayıtla yaşar",
                  children: [
                    {
                      name: "il · Alan (3)",
                      meta: "Kum — adı tartışılacak: Field/Attribute",
                      collapsed: true, // derin zincir tıklamayla açılır — etiket çakışmasını önler
                      children: [
                        {
                          name: "required · Toz (2)",
                          meta: "property/validation",
                          children: [{ name: "TR il listesinden · Atom (1)", meta: "kural/kısıt" }],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "ZamanKayıtları · Fragment (5)",
                  meta: "Küçük Taş — child satırlar",
                  children: [{ name: "saat · Alan (3)" }],
                },
              ],
            },
            {
              name: "LeaveRequest · ArcheType (13)",
              meta: "Büyük Taş — izin talepleri",
              children: [{ name: "Onaylar · Fragment (5)" }],
            },
          ],
        },
        {
          name: "Bordro · Kaya (21)",
          meta: "Domain",
          children: [{ name: "Payslip · ArcheType (13)" }],
        },
      ],
    },
    {
      name: "CRM · Dağ (34+)",
      meta: "Application — Salesforce clone",
      collapsed: true,
      children: [
        {
          name: "Satış · Kaya (21)",
          children: [
            {
              name: "Deal · ArcheType (13)",
              children: [{ name: "Aktiviteler · Fragment (5)", children: [{ name: "tarih · Alan (3)" }] }],
            },
          ],
        },
      ],
    },
  ],
};

function FallbackList({ node }: { node: WbsNode }) {
  return (
    <li>
      {node.name}
      {node.meta ? ` — ${node.meta}` : ""}
      {node.children?.length ? (
        <ul>
          {node.children.map((c) => (
            <FallbackList key={c.name} node={c} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function WbsChartBlock({ block }: { block: Extract<Block, { type: "wbsChart" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let disposed = false;
    let chart: { dispose: () => void; resize: () => void } | undefined;
    let onResize: (() => void) | undefined;
    (async () => {
      try {
        // Canvas yeteneği yoksa (jsdom, kısıtlı ortam) echarts'a hiç girme — fallback liste
        let ctx: unknown = null;
        try {
          ctx = document.createElement("canvas").getContext("2d");
        } catch {
          ctx = null;
        }
        if (!ctx) {
          setFallback(true);
          return;
        }
        const [core, { TreeChart }, { CanvasRenderer }, { TooltipComponent }] = await Promise.all([
          import("echarts/core"),
          import("echarts/charts"),
          import("echarts/renderers"),
          import("echarts/components"),
        ]);
        if (disposed || !ref.current) return;
        core.use([TreeChart, CanvasRenderer, TooltipComponent]);
        const c = core.init(ref.current);
        chart = c;
        c.setOption({
          tooltip: {
            formatter: (p: { data: WbsNode }) =>
              `<strong>${p.data.name}</strong>${p.data.meta ? `<br/>${p.data.meta}` : ""}`,
          },
          series: [
            {
              type: "tree",
              data: [WBS_SAMPLE],
              orient: "LR",
              left: 8,
              right: 230,
              top: 8,
              bottom: 8,
              symbolSize: 9,
              initialTreeDepth: -1,
              itemStyle: { color: "#e0b45c", borderColor: "#5d6774" },
              lineStyle: { color: "#2e333a", width: 1.2 },
              label: { color: "#e8eaed", fontSize: 12, position: "right" as const, distance: 6 },
              leaves: { label: { color: "#b6bcc6" } },
              expandAndCollapse: true,
              animationDuration: 250,
            },
          ],
        });
        onResize = () => c.resize();
        window.addEventListener("resize", onResize);
      } catch {
        if (!disposed) setFallback(true); // canvas yok / yükleme hatası → erişilebilir liste
      }
    })();
    return () => {
      disposed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      chart?.dispose();
    };
  }, []);

  return (
    <figure id={block.id} className="wbs-chart">
      {block.title && <h3>{block.title}</h3>}
      {fallback ? (
        <ul aria-label="WBS kırılımı (liste görünümü)">
          <FallbackList node={WBS_SAMPLE} />
        </ul>
      ) : (
        <>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: yatay kaydırılabilir bölge klavyeyle odaklanabilir olmalı (axe: scrollable-region-focusable) */}
          <section style={{ overflowX: "auto" }} tabIndex={0} aria-label="WBS ağacı — yatay kaydırılabilir">
            <div
              ref={ref}
              role="img"
              aria-label="WBS ağacı: Dağ'dan Atom'a soldan sağa kırılım — HRMS ve CRM örnek app'leri"
              style={{ width: 1560, height: 640 }}
            />
          </section>
        </>
      )}
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
