import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import {
  basicSetup,
  EditorView,
} from "https://esm.sh/codemirror?target=es2022&dts";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark?target=es2022&dts";
import { keymap } from "https://esm.sh/@codemirror/view?target=es2022&dts";
import { indentWithTab } from "https://esm.sh/@codemirror/commands?target=es2022&dts";
import { DEFAULT_MESSAGE } from "../constants/defaultMessage.ts";
import { shortUrlId } from "../utils/urlId.ts";
import { 
  SupportedLang, 
  detectLanguageFromContent, 
  getLanguageExtension 
} from "../utils/languageSupport.ts";

interface CodeHighlighterProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
  roomId?: string; // Optional room ID for collaborative editing
}

export default function CodeHighlighter({ code, onCodeChange, roomId }: CodeHighlighterProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const currentCode = useSignal(code);
  const showFeedback = useSignal(false);
  const feedbackMessage = useSignal("");
  const isSharing = useSignal(false);
  
  // Collaborative editing state
  const ydocRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const yUndoManagerRef = useRef<any>(null);
  const isConnected = useSignal(false);
  const connectionStatus = useSignal("Connecting...");

  // Function to recreate editor with new language support
  const recreateEditor = async (newCode: string) => {
    if (!parentRef.current) return;

    // Destroy existing editor
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    // Detect language for new content
    const detected: SupportedLang = detectLanguageFromContent(newCode);
    console.log("🔍 Re-detected language:", detected, "for pasted content:", newCode.substring(0, 50));

    // Get language extension with lazy loading
    const languageExtension = await getLanguageExtension(detected);

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Create new editor with detected language
    const view = new EditorView({
      parent: parentRef.current!,
      doc: newCode,
      extensions: [
        basicSetup,
        oneDark,
        languageExtension,
        EditorView.editable.of(true),
        // Tab key now inserts tab characters for indentation
        // Accessibility: Press Escape then Tab to move focus, or use Ctrl-m (Cmd-m on Mac) to toggle tab focus mode
        keymap.of([indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const updatedCode = update.state.doc.toString();
            currentCode.value = updatedCode;
            onCodeChange?.(updatedCode);
          }
        }),
        EditorView.theme({
          "&": { 
            height: "100dvh", 
            maxWidth: "100%",
            overflow: "hidden",
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: "14px",
            lineHeight: "1.5"
          },
          ".cm-scroller": { 
            overflow: "auto",
            height: "calc(100dvh - 80px)" // Account for action buttons
          },
          ".cm-content": { 
            paddingTop: "20px", // Add top padding
            paddingBottom: "20px", // Reduced padding
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: "14px",
            lineHeight: "1.5"
          },
          // Make line numbers non-selectable and style them
          ".cm-gutters": { 
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: "14px"
          },
          ".cm-lineNumbers": { 
            userSelect: "none",
            WebkitUserSelect: "none", 
            MozUserSelect: "none",
            msUserSelect: "none",
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: "14px"
          },
          ".cm-gutterElement": {
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none", 
            msUserSelect: "none",
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: "14px"
          }
        }),
      ].flat(),
    });

    // Focus editor on desktop only
    if (!isMobile) {
      setTimeout(() => {
        view.focus();
      }, 100);
    }

    viewRef.current = view;
    
    // Initialize collaboration if roomId is provided
    if (roomId) {
      initializeCollaboration(view);
    }
  };

  // Initialize collaborative editing if roomId is provided
  const initializeCollaboration = async (view: EditorView) => {
    if (!roomId) return;
    
    try {
      // Dynamically import Y.js modules on client side
      const [Y, { CodemirrorBinding }, { WebrtcProvider }] = await Promise.all([
        import("https://esm.sh/yjs?target=es2022&dts"),
        import("https://esm.sh/y-codemirror?target=es2022&dts"),
        import("https://esm.sh/y-webrtc?target=es2022&dts")
      ]);

      // Create Y.js document
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // Create WebRTC provider with the room ID
      const provider = new WebrtcProvider(roomId, ydoc);
      providerRef.current = provider;

      // Get shared text
      const yText = ydoc.getText('codemirror');
      
      // Set initial content if the document is empty
      if (yText.toString().trim() === '') {
        yText.insert(0, code);
      }

      // Create undo manager
      const yUndoManager = new Y.UndoManager(yText, {
        trackedOrigins: new Set([])
      });
      yUndoManagerRef.current = yUndoManager;

      // Create binding between Y.js and CodeMirror
      const binding = new CodemirrorBinding(yText, view, provider.awareness, {
        yUndoManager
      });
      bindingRef.current = binding;

      // Set up connection status monitoring (logging only)
      provider.on('status', ({ status }: { status: string }) => {
        console.log('Connection status:', status);
        if (status === 'connected') {
          isConnected.value = true;
        } else if (status === 'disconnected') {
          isConnected.value = false;
        }
      });

      // Automatically connect when loaded via share slug
      try {
        provider.connect();
        showFeedbackMessage("Collaborative editing enabled!");
      } catch (error) {
        console.error('Failed to connect:', error);
        showFeedbackMessage("Failed to connect. Please try again.");
      }

      // Set up awareness for user presence
      provider.awareness.setLocalStateField('user', {
        name: `User ${Math.floor(Math.random() * 1000)}`,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });

      showFeedbackMessage("Collaborative editing enabled!");

    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      showFeedbackMessage("Failed to enable collaboration");
    }
  };

  useEffect(() => {
    if (!parentRef.current) return;

    // Only create editor if it doesn't exist
    if (viewRef.current) return;

    const createInitialEditor = async () => {
      const detected: SupportedLang = detectLanguageFromContent(currentCode.value);
      console.log("🔍 Detected language:", detected, "for content preview:", currentCode.value.substring(0, 50));

      // Get language extension with lazy loading
      const languageExtension = await getLanguageExtension(detected);

      // Detect if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const view = new EditorView({
        parent: parentRef.current!,
        doc: currentCode.value,
        extensions: [
          basicSetup,
          oneDark,
          languageExtension,
          EditorView.editable.of(true),
          // Tab key now inserts tab characters for indentation
          // Accessibility: Press Escape then Tab to move focus, or use Ctrl-m (Cmd-m on Mac) to toggle tab focus mode
          keymap.of([indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newCode = update.state.doc.toString();
              currentCode.value = newCode;
              onCodeChange?.(newCode);
            }
          }),
          EditorView.theme({
            "&": { 
              height: "100dvh", 
              maxWidth: "100%",
              overflow: "hidden",
              fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: "14px",
              lineHeight: "1.5"
            },
            ".cm-scroller": { 
              overflow: "auto",
              height: "calc(100dvh - 80px)" // Account for action buttons
            },
            ".cm-content": { 
              paddingTop: "20px", // Add top padding
              paddingBottom: "20px", // Reduced padding
              fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: "14px",
              lineHeight: "1.5"
            },
            // Make line numbers non-selectable and style them
            ".cm-gutters": { 
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: "14px"
            },
            ".cm-lineNumbers": { 
              userSelect: "none",
              WebkitUserSelect: "none", 
              MozUserSelect: "none",
              msUserSelect: "none",
              fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: "14px"
            },
            ".cm-gutterElement": {
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none", 
              msUserSelect: "none",
              fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: "14px"
            }
          }),
        ].flat(),
      });

      // Focus editor on desktop only
      if (!isMobile) {
        setTimeout(() => {
          view.focus();
        }, 100);
      }

      viewRef.current = view;
      
      // Initialize collaboration if roomId is provided
      if (roomId) {
        initializeCollaboration(view);
      }
    };

    // Call the async function to create the editor
    createInitialEditor();

    return () => {
      // Cleanup collaborative editing
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
      
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []); // Only run once on mount

  // Handle keyboard shortcuts and paste events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Ctrl+V (Windows/Linux) or Cmd+V (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        pasteFromClipboard();
      }
    };

    const handlePaste = async (event: ClipboardEvent) => {
      // Handle paste events (mobile and desktop)
      const text = event.clipboardData?.getData('text/plain');
      if (text && text.trim()) {
        event.preventDefault();
        await recreateEditor(text);
        currentCode.value = text;
        onCodeChange?.(text);
        showFeedbackMessage("Pasted successfully!");
      }
    };

    // Add event listeners to the document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, []); // Only run once on mount

  // Handle external code changes (from parent component)
  useEffect(() => {
    if (viewRef.current && code !== currentCode.value) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code
        }
      });
      viewRef.current.dispatch(transaction);
      currentCode.value = code;
    }
  }, [code]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentCode.value);
      showFeedbackMessage("Copied to clipboard!");
    } catch (err) {
      showFeedbackMessage("Failed to copy");
    }
  };

  const shareCode = async () => {
    if (isSharing.value) return; // Prevent multiple clicks
    
    isSharing.value = true;
    try {
      // Store code in Redis and get share URL
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: currentCode.value }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Copy the share URL to clipboard
        await navigator.clipboard.writeText(result.url);
        if (result.message) {
          showFeedbackMessage(result.message);
        } else {
          showFeedbackMessage("Share URL copied to clipboard!");
        }
      } else {
        showFeedbackMessage("Failed to share code");
      }
    } catch (err) {
      console.error('Share error:', err);
      showFeedbackMessage("Failed to share");
    } finally {
      isSharing.value = false;
    }
  };

  const pasteFromClipboard = async () => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        showFeedbackMessage("Clipboard API not supported");
        return;
      }

      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // Recreate editor with new content and detected language
        await recreateEditor(text);
        currentCode.value = text;
        onCodeChange?.(text);
        showFeedbackMessage("Pasted successfully!");
      } else {
        showFeedbackMessage("Clipboard is empty");
      }
    } catch (err) {
      console.error("Paste error:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        // Fallback: try using a temporary textarea
        try {
          const textarea = document.createElement('textarea');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          
          // Try to paste using document.execCommand
          const success = document.execCommand('paste');
          const text = textarea.value;
          document.body.removeChild(textarea);
          
          if (success && text.trim()) {
            // Recreate editor with new content and detected language
            await recreateEditor(text);
            currentCode.value = text;
            onCodeChange?.(text);
            showFeedbackMessage("Pasted successfully!");
          } else {
            showFeedbackMessage("Please use Ctrl+V to paste");
          }
        } catch (fallbackErr) {
          showFeedbackMessage("Please use Ctrl+V to paste");
        }
      } else {
        showFeedbackMessage("Failed to paste");
      }
    }
  };

  const showFeedbackMessage = (message: string) => {
    feedbackMessage.value = message;
    showFeedback.value = true;
    setTimeout(() => showFeedback.value = false, 2000);
  };

  // Toggle collaborative editing connection
  const toggleConnection = () => {
    if (!providerRef.current) return;

    if (providerRef.current.shouldConnect) {
      try {
        providerRef.current.disconnect();
        isConnected.value = false;
        showFeedbackMessage("Disconnected from collaboration");
      } catch (error) {
        console.error('Error disconnecting:', error);
        showFeedbackMessage("Error disconnecting");
      }
    } else {
      try {
        providerRef.current.connect();
        isConnected.value = true;
        showFeedbackMessage("Connecting to collaboration...");
      } catch (error) {
        console.error('Error connecting:', error);
        isConnected.value = false;
        showFeedbackMessage("Failed to connect. Please try again.");
      }
    }
  };

  const hasContent = currentCode.value.trim().length > 0;
  const hasDefaultContent = currentCode.value.trim() === DEFAULT_MESSAGE.trim();
  const isEmpty = !hasContent;

  return (
    <div class="relative w-full overflow-hidden" style="height: 100vh; height: 100dvh;">
      <div ref={parentRef} class="h-full w-full" />
      

      
      {/* Action buttons */}
      <div class="absolute bottom-4 right-4 flex gap-2">
        {hasContent && !hasDefaultContent && (
          <>
            <button
              onClick={copyToClipboard}
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
              title="Copy code"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            
            <button
              onClick={shareCode}
              disabled={isSharing.value}
              class={`px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm ${isSharing.value ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Share code"
            >
              {isSharing.value ? (
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              )}
              {isSharing.value ? 'Sharing...' : 'Share'}
            </button>
          </>
        )}
        
        <button
          onClick={pasteFromClipboard}
          class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
          title="Paste from clipboard"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste
        </button>
      </div>

      {/* Feedback message */}
      {showFeedback.value && (
        <div class="absolute bottom-16 right-4 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg text-sm animate-fade-in">
          {feedbackMessage.value}
        </div>
      )}
    </div>
  );
}
