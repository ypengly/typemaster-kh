"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { localEntries } from "@/lib/leaderboard";
import type { Language } from "@/lib/types";
import { MODE_LABEL, fmtDate } from "@/lib/utils";
import { PageHeader, PageSkeleton, EmptyState } from "@/components/PageHeader";
import { LangTabs } from "@/components/LangTabs";
import { Card } from "@/components/ui/card";

export default function LeaderboardPage() {
  const { state, ready } = useStore();
  const [lang, setLang] = useState<Language>("en");
  const rows = useMemo(() => localEntries(state).filter((e) => e.language === lang).sort((a, b) => b.score - a.score).slice(0, 20), [state, lang]);
  if (!ready) return <PageSkeleton />;
  return (
    <div className="space-y-5">
      <PageHeader title="Leaderboard" subtitle="Your best runs on this device. Score = CPM × accuracy², so clean typing beats sloppy speed." action={<LangTabs value={lang} onChange={setLang} />} />
      {rows.length === 0 ? (
        <EmptyState title="No scores yet" body="Finish a lesson, a speed test or a game with at least 20 characters to appear here." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-3 font-medium">Rank</th>
                <th className="p-3 font-medium">Player</th>
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 text-right font-medium">Score</th>
                <th className="p-3 text-right font-medium">{lang === "en" ? "WPM" : "CPM"}</th>
                <th className="p-3 text-right font-medium">Accuracy</th>
                <th className="p-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-display font-semibold">{i + 1}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{MODE_LABEL[r.mode]}</td>
                  <td className="p-3 text-right font-semibold tabular-nums">{r.score}</td>
                  <td className="p-3 text-right tabular-nums">{Math.round(lang === "en" ? r.wpm : r.cpm)}</td>
                  <td className="p-3 text-right tabular-nums">{r.accuracy.toFixed(1)}%</td>
                  <td className="p-3 text-right text-muted-foreground">{fmtDate(r.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-sm text-muted-foreground">Scores are stored with a user id, name, mode and score, so they are ready to be sent to an online leaderboard once cloud sync is added.</p>
    </div>
  );
}
