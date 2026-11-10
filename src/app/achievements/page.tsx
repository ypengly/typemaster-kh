"use client";

import { Award, BookOpen, Calendar, Crown, Flame, Footprints, Gamepad2, Keyboard, Languages, Lock, Medal, Sparkles, Star, Target, Trophy, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACHIEVEMENTS, ACHIEVEMENT_XP, type Achievement } from "@/lib/achievements";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { cn, fmtDate } from "@/lib/utils";

const ICONS: Record<Achievement["icon"], typeof Award> = {
  footprints: Footprints, book: BookOpen, trophy: Trophy, crown: Crown, flame: Flame, zap: Zap, target: Target, star: Star,
  gamepad: Gamepad2, calendar: Calendar, keyboard: Keyboard, languages: Languages, medal: Medal, sparkles: Sparkles,
};

export default function AchievementsPage() {
  const { state, ready } = useStore();
  if (!ready) return <PageSkeleton />;
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" subtitle={`Every badge is worth ${ACHIEVEMENT_XP} bonus XP.`} />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>{unlocked} of {ACHIEVEMENTS.length} unlocked</span>
          <span className="tabular-nums text-muted-foreground">{Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <Progress value={(unlocked / ACHIEVEMENTS.length) * 100} label="Achievements unlocked" barClassName="bg-accent" />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = state.achievements[a.id];
          const Icon = at ? ICONS[a.icon] : Lock;
          return (
            <li key={a.id} className={cn("flex gap-4 rounded-2xl border p-4", at ? "border-accent/50 bg-accent/10" : "border-border bg-card opacity-70")}>
              <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", at ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold leading-snug">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.description}</p>
                {at && <p className="mt-1 text-xs font-medium text-success">Unlocked {fmtDate(at)}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
