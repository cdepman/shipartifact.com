"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import {
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface SiteData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sourceCode: string;
  artifactType: string;
  currentVersion: number;
  showcased: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface Deployment {
  id: string;
  version: number;
  status: string;
  deployedAt: string;
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [site, setSite] = useState<SiteData | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [togglingShowcase, setTogglingShowcase] = useState(false);

  useEffect(() => {
    async function fetchSite() {
      try {
        const res = await fetch(`/api/sites/${slug}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setSite(data.site);
        setDeployments(data.deployments);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [slug, router]);

  const copyUrl = async () => {
    if (!site) return;
    await navigator.clipboard.writeText(site.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleShowcase = async () => {
    if (!site) return;
    setTogglingShowcase(true);
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showcased: !site.showcased }),
      });
      if (res.ok) {
        const data = await res.json();
        setSite(data.site);
      }
    } catch {
      // ignore
    } finally {
      setTogglingShowcase(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/sites/${slug}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-96 rounded bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </>
    );
  }

  if (!site) return null;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{site.title}</h1>
            {site.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {site.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium uppercase text-primary">
              {site.artifactType}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              v{site.currentVersion}
            </span>
          </div>
        </div>

        {/* URL bar */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
          <span className="flex-1 font-mono text-sm text-primary">
            {site.url}
          </span>
          <button
            onClick={copyUrl}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Copy URL"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Open site"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Preview */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <iframe
            src={site.url}
            className="h-96 w-full"
            title={`Preview of ${site.title}`}
          />
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <Link
            href={`/new?redeploy=${slug}`}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw size={14} />
            Relaunch
          </Link>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-red-500/30 hover:text-red-400"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>

        {/* Showcase toggle */}
        <div className="mb-8 flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <h3 className="text-sm font-medium">Showcase</h3>
            <p className="text-xs text-muted-foreground">
              Feature this creation in the public gallery
            </p>
          </div>
          <button
            onClick={toggleShowcase}
            disabled={togglingShowcase}
            className="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50"
            style={{ backgroundColor: site.showcased ? "var(--primary)" : "var(--muted)" }}
          >
            <div
              className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform"
              style={{
                backgroundColor: site.showcased ? "#fff" : "var(--foreground)",
                opacity: site.showcased ? 1 : 0.5,
                transform: site.showcased ? "translateX(20px)" : "translateX(0)",
              }}
            />
          </button>
        </div>

        {/* Deployment history */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Deployment History</h2>
          <div className="rounded-xl border border-border">
            {deployments.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < deployments.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                    v{d.version}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                      d.status === "deployed"
                        ? "bg-green-500/10 text-green-400"
                        : d.status === "failed"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(d.deployedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
