export interface ScanFix {
  id: string;
  label: string;
  severity: "fix" | "warning";
}

export interface ScanResult {
  fixes: ScanFix[];
  fixedCode: string;
}

type Check = (
  code: string,
  usesAi: boolean
) => { code: string; fix?: ScanFix };

// ── Check 1: Strip hardcoded API keys ──────────────────────────────

const stripApiKeys: Check = (code) => {
  // Anthropic keys: sk-ant-api03-..., sk-ant-...
  // OpenAI keys: sk-...
  // Generic long bearer tokens
  const keyPatterns = [
    /['"]sk-ant-[A-Za-z0-9_-]{20,}['"]/g,
    /['"]sk-[A-Za-z0-9_-]{40,}['"]/g,
  ];

  let fixed = code;
  let found = false;

  for (const pattern of keyPatterns) {
    if (pattern.test(fixed)) {
      found = true;
      fixed = fixed.replace(pattern, '""');
    }
  }

  if (!found) return { code };

  return {
    code: fixed,
    fix: {
      id: "strip-api-keys",
      label: "Removed API key for security",
      severity: "fix",
    },
  };
};

// ── Check 2: Fix hardcoded image format ────────────────────────────

const fixImageFormat: Check = (code) => {
  // Detect any hardcoded image media type in API call contexts
  // Matches: media_type: "image/jpeg", media_type: "image/png", etc.
  const imageFormatPattern =
    /(?:media_type|mediaType|type)(\s*:\s*)['"]image\/(?:jpeg|png|gif|webp)['"]/;

  if (!imageFormatPattern.test(code)) return { code };

  // Inject a helper that detects format from base64 magic bytes
  const helper = `
// [PushToStart] Auto-detect image format from base64 data
function __ptsDetectImageFormat(b64) {
  if (!b64 || typeof b64 !== 'string') return 'image/png';
  var d = b64.replace(/^data:.*?,/, '');
  if (d.startsWith('/9j/')) return 'image/jpeg';
  if (d.startsWith('iVBOR')) return 'image/png';
  if (d.startsWith('R0lGOD')) return 'image/gif';
  if (d.startsWith('UklGR')) return 'image/webp';
  return 'image/png';
}
`;

  // Find the base64 data variable used near the media_type assignment.
  // Common Claude patterns:
  //   { type: "image", source: { type: "base64", media_type: "image/png", data: someVar } }
  //   The "data" field sibling is what we need to sniff.
  // Strategy: replace hardcoded format string with a call to __ptsDetectImageFormat
  // that reads the "data" sibling. Since we can't reliably find the variable name,
  // we wrap it so it auto-patches at runtime using a proxy on the message construction.

  // Replace all hardcoded image formats with the detection call.
  // We look for the "data:" sibling field to find the variable name.
  let fixed = code;

  // Pattern: { ..., media_type: "image/...", data: EXPR } or { ..., data: EXPR, ..., media_type: "image/..." }
  // Replace each hardcoded media_type/mediaType with a getter that sniffs the sibling data field.
  const replacePatterns = [
    /media_type:\s*['"]image\/(?:jpeg|png|gif|webp)['"]/g,
    /mediaType:\s*['"]image\/(?:jpeg|png|gif|webp)['"]/g,
  ];

  for (const pattern of replacePatterns) {
    const key = pattern.source.startsWith("media_type") ? "media_type" : "mediaType";
    fixed = fixed.replace(pattern, `${key}: "__PTS_DETECT__"`);
  }

  // Now inject a runtime patch: after the message object is built, walk it and
  // replace "__PTS_DETECT__" with the actual detected format from the sibling `data` field.
  const patcher = `
// [PushToStart] Patch fetch to auto-detect image formats
(function() {
  var _ptsFetch = window.__ptsFetch || window.fetch;
  window.__ptsFetch = _ptsFetch;
  window.fetch = function(url, opts) {
    if (opts && opts.body && typeof opts.body === 'string') {
      try {
        var parsed = JSON.parse(opts.body);
        (function walk(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (Array.isArray(obj)) { obj.forEach(walk); return; }
          if ((obj.media_type === '__PTS_DETECT__' || obj.mediaType === '__PTS_DETECT__') && obj.data) {
            var fmt = __ptsDetectImageFormat(obj.data);
            if (obj.media_type) obj.media_type = fmt;
            if (obj.mediaType) obj.mediaType = fmt;
          }
          Object.values(obj).forEach(walk);
        })(parsed);
        opts = Object.assign({}, opts, { body: JSON.stringify(parsed) });
      } catch(e) {}
    }
    return _ptsFetch.apply(window, arguments);
  };
})();
`;

  fixed = helper + patcher + fixed;

  return {
    code: fixed,
    fix: {
      id: "fix-image-format",
      label: "Added automatic image format detection",
      severity: "fix",
    },
  };
};

// ── Check 3: Add AI error handling ─────────────────────────────────

const addAiErrorHandling: Check = (code, usesAi) => {
  if (!usesAi) return { code };

  // Check if there's already reasonable error handling
  const hasCatch = /\.catch\s*\(/.test(code) || /catch\s*\(/.test(code);
  if (hasCatch) return { code };

  // Inject a global unhandled rejection handler for friendly error messages
  const handler = `
// [PushToStart] Friendly error handler for AI calls
window.addEventListener('unhandledrejection', function(e) {
  if (e.reason && typeof e.reason.message === 'string') {
    var msg = e.reason.message;
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      alert('Having trouble connecting to AI. Please check your internet and try again.');
    } else if (msg.includes('400')) {
      alert('The AI request had an issue. Try again with a different input.');
    } else if (msg.includes('500') || msg.includes('503')) {
      alert('The AI service is temporarily unavailable. Please try again in a moment.');
    }
  }
});
`;

  return {
    code: handler + code,
    fix: {
      id: "ai-error-handling",
      label: "Added friendly error messages",
      severity: "fix",
    },
  };
};

// ── Check 4: Add rate limit handling ───────────────────────────────

const addRateLimitHandling: Check = (code, usesAi) => {
  if (!usesAi) return { code };

  // Check if 429 is already handled
  if (/429/.test(code) || /rate.?limit/i.test(code)) return { code };

  // Inject a fetch wrapper that handles 429s gracefully
  const handler = `
// [PushToStart] Rate limit handler
(function() {
  var _ptsFetch = window.fetch;
  window.fetch = function() {
    return _ptsFetch.apply(window, arguments).then(function(res) {
      if (res.status === 429) {
        var toast = document.createElement('div');
        toast.textContent = 'Slow down! Please wait a moment before trying again.';
        toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
      }
      return res;
    });
  };
})();
`;

  return {
    code: handler + code,
    fix: {
      id: "rate-limit-handling",
      label: "Added rate limit handling",
      severity: "fix",
    },
  };
};

// ── Check 5: Remove process.env references ─────────────────────────

const removeProcessEnv: Check = (code) => {
  if (!/process\.env/.test(code)) return { code };

  const fixed = code.replace(/^.*process\.env.*$/gm, "// (removed server-only reference)");

  return {
    code: fixed,
    fix: {
      id: "remove-process-env",
      label: "Removed server-only references",
      severity: "warning",
    },
  };
};

// ── Check 6: Remove require() calls ────────────────────────────────

const removeRequire: Check = (code) => {
  if (!/\brequire\s*\(/.test(code)) return { code };

  // Only remove standalone require lines, not dynamic import patterns
  const fixed = code.replace(
    /^.*\brequire\s*\(['"][^'"]+['"]\).*$/gm,
    "// (removed Node.js import)"
  );

  return {
    code: fixed,
    fix: {
      id: "remove-require",
      label: "Removed Node.js imports",
      severity: "warning",
    },
  };
};

// ── Main scanner ───────────────────────────────────────────────────

const ALL_CHECKS: Check[] = [
  stripApiKeys,
  fixImageFormat,
  addAiErrorHandling,
  addRateLimitHandling,
  removeProcessEnv,
  removeRequire,
];

export function scanAndFix(code: string, usesAi: boolean): ScanResult {
  const fixes: ScanFix[] = [];
  let current = code;

  for (const check of ALL_CHECKS) {
    const result = check(current, usesAi);
    current = result.code;
    if (result.fix) {
      fixes.push(result.fix);
    }
  }

  return { fixes, fixedCode: current };
}
