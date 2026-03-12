import { ArtifactType } from "./detect";
import { SITES_DOMAIN, APP_URL } from "@/lib/constants";

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

function escapeScriptClose(code: string): string {
  // Prevent </script> in artifact code from terminating the <script> block
  return code.replace(/<\/script>/gi, "<\\/script>");
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

  // Escape </script> to prevent XSS via script block termination
  processed = escapeScriptClose(processed);

  return processed;
}

const AI_PROXY_SCRIPT = `<script>
(function() {
  var _origFetch = window.fetch;
  window.fetch = function(url, opts) {
    if (typeof url === 'string' && url.indexOf('api.anthropic.com') !== -1) {
      var proxyUrl = '/api/ai' + new URL(url).pathname;
      var newHeaders = {};
      if (opts && opts.headers) {
        var h = opts.headers;
        if (typeof h.forEach === 'function') {
          h.forEach(function(v, k) { newHeaders[k] = v; });
        } else {
          for (var k in h) { newHeaders[k] = h[k]; }
        }
      }
      delete newHeaders['anthropic-dangerous-direct-browser-access'];
      var newOpts = Object.assign({}, opts, { headers: newHeaders });
      return _origFetch.call(window, proxyUrl, newOpts);
    }
    return _origFetch.apply(window, arguments);
  };
})();
</script>`;

const FAVICON_LINK = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'/%3E%3Cpath d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09'/%3E%3Cpath d='M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z'/%3E%3Cpath d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05'/%3E%3C/svg%3E" />`;

const BADGE_HTML = `
  <div style="position:fixed;bottom:8px;right:8px;opacity:0.5;font-size:11px;font-family:sans-serif;z-index:99999;">
    <a href="https://shipartifact.com" target="_blank" rel="noopener" style="color:#888;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
      Made with ShipArtifact
    </a>
  </div>`;

export function wrapJsxArtifact(
  code: string,
  meta: { title: string; description?: string; slug: string },
  options?: { usesAi?: boolean }
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
  <meta property="og:url" content="https://${meta.slug}.${SITES_DOMAIN}" />
  <meta property="og:image" content="${APP_URL}/api/og" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  ${FAVICON_LINK}
  ${options?.usesAi ? AI_PROXY_SCRIPT : ""}
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
  meta: { title: string; description?: string; slug: string },
  options?: { usesAi?: boolean }
): string {
  const desc = meta.description || meta.title;
  const trimmed = code.trim();
  const aiScript = options?.usesAi ? AI_PROXY_SCRIPT : "";

  // If it's a complete HTML document, inject meta tags
  if (trimmed.match(/^<!DOCTYPE/i) || trimmed.match(/^<html/i)) {
    let html = trimmed;

    // Inject title into <head> if not present
    if (!html.includes("<title>")) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n  <title>${escapeHtml(meta.title)}</title>`
      );
    }

    // Inject OG meta tags if not present
    if (!html.includes("og:image")) {
      const ogTags = `
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="https://${meta.slug}.${SITES_DOMAIN}" />
  <meta property="og:image" content="${APP_URL}/api/og" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />`;
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>${ogTags}`
      );
    }

    // Inject favicon if not present
    if (!html.includes("rel=\"icon\"") && !html.includes("rel='icon'")) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n  ${FAVICON_LINK}`
      );
    }

    // Inject AI proxy script as first child of <head>
    if (aiScript) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n  ${aiScript}`
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
  <meta property="og:url" content="https://${meta.slug}.${SITES_DOMAIN}" />
  <meta property="og:image" content="${APP_URL}/api/og" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  ${FAVICON_LINK}
  ${aiScript}
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
  meta: { title: string; description?: string; slug: string },
  options?: { usesAi?: boolean }
): string {
  if (type === "jsx") {
    return wrapJsxArtifact(code, meta, options);
  }
  return wrapHtmlArtifact(code, meta, options);
}
