import { useState, useEffect, useRef } from "react";
import { process } from "@visualizer/core";
import dynamic from "next/dynamic";
import { markdown as mdLang } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import DOMPurify from "isomorphic-dompurify";
import mermaid from "mermaid";

// Import CodeMirror dynamically to avoid SSR issues
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import "katex/dist/katex.min.css";

export default function HomePage() {
  const [markdown, setMarkdown] = useState(
    '# Smart Markdown Visualizer\n\nWelcome! This visualizer supports advanced Markdown features.\n\n## Code Syntax Highlighting\n\n```javascript\nconsole.log("Hello, syntax highlighting!");\nconst sum = (a, b) => a + b;\n```\n\n## Mathematical Notation\n\nInline math: $E = mc^2$\n\nBlock math:\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$\n\n## Mermaid Diagrams\n\n```mermaid\ngraph TD;\n    A[Start] --> B{Decision};\n    B -->|Yes| C[Success];\n    B -->|No| D[Failure];\n    C --> E[End];\n    D --> E;\n```\n\n## GitHub Flavored Markdown\n\n| Feature    | Support |\n|------------|---------|\n| Tables     | ✔       |\n| Math       | ✔       |\n| Diagrams   | ✔       |\n| Syntax     | ✔       |\n\n**Try editing the markdown!**\n'
  );
  const [html, setHtml] = useState("");
  const [wordWrap, setWordWrap] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);

  const editorPaneRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Export functions
  const exportAsMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    // Use the rendered preview content (with Mermaid SVGs already generated)
    const renderedContent = previewRef.current?.innerHTML || html;

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background-color: #f5f5f5; }
    code { background-color: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background-color: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
    /* Mermaid diagram styling */
    .mermaid { display: flex; justify-content: center; margin: 1rem 0; }
    .mermaid svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${renderedContent}
</body>
</html>`;
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    // Use the rendered preview content (with Mermaid SVGs already generated)
    const renderedContent = previewRef.current?.innerHTML || html;

    // Open print dialog with preview content
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Print Preview</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    img { max-width: 100%; page-break-inside: avoid; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background-color: #f5f5f5; }
    code { background-color: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background-color: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; page-break-inside: avoid; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
    /* Mermaid diagram styling */
    .mermaid { display: flex; justify-content: center; margin: 1rem 0; page-break-inside: avoid; }
    .mermaid svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${renderedContent}
<script>
  window.onload = function() {
    setTimeout(() => {
      window.print();
    }, 500);
  };
</script>
</body>
</html>`);
    printWindow.document.close();
  };

  useEffect(() => {
    const processMarkdown = async () => {
      const result = await process(markdown);
      // Sanitize HTML to prevent XSS attacks
      // Configure DOMPurify to allow Mermaid diagrams
      const sanitizedHtml = DOMPurify.sanitize(result, {
        ADD_TAGS: ["div"],
        ADD_ATTR: ["class"],
        FORCE_BODY: true,
      });
      setHtml(sanitizedHtml);
    };
    processMarkdown();
  }, [markdown]);

  useEffect(() => {
    if (html && previewRef.current) {
      // Initialize Mermaid once
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict", // 🔒 SECURITY: Block inline event handlers and unsafe SVG
      });

      // Use setTimeout to ensure DOM is updated
      setTimeout(async () => {
        try {
          const mermaidElements =
            previewRef.current?.querySelectorAll(".mermaid");
          if (mermaidElements && mermaidElements.length > 0) {
            // Clear any previous SVG content to prevent duplicates
            mermaidElements.forEach((el) => {
              if (el.querySelector("svg")) {
                el.innerHTML = el.textContent || "";
              }
            });

            await mermaid.run({ querySelector: ".mermaid" });
          }
        } catch (e) {
          console.error("Mermaid run error:", e);
        }
      }, 100);
    }
  }, [html]);

  // Synchronized scrolling
  useEffect(() => {
    if (!syncScroll) return;

    const editorScroller = editorPaneRef.current?.querySelector(".cm-scroller");
    const preview = previewRef.current;

    if (!editorScroller || !preview) return;

    const handleEditorScroll = () => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      const scrollPercentage =
        editorScroller.scrollTop /
        (editorScroller.scrollHeight - editorScroller.clientHeight);
      preview.scrollTop =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    };

    const handlePreviewScroll = () => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      const scrollPercentage =
        preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editorScroller.scrollTop =
        scrollPercentage *
        (editorScroller.scrollHeight - editorScroller.clientHeight);

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    };

    editorScroller.addEventListener("scroll", handleEditorScroll);
    preview.addEventListener("scroll", handlePreviewScroll);

    return () => {
      editorScroller.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [syncScroll, html]); // Re-attach when html changes or syncScroll toggles

  const extensions: Extension[] = [mdLang()];
  if (wordWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return (
    <>
      <style jsx global>{`
        /* Basic styles for syntax highlighting */
        html,
        body {
          margin: 0;
          padding: 0;
          font-family: sans-serif;
        }
        .hljs {
          display: block;
          overflow-x: auto;
          padding: 0.5em;
          background: #f3f3f3;
          color: #333;
        }
        .hljs-comment,
        .hljs-quote {
          color: #998;
          font-style: italic;
        }
        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-subst {
          color: #333;
          font-weight: bold;
        }
        .hljs-number,
        .hljs-literal,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-tag .hljs-attr {
          color: #008080;
        }
        .hljs-string,
        .hljs-doctag {
          color: #d14;
        }
        table {
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th,
        td {
          border: 1px solid #ccc;
          padding: 0.5rem;
        }
      `}</style>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .header {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          border-bottom: 1px solid #ccc;
        }
        .header-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 1rem;
        }
        .header-item h1 {
          margin: 0;
          font-size: 1.2rem;
        }
        .preview-header {
          padding: 0 1rem;
        }
        .wrap-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }
        .wrap-control input[type="checkbox"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }
        .wrap-control label {
          cursor: pointer;
          margin: 0;
        }
        .export-btn {
          padding: 0.5rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .export-btn:hover {
          background: #0056b3;
        }
        .export-btn:active {
          transform: translateY(1px);
        }
        .content {
          display: flex;
          flex: 1;
          overflow: hidden; /* Prevents content from overflowing container */
        }
        .pane {
          flex: 1;
          padding: 1rem;
          position: relative;
          box-sizing: border-box;
        }
        .editor-pane {
          padding: 0;
          overflow: hidden; /* Let CodeMirror handle its own scrolling */
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .preview-pane {
          border-left: 1px solid #ccc;
          overflow-y: auto; /* Enable vertical scrolling */
          overflow-x: hidden; /* Prevent horizontal scroll */
        }
        /* Style the preview pane scrollbar */
        .preview-pane::-webkit-scrollbar {
          width: 12px;
        }
        .preview-pane::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .preview-pane::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 6px;
        }
        .preview-pane::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        /* Firefox scrollbar styling */
        .preview-pane {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        /* Ensure CodeMirror takes up full space and is scrollable */
        .editor-pane :global(.cm-editor) {
          height: 100% !important;
          width: 100% !important;
          font-size: 14px;
        }
        .editor-pane :global(.cm-scroller) {
          overflow-y: scroll !important; /* Always show scrollbar */
          overflow-x: auto !important;
          height: 100% !important;
          scrollbar-gutter: stable; /* Reserve space for scrollbar */
        }
        /* Force scrollbar to always be visible */
        .editor-pane :global(.cm-content) {
          min-height: 100%;
        }
        /* Style CodeMirror scrollbar - make it prominent */
        .editor-pane :global(.cm-scroller)::-webkit-scrollbar {
          width: 14px !important;
          height: 14px !important;
          background: #f1f1f1;
        }
        .editor-pane :global(.cm-scroller)::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-left: 1px solid #ddd;
        }
        .editor-pane :global(.cm-scroller)::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 7px;
          border: 2px solid #f1f1f1;
        }
        .editor-pane :global(.cm-scroller)::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .editor-pane :global(.cm-scroller)::-webkit-scrollbar-corner {
          background: #f1f1f1;
        }
        /* Firefox scrollbar for CodeMirror */
        .editor-pane :global(.cm-scroller) {
          scrollbar-width: auto !important; /* Show full scrollbar */
          scrollbar-color: #888 #f1f1f1;
        }
        /* Ensure editor pane container has no scrollbars */
        .editor-pane::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .editor-pane {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        /* Make CodeMirror fill the container properly */
        .editor-pane > div {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div className="container">
        <div className="header">
          <div className="header-item">
            <h1>Markdown</h1>
            <div className="wrap-control">
              <input
                type="checkbox"
                id="wordWrap"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
              <label htmlFor="wordWrap">Word Wrap</label>
            </div>
            <div className="wrap-control">
              <input
                type="checkbox"
                id="syncScroll"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
              />
              <label htmlFor="syncScroll">Sync Scroll</label>
            </div>
          </div>
          <div className="header-item preview-header">
            <h1>Preview</h1>
            <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
              <button
                onClick={exportAsMarkdown}
                className="export-btn"
                title="Export as Markdown"
              >
                📄 .MD
              </button>
              <button
                onClick={exportAsHTML}
                className="export-btn"
                title="Export as HTML"
              >
                🌐 HTML
              </button>
              <button
                onClick={exportAsPDF}
                className="export-btn"
                title="Export as PDF"
              >
                📑 PDF
              </button>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="pane editor-pane" ref={editorPaneRef}>
            <CodeMirror
              value={markdown}
              extensions={extensions}
              onChange={(value) => setMarkdown(value)}
              height="100%"
              style={{
                height: "100%",
                fontSize: "14px",
              }}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
                highlightSpecialChars: true,
                drawSelection: true,
              }}
            />
          </div>
          <div className="pane preview-pane" ref={previewRef}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </>
  );
}
