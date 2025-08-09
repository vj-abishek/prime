import { Head } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import CodeHighlighter from "../islands/CodeHighlighter.tsx";
import { DEFAULT_MESSAGE } from "../constants/defaultMessage.ts";

export default function Home() {
  const typescriptCode = useSignal(DEFAULT_MESSAGE);

  const handleCodeChange = (newCode: string) => {
    typescriptCode.value = newCode;
  };

  return (
    <>
      <Head>
        <title>Zen Code - Beautiful Code Editor & Snippet Sharing</title>
        
        {/* Basic Meta Tags */}
        <meta name="description" content="A beautiful, minimalist code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        <meta name="keywords" content="code editor, code sharing, typescript, javascript, python, css, programming, snippets" />
        <meta name="author" content="Zen Code" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Zen Code - Beautiful Code Editor & Snippet Sharing" />
        <meta property="og:description" content="A beautiful, minimalist code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zencode.dev" />
        <meta property="og:site_name" content="Zen Code" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Zen Code - Beautiful Code Editor & Snippet Sharing" />
        <meta name="twitter:description" content="A beautiful, minimalist code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        <meta name="twitter:site" content="@zencode" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#111827" />
        <meta name="msapplication-TileColor" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Zen Code",
            "description": "A beautiful, minimalist code editor for writing and sharing code snippets",
            "url": "https://zencode.dev",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "Zen Code"
            }
          })
        }} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div class="bg-gray-950 text-gray-100 flex items-center justify-center overflow-hidden">
        <div class="w-full max-w-5xl h-full flex items-center justify-center">
          <CodeHighlighter code={typescriptCode.value} onCodeChange={handleCodeChange} />
        </div>
      </div>
    </>
  );
}
