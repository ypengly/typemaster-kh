"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Language, ResultSummary, TypingResult } from "@/lib/types";
import type { RunStats } from "@/lib/engineTypes";
import { getPassages, getSentences, getWords, pickRandom } from "@/lib/pools";
import { getDailyChallenge, dailyKey } from "@/lib/daily";
import { localDay } from "@/lib/dates";
import { clustersEqual, normalizeText, splitClusters } from "@/lib/text";
import { computeStats, formatTime } from "@/lib/stats";
import { toResult, cn } from "@/lib/utils";
import { TypingEngine } from "@/components/TypingEngine";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Done = { result: TypingResult; summary: ResultSummary };

function useFinish(lang: Language, mode: TypingResult["mode"], dailyKeyStr?: string) {
  const { recordResult } = useStore();
  return (stats: RunStats): Done => {
    const result = toResult(stats, { language: lang, mode });
    return { result, summary: recordResult(result, { dailyKey: dailyKeyStr }) };
  };
}

function Seconds({ value, onChange, options }: { value: number; onChange: (n: number) => void; options: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Round length">
      <span className="text-sm font-semibold">Round length</span>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={cn("h-9 rounded-lg border px-3 text-sm font-medium", value === o ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
          {o}s
        </button>
      ))}
    </div>
  );
}

