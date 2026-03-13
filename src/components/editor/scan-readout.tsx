"use client";

import { Check, Loader2, Shield } from "lucide-react";
import type { ScanResult } from "@/lib/artifact/scan";

interface ScanReadoutProps {
  isScanning: boolean;
  result: ScanResult | null;
}

export function ScanReadout({ isScanning, result }: ScanReadoutProps) {
  if (isScanning) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <Loader2 size={16} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          Scanning your creation...
        </span>
      </div>
    );
  }

  if (!result) return null;

  const hasFixes = result.fixes.length > 0;

  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
          <Check size={12} className="text-green-500" />
        </div>
        <span className="text-sm font-medium">
          {hasFixes ? "Ready to publish" : "All clear — ready to publish"}
        </span>
      </div>

      {hasFixes && (
        <div className="mt-2 space-y-1 pl-7">
          {result.fixes.map((fix) => (
            <div key={fix.id} className="flex items-center gap-2 text-xs">
              <Shield size={10} className="text-primary" />
              <span className="text-muted-foreground">{fix.label}</span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 pl-7 text-[11px] text-muted-foreground/70">
        We just make sure it works on its own, outside of Claude. Nothing about
        your creation has changed.
      </p>
    </div>
  );
}
