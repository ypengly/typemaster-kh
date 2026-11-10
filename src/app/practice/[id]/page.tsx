"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Clock, Lock, RotateCcw, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { getLesson, lessonsFor, nextLesson } from "@/data";
import { getLessonStatus } from "@/lib/progress";
import type { ResultSummary, TypingResult } from "@/lib/types";
import type { RunStats } from "@/lib/engineTypes";
import { LANG_SLUG, toResult } from "@/lib/utils";
import { PageSkeleton } from "@/components/PageHeader";
import { TypingEngine } from "@/components/TypingEngine";
import { TimerPicker } from "@/components/TimerPicker";
import { ResultCard } from "@/components/ResultCard";
import { KeyboardTip } from "@/components/KeyboardTip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PracticePage() {
  const params = useParams<{ id: string }>();
  const lesson = params?.id ? getLesson(params.id) : undefined;
  const { state, ready, recordResult, updateSettings } = useStore();
  const [duration, setDuration] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState<{ result: TypingResult; summary: ResultSummary } | null>(null);

  if (!lesson) notFound();
  if (!ready) return <PageSkeleton />;

  const lessons = lessonsFor(lesson.language);
  const status = getLessonStatus(lesson, lessons, state);
  const next = nextLesson(lesson);
  const prev = lessons[lesson.number - 2];
  const academy = `/academy/${LANG_SLUG[lesson.language]}`;
  const seconds = duration ?? 0; // lessons are untimed unless the learner picks a timer

  if (status === "locked") {
    return (
      <Card>
        <CardContent className="space-y-4 py-10 text-center">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="font-display text-2xl font-semibold">Lesson {lesson.number} is locked</h1>
          <p className="text-muted-foreground">Finish lesson {lesson.number - 1} with at least one star to unlock it, or unlock every lesson in Settings.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {prev && <Link href={`/practice/${prev.id}`} className={buttonVariants()}>Go to lesson {prev.number}</Link>}
            <Button variant="outline" onClick={() => updateSettings({ unlockAll: true })}>Unlock all lessons</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onFinish = (stats: RunStats) => {
    const result = toResult(stats, { language: lesson.language, mode: "lesson", lessonId: lesson.id });
    const summary = recordResult(result, { lesson });
    setDone({ result, summary });
  };

  const retry = () => {
    setDone(null);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href={academy} className="text-sm font-semibold text-primary hover:underline">← {lesson.language === "en" ? "English" : "Khmer"} Academy</Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {lesson.number}. {lesson.title}
        </h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">{lesson.instructions}</p>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> About {lesson.estimatedMinutes} min</span>
          <span className="inline-flex items-center gap-1.5"><Target className="h-4 w-4" /> Aim for {lesson.recommendedAccuracy}% accuracy</span>
          <span className="capitalize">{lesson.difficulty} · {lesson.category}</span>
        </p>
      </div>

      <KeyboardTip language={lesson.language} />

      {done ? (
        <ResultCard
          result={done.result}
          summary={done.summary}
          showStars
          title={done.summary.stars > 0 ? "Lesson complete" : done.result.completion < 100 ? "Lesson not finished" : `Reach ${lesson.recommendedAccuracy - 10}% accuracy to earn a star`}
          actions={
            <>
              <Button variant="outline" onClick={retry}><RotateCcw className="h-4 w-4" /> Try again</Button>
              {next && done.summary.stars > 0 && (
                <Link href={`/practice/${next.id}`} className={buttonVariants()}>Next lesson <ArrowRight className="h-4 w-4" /></Link>
              )}
              <Link href={academy} className={buttonVariants({ variant: "ghost" })}>Back to lessons</Link>
            </>
          }
        />
      ) : (
        <>
          <TypingEngine key={lesson.id} text={lesson.text} language={lesson.language} durationSec={seconds} resetKey={runKey} onFinish={onFinish} showLiveStats={state.settings.showLiveStats} />
          <details className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">Timer (optional)</summary>
            <div className="mt-3">
              <TimerPicker value={seconds} onChange={(s) => { setDuration(s); setRunKey((k) => k + 1); }} />
              <p className="mt-2 text-xs text-muted-foreground">Changing the timer restarts the lesson. Lessons need 100% completion to earn stars.</p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
