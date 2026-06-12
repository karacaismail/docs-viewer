// Okuma ilerleme çubuğu (UX-B5): sayfanın ne kadarının kaldığını gösterir.
// Dekoratif (aria-hidden); ekran okuyucu için bilgi taşımaz, pager zaten konum verir.
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="read-progress" aria-hidden>
      <div className="read-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
