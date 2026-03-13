import { getShowcasedSites } from "@/lib/db/queries";
import { SITES_DOMAIN } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Globe, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // revalidate every 60 seconds

export default async function ShowcasePage() {
  const sites = await getShowcasedSites();

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Showcase</h1>
          <p className="mt-2 text-muted-foreground">
            Creations built with Claude and published on PushToStart
          </p>
        </div>

        {sites.length === 0 ? (
          <div className="py-20 text-center">
            <Globe size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">
              No creations showcased yet.
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Be the first! Toggle &ldquo;Add to Showcase&rdquo; when you publish.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <a
                key={site.slug}
                href={`https://${site.slug}.${SITES_DOMAIN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative h-48 bg-muted">
                  <iframe
                    src={`https://${site.slug}.${SITES_DOMAIN}`}
                    className="h-[600px] w-[1000px] origin-top-left pointer-events-none"
                    style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
                    tabIndex={-1}
                    loading="lazy"
                    title={site.title}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight group-hover:text-primary">
                      {site.title}
                    </h3>
                    <ExternalLink
                      size={14}
                      className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  {site.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {site.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    {site.usesAi && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Sparkles size={10} />
                        AI-powered
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {site.slug}.{SITES_DOMAIN}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Publish your own creation
          </Link>
        </div>
      </div>
    </>
  );
}
