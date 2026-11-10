"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { getPassages, pickRandom } from "@/lib/pools";
import type { Language, ResultSummary, TypingResult } from "@/lib/types";
import type { RunStats } from "@/lib/engineTypes";
import { toResult } from "@/lib/utils";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { LangTabs } from "@/components/LangTabs";
import { TimerPicker } from "@/components/TimerPicker";
import { TypingEngine } from "@/components/TypingEngine";
import { ResultCard } from "@/components/ResultCard";
import { KeyboardTip } from "@/components/KeyboardTip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SpeedTestPage() {
  const { state, ready, recordResult, updateSettings } = useStore();
  const [lang, setLang] = useState<Language>("en");
  const [duration, setDuration] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState<{ result: TypingResult; summary: ResultSummary } | null>(null);

  const passages = useMemo(() => getPassages(lang), [lang]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const first = useMemo(() => pickRandom(passages)[0], [passages, runKey]);

  if (!ready) return <PageSkeleton />;
  const seconds = duration ?? state.settings.defaultDurationSec;
  const best = state.pb[lang];

  const restart = () => {
    setDone(null);
    setRunKey((k) => k + 1);
  };

  const onFinish = (stats: RunStats) => {
    const result = toResult(stats, { language: lang, mode: "test" });
    setDone({ result, summary: recordResult(result) });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Typing speed test" subtitle="Type as much as you can before the timer ends. New text keeps coming, so you never run out." />
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-4">
            <LangTabs value={lang} onChange={(l) => { setLang(l); restart(); }} />
            <TimerPicker value={seconds} onChange={(s) => { setDuration(s); updateSettings({ defaultDurationSec: s }); restart(); }} />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Personal best</p>
            {best.cpm > 0 ? <p>{lang === "en" ? `${best.wpm} WPM · ` : ""}{best.cpm} CPM · {best.accuracy}% accuracy</p> : <p>No record yet.</p>}
          </div>
        </CardContent>
      </Card>

      <KeyboardTip language={lang} />

      {done ? (
        <ResultCard
          result={done.result}
          summary={done.summary}
          title="Speed test result"
          actions={<Button onClick={restart}><RotateCcw className="h-4 w-4" /> Test again</Button>}
        />
      ) : (
        <TypingEngine
          key={`${lang}-${seconds}`}
          text={first}
          language={lang}
          durationSec={seconds}
          getMore={seconds > 0 ? () => pickRandom(passages)[0] : undefined}
          resetKey={runKey}
          onFinish={onFinish}
          showLiveStats={state.settings.showLiveStats}
        />
      )}
    </div>
  );
}
