"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PRESETS: { label: string; sec: number }[] = [
  { label: "1 min", sec: 60 },
  { label: "2 min", sec: 120 },
  { label: "3 min", sec: 180 },
  { label: "5 min", sec: 300 },
  { label: "10 min", sec: 600 },
  { label: "Unlimited", sec: 0 },
];

export function TimerPicker({ value, onChange, label = "Timer" }: { value: number; onChange: (sec: number) => void; label?: string }) {
  const isPreset = PRESETS.some((p) => p.sec === value);
  const [customOpen, setCustomOpen] = useState(!isPreset);
  const showCustom = customOpen || !isPreset;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={!showCustom && value === p.sec}
            onClick={() => {
              setCustomOpen(false);
              onChange(p.sec);
            }}
            className={cn(
              "h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors",
              !showCustom && value === p.sec ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={showCustom}
          onClick={() => {
            setCustomOpen(true);
            if (isPreset) onChange(90);
          }}
          className={cn(
            "h-10 rounded-xl border px-3.5 text-sm font-medium transition-colors",
            showCustom ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
          )}
        >
          Custom
        </button>
      </div>
      {showCustom && (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Seconds</span>
          <input
            type="number"
            min={10}
            max={3600}
            value={value || 90}
            onChange={(e) => onChange(Math.max(10, Math.min(3600, Number(e.target.value) || 10)))}
            className="h-10 w-28 rounded-xl border border-border bg-card px-3"
          />
          <span className="text-muted-foreground">(10 – 3600)</span>
        </label>
      )}
    </fieldset>
  );
}
