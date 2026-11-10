"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Flag, ClipboardX } from "lucide-react";
import type { Language } from "@/lib/types";
import { clustersEqual, isPartial, normalizeText, splitClusters } from "@/lib/text";
import { computeStats } from "@/lib/stats";
import { formatTime } from "@/lib/stats";
import type { RunStats, FinishReason } from "@/lib/engineTypes";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Status = "idle" | "running" | "paused" | "finished";

export interface TypingEngineProps {
  text: string;
  language: Language;
  /** Time limit in seconds. 0 = unlimited practice. */
  durationSec: number;
  /** Timed runs can ask for more text when the learner gets close to the end. */
  getMore?: () => string;
  onFinish: (stats: RunStats) => void;
  /** Change this value to force a restart (for example after "Try again"). */
  resetKey?: string | number;
  showLiveStats?: boolean;
  autoFocus?: boolean;
}

function evaluate(value: string, target: string, lang: Language) {
  const tc = splitClusters(target, lang);
  const vc = splitClusters(value, lang);
  const n = vc.length;
  const pending = n > 0 && n <= tc.length && isPartial(vc[n - 1], tc[n - 1], lang);
  const committed = pending ? n - 1 : n;
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < committed; i++) {
    if (i < tc.length && clustersEqual(vc[i], tc[i], lang)) correct++;
    else incorrect++;
  }
  return { tc, vc, pending, committed, correct, incorrect };
}

