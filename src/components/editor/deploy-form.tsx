"use client";

import { useState, useEffect, useCallback } from "react";
import { SITES_DOMAIN } from "@/lib/constants";
import { Loader2, Check, X } from "lucide-react";

interface DeployFormProps {
  slug: string;
  title: string;
  description: string;
  onSlugChange: (slug: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  errors: Record<string, string>;
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
  errors,
}: DeployFormProps) {
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");

    try {
      const res = await fetch(`/api/sites/${slugToCheck}`);
      setSlugStatus(res.status === 404 ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (slug.length >= 3) {
        checkSlugAvailability(slug);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [slug, checkSlugAvailability]);

  const handleSlugChange = (value: string) => {
    // Only allow lowercase, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onSlugChange(sanitized);
  };

  return (
    <div className="space-y-4">
      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Site name</label>
        <div className="flex items-center">
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="my-cool-app"
            className="flex-1 rounded-l-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex items-center gap-1 rounded-r-lg border border-l-0 border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            .{SITES_DOMAIN}
            {slugStatus === "checking" && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {slugStatus === "available" && (
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
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="My Awesome App"
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
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

      {/* Deploy button */}
      <button
        onClick={onDeploy}
        disabled={isDeploying || slugStatus === "taken"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isDeploying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Deploying...
          </>
        ) : (
          "Deploy"
        )}
      </button>

      {errors.general && (
        <p className="text-center text-xs text-red-400">{errors.general}</p>
      )}
    </div>
  );
}
