import { useEffect, useRef } from "preact/hooks";

interface CodeHighlighterProps {
  code: string;
}

export default function CodeHighlighter({ code }: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadHighlightJS = async () => {
      try {
        // Import the full highlight.js package
        const hljs = await import("https://esm.sh/highlight.js@11.11.1");
        
        // Make it globally available
        window.hljs = hljs.default;
        
        // Import line numbers plugin
        await import("https://esm.sh/highlightjs-line-numbers.js@2.9.0");
        
        // Apply highlighting and line numbers
        if (codeRef.current) {
          // Always use highlightElement for consistent highlighting
          hljs.default.highlightElement(codeRef.current);
          
          // Apply line numbers if plugin is available
          if (window.hljs && window.hljs.lineNumbersBlock) {
            window.hljs.lineNumbersBlock(codeRef.current);
          }
        }
      } catch (error) {
        console.error("Failed to load Highlight.js:", error);
      }
    };

    loadHighlightJS();
  }, [code]);

  return (
    <pre class="bg-gray-800 p-2 overflow-x-auto max-h-full max-w-full">
      <code
        ref={codeRef}
        class="language-typescript text-sm leading-relaxed"
      >
        {code}
      </code>
    </pre>
  );
}

// Add global types for Highlight.js
declare global {
  interface Window {
    hljs: {
      highlightElement: (element: HTMLElement) => void;
      highlightAll: () => void;
      lineNumbersBlock: (element: HTMLElement) => void;
    };
  }
} 