/* 1 — Speed Challenge */
export function SpeedChallenge({ lang }: { lang: Language }) {
  const finish = useFinish(lang, "speed");
  const { state } = useStore();
  const [secs, setSecs] = useState(60);
  const [done, setDone] = useState<Done | null>(null);
  const [key, setKey] = useState(0);
  const passages = useMemo(() => getPassages(lang), [lang]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const first = useMemo(() => pickRandom(passages)[0], [passages, key]);
  const again = () => { setDone(null); setKey((k) => k + 1); };

  if (done)
    return <ResultCard result={done.result} summary={done.summary} title={`Speed Challenge · ${done.result.correct} correct characters`} actions={<Button onClick={again}><RotateCcw className="h-4 w-4" /> Play again</Button>} />;
  return (
    <div className="space-y-4">
      <Seconds value={secs} onChange={(n) => { setSecs(n); setKey((k) => k + 1); }} options={[30, 60, 120]} />
      <p className="text-sm text-muted-foreground">Score = correct characters before time expires.</p>
      <TypingEngine key={`${secs}-${key}`} text={first} language={lang} durationSec={secs} getMore={() => pickRandom(passages)[0]} onFinish={(s) => setDone(finish(s))} showLiveStats={state.settings.showLiveStats} />
    </div>
  );
}

/* 2 — Word Challenge */
export function WordChallenge({ lang }: { lang: Language }) {
  const finish = useFinish(lang, "word");
  const words = useMemo(() => getWords(lang), [lang]);
  const [secs, setSecs] = useState(60);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [left, setLeft] = useState(60);
  const [word, setWord] = useState(() => pickRandom(words)[0]);
  const [input, setInput] = useState("");
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const charsOk = useRef(0);
  const charsAll = useRef(0);
  const startedAt = useRef(0);
  const ref = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStatus("idle"); setLeft(secs); setInput(""); setRight(0); setWrong(0); setDone(null);
    charsOk.current = 0; charsAll.current = 0; setWord(pickRandom(words)[0]);
    window.requestAnimationFrame(() => ref.current?.focus());
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLeft(secs); }, [secs]);

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, secs - (performance.now() - startedAt.current) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setStatus("done");
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [status, secs, right, wrong]);

  // finish once when status flips to done
  useEffect(() => {
    if (status !== "done" || done) return;
    const total = right + wrong;
    const acc = total ? (right / total) * 100 : 0;
    const stats = computeStats({ lang, correct: charsOk.current, incorrect: charsAll.current - charsOk.current, judged: total, errors: wrong, committed: charsAll.current, totalClusters: charsAll.current, elapsedMs: secs * 1000 });
    setDone(finish({ ...stats, accuracy: Math.round(acc * 10) / 10, completion: 100, total: charsAll.current, reason: "time" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const submit = (value: string) => {
    const typed = normalizeText(value).trim();
    if (!typed) return;
    const n = splitClusters(word, lang).length;
    charsAll.current += n;
    const ok = splitClusters(typed, lang).length === n && splitClusters(typed, lang).every((c, i) => clustersEqual(c, splitClusters(word, lang)[i], lang));
    if (ok) { charsOk.current += n; setRight((r) => r + 1); } else setWrong((w) => w + 1);
    setFlash(ok ? "ok" : "bad");
    window.setTimeout(() => setFlash(null), 250);
    setInput("");
    setWord(pickRandom(words.filter((w) => w !== word))[0]);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "done") return;
    const v = normalizeText(e.target.value);
    if (status === "idle") { startedAt.current = performance.now(); setStatus("running"); }
    if (v === word) { submit(v); return; } // exact match moves on automatically
    setInput(v.replace(/\s/g, ""));
  };

  if (done)
    return <ResultCard result={done.result} summary={done.summary} title={`Word Challenge · ${right} of ${right + wrong} words correct`} actions={<Button onClick={reset}><RotateCcw className="h-4 w-4" /> Play again</Button>} />;

  return (
    <Card>
      <CardContent className="space-y-5">
        <Seconds value={secs} onChange={(n) => { if (status === "idle") setSecs(n); }} options={[30, 60, 90]} />
        <div className="flex items-center justify-between text-sm">
          <span className="font-display text-2xl font-semibold tabular-nums">{formatTime(left)}</span>
          <span className="text-muted-foreground">{right} correct · {wrong} missed</span>
        </div>
        <Progress value={(left / secs) * 100} label="Time left" barClassName="bg-accent" />
        <div lang={lang === "km" ? "km" : "en"} className={cn("grid min-h-32 place-items-center rounded-2xl border-2 px-4 py-6 text-center transition-colors", flash === "ok" ? "border-success bg-success/10" : flash === "bad" ? "border-danger bg-danger/10" : "border-border bg-muted/40")}>
          <p className={cn("break-all", lang === "km" ? "font-khmer text-5xl leading-[1.8]" : "font-display text-5xl")}>{word}</p>
        </div>
        <input
          ref={ref}
          value={input}
          onChange={onChange}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); submit(input); } }}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          autoFocus
          autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
          lang={lang === "km" ? "km" : "en"}
          aria-label="Type the word shown"
          placeholder={status === "idle" ? "Type the word to begin" : ""}
          className={cn("h-14 w-full rounded-xl border border-border bg-background px-4 text-center text-2xl", lang === "km" && "font-khmer")}
        />
        <p className="text-center text-xs text-muted-foreground">Space or Enter sends the word. An exact match moves on by itself.</p>
        {status === "running" && <Button variant="outline" size="sm" onClick={reset}>Restart</Button>}
      </CardContent>
    </Card>
  );
}

