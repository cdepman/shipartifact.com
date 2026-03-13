"use client";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

const EXAMPLE_PROMPTS = [
  {
    label: "Explain This Photo Like I'm 5",
    prompt:
      "Build me an app where I can upload a photo or take a picture, and it looks at the photo and explains the main things it sees in simple but not too dumbed-down words that a 10-year-old would understand. Make it playful and colorful with big text and friendly vibes for that age range. It should pick out the 1-3 most central things in the photo.",
  },
  {
    label: "Recipe Inventor",
    prompt:
      "Build me a recipe generator. I type in whatever ingredients I have and it creates a complete recipe with steps, cook time, and difficulty rating. Give it a fun kitchen-themed design.",
  },
  {
    label: "Story Maker",
    prompt:
      "Build me a children's bedtime story creator. I enter a character name, a favorite animal, and a magical place, and it writes a short illustrated story. Make it whimsical with big friendly text and soft colors.",
  },
];

export function PromptCopySection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {EXAMPLE_PROMPTS.map((item, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-border bg-card p-5"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {item.label}
          </p>
          <p className="mb-3 text-[11px] text-muted-foreground">
            ✨ AI-powered — keeps working after you publish
          </p>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
            &ldquo;{item.prompt}&rdquo;
          </p>
          <button
            onClick={() => handleCopy(item.prompt, i)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {copiedIndex === i ? (
              <>
                <Check size={14} className="text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard size={14} />
                Copy prompt
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
