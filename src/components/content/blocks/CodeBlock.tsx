// Shiki token pipeline — codeToTokens -> React renderer (01 §Kritik, 11 §CodeBlock).
// HTML string üreten Shiki yolu ve raw HTML injection bu projede yasaktır.
// İnce taneli core: yalnız şemadaki diller yüklenir; wasm yerine JS regex engine
// (performans bütçesi — 09A/14 #15).
import { useEffect, useState } from "react";
import type { HighlighterCore } from "shiki/core";
import type { Block } from "../../../schemas";

type B = { block: Extract<Block, { type: "codeBlock" }> };
interface TokenLine {
  content: string;
  color?: string;
}

let hlPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  hlPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    return createHighlighterCore({
      themes: [import("shiki/themes/github-dark-default.mjs")], // 09A §6 kilidi
      langs: [
        import("shiki/langs/python.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/yaml.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/http.mjs"),
      ],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    });
  })();
  return hlPromise;
}

export function CodeBlock({ block }: B) {
  const [lines, setLines] = useState<TokenLine[][] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (block.language === "text") return; // düz görünüm yeterli
    let alive = true;
    getHighlighter()
      .then((hl) => hl.codeToTokens(block.code, { lang: block.language, theme: "github-dark-default" }))
      .then((result) => {
        if (alive)
          setLines(result.tokens.map((line) => line.map((t) => ({ content: t.content, color: t.color }))));
      })
      .catch(() => {
        // Tokenization hatası block'u düşürmez (11 §CodeBlock 5)
        if (import.meta.env.DEV) console.warn(`Shiki tokenization başarısız: ${block.language}`);
      });
    return () => {
      alive = false;
    };
  }, [block.code, block.language]);

  const copy = async () => {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const showNumbers = block.showLineNumbers ?? block.code.split("\n").length > 4;
  const hl = new Set(block.highlightedLines ?? []);
  const rawLines = block.code.split("\n");

  return (
    <div id={block.id} className="codeblock">
      <div className="codeblock__bar">
        <i className="ph ph-code" aria-hidden />
        <span className="title">{block.title ?? block.language}</span>
        {(block.copyEnabled ?? true) && (
          <button
            type="button"
            className="iconbtn"
            onClick={copy}
            aria-label={copied ? "Kopyalandı" : "Kodu kopyala"}
            style={{ minHeight: 32, minWidth: 32 }}
          >
            <i className={`ph ${copied ? "ph-check" : "ph-copy"}`} aria-hidden />
          </button>
        )}
        <span aria-live="polite" style={{ position: "absolute", left: -9999 }}>
          {copied ? "Kod panoya kopyalandı" : ""}
        </span>
      </div>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scroll bölgesi klavyeyle odaklanabilir olmalı (axe: scrollable-region-focusable) */}
      <pre tabIndex={0}>
        <code>
          {(lines ?? rawLines.map((l) => [{ content: l }] as TokenLine[])).map((line, i) => (
            <span key={i} className={hl.has(i + 1) ? "line--hl" : undefined}>
              {showNumbers && (
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: "2.5em",
                    color: "var(--color-text-muted)",
                    userSelect: "none",
                  }}
                >
                  {i + 1}
                </span>
              )}
              {line.map((t, j) => (
                <span key={j} style={t.color ? { color: t.color } : undefined}>
                  {t.content}
                </span>
              ))}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