export function TypingEngine({ text, language, durationSec, getMore, onFinish, resetKey, showLiveStats = true, autoFocus = true }: TypingEngineProps) {
  const initial = useMemo(() => normalizeText(text), [text]);
  const [target, setTarget] = useState(initial);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [focused, setFocused] = useState(false);

  const targetRef = useRef(initial);
  const valueRef = useRef("");
  const statusRef = useRef<Status>("idle");
  const judgedRef = useRef(0);
  const errorsRef = useRef(0);
  const startRef = useRef(0);
  const accRef = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const setStatusBoth = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  const elapsedNow = () => (statusRef.current === "running" ? accRef.current + performance.now() - startRef.current : accRef.current);

  const reset = useCallback(() => {
    targetRef.current = initial;
    valueRef.current = "";
    judgedRef.current = 0;
    errorsRef.current = 0;
    accRef.current = 0;
    setTarget(initial);
    setValue("");
    setElapsed(0);
    statusRef.current = "idle";
    setStatus("idle");
    if (autoFocus) window.requestAnimationFrame(() => taRef.current?.focus());
  }, [initial, autoFocus]);

  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  const finish = useCallback(
    (reason: FinishReason) => {
      if (statusRef.current === "finished") return;
      const e = elapsedNow();
      const ev = evaluate(valueRef.current, targetRef.current, language);
      // a Khmer cluster still being composed at the end is judged as typed
      const committed = ev.vc.length;
      for (let i = judgedRef.current; i < committed; i++) {
        if (!(i < ev.tc.length && clustersEqual(ev.vc[i], ev.tc[i], language))) errorsRef.current++;
      }
      judgedRef.current = Math.max(judgedRef.current, committed);
      const final = evaluate(valueRef.current, targetRef.current, language);
      const correct = final.vc.reduce((n, c, i) => (i < final.tc.length && clustersEqual(c, final.tc[i], language) ? n + 1 : n), 0);
      const stats = computeStats({
        lang: language,
        correct,
        incorrect: committed - correct,
        judged: judgedRef.current,
        errors: errorsRef.current,
        committed,
        totalClusters: final.tc.length,
        elapsedMs: e,
      });
      accRef.current = e;
      setElapsed(e);
      setStatusBoth("finished");
      onFinishRef.current({ ...stats, total: final.tc.length, reason });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  // timer
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      const e = elapsedNow();
      setElapsed(e);
      if (durationSec > 0 && e >= durationSec * 1000) finish("time");
    }, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, durationSec, finish]);

  const begin = () => {
    if (statusRef.current === "idle") {
      startRef.current = performance.now();
      accRef.current = 0;
      setStatusBoth("running");
    }
    taRef.current?.focus();
  };

  const pause = () => {
    if (statusRef.current !== "running") return;
    accRef.current += performance.now() - startRef.current;
    setStatusBoth("paused");
  };
  const resume = () => {
    if (statusRef.current !== "paused") return;
    startRef.current = performance.now();
    setStatusBoth("running");
    window.requestAnimationFrame(() => taRef.current?.focus());
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (statusRef.current === "paused" || statusRef.current === "finished") return;
    const inputType = (e.nativeEvent as InputEvent).inputType;
    if (inputType === "insertFromPaste" || inputType === "insertFromDrop" || inputType === "insertFromYank") return;
    const v = normalizeText(e.target.value);
    if (statusRef.current === "idle") {
      startRef.current = performance.now();
      accRef.current = 0;
      setStatusBoth("running");
    }

    let tgt = targetRef.current;
    let ev = evaluate(v, tgt, language);
    for (let i = judgedRef.current; i < ev.committed; i++) {
      if (!(i < ev.tc.length && clustersEqual(ev.vc[i], ev.tc[i], language))) errorsRef.current++;
    }
    judgedRef.current = Math.max(judgedRef.current, ev.committed);

    valueRef.current = v;
    setValue(v);

    // timed runs: keep the text coming
    if (getMore && durationSec > 0 && ev.tc.length - ev.vc.length < 60) {
      tgt = `${tgt} ${normalizeText(getMore())}`;
      targetRef.current = tgt;
      setTarget(tgt);
      ev = evaluate(v, tgt, language);
    }

    // finished the whole text?
    if (!(getMore && durationSec > 0) && ev.vc.length >= ev.tc.length && !ev.pending) finish("complete");
  };

  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPasteBlocked(true);
    window.setTimeout(() => setPasteBlocked(false), 1800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") e.preventDefault();
    if (["ArrowLeft", "ArrowUp", "ArrowDown", "Home", "PageUp"].includes(e.key)) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && ["v", "x", "a"].includes(e.key.toLowerCase())) e.preventDefault();
    if (e.key === "Escape" && statusRef.current === "running") pause();
  };

  const keepCaretAtEnd = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (t.selectionStart !== t.value.length) t.setSelectionRange(t.value.length, t.value.length);
  };

  const ev = useMemo(() => evaluate(value, target, language), [value, target, language]);
  const cursor = ev.pending ? ev.vc.length - 1 : ev.vc.length;

  // keep the cursor visible inside the text box
  useEffect(() => {
    const box = boxRef.current;
    const el = box?.querySelector<HTMLElement>('[data-cursor="true"]');
    if (!box || !el) return;
    const top = el.offsetTop;
    if (top < box.scrollTop + 8 || top + el.offsetHeight > box.scrollTop + box.clientHeight - 8) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [cursor]);

  const stats = computeStats({
    lang: language,
    correct: ev.correct,
    incorrect: ev.incorrect,
    judged: judgedRef.current,
    errors: errorsRef.current,
    committed: ev.committed,
    totalClusters: ev.tc.length,
    elapsedMs: elapsed,
  });
  const remaining = durationSec > 0 ? Math.max(0, durationSec - elapsed / 1000) : null;
  const unlimitedOrTimed = remaining === null ? formatTime(elapsed / 1000) : formatTime(remaining);
  const typedLabel = language === "km" ? "CPM" : "WPM";
  const disabled = status === "finished" || status === "paused";

  return (
    <div className="space-y-4">
      {showLiveStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="off">
          <Hud label={remaining === null ? "Time" : "Time left"} value={unlimitedOrTimed} emphasis={remaining !== null && remaining <= 10 && status === "running"} />
          <Hud label={typedLabel} value={String(Math.round(language === "km" ? stats.cpm : stats.wpm))} />
          <Hud label="Accuracy" value={`${Math.round(stats.accuracy)}%`} />
          <Hud label="Errors" value={String(stats.errors)} />
        </div>
      )}

      <div className="relative">
        <div
          ref={boxRef}
          lang={language === "km" ? "km" : "en"}
          className={cn(
            "typing-text relative h-64 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-soft sm:h-72 sm:p-7",
            language === "km" ? "font-khmer typing-km" : "typing-en",
            focused && status !== "finished" && "ring-2 ring-ring/60",
          )}
        >
          {ev.tc.map((c, i) => {
            let cls = "text-muted-foreground";
            if (i < ev.committed) cls = i < ev.vc.length && clustersEqual(ev.vc[i], c, language) ? "text-success bg-success/10" : "text-danger bg-danger/20 underline decoration-danger/60";
            else if (ev.pending && i === ev.vc.length - 1) cls = "bg-accent/30 text-foreground";
            const isCursor = i === cursor && status !== "finished";
            return (
              <span key={i} data-cursor={isCursor ? "true" : undefined} className={cn("rounded-[3px]", cls, isCursor && "cursor-mark")}>
                {c}
              </span>
            );
          })}
        </div>

        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onPaste={block}
          onDrop={block}
          onCut={block}
          onCopy={block}
          onContextMenu={(e) => e.preventDefault()}
          onClick={keepCaretAtEnd}
          onSelect={keepCaretAtEnd}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          lang={language === "km" ? "km" : "en"}
          aria-label={language === "km" ? "Typing area. Type the Khmer text shown above." : "Typing area. Type the text shown above."}
          className="absolute inset-0 h-full w-full resize-none rounded-2xl bg-transparent text-transparent caret-transparent opacity-0 outline-none"
        />

        {status === "idle" && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm text-muted-foreground">
            {focused ? "Start typing — the timer begins with your first key." : "Click or tap the text, then start typing."}
          </p>
        )}
        {status === "paused" && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/80 backdrop-blur-sm">
            <Button onClick={resume} size="lg">
              <Play className="h-5 w-5" /> Resume
            </Button>
          </div>
        )}
        {pasteBlocked && (
          <p className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white animate-pop" role="status">
            <ClipboardX className="h-4 w-4" /> Pasting is turned off during practice
          </p>
        )}
      </div>

      <Progress value={stats.completion} label="Completion" />

      <div className="flex flex-wrap items-center gap-2">
        {status === "idle" && (
          <Button onClick={begin}>
            <Play className="h-4 w-4" /> Start
          </Button>
        )}
        {status === "running" && (
          <Button onClick={pause} variant="outline">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        {status === "paused" && (
          <Button onClick={resume}>
            <Play className="h-4 w-4" /> Resume
          </Button>
        )}
        <Button onClick={reset} variant="outline">
          <RotateCcw className="h-4 w-4" /> Restart
        </Button>
        <Button onClick={() => finish("manual")} variant="soft" disabled={status === "idle" || status === "finished"}>
          <Flag className="h-4 w-4" /> Finish
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">{ev.committed} / {ev.tc.length} characters</span>
      </div>
    </div>
  );
}

function Hud({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-display text-2xl font-semibold tabular-nums", emphasis && "text-danger animate-blink")}>{value}</p>
    </div>
  );
}
