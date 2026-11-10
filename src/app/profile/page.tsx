"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { levelProgress, levelTitle, displayStreak } from "@/lib/progress";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatTime } from "@/lib/stats";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { state, ready, updateProfileName, exportJson, importJson } = useStore();
  const [name, setName] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ready) return <PageSkeleton />;

  const lp = levelProgress(state.xp);
  const completed = Object.values(state.progress).filter((p) => p.completed).length;
  const stars = Object.values(state.progress).reduce((n, p) => n + p.stars, 0);
  const shown = name ?? state.profile.name;

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typemaster-kh-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const upload = async (f: File | undefined) => {
    if (!f) return;
    const ok = importJson(await f.text());
    setMsg(ok ? "Backup restored." : "That file is not a TypeMaster KH backup.");
    if (fileRef.current) fileRef.current.value = "";
  };

  const rows: [string, string][] = [
    ["Lessons completed", `${completed} / 200`],
    ["Stars earned", `${stars} / 600`],
    ["Achievements", `${Object.keys(state.achievements).length} / ${ACHIEVEMENTS.length}`],
    ["Total practice time", formatTime(state.totals.seconds)],
    ["Correct characters typed", state.totals.chars.toLocaleString()],
    ["Perfect runs", String(state.totals.perfect)],
    ["Games finished", String(state.totals.games)],
    ["Current / best streak", `${displayStreak(state)} / ${state.streak.best} days`],
    ["Best English", state.pb.en.cpm ? `${state.pb.en.wpm} WPM · ${state.pb.en.cpm} CPM` : "—"],
    ["Best Khmer", state.pb.km.cpm ? `${state.pb.km.cpm} CPM` : "—"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your progress lives in this browser. Back it up any time." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardContent className="space-y-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Display name</span>
              <div className="flex gap-2">
                <input value={shown} maxLength={30} onChange={(e) => setName(e.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3" />
                <Button onClick={() => { updateProfileName(shown); setName(null); setMsg("Name saved."); }}>Save</Button>
              </div>
            </label>
            <div>
              <p className="font-display text-2xl font-semibold">Level {lp.level} · {levelTitle(lp.level)}</p>
              <p className="mb-2 text-sm text-muted-foreground">{state.xp} XP · {lp.needed - lp.current} XP to level {lp.level + 1}</p>
              <Progress value={lp.pct} label="Level progress" barClassName="bg-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-2.5 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Backup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Download your progress as a file, or restore it on another device.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={download}><Download className="h-4 w-4" /> Download backup</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Restore backup</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </div>
          {msg && <p role="status" className="text-sm font-medium">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
