import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";

interface SiteCardProps {
  slug: string;
  title: string;
  description?: string | null;
  artifactType: string;
  currentVersion: number;
  url: string;
  updatedAt: Date | string;
}

export function SiteCard({
  slug,
  title,
  description,
  artifactType,
  currentVersion,
  url,
  updatedAt,
}: SiteCardProps) {
  const updatedDate = new Date(updatedAt);
  const timeAgo = getTimeAgo(updatedDate);

  return (
    <Link
      href={`/site/${slug}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:bg-primary/[0.02]"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-primary">
          {artifactType}
        </span>
      </div>

      {description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-mono">
          {slug}.shipartifact.com
          <ExternalLink
            size={10}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
        <span>
          v{currentVersion} &middot; {timeAgo}
        </span>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
