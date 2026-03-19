"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import { CodeEditor } from "@/components/editor/code-editor";
import { PreviewPane, wrapForPreview } from "@/components/editor/preview-pane";
import { DeployForm } from "@/components/editor/deploy-form";
import { SharePreview } from "@/components/editor/share-preview";
import { ScanReadout } from "@/components/editor/scan-readout";
import { Navbar } from "@/components/shared/navbar";
import { ExternalLink, PartyPopper } from "lucide-react";
import { SITES_DOMAIN } from "@/lib/constants";
import { extractTitle, detectsAiUsage, detectArtifactType } from "@/lib/artifact/detect";
import { scanAndFix, type ScanResult } from "@/lib/artifact/scan";

export default function NewSitePage() {
  return (
    <Suspense>
      <NewSitePageInner />
    </Suspense>
  );
}

function NewSitePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redeploySlug = searchParams.get("redeploy");

  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRedeploy, setIsRedeploy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deployResult, setDeployResult] = useState<{
    url: string;
    slug: string;
  } | null>(null);
  const [usesAi, setUsesAi] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const titleManuallyEdited = useRef(false);
  const scanTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const screenshotTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const screenshotIframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-extract title from pasted code and generate slug
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);

      const ai = detectsAiUsage(newCode);
      setUsesAi(ai);

      if (!titleManuallyEdited.current && !isRedeploy) {
        const extracted = extractTitle(newCode);
        if (extracted) {
          setTitle(extracted);
          const autoSlug = extracted
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
          setSlug(autoSlug);
        }
      }

      // Debounced scan — only run on non-trivial code
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (newCode.trim().length < 50) {
        setScanResult(null);
        setIsScanning(false);
        return;
      }

      setIsScanning(true);
      scanTimeout.current = setTimeout(() => {
        const result = scanAndFix(newCode, ai);
        setScanResult(result);
        setIsScanning(false);
      }, 500);
    },
    [isRedeploy]
  );

  // Capture OG screenshot from a hidden iframe after code stabilizes
  const captureScreenshot = useCallback((htmlCode: string) => {
    if (screenshotTimeout.current) clearTimeout(screenshotTimeout.current);
    if (!htmlCode || htmlCode.trim().length < 50) {
      setOgImage(null);
      return;
    }

    // Debounce — wait for code to stabilize before capturing
    screenshotTimeout.current = setTimeout(() => {
      const iframe = screenshotIframeRef.current;
      if (!iframe) return;

      const artType = detectArtifactType(htmlCode);
      iframe.srcdoc = wrapForPreview(htmlCode, artType, title || "Preview");
      iframe.onload = () => {
        // Give scripts time to execute (React, Tailwind, etc.)
        setTimeout(async () => {
          try {
            const doc = iframe.contentDocument;
            if (!doc?.body) return;

            // Render at mobile width, capture top portion
            const captureW = 390;
            const captureH = 844;
            const fullCanvas = await html2canvas(doc.body, {
              width: captureW,
              height: captureH,
              windowWidth: captureW,
              windowHeight: captureH,
              scale: 2,
              useCORS: true,
              logging: false,
            });

            // Crop to square (1200x1200) from top of mobile view — tall cards look great in iMessage
            const ogSize = 1200;
            const srcH = Math.min(fullCanvas.height, fullCanvas.width);
            const crop = document.createElement("canvas");
            crop.width = ogSize;
            crop.height = ogSize;
            crop.getContext("2d")!.drawImage(
              fullCanvas,
              0, 0, fullCanvas.width, srcH,
              0, 0, ogSize, ogSize
            );

            setOgImage(crop.toDataURL("image/jpeg", 0.85));
          } catch {
            // Screenshot failed — non-fatal, will use default OG
          }
        }, 1500);
      };
    }, 2000);
  }, [title]);

  // Trigger screenshot when preview code changes
  useEffect(() => {
    const previewCode = scanResult?.fixedCode || code;
    if (previewCode) {
      captureScreenshot(previewCode);
    }
  }, [scanResult?.fixedCode, code, captureScreenshot]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    titleManuallyEdited.current = true;
  }, []);

  // Prefill from existing site when redeploying
  useEffect(() => {
    if (!redeploySlug) return;

    async function loadExistingSite() {
      try {
        const res = await fetch(`/api/sites/${redeploySlug}`);
        if (!res.ok) return;
        const data = await res.json();
        setSlug(data.site.slug);
        setTitle(data.site.title);
        setDescription(data.site.description || "");
        setCode(data.site.sourceCode);
        setIsRedeploy(true);
      } catch {
        // ignore — user can still deploy fresh
      }
    }
    loadExistingSite();
  }, [redeploySlug]);

  const handleDeploy = async () => {
    setErrors({});
    setIsDeploying(true);

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: title || slug,
          description,
          sourceCode: scanResult?.fixedCode || code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errMap: Record<string, string> = {};
          for (const err of data.errors) {
            errMap[err.field] = err.message;
          }
          setErrors(errMap);
        } else {
          setErrors({ general: data.error || "Launch failed" });
        }
        return;
      }

      // Upload OG image separately (non-blocking, don't fail deploy)
      if (ogImage) {
        fetch("/api/og/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, image: ogImage }),
        }).catch(() => {});
      }

      setDeployResult({ url: data.url, slug });
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsDeploying(false);
    }
  };

  // Success state
  if (deployResult) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-4 sm:px-6">
          <div className="max-w-md text-center">
            <PartyPopper
              size={48}
              className="mx-auto mb-4 text-primary"
            />
            <h1 className="mb-2 text-3xl font-bold">Shipped!</h1>
            <p className="mb-6 text-muted-foreground">
              Your creation is now live at:
            </p>
            <a
              href={deployResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 inline-flex items-center gap-2 rounded-xl bg-muted px-6 py-3 font-mono text-sm text-primary transition-colors hover:bg-muted/80"
            >
              {deployResult.slug}.{SITES_DOMAIN}
              <ExternalLink size={14} />
            </a>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setDeployResult(null);
                  setCode("");
                  setSlug("");
                  setTitle("");
                  setDescription("");
                  setIsRedeploy(false);
                  setOgImage(null);
                  titleManuallyEdited.current = false;
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Launch Another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <h1 className="mb-1 text-xl font-bold sm:text-2xl">
          {isRedeploy ? `Relaunch ${slug}` : "Launch New Site"}
        </h1>
        <p className="mb-4 text-sm text-muted-foreground sm:mb-6">
          {isRedeploy
            ? "Update the code and relaunch."
            : "Paste your code here, preview it, and ship it."}
        </p>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2" style={{ minHeight: "40vh" }}>
          <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
          <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
            <PreviewPane
              code={scanResult?.fixedCode || code}
              title={title || slug || "Preview"}
            />
          </div>
        </div>

        {(isScanning || scanResult) && (
          <div className="mx-auto mt-4 max-w-3xl">
            <ScanReadout isScanning={isScanning} result={scanResult} />
          </div>
        )}

        <div className="mx-auto mt-6 grid max-w-3xl items-start gap-8 lg:grid-cols-[1fr_auto]">
          <DeployForm
            slug={slug}
            title={title}
            description={description}
            onSlugChange={setSlug}
            onTitleChange={handleTitleChange}
            onDescriptionChange={setDescription}
            onDeploy={handleDeploy}
            isDeploying={isDeploying}
            isRedeploy={isRedeploy}
            errors={errors}
            usesAi={usesAi}
          />
          <div className="hidden lg:block">
            <SharePreview
              slug={slug}
              title={title}
              ogImage={ogImage}
              hasCode={code.trim().length > 50}
            />
          </div>
        </div>
      </div>

      {/* Hidden iframe for OG screenshot capture — mobile viewport */}
      <iframe
        ref={screenshotIframeRef}
        style={{ position: "absolute", left: "-9999px", top: 0, width: 390, height: 844, border: "none" }}
        title="Screenshot capture"
      />
    </>
  );
}
