// Rail 2: accordion page listesi; tek gruplu kategoride düz liste (10 §Rail 2-3)

import * as Accordion from "@radix-ui/react-accordion";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { NavCategory } from "../../schemas";

export function RailTwo({
  category,
  onNavigate,
  plain,
}: {
  category: NavCategory;
  onNavigate?: () => void;
  plain?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeSlug = pathname.replace(/^\/docs\//, "");
  const activeGroup = category.groups.find((g) => g.items.some((i) => i.slug === activeSlug))?.id;
  const [openGroups, setOpenGroups] = useState<string[]>(
    activeGroup ? [activeGroup] : [category.groups[0]?.id ?? ""],
  );

  // Yeni aktif page kapalı gruptaysa o grup açılır (10 §Rail 2)
  useEffect(() => {
    if (activeGroup) setOpenGroups((prev) => (prev.includes(activeGroup) ? prev : [...prev, activeGroup]));
  }, [activeGroup]);

  const single = category.groups.length === 1;

  const renderItems = (items: NavCategory["groups"][number]["items"]) =>
    items.map((it) => {
      const [section, page] = it.slug.split("/");
      return (
        <Link
          key={it.pageId}
          to="/docs/$section/$page"
          params={{ section, page }}
          className="navitem"
          aria-current={it.slug === activeSlug ? "page" : undefined}
          onClick={onNavigate}
        >
          {it.title}
        </Link>
      );
    });

  return (
    <nav className={plain ? undefined : "rail2"} aria-label={`${category.label} sayfaları`}>
      {!plain && <div className="rail2__heading">{category.label}</div>}
      {single ? (
        renderItems(category.groups[0].items)
      ) : (
        <Accordion.Root type="multiple" value={openGroups} onValueChange={setOpenGroups}>
          {category.groups.map((g) => (
            <Accordion.Item key={g.id} value={g.id}>
              <Accordion.Header asChild>
                <h3 style={{ margin: 0 }}>
                  <Accordion.Trigger className="acc__trigger">
                    {g.label}
                    <i className="ph ph-caret-down" aria-hidden />
                  </Accordion.Trigger>
                </h3>
              </Accordion.Header>
              <Accordion.Content>{renderItems(g.items)}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </nav>
  );
}
