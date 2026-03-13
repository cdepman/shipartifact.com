"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { detectArtifactType, ArtifactType } from "@/lib/artifact/detect";

interface PreviewPaneProps {
  code: string;
  title?: string;
}

// Client-side wrapping for instant preview (mirrors server-side wrap.ts)
function wrapForPreview(
  code: string,
  type: ArtifactType,
  title: string
): string {
  if (type === "jsx") {
    let processed = code;
    processed = processed.replace(
      /^import\s+.*from\s+['"].*['"];?\s*$/gm,
      ""
    );

    // Extract component name before stripping exports
    const exportDefault = code.match(
      /export\s+default\s+function\s+([A-Z]\w*)/
    );
    const standaloneExport = code.match(
      /export\s+default\s+([A-Z]\w*)\s*;?$/m
    );
    const funcMatches = [
      ...code.matchAll(/(?:function|const|let|var)\s+([A-Z]\w*)/g),
    ];
    const componentName =
      exportDefault?.[1] ||
      standaloneExport?.[1] ||
      funcMatches[funcMatches.length - 1]?.[1] ||
      "App";

    processed = processed.replace(
      /export\s+default\s+function\s+/g,
      "function "
    );
    processed = processed.replace(
      /export\s+default\s+class\s+/g,
      "class "
    );
    processed = processed.replace(/^export\s+default\s+\w+;?\s*$/gm, "");
    processed = processed.replace(/^export\s+/gm, "");

    // Escape </script> to prevent script block termination
    processed = processed.replace(/<\/script>/gi, "<\\/script>");

    return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<style>* { margin: 0; padding: 0; box-sizing: border-box; }</style>
</head><body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, useReducer } = React;
${processed}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(${componentName}));
</script>
</body></html>`;
  }

  // HTML
  const trimmed = code.trim();
  if (trimmed.match(/^<!DOCTYPE/i) || trimmed.match(/^<html/i)) {
    return trimmed;
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title}</title></head><body>${code}</body></html>`;
}

export function PreviewPane({ code, title = "Preview" }: PreviewPaneProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const detectedType = useMemo(
    () => (code ? detectArtifactType(code) : null),
    [code]
  );

  const previewHtml = useMemo(() => {
    if (!code) return "";
    return wrapForPreview(code, detectedType!, title);
  }, [code, detectedType, title, refreshKey]);

  return (
    <div
      className={`flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "h-full rounded-xl border border-border"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Preview</span>
          {detectedType && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-primary">
              {detectedType}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Refresh preview"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 size={14} />
            ) : (
              <Maximize2 size={14} />
            )}
          </button>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 bg-white">
        {code ? (
          <iframe
            ref={iframeRef}
            key={refreshKey}
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-forms"
            className="h-full w-full"
            title="Preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Paste code to see a live preview
          </div>
        )}
      </div>
    </div>
  );
}
