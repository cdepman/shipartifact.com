"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Shield } from "lucide-react";
import type { ScanResult } from "@/lib/artifact/scan";

const SCAN_STEPS = [
  "Checking for API keys...",
  "Detecting image formats...",
  "Fixing Claude preview links...",
  "Removing server-only code...",
  "Verifying standalone compatibility...",
];

const STEP_DURATION = 800; // ms per step

interface ScanReadoutProps {
  isScanning: boolean;
  result: ScanResult | null;
}

export function ScanReadout({ isScanning, result }: ScanReadoutProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [prevResult, setPrevResult] = useState<ScanResult | null>(null);
  const animatingRef = useRef(false);

  // When result arrives (scan finished), start the staged animation
  useEffect(() => {
    if (isScanning) {
      setShowResult(false);
      setStepIndex(0);
      animatingRef.current = false;
      return;
    }

    if (!result || animatingRef.current) return;

    // If we already showed this exact result, skip animation
    if (result === prevResult) {
      setShowResult(true);
      return;
    }

    animatingRef.current = true;
    setShowResult(false);
    setStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= SCAN_STEPS.length) {
        clearInterval(interval);
        setShowResult(true);
        setPrevResult(result);
        animatingRef.current = false;
      } else {
        setStepIndex(step);
      }
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [isScanning, result, prevResult]);

  // Scanning state or stepped animation
  if (!showResult) {
    if (!isScanning && !result) return null;

    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <div className="relative h-4 w-4">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <div className="absolute inset-[3px] rounded-full bg-primary" />
        </div>
        <span
          key={stepIndex}
          className="animate-fade-in text-sm text-muted-foreground"
        >
          {SCAN_STEPS[stepIndex]}
        </span>
      </div>
    );
  }

  if (!result) return null;

  const hasFixes = result.fixes.length > 0;

  return (
    <div className="animate-fade-in rounded-lg border border-border bg-muted/50 px-4 py-3">
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
