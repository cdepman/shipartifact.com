"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SITES_DOMAIN } from "@/lib/constants";

interface ShowcaseSite {
  slug: string;
  title: string;
  description: string | null;
  usesAi: boolean;
  url: string;
}

export function ShowcaseCarousel() {
  const [sites, setSites] = useState<ShowcaseSite[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/showcase")
      .then((r) => r.json())
      .then((data) => setSites(data.sites || []))
      .catch(() => {});
  }, []);

  if (sites.length === 0) return null;

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Showcase
            </p>
            <h2 className="text-3xl font-bold">See what people are building</h2>
          </div>
          <Link
            href="/showcase"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80 sm:flex"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-6 pb-4 scrollbar-hide sm:px-[max(1.5rem,calc((100vw-56rem)/2+1.5rem))]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {sites.map((site) => (
          <a
            key={site.slug}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-72 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="relative h-40 overflow-hidden bg-muted">
              <iframe
                src={site.url}
                className="pointer-events-none h-[540px] w-[960px] origin-top-left"
                style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
                tabIndex={-1}
                loading="lazy"
                title={site.title}
              />
            </div>
            <div className="p-3.5">
              <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">
                {site.title}
              </h3>
              {site.description && (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {site.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {site.usesAi && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    <Sparkles size={8} />
                    AI
                  </span>
                )}
                <span className="font-mono text-[9px] text-muted-foreground">
                  {site.slug}.{SITES_DOMAIN}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 text-center sm:hidden">
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
