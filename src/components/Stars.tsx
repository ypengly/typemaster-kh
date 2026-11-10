import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ count, size = "sm", className }: { count: number; size?: "sm" | "lg"; className?: string }) {
  const dim = size === "lg" ? "h-8 w-8" : "h-4 w-4";
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <Star key={i} className={cn(dim, i <= count ? "fill-accent text-accent" : "text-border")} />
      ))}
    </span>
  );
}
