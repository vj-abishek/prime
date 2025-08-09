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
        <title>Zen Code - Prime</title>
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
          <CodeHighlighter code={typescriptCode.value} onCodeChange={handleCodeChange} />
        </div>
      </div>
    </>
  );
}
