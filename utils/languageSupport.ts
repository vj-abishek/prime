// Language support module for CodeHighlighter
// Provides lazy loading and caching for CodeMirror language extensions

export type SupportedLang =
  | "txt"
  | "js"
  | "jsx"
  | "tsx"
  | "json"
  | "py"
  | "css"
  | "html"
  | "xml"
  | "java"
  | "cpp"
  | "c"
  | "rust"
  | "ruby"
  | "typescript"
  | "general";

// Language loader with lazy loading
export const languageLoaders: Record<SupportedLang, () => Promise<any>> = {
  txt: async () => [],
  js: async () => {
    const { javascript } = await import(
      "https://esm.sh/@codemirror/lang-javascript?target=es2022&dts"
    );
    return javascript({ typescript: false });
  },
  jsx: async () => {
    const { javascript } = await import(
      "https://esm.sh/@codemirror/lang-javascript?target=es2022&dts"
    );
    return javascript({ typescript: false, jsx: true });
  },
  tsx: async () => {
    const { javascript } = await import(
      "https://esm.sh/@codemirror/lang-javascript?target=es2022&dts"
    );
    return javascript({ typescript: true, jsx: true });
  },
  typescript: async () => {
    const { javascript } = await import(
      "https://esm.sh/@codemirror/lang-javascript?target=es2022&dts"
    );
    return javascript({ typescript: true });
  },
  json: async () => {
    const { json } = await import(
      "https://esm.sh/@codemirror/lang-json?target=es2022&dts"
    );
    return json();
  },
  py: async () => {
    const { python } = await import(
      "https://esm.sh/@codemirror/lang-python?target=es2022&dts"
    );
    return python();
  },
  css: async () => {
    const { css } = await import(
      "https://esm.sh/@codemirror/lang-css?target=es2022&dts"
    );
    return css();
  },
  html: async () => {
    const { html } = await import(
      "https://esm.sh/@codemirror/lang-html?target=es2022&dts"
    );
    return html();
  },
  xml: async () => {
    const { xml } = await import(
      "https://esm.sh/@codemirror/lang-xml?target=es2022&dts"
    );
    return xml();
  },
  java: async () => {
    const { java } = await import(
      "https://esm.sh/@codemirror/lang-java?target=es2022&dts"
    );
    return java();
  },
  cpp: async () => {
    const { cpp } = await import(
      "https://esm.sh/@codemirror/lang-cpp?target=es2022&dts"
    );
    return cpp();
  },
  c: async () => {
    const { cpp } = await import(
      "https://esm.sh/@codemirror/lang-cpp?target=es2022&dts"
    );
    return cpp();
  },
  rust: async () => {
    const { rust } = await import(
      "https://esm.sh/@codemirror/lang-rust?target=es2022&dts"
    );
    return rust();
  },
  ruby: async () => {
    const { StreamLanguage } = await import(
      "https://esm.sh/@codemirror/language?target=es2022&dts"
    );
    const { ruby } = await import(
      "https://esm.sh/@codemirror/legacy-modes/mode/ruby?target=es2022&dts"
    );
    return StreamLanguage.define(ruby);
  },
  general: async () => {
    // Simple fallback highlighting for unsupported languages
    const { StreamLanguage } = await import(
      "https://esm.sh/@codemirror/language?target=es2022&dts"
    );
    const { LanguageSupport } = await import(
      "https://esm.sh/@codemirror/language?target=es2022&dts"
    );
    const { syntaxHighlighting, HighlightStyle } = await import(
      "https://esm.sh/@codemirror/language?target=es2022&dts"
    );
    const { tags } = await import(
      "https://esm.sh/@lezer/highlight?target=es2022&dts"
    );

    const style = HighlightStyle.define([
      { tag: tags.string, color: "#a8ff60" },
      { tag: tags.number, color: "#ff9d00" },
      { tag: tags.comment, color: "#7a7a7a" },
      { tag: tags.keyword, color: "#ff73fd" },
      { tag: tags.operator, color: "#ffffff" },
      { tag: tags.variableName, color: "#ffcc66" },
    ]);

    const parser = StreamLanguage.define({
      token: (stream) => {
        if (stream.eatSpace()) return null;
        if (stream.match(/\/\/.*/)) return "comment";
        if (stream.match(/"[^"]*"/)) return "string";
        if (stream.match(/\d+/)) return "number";
        if (
          stream.match(
            /\b(if|else|for|while|function|return|class|import|export)\b/,
          )
        ) return "keyword";
        if (stream.match(/\w+/)) return "variableName";
        if (stream.match(/[+\-*/%=<>!&|^~?:;,.()[\]{}]/)) return "operator";
        stream.next();
        return null;
      },
    });

    return new LanguageSupport(parser, [syntaxHighlighting(style)]);
  },
};

// Cache for loaded language extensions
const languageCache = new Map<SupportedLang, any>();

/**
 * Get language extension with caching and lazy loading
 */
export async function getLanguageExtension(lang: SupportedLang): Promise<any> {
  if (languageCache.has(lang)) {
    return languageCache.get(lang);
  }

  const loader = languageLoaders[lang];
  if (!loader) {
    console.warn(`No language loader found for: ${lang}`);
    return [];
  }

  try {
    const extension = await loader();
    languageCache.set(lang, extension);
    return extension;
  } catch (error) {
    console.error(`Failed to load language ${lang}:`, error);
    return [];
  }
}

// Map highlight.js language names to SupportedLang
const hljsToSupportedLang: Record<string, SupportedLang> = {
  javascript: "js",
  typescript: "typescript",
  python: "py",
  css: "css",
  html: "html",
  xml: "xml",
  json: "json",
  java: "java",
  cpp: "cpp",
  c: "c",
  rust: "rust",
  ruby: "ruby",
  // Common aliases
  js: "js",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  rb: "ruby",
};

let hljs: any = null;

/**
 * Detect programming language from content using highlight.js
 */
export async function detectLanguageFromContent(
  content: string,
): Promise<SupportedLang> {
  const text = content.trim();
  if (!text) return "txt";

  // Fast path: try JSON parse first
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      JSON.parse(text);
      return "json";
    } catch (_) {
      /* not json */
    }
  }

  // Lazy load highlight.js
  if (!hljs) {
    hljs = (await import("https://esm.sh/highlight.js@11.9.0")).default;
  }

  const result = hljs.highlightAuto(text);
  const detected = result.language || "";

  console.log("🔍 Detected language:", detected);

  return hljsToSupportedLang[detected] || "general";
}