/* 3 — Sentence Challenge */
export function SentenceChallenge({ lang }: { lang: Language }) {
  const finish = useFinish(lang, "sentence");
  const { state } = useStore();
  const [round, setRound] = useState(0);
  const [sentences, setSentences] = useState(() => pickRandom(getSentences(lang), 5));
  const [runs, setRuns] = useState<RunStats[]>([]);
  const [pending, setPending] = useState<RunStats | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const restart = () => { setRound(0); setSentences(pickRandom(getSentences(lang), 5)); setRuns([]); setPending(null); setDone(null); };

  const onRun = (s: RunStats) => {
    const all = [...runs, s];
    setRuns(all);
    if (all.length < 5) { setPending(s); return; }
    const total = all.reduce((n, r) => n + r.total, 0);
    const correct = all.reduce((n, r) => n + r.correct, 0);
    const ms = all.reduce((n, r) => n + r.timeSec * 1000, 0);
    const acc = all.reduce((n, r) => n + r.accuracy * r.total, 0) / Math.max(1, total);
    const errors = all.reduce((n, r) => n + r.errors, 0);
    const stats = computeStats({ lang, correct, incorrect: total - correct, judged: total, errors, committed: total, totalClusters: total, elapsedMs: ms });
    setDone(finish({ ...stats, accuracy: Math.round(acc * 10) / 10, completion: 100, total, reason: "complete" }));
  };

  if (done) return <ResultCard result={done.result} summary={done.summary} title="Sentence Challenge complete" actions={<Button onClick={restart}><RotateCcw className="h-4 w-4" /> Play again</Button>} />;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">Sentence {Math.min(round + 1, 5)} of 5</p>
      <Progress value={(runs.length / 5) * 100} label="Challenge progress" />
      {pending ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p>Sentence {round + 1} done · {pending.accuracy.toFixed(0)}% accuracy · {Math.round(pending.cpm)} CPM</p>
            <Button onClick={() => { setPending(null); setRound((r) => r + 1); }}>Next sentence</Button>
          </CardContent>
        </Card>
      ) : (
        <TypingEngine key={round} text={sentences[round]} language={lang} durationSec={0} onFinish={onRun} showLiveStats={state.settings.showLiveStats} />
      )}
    </div>
  );
}

/* 4 — Accuracy Challenge */
export function AccuracyChallenge({ lang }: { lang: Language }) {
  const finish = useFinish(lang, "accuracy");
  const { state } = useStore();
  const [target, setTarget] = useState(95);
  const [key, setKey] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const text = useMemo(() => pickRandom(getSentences(lang), 2).join(" "), [lang, key]);
  const again = () => { setDone(null); setKey((k) => k + 1); };

  if (done) {
    const passed = done.result.accuracy >= target && done.result.completion >= 100;
    return (
      <ResultCard
        result={done.result}
        summary={done.summary}
        title={passed ? "Challenge passed" : "Challenge missed"}
        banner={<span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", passed ? "bg-success/15 text-success" : "bg-danger/15 text-danger")}>{passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} Target {target}% · you scored {done.result.accuracy.toFixed(1)}%</span>}
        actions={<Button onClick={again}><RotateCcw className="h-4 w-4" /> Try again</Button>}
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Target accuracy">
        <span className="text-sm font-semibold">Target accuracy</span>
        {[90, 95, 98, 100].map((t) => (
          <button key={t} type="button" aria-pressed={target === t} onClick={() => setTarget(t)} className={cn("h-9 rounded-lg border px-3 text-sm font-medium", target === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>{t}%</button>
        ))}
      </div>
      <TypingEngine key={`${target}-${key}`} text={text} language={lang} durationSec={0} onFinish={(s) => setDone(finish(s))} showLiveStats={state.settings.showLiveStats} />
    </div>
  );
}

/* 5 — Daily Challenge */
export function DailyChallenge({ lang }: { lang: Language }) {
  const { state } = useStore();
  const today = localDay();
  const key = dailyKey(lang, today);
  const completedAtStart = useRef(!!state.dailyChallenges[key]).current;
  const finish = useFinish(lang, "daily", key);
  const text = useMemo(() => getDailyChallenge(lang, today), [lang, today]);
  const [done, setDone] = useState<Done | null>(null);
  const [runKey, setRunKey] = useState(0);

  if (done) return <ResultCard result={done.result} summary={done.summary} title={done.summary.dailyBonus ? "Daily challenge complete" : "Daily challenge finished"} actions={<Button onClick={() => { setDone(null); setRunKey((k) => k + 1); }}><RotateCcw className="h-4 w-4" /> Practice again</Button>} />;
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-accent/15 px-4 py-3 text-sm">
        {completedAtStart ? "You already finished today's challenge. Replays are free practice with no bonus." : "Finish with at least 80% accuracy to earn +50 XP. A new text arrives at midnight."}
      </p>
      <TypingEngine text={text} language={lang} durationSec={0} resetKey={runKey} onFinish={(s) => setDone(finish(s))} showLiveStats={state.settings.showLiveStats} />
    </div>
  );
}
