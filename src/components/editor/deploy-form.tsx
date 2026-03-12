"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SITES_DOMAIN } from "@/lib/constants";
import { Loader2, Check, X, Sparkles } from "lucide-react";

interface DeployFormProps {
  slug: string;
  title: string;
  description: string;
  onSlugChange: (slug: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  isRedeploy?: boolean;
  errors: Record<string, string>;
  usesAi?: boolean;
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DeployForm({
  slug,
  title,
  description,
  onSlugChange,
  onTitleChange,
  onDescriptionChange,
  onDeploy,
  isDeploying,
  isRedeploy = false,
  errors,
  usesAi = false,
}: DeployFormProps) {
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "owned" | "taken"
  >("idle");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // On redeploy, slug is already set and should not auto-generate
  const initializedRef = useRef(isRedeploy);
  useEffect(() => {
    if (isRedeploy) {
      setSlugManuallyEdited(true);
      initializedRef.current = true;
    }
  }, [isRedeploy]);

  const checkSlugAvailability = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck || slugToCheck.length < 3) {
        setSlugStatus("idle");
        return;
      }

      if (isRedeploy) {
        setSlugStatus("owned");
        return;
      }

      setSlugStatus("checking");

      try {
        const res = await fetch(`/api/sites/${slugToCheck}`);
        if (res.status === 404) {
          setSlugStatus("available");
        } else if (res.ok) {
          setSlugStatus("owned");
        } else if (res.status === 403) {
          setSlugStatus("taken");
        } else {
          setSlugStatus("idle");
        }
      } catch {
        setSlugStatus("idle");
      }
    },
    [isRedeploy]
  );

  useEffect(() => {
    if (isRedeploy) {
      setSlugStatus("owned");
      return;
    }
    const timeout = setTimeout(() => {
      if (slug.length >= 3) {
        checkSlugAvailability(slug);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [slug, checkSlugAvailability, isRedeploy]);

  const handleTitleChange = (value: string) => {
    onTitleChange(value);

    // Auto-generate slug from title unless user manually edited it
    if (!slugManuallyEdited && !isRedeploy) {
      onSlugChange(titleToSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onSlugChange(sanitized);
    setSlugManuallyEdited(true);
  };

  const canDeploy = slugStatus !== "taken" && slugStatus !== "checking";

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="My Awesome App"
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Site name</label>
        <div className="flex items-center">
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="my-cool-app"
            disabled={isRedeploy}
            className="flex-1 rounded-l-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60"
          />
          <div className="flex items-center gap-1 rounded-r-lg border border-l-0 border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            .{SITES_DOMAIN}
            {slugStatus === "checking" && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {(slugStatus === "available" || slugStatus === "owned") && (
              <Check size={14} className="text-green-500" />
            )}
            {slugStatus === "taken" && (
              <X size={14} className="text-red-500" />
            )}
          </div>
        </div>
        {errors.slug && (
          <p className="mt-1 text-xs text-red-400">{errors.slug}</p>
        )}
        {slugStatus === "taken" && !errors.slug && (
          <p className="mt-1 text-xs text-red-400">
            This site name is already taken
          </p>
        )}
        {slugStatus === "owned" && !isRedeploy && (
          <p className="mt-1 text-xs text-muted-foreground">
            You own this slug — launching will update the existing site
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Description{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="A brief description of your site"
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* AI indicator */}
      {usesAi && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Sparkles size={14} />
          <span>This artifact uses AI — API calls will be proxied through ShipArtifact</span>
        </div>
      )}

      {/* Launch button */}
      <button
        onClick={onDeploy}
        disabled={isDeploying || !canDeploy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isDeploying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Launching...
          </>
        ) : isRedeploy ? (
          "Relaunch"
        ) : (
          "Launch"
        )}
      </button>

      {errors.general && (
        <p className="text-center text-xs text-red-400">{errors.general}</p>
      )}
    </div>
  );
}
