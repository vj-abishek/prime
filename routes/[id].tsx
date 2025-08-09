  import { PageProps } from "$fresh/server.ts";
  import { Head } from "$fresh/runtime.ts";
  import CodeHighlighter from "../islands/CodeHighlighter.tsx";
  import { getCode } from "../utils/redis.ts";

  // Function to create a preview description from code
  function createCodePreview(code: string, maxLength: number = 200): string {
    const text = code.trim();
    if (!text) return "Empty code snippet";
    
    // Remove extra whitespace and newlines
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length <= maxLength) {
      return cleanText;
    }
    
    return cleanText.substring(0, maxLength) + "...";
  }

  // Function to detect language for meta tags
  function detectLanguageFromContent(content: string): string {
    const text = content.trim();
    if (!text) return "Text";

    // Try JSON first
    if ((text.startsWith("{") || text.startsWith("["))) {
      try {
        JSON.parse(text);
        return "JSON";
      } catch (_) {/* not json */}
    }

    // React/JSX heuristics
    if (/\bimport\s+React|\bexport\s+default|\breturn\s*\(|\bconst\s+\w+\s*[:=]\s*\(|\bfunction\s+\w+\s*\([^)]*\)\s*:\s*JSX\.Element|\binterface\s+\w+Props|\btype\s+\w+Props|\buse[A-Z]\w+\(|<\w+[^>]*>|<\/\w+>/.test(text)) {
      return "TypeScript/React";
    }

    // CSS heuristics
    if (/\b\w+\s*:\s*[^;]+;/.test(text) || /[.#]\w+\s*\{/.test(text) || /@(media|import|keyframes)/.test(text)) {
      return "CSS";
    }

    // Python heuristics
    if (/\bdef\s+\w+\s*\(|\bclass\s+\w+\s*\(|\bimport\s+\w+|:\s*(#.*)?$/m.test(text)) {
      return "Python";
    }

    // JavaScript heuristics
    if (/\b(function|const|let|var|import|export|=>)\b|\/\/|\/\*/.test(text)) {
      return "JavaScript";
    }

    return "Code";
  }

  export default async function SharePage(props: PageProps) {
    const url = new URL(props.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return (
        <>
          <Head>
            <title>Invalid URL - Zen Code</title>
            <meta name="description" content="Invalid or missing code ID in the URL." />
          </Head>
          <div class="h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-2xl font-bold mb-4">Invalid URL</h1>
              <p class="text-gray-400 mb-6">No code ID provided in the URL.</p>
              <a 
                href="/" 
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200"
              >
                Go Home
              </a>
            </div>
          </div>
        </>
      );
    }
    
    try {
      const code = await getCode(id);
      
      if (!code) {
        return (
          <>
            <Head>
              <title>Code Not Found - Zen Code</title>
              <meta name="description" content="The shared code could not be found." />
            </Head>
            <div class="h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Code Not Found</h1>
                <p class="text-gray-400 mb-6">The shared code with ID "{id}" could not be found.</p>
                <a 
                  href="/" 
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200"
                >
                  Go Home
                </a>
              </div>
            </div>
          </>
        );
      }

      const codePreview = createCodePreview(code);
      const detectedLang = detectLanguageFromContent(code);
      const totalLines = code.split('\n').length;
      const currentUrl = props.url.href;
      const siteName = "Zen Code";

      return (
        <>
          <Head>
            <title>Shared {detectedLang} Code - {siteName}</title>
            
            {/* Basic Meta Tags */}
            <meta name="description" content={codePreview} />
            <meta name="keywords" content={`${detectedLang.toLowerCase()}, code, programming, snippet, share`} />
            <meta name="author" content={siteName} />
            
                      {/* Open Graph Meta Tags */}
          <meta property="og:title" content={`Shared ${detectedLang} Code`} />
          <meta property="og:description" content={codePreview} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={currentUrl} />
          <meta property="og:site_name" content={siteName} />
          <meta property="og:locale" content="en_US" />
            
                      {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`Shared ${detectedLang} Code`} />
          <meta name="twitter:description" content={codePreview} />
          <meta name="twitter:site" content="@zencode" />
            
                      {/* Additional Meta Tags for Code Preview */}
            
            {/* Code-specific meta tags */}
            <meta name="code-language" content={detectedLang} />
            <meta name="code-lines" content={totalLines.toString()} />
            <meta name="code-preview" content={codePreview} />
            
            {/* Structured Data for Rich Snippets */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareSourceCode",
                "name": `Shared ${detectedLang} Code`,
                "description": codePreview,
                "programmingLanguage": detectedLang,
                "codeRepository": currentUrl,
                "author": {
                  "@type": "Organization",
                  "name": siteName
                },
                "dateCreated": new Date().toISOString(),
                "url": currentUrl
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
              <CodeHighlighter code={code} />
            </div>
          </div>
        </>
      );
    } catch (error) {
      console.error('Error loading shared code:', error);
      return (
        <>
          <Head>
            <title>Error - Zen Code</title>
            <meta name="description" content="There was an error loading the shared code." />
          </Head>
          <div class="h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-2xl font-bold mb-4">Error Loading Code</h1>
              <p class="text-gray-400 mb-6">There was an error loading the shared code.</p>
              <a 
                href="/" 
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200"
              >
                Go Home
              </a>
            </div>
          </div>
        </>
      );
    }
  } 