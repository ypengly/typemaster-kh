"use client";

import Link from "next/link";
import { Activity, ArrowRight, Flame, Gauge, Target, Trophy, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { lessonsFor } from "@/data";
import { displayStreak, levelProgress, levelTitle, nextLessonToPractice } from "@/lib/progress";
import { lastDays, localDay } from "@/lib/dates";
import type { Language } from "@/lib/types";
import { PageHeader, PageSkeleton, EmptyState } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { LineChart, ProgressRing, BarList } from "@/components/Charts";
import { LANG_LABEL, LANG_SLUG, MODE_LABEL, cn, fmtDate } from "@/lib/utils";

function Tile({ icon: Icon, label, value, hint }: { icon: typeof Zap; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { state, ready } = useStore();
  if (!ready) return <PageSkeleton />;

  const lp = levelProgress(state.xp);
  const days = lastDays(14);
  const today = state.daily[localDay()];
  const goalSec = state.settings.dailyGoalMinutes * 60;
  const todaySec = today?.seconds ?? 0;
  const recent = state.history.slice(0, 6);
  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  const last20 = state.history.slice(0, 20);
  const avgAccuracy = last20.length ? Math.round(last20.reduce((a, r) => a + r.accuracy, 0) / last20.length) : 0;
  const enRuns = last20.filter((r) => r.language === "en");
  const kmRuns = last20.filter((r) => r.language === "km");
  const completedTotal = Object.values(state.progress).filter((p) => p.completed).length;

  const langBlock = (lang: Language) => {
    const lessons = lessonsFor(lang);
    const done = lessons.filter((l) => state.progress[l.id]?.completed).length;
    const series = days.map((d) => {
      const rs = state.history.filter((r) => r.language === lang && r.at && localDay(new Date(r.at)) === d);
      return rs.length ? Math.round(rs.reduce((a, r) => a + r.cpm, 0) / rs.length) : null;
    });
    const tiers = (["basic", "intermediate", "advanced"] as const).map((d) => {
      const ls = lessons.filter((l) => l.difficulty === d);
      return { label: d[0].toUpperCase() + d.slice(1), value: ls.filter((l) => state.progress[l.id]?.completed).length, total: ls.length };
    });
    const next = nextLessonToPractice(lessons, state);
    return (
      <Card key={lang}>
        <CardHeader>
          <CardTitle className={cn(lang === "km" && "font-khmer")}>{lang === "en" ? "English progress" : "Khmer progress · ភាសាខ្មែរ"}</CardTitle>
          <Link href={`/academy/${LANG_SLUG[lang]}`} className="text-sm font-semibold text-primary hover:underline">
            Open academy
          </Link>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5">
            <ProgressRing pct={done} className={lang === "en" ? "text-primary" : "text-accent"}>
              <span className="font-display text-2xl font-semibold text-foreground">{done}</span>
              <span className="text-xs text-muted-foreground">of 100</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <BarList items={tiers} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Average CPM, last 14 days</p>
            <LineChart values={series} labels={[fmtDate(new Date(days[0]).toISOString()), "Today"]} unit="CPM" className={lang === "km" ? "text-accent" : "text-primary"} />
          </div>
          <Link href={`/practice/${next.id}`} className={buttonVariants({ variant: "soft", className: "w-full" })}>
            {done === 0 ? "Start" : "Continue"}: {next.title} <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${state.profile.name}`} subtitle="Pick up where you left off, or beat your best." />

      <Card className="overflow-hidden">
        <div className="grid gap-5 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Daily goal · {state.settings.dailyGoalMinutes} minutes</p>
            <Progress value={(todaySec / goalSec) * 100} label="Daily goal" barClassName="bg-accent" />
            <p className="text-sm">
              {todaySec >= goalSec ? "Goal reached — nice work." : `${Math.max(1, Math.ceil((goalSec - todaySec) / 60))} min left today.`}{" "}
              <span className="text-muted-foreground">({Math.round(todaySec / 60)} min practiced)</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/practice/${nextLessonToPractice(lessonsFor("en"), state).id}`} className={buttonVariants({ size: "lg" })}>
              Continue English
            </Link>
            <Link href={`/practice/${nextLessonToPractice(lessonsFor("km"), state).id}`} className={buttonVariants({ size: "lg", variant: "accent" })}>
              Continue <span className="font-khmer">ខ្មែរ</span>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={Trophy} label="Lessons completed" value={`${completedTotal} / 200`} />
        <Tile icon={Zap} label="Level" value={`${lp.level} · ${levelTitle(lp.level)}`} hint={`${state.xp} XP · ${lp.needed - lp.current} to next level`} />
        <Tile icon={Flame} label="Current streak" value={`${displayStreak(state)} day${displayStreak(state) === 1 ? "" : "s"}`} hint={`Best ${state.streak.best}`} />
        <Tile icon={Gauge} label="Average speed" value={`${avg(enRuns.map((r) => r.wpm))} WPM · ${avg(kmRuns.map((r) => r.cpm))} CPM`} hint="English WPM · Khmer CPM (last 20 runs)" />
        <Tile icon={Target} label="Accuracy" value={last20.length ? `${avgAccuracy}%` : "—"} hint="Average of last 20 runs" />
        <Tile icon={Activity} label="Total typed" value={state.totals.chars.toLocaleString()} hint="correct characters" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">{(["en", "km"] as const).map(langBlock)}</div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState title="No typing sessions yet" body="Finish your first lesson and your results will show up here." action={<Link href="/practice/en-001" className={buttonVariants()}>Start lesson 1</Link>} />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-medium">
                    {MODE_LABEL[r.mode]} · {LANG_LABEL[r.language]}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {r.language === "km" ? `${Math.round(r.cpm)} CPM` : `${Math.round(r.wpm)} WPM`} · {Math.round(r.accuracy)}% · {fmtDate(r.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
