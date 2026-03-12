import { ArtifactType } from "./detect";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractComponentName(code: string): string {
  // Match "export default function ComponentName"
  const exportDefault = code.match(
    /export\s+default\s+function\s+([A-Z]\w*)/
  );
  if (exportDefault) return exportDefault[1];

  // Match "export default class ComponentName"
  const exportDefaultClass = code.match(
    /export\s+default\s+class\s+([A-Z]\w*)/
  );
  if (exportDefaultClass) return exportDefaultClass[1];

  // Match standalone "export default ComponentName"
  const standaloneExport = code.match(/export\s+default\s+([A-Z]\w*)\s*;?$/m);
  if (standaloneExport) return standaloneExport[1];

  // Find the last PascalCase function defined
  const funcMatches = [
    ...code.matchAll(/(?:function|const|let|var)\s+([A-Z]\w*)/g),
  ];
  if (funcMatches.length > 0) {
    return funcMatches[funcMatches.length - 1][1];
  }

  return "App";
}

function prepareJsxCode(code: string): string {
  let processed = code;

  // Remove import statements (React etc. are loaded via UMD)
  processed = processed.replace(
    /^import\s+.*from\s+['"].*['"];?\s*$/gm,
    ""
  );

  // Convert "export default function X" to "function X"
  processed = processed.replace(
    /export\s+default\s+function\s+/g,
    "function "
  );

  // Convert "export default class X" to "class X"
  processed = processed.replace(/export\s+default\s+class\s+/g, "class ");

  // Remove standalone "export default X;" at end
  processed = processed.replace(/^export\s+default\s+\w+;?\s*$/gm, "");

  // Remove other export statements
  processed = processed.replace(/^export\s+/gm, "");

  return processed;
}

const BADGE_HTML = `
  <div style="position:fixed;bottom:8px;right:8px;opacity:0.5;font-size:11px;font-family:sans-serif;z-index:99999;">
    <a href="https://shipartifact.com" target="_blank" rel="noopener" style="color:#888;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
      Made with ShipArtifact
    </a>
  </div>`;

export function wrapJsxArtifact(
  code: string,
  meta: { title: string; description?: string; slug: string }
): string {
  const componentName = extractComponentName(code);
  const processedCode = prepareJsxCode(code);
  const desc = meta.description || meta.title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="https://${meta.slug}.shipartifact.com" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, useReducer } = React;

    ${processedCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(${componentName}));
  </script>
  ${BADGE_HTML}
</body>
</html>`;
}

export function wrapHtmlArtifact(
  code: string,
  meta: { title: string; description?: string; slug: string }
): string {
  const desc = meta.description || meta.title;
  const trimmed = code.trim();

  // If it's a complete HTML document, inject meta tags
  if (trimmed.match(/^<!DOCTYPE/i) || trimmed.match(/^<html/i)) {
    let html = trimmed;

    // Inject meta tags into <head> if not present
    if (!html.includes("<title>")) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n  <title>${escapeHtml(meta.title)}</title>`
      );
    }

    // Add badge before closing body
    html = html.replace(
      /<\/body>/i,
      `${BADGE_HTML}\n</body>`
    );

    return html;
  }

  // If it's a fragment, wrap in a full document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="https://${meta.slug}.shipartifact.com" />
</head>
<body>
  ${code}
  ${BADGE_HTML}
</body>
</html>`;
}

export function wrapArtifact(
  code: string,
  type: ArtifactType,
  meta: { title: string; description?: string; slug: string }
): string {
  if (type === "jsx") {
    return wrapJsxArtifact(code, meta);
  }
  return wrapHtmlArtifact(code, meta);
}
