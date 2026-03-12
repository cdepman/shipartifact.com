"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "@/components/editor/code-editor";
import { PreviewPane } from "@/components/editor/preview-pane";
import { DeployForm } from "@/components/editor/deploy-form";
import { Navbar } from "@/components/shared/navbar";
import { ExternalLink, PartyPopper } from "lucide-react";
import { SITES_DOMAIN } from "@/lib/constants";

export default function NewSitePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deployResult, setDeployResult] = useState<{
    url: string;
    slug: string;
  } | null>(null);

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
          sourceCode: code,
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
          setErrors({ general: data.error || "Deployment failed" });
        }
        return;
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
        <div className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <PartyPopper
              size={48}
              className="mx-auto mb-4 text-primary"
            />
            <h1 className="mb-2 text-3xl font-bold">Shipped!</h1>
            <p className="mb-6 text-muted-foreground">
              Your artifact is now live at:
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
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Deploy Another
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
      <div className="mx-auto max-w-7xl px-6 py-6">
        <h1 className="mb-1 text-2xl font-bold">Deploy New Artifact</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Paste your Claude artifact code, preview it, and ship it.
        </p>

        <div className="grid gap-6 lg:grid-cols-2" style={{ height: "60vh" }}>
          {/* Code editor */}
          <CodeEditor value={code} onChange={setCode} />

          {/* Preview */}
          <PreviewPane code={code} title={title || slug || "Preview"} />
        </div>

        {/* Deploy config */}
        <div className="mx-auto mt-6 max-w-lg">
          <DeployForm
            slug={slug}
            title={title}
            description={description}
            onSlugChange={setSlug}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onDeploy={handleDeploy}
            isDeploying={isDeploying}
            errors={errors}
          />
        </div>
      </div>
    </>
  );
}
