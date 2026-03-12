export type ArtifactType = "jsx" | "html";

export function detectArtifactType(code: string): ArtifactType {
  const trimmed = code.trim();

  const jsxIndicators = [
    /import\s+.*from\s+['"]react['"]/,
    /export\s+default\s+function/,
    /export\s+default\s+class/,
    /useState|useEffect|useRef|useMemo|useCallback|useContext/,
    /className=/,
    /onClick=\{/,
    /<\w+\s[^>]*\{[^}]+\}/,
    /React\./,
    /jsx/i,
  ];

  const htmlIndicators = [
    /^<!DOCTYPE\s+html/i,
    /^<html/i,
    /<script\b/i,
    /\bclass="/,
    /\bonclick="/i,
    /<\/html>/i,
    /<\/body>/i,
  ];

  const jsxScore = jsxIndicators.filter((r) => r.test(trimmed)).length;
  const htmlScore = htmlIndicators.filter((r) => r.test(trimmed)).length;

  return jsxScore > htmlScore ? "jsx" : "html";
}
