import { Info } from "lucide-react";
import type { Language } from "@/lib/types";

export function KeyboardTip({ language }: { language: Language }) {
  if (language !== "km") return null;
  return (
    <p className="flex items-start gap-2 rounded-xl bg-accent/15 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Switch to a Khmer keyboard before you start: Windows <kbd className="rounded bg-card px-1.5">Win</kbd>+<kbd className="rounded bg-card px-1.5">Space</kbd>, macOS{" "}
        <kbd className="rounded bg-card px-1.5">Ctrl</kbd>+<kbd className="rounded bg-card px-1.5">Space</kbd>, or the Khmer keyboard on Android and iOS.
      </span>
    </p>
  );
}
