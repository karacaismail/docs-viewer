// Üst katman state makinesi — aynı anda en fazla bir katman açık (09 §Davranış 3)
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Layer = "none" | "search" | "panel" | "mobileNav" | "mobileToc";

interface UiState {
  layer: Layer;
  panelTermId: string | null;
  /** Panel kapanınca focus dönecek element (12 §Etkileşim 4) — kontrollü Dialog'da Radix trigger'ı bilemez */
  returnFocusEl: HTMLElement | null;
  open: (layer: Exclude<Layer, "none">, termId?: string) => void;
  close: () => void;
}

const Ctx = createContext<UiState | null>(null);

export function UiStateProvider({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<Layer>("none");
  const [panelTermId, setPanelTermId] = useState<string | null>(null);
  const [returnFocusEl, setReturnFocusEl] = useState<HTMLElement | null>(null);
  const open = useCallback((l: Exclude<Layer, "none">, termId?: string) => {
    setLayer(l);
    if (l === "panel") {
      setPanelTermId(termId ?? null);
      setReturnFocusEl(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    }
  }, []);
  const close = useCallback(() => setLayer("none"), []);
  const value = useMemo(
    () => ({ layer, panelTermId, returnFocusEl, open, close }),
    [layer, panelTermId, returnFocusEl, open, close],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUiState(): UiState {
  const v = useContext(Ctx);
  if (!v) throw new Error("UiStateProvider eksik");
  return v;
}
