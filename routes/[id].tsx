  import { PageProps } from "$fresh/server.ts";
  import { Head } from "$fresh/runtime.ts";
  import CodeHighlighter from "../islands/CodeHighlighter.tsx";
  import { getCode } from "../utils/redis.ts";

  export default async function SharePage(props: PageProps) {
    const url = new URL(props.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return (
        <>
          <Head>
            <title>Invalid URL - Zen Code</title>
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

      return (
        <>
          <Head>
            <title>Shared Code - Zen Code</title>
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
          <div class="h-screen bg-gray-950 text-gray-100 flex items-center justify-center overflow-hidden">
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