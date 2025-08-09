import { useEffect, useRef } from "preact/hooks";
import {
  basicSetup,
  EditorView,
} from "https://esm.sh/codemirror@6.0.2?target=es2022&dts";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript@6.2.2?target=es2022&dts";
import { json as jsonLang } from "https://esm.sh/@codemirror/lang-json@6.0.1?target=es2022&dts";
import { python } from "https://esm.sh/@codemirror/lang-python@6.1.3?target=es2022&dts";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.1.3?target=es2022&dts";

interface CodeHighlighterProps {
  code: string;
}

type SupportedLang = "txt" | "js" | "json" | "py";

function detectLanguageFromContent(content: string): SupportedLang {
  const text = content.trim();
  if (!text) return "txt";

  // Try JSON first (fast parse for small content)
  if ((text.startsWith("{") || text.startsWith("["))) {
    try {
      JSON.parse(text);
      return "json";
    } catch (_) {/* not json */}
  }

  // Python heuristics
  if (/\bdef\s+\w+\s*\(|\bclass\s+\w+\s*\(|\bimport\s+\w+|:\s*(#.*)?$/m.test(text)) {
    return "py";
  }

  // JavaScript heuristics
  if (/\b(function|const|let|var|import|export|=>)\b|\/\/|\/\*/.test(text)) {
    return "js";
  }

  return "txt";
}

export default function CodeHighlighter({ code }: CodeHighlighterProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!parentRef.current) return;

    // Destroy existing view if any
    viewRef.current?.destroy();

    const detected: SupportedLang = detectLanguageFromContent(code);

    const languageExtension =
      detected === "json" ? jsonLang()
      : detected === "py" ? python()
      : detected === "js" ? javascript({ typescript: false })
      : [];

    const view = new EditorView({
      parent: parentRef.current,
      doc: code,
      extensions: [
        basicSetup,
        oneDark,
        languageExtension,
        EditorView.editable.of(true),
        EditorView.theme({
          "&": { maxHeight: "100%", maxWidth: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { paddingBottom: "50%" },
        }),
      ].flat(),
    });

    viewRef.current = view;

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [code]);

  return <div ref={parentRef} class="h-full w-full" />;
}
