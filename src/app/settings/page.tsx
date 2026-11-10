"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Settings } from "@/lib/types";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { TimerPicker } from "@/components/TimerPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; icon?: typeof Sun }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(({ id, label: l, icon: Icon }) => (
        <button key={String(id)} type="button" aria-pressed={value === id} onClick={() => onChange(id)} className={cn("inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium", value === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
          {Icon && <Icon className="h-4 w-4" />} {l}
        </button>
      ))}
    </div>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-b border-border py-4 last:border-0">
      <p className="font-semibold">{title}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { state, ready, updateSettings, resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);
  if (!ready) return <PageSkeleton />;
  const s = state.settings;
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => updateSettings({ [k]: v } as Partial<Settings>);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Changes are saved automatically." />
      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent>
          <Row title="Theme">
            <Seg label="Theme" value={s.theme} onChange={set("theme")} options={[{ id: "system", label: "System", icon: Monitor }, { id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }]} />
          </Row>
          <Row title="Typing text size" hint="Applies to the text you type in lessons, tests and games.">
            <Seg label="Text size" value={s.fontScale} onChange={set("fontScale")} options={[{ id: "sm", label: "Small" }, { id: "md", label: "Medium" }, { id: "lg", label: "Large" }]} />
          </Row>
          <Row title="Daily goal" hint="Minutes of typing per day.">
            <Seg label="Daily goal" value={s.dailyGoalMinutes} onChange={set("dailyGoalMinutes")} options={[5, 10, 15, 20, 30, 45, 60].map((m) => ({ id: m, label: `${m} min` }))} />
          </Row>
          <Row title="Default speed-test timer">
            <TimerPicker label="Timer" value={s.defaultDurationSec} onChange={set("defaultDurationSec")} />
          </Row>
          <Row title="Live statistics" hint="Show time, speed, accuracy and errors while you type.">
            <Seg label="Live stats" value={s.showLiveStats ? "on" : "off"} onChange={(v) => updateSettings({ showLiveStats: v === "on" })} options={[{ id: "on", label: "Show" }, { id: "off", label: "Hide" }]} />
          </Row>
          <Row title="Lesson unlocking" hint="Lessons normally unlock in order. Turn this on to open all 200 lessons.">
            <Seg label="Unlock all" value={s.unlockAll ? "all" : "order"} onChange={(v) => updateSettings({ unlockAll: v === "all" })} options={[{ id: "order", label: "In order" }, { id: "all", label: "Unlock all" }]} />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reset progress</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Deletes lessons, XP, history, streaks and achievements from this browser. Download a backup from your profile first if you want to keep them.</p>
          {confirm ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="danger" onClick={() => { resetAll(); setConfirm(false); }}>Yes, delete everything</Button>
              <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setConfirm(true)}>Reset all progress</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
