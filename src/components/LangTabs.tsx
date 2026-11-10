"use client";

import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LangTabs({ value, onChange, label = "Language" }: { value: Language; onChange: (l: Language) => void; label?: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-border bg-card p-1">
      {(["en", "km"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={value === l}
          onClick={() => onChange(l)}
          className={cn("h-9 rounded-lg px-4 text-sm font-semibold transition-colors", value === l ? "bg-primary text-primary-foreground" : "hover:bg-muted", l === "km" && "font-khmer")}
        >
          {l === "en" ? "English" : "ខ្មែរ · Khmer"}
        </button>
      ))}
    </div>
  );
}
