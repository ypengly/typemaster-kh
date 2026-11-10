"use client";

import type { ReactNode } from "react";
import { Award, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { ResultSummary, TypingResult } from "@/lib/types";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatTime } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/Stars";

export function ResultCard({ result, summary, title, banner, actions, showStars }: { result: TypingResult; summary?: ResultSummary; title?: string; banner?: ReactNode; actions?: ReactNode; showStars?: boolean }) {
  const km = result.language === "km";
  const unlocked = (summary?.newAchievements ?? []).map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);
  return (
    <Card className="animate-pop overflow-hidden">
      <div className="bg-gradient-to-br from-primary/15 via-transparent to-accent/15 p-6 text-center">
        <p className="text-sm text-muted-foreground">{title ?? "Run complete"}</p>
        {showStars && summary && <Stars count={summary.stars} size="lg" className="mt-3" />}
        <p className="mt-2 font-display text-5xl font-semibold tabular-nums">{km ? Math.round(result.cpm) : Math.round(result.wpm)}</p>
        <p className="text-sm font-medium text-muted-foreground">{km ? "characters per minute" : "words per minute"}</p>
        {banner && <div className="mt-3">{banner}</div>}
      </div>
      <CardContent className="space-y-5">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Accuracy" value={`${result.accuracy.toFixed(1)}%`} />
          <Tile label={km ? "WPM" : "CPM"} value={km ? "—" : String(Math.round(result.cpm))} hint={km ? "CPM is the main measure for Khmer" : undefined} />
          <Tile label="Correct" value={String(result.correct)} />
          <Tile label="Incorrect" value={String(result.incorrect)} />
          <Tile label="Total errors" value={String(result.errors)} />
          <Tile label="Completion" value={`${Math.round(result.completion)}%`} />
          <Tile label="Time" value={formatTime(result.timeSec)} />
          <Tile label="Length" value={`${result.total} chars`} />
        </dl>

        {summary && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 font-semibold">
              <Zap className="h-4 w-4" /> +{summary.xp} XP
            </span>
            {summary.personalBest && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 font-semibold text-success">
                <TrendingUp className="h-4 w-4" /> New personal best
              </span>
            )}
            {summary.perfect && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary">
                <Sparkles className="h-4 w-4" /> Perfect accuracy
              </span>
            )}
            {summary.dailyBonus && <span className="rounded-full bg-accent/20 px-3 py-1.5 font-semibold">Daily challenge bonus</span>}
            {summary.leveledUp && <span className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Level {summary.level}!</span>}
          </div>
        )}

        {unlocked.length > 0 && (
          <ul className="space-y-2">
            {unlocked.map((a) => (
              <li key={a!.id} className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
                <Award className="h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold">{a!.title}</p>
                  <p className="text-sm text-muted-foreground">{a!.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3" title={hint}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
