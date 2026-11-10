"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-20 text-center" role="alert">
      <p className="font-display text-2xl font-semibold">Something went wrong</p>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{error.message || "An unexpected error happened."} Your saved progress is safe in this browser.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
