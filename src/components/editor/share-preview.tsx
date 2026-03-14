"use client";

import { SITES_DOMAIN } from "@/lib/constants";

interface SharePreviewProps {
  slug: string;
  title: string;
  ogImage?: string | null;
  hasCode?: boolean;
}

export function SharePreview({ slug, title, ogImage, hasCode }: SharePreviewProps) {
  const displayTitle = title || slug || "My App";
  const displayUrl = slug
    ? `${slug}.${SITES_DOMAIN}`
    : `your-site.${SITES_DOMAIN}`;

  const isGenerating = hasCode && !ogImage;

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-xs font-medium text-muted-foreground">
        Share preview
      </p>

      {/* Phone frame — iPhone-style */}
      <div
        className="relative rounded-[40px] bg-[#1c1c1e] p-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_-12px_rgba(0,0,0,0.6)]"
      >
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-[18px] z-10 h-[18px] w-[60px] -translate-x-1/2 rounded-full bg-black" />

        {/* Screen */}
        <div className="relative w-[260px] overflow-hidden rounded-[30px] bg-white">
          {/* Status bar */}
          <div className="relative flex items-center justify-between px-6 pb-0 pt-[14px]">
            <span className="text-[10px] font-semibold text-black">9:41</span>
            <div className="flex items-center gap-[3px]">
              {/* Signal */}
              <svg width="13" height="10" viewBox="0 0 17 12" fill="none">
                <rect x="0" y="8.5" width="3" height="3.5" rx="0.75" fill="black" />
                <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.75" fill="black" />
                <rect x="9" y="2.5" width="3" height="9.5" rx="0.75" fill="black" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.75" fill="black" opacity="0.25" />
              </svg>
              {/* WiFi */}
              <svg width="12" height="10" viewBox="0 0 16 12" fill="black">
                <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" />
                <path d="M4.93 7.76a4.5 4.5 0 016.14 0" stroke="black" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                <path d="M2.4 5.23a8 8 0 0111.2 0" stroke="black" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
              {/* Battery */}
              <svg width="20" height="10" viewBox="0 0 27 13" fill="none">
                <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="black" strokeOpacity="0.35" />
                <rect x="2" y="2" width="18" height="9" rx="1.5" fill="black" />
                <path d="M24 4.5v4a2 2 0 000-4z" fill="black" opacity="0.35" />
              </svg>
            </div>
          </div>

          {/* Messages header */}
          <div className="border-b border-[#e5e5ea] px-4 pb-2 pt-3">
            <div className="flex items-center gap-2">
              <svg width="8" height="12" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ee5a24] text-[12px]">
                  🙂
                </div>
                <span className="mt-0.5 text-[9px] text-black">Friend</span>
              </div>
              <div className="w-4" />
            </div>
          </div>

          {/* Chat area */}
          <div className="flex min-h-[340px] flex-col bg-white px-2.5 pb-3 pt-3">
            {/* Sent message — "check this out" */}
            <div className="mb-1 ml-auto max-w-[180px]">
              <div className="rounded-2xl rounded-br-md bg-[#007AFF] px-3 py-1.5">
                <p className="text-[11px] leading-[1.35] text-white">
                  check this out
                </p>
              </div>
            </div>

            {/* Sent message — the link preview card */}
            <div className="mb-3 ml-auto max-w-[210px]">
              <div className="overflow-hidden rounded-2xl rounded-tr-md bg-[#007AFF]">
                {/* OG image */}
                <div className="relative h-[110px] overflow-hidden bg-[#06080d]">
                  {ogImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ogImage}
                      alt="Site preview"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : isGenerating ? (
                    <div className="absolute inset-0 overflow-hidden bg-[#06080d]">
                      <div className="og-shimmer absolute inset-0" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src="/api/og"
                      alt="PushToStart"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* Card text area */}
                <div className="px-2.5 py-1.5">
                  <p className="text-[8px] uppercase tracking-wide text-white/60">
                    {SITES_DOMAIN}
                  </p>
                  <p className="mt-[1px] truncate text-[11px] font-semibold leading-tight text-white">
                    {displayTitle}
                  </p>
                  <p className="mt-[2px] truncate text-[9px] text-white/50">
                    {displayUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Input bar */}
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#c7c7cc" strokeWidth="1.5" />
                <path d="M12 8v8M8 12h8" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="flex-1 rounded-full border border-[#c7c7cc] px-3 py-1">
                <span className="text-[10px] text-[#c7c7cc]">iMessage</span>
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center bg-white pb-1.5 pt-1">
            <div className="h-[4px] w-[100px] rounded-full bg-black/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
