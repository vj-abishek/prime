import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>merg.cc - Code Editor & Snippet Sharing</title>
        <meta name="description" content="A beautiful code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        <meta name="keywords" content="code editor, code sharing, typescript, javascript, python, css, programming, snippets" />
        <meta name="author" content="merg.cc" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://merg.cc" />
        
        {/* Open Graph */}
        <meta property="og:title" content="merg.cc - Code Editor & Snippet Sharing" />
        <meta property="og:description" content="A beautiful code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://merg.cc" />
        <meta property="og:site_name" content="merg.cc" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="merg.cc - Code Editor & Snippet Sharing" />
        <meta name="twitter:description" content="A beautiful code editor for writing and sharing code snippets. Support for TypeScript, JavaScript, Python, CSS, and more." />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "merg.cc",
            "description": "A beautiful code editor for writing and sharing code snippets",
            "url": "https://merg.cc",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
