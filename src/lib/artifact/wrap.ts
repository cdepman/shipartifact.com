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
  function __ptsDetectFmt(d) {
    if (!d || typeof d !== 'string') return null;
    if (d.startsWith('/9j/')) return 'image/jpeg';
    if (d.startsWith('iVBOR')) return 'image/png';
    if (d.startsWith('R0lGOD')) return 'image/gif';
    if (d.startsWith('UklGR')) return 'image/webp';
    return null;
  }
  function __ptsConvertImage(b64, mediaType) {
    var d = b64.replace(/^data:.*?,/, '');
    var known = __ptsDetectFmt(d);
    var fmt = known || mediaType || 'image/png';
    var MAX_B64 = 6000000;
    if (known && d.length <= MAX_B64) return Promise.resolve({ data: d, media_type: known });
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() {
        var c = document.createElement('canvas');
        var w = img.naturalWidth, h = img.naturalHeight;
        var max = 2048;
        if (w > max || h > max) {
          var s = Math.min(max / w, max / h);
          w = Math.round(w * s); h = Math.round(h * s);
        }
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        var quals = [0.92, 0.82, 0.7];
        for (var i = 0; i < quals.length; i++) {
          var out = c.toDataURL('image/jpeg', quals[i]).split(',')[1];
          if (out.length <= MAX_B64 || i === quals.length - 1) {
            resolve({ data: out, media_type: 'image/jpeg' });
            return;
          }
        }
      };
      img.onerror = function() {
        resolve({ data: d, media_type: fmt });
      };
      img.src = 'data:' + fmt + ';base64,' + d;
    });
  }
  function __ptsFixImages(obj) {
    if (!obj || typeof obj !== 'object') return Promise.resolve();
    if (Array.isArray(obj)) {
      return obj.reduce(function(p, item) {
        return p.then(function() { return __ptsFixImages(item); });
      }, Promise.resolve());
    }
    var work = Promise.resolve();
    if (obj.type === 'base64' && typeof obj.data === 'string' && (obj.media_type || obj.mediaType)) {
      work = __ptsConvertImage(obj.data, obj.media_type || obj.mediaType).then(function(r) {
        obj.data = r.data;
        if (obj.media_type) obj.media_type = r.media_type;
        if (obj.mediaType) obj.mediaType = r.media_type;
      });
    }
    return work.then(function() {
      var keys = Object.keys(obj);
      return keys.reduce(function(p, k) {
        return p.then(function() {
          if (obj[k] && typeof obj[k] === 'object') return __ptsFixImages(obj[k]);
        });
      }, Promise.resolve());
    });
  }
  function __ptsToast(msg, isError) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);max-width:90vw;' +
      'padding:12px 24px;border-radius:10px;z-index:99999;font-size:14px;font-family:system-ui,sans-serif;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;' +
      (isError ? 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;' : 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;');
    document.body.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 5000);
  }
  function __ptsHandleAiResponse(res) {
    if (res.ok) return res;
    var status = res.status;
    if (status === 429) {
      __ptsToast('Slow down — please wait a moment before trying again.', false);
    } else {
      res.clone().json().then(function(body) {
        var msg = (body && body.error && body.error.message) || 'Something went wrong (HTTP ' + status + ')';
        __ptsToast(msg, true);
      }).catch(function() {
        __ptsToast('AI request failed (HTTP ' + status + ')', true);
      });
    }
    return res;
  }
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
      var newBody = opts && opts.body;
      if (typeof newBody === 'string') {
        try {
          var p = JSON.parse(newBody);
          if (p.messages) {
            return __ptsFixImages(p.messages).then(function() {
              return _origFetch.call(window, proxyUrl, Object.assign({}, opts, {
                headers: newHeaders, body: JSON.stringify(p)
              }));
            }).then(__ptsHandleAiResponse);
          }
        } catch(e) {}
      }
      var newOpts = Object.assign({}, opts, { headers: newHeaders, body: newBody });
      return _origFetch.call(window, proxyUrl, newOpts).then(__ptsHandleAiResponse);
    }
    return _origFetch.apply(window, arguments);
  };
})();
</script>`;

const FAVICON_LINK = `<link rel="icon" type="image/png" href="${APP_URL}/logo.png" />`;

const BADGE_HTML = `
  <div style="position:fixed;bottom:8px;right:8px;opacity:0.5;font-size:11px;font-family:sans-serif;z-index:99999;">
    <a href="https://pushtostart.ai" target="_blank" rel="noopener" style="color:#888;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
      Made with PushToStart
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
  <meta property="og:image" content="${APP_URL}/og.png" />
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
  <meta property="og:image" content="${APP_URL}/og.png" />
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
  <meta property="og:image" content="${APP_URL}/og.png" />
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
