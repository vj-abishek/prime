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

/**
 * Detect programming language from content using heuristics
 */
export function detectLanguageFromContent(content: string): SupportedLang {
  const text = content.trim();
  if (!text) return "txt";

  // Try JSON first (fast parse for small content)
  if ((text.startsWith("{") || text.startsWith("["))) {
    try {
      JSON.parse(text);
      return "json";
    } catch (_) { /* not json */ }
  }

  // HTML/XML detection
  if (
    /^<!DOCTYPE|<html|<head|<body|<div|<span|<p|<h[1-6]|<ul|<ol|<li|<table|<tr|<td|<th|<form|<input|<button|<img|<a|<script|<style|<meta|<link|<title/
      .test(text)
  ) {
    return "html";
  }

  // Java detection
  if (
    /\bpublic\s+(class|interface|enum)\s+\w+|\bprivate\s+|\bprotected\s+|\bstatic\s+|\bfinal\s+|\babstract\s+|\bimport\s+java|\bpackage\s+\w+|\bSystem\.out\.print|\bnew\s+\w+\(/
      .test(text)
  ) {
    return "java";
  }

  // C/C++ detection
  if (
    /\b#include\s*[<"]|\bint\s+main\s*\(|\bprintf\s*\(|\bcout\s*<<|\bcin\s*>>|\bstd::|\bnamespace\s+\w+|\bclass\s+\w+|\btemplate\s*</
      .test(text)
  ) {
    return text.includes("std::") || text.includes("cout") ||
        text.includes("cin") || text.includes("template")
      ? "cpp"
      : "c";
  }

  // Rust detection
  if (
    /\bfn\s+\w+|\blet\s+mut?\s+\w+|\buse\s+\w+|\bstruct\s+\w+|\benum\s+\w+|\bimpl\s+\w+|\bpub\s+|\bmod\s+\w+|\bprintln!|\bvec!|\bvec!\[/
      .test(text)
  ) {
    return "rust";
  }

  // React/JSX heuristics (check before JavaScript)
  if (
    /\bimport\s+React|\bexport\s+default|\breturn\s*\(|\bconst\s+\w+\s*[:=]\s*\(|\bfunction\s+\w+\s*\([^)]*\)\s*:\s*JSX\.Element|\binterface\s+\w+Props|\btype\s+\w+Props|\buse[A-Z]\w+\(|<\w+[^>]*>|<\/\w+>/
      .test(text)
  ) {
    return "tsx";
  }

  // CSS heuristics - simple but effective detection
  if (
    /\b\w+\s*:\s*[^;]+;/.test(text) || /[.#]\w+\s*\{/.test(text) ||
    /@(media|import|keyframes)/.test(text)
  ) {
    return "css";
  }

  // Python heuristics
  if (
    /\bdef\s+\w+\s*\(|\bclass\s+\w+\s*\(|\bimport\s+\w+|:\s*(#.*)?$/m.test(text)
  ) {
    return "py";
  }

  // JavaScript heuristics
  if (/\b(function|const|let|var|import|export|=>)\b|\/\/|\/\*/.test(text)) {
    return "js";
  }

  return "general";
}
