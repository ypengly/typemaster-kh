"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { lessonsFor } from "@/data";
import { getLessonStatus, nextLessonToPractice } from "@/lib/progress";
import { LANG_LABEL, LANG_NATIVE, cn, slugToLang } from "@/lib/utils";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { LessonCard } from "@/components/LessonCard";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import type { Difficulty } from "@/lib/types";

const TIERS: { id: Difficulty; label: string; range: string; blurb: Record<"en" | "km", string> }[] = [
  { id: "basic", label: "Basic", range: "1–30", blurb: { en: "Letters, rows, numbers, symbols and simple words.", km: "Consonants, vowels, subscripts, numbers and basic words." } },
  { id: "intermediate", label: "Intermediate", range: "31–70", blurb: { en: "Vocabulary, sentences, punctuation, conversations and short paragraphs.", km: "Vocabulary, sentences, conversations, punctuation and short paragraphs." } },
  { id: "advanced", label: "Advanced", range: "71–100", blurb: { en: "Long sentences, news, education, business writing and essays.", km: "Long sentences, articles, news, formal writing and essays." } },
];

export default function AcademyPage() {
  const params = useParams<{ lang: string }>();
  const lang = slugToLang(params?.lang);
  const { state, ready } = useStore();
  const [tier, setTier] = useState<Difficulty | null>(null);
  if (!lang) notFound();
  if (!ready) return <PageSkeleton />;

  const lessons = lessonsFor(lang);
  const done = lessons.filter((l) => state.progress[l.id]?.completed).length;
  const next = nextLessonToPractice(lessons, state);
  const activeTier = tier ?? next.difficulty;

  return (
    <div className="space-y-6">
      <PageHeader
        title={lang === "en" ? "English Academy" : "Khmer Academy"}
        subtitle={`${LANG_LABEL[lang]} · ${LANG_NATIVE[lang]} — 100 lessons from beginner to advanced.`}
        action={
          <Link href={`/practice/${next.id}`} className={buttonVariants({ size: "lg" })}>
            {done === 0 ? "Start lesson 1" : `Continue: lesson ${next.number}`} <ArrowRight className="h-5 w-5" />
          </Link>
        }
      />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold">{done} of 100 lessons completed</span>
          <span className="tabular-nums text-muted-foreground">{done}%</span>
        </div>
        <Progress value={done} label={`${LANG_LABEL[lang]} progress`} />
      </div>

      <div role="tablist" aria-label="Difficulty" className="flex flex-wrap gap-2">
        {TIERS.map((t) => {
          const total = lessons.filter((l) => l.difficulty === t.id);
          const d = total.filter((l) => state.progress[l.id]?.completed).length;
          return (
            <button key={t.id} role="tab" aria-selected={activeTier === t.id} onClick={() => setTier(t.id)} className={cn("rounded-xl border px-4 py-2.5 text-left transition-colors", activeTier === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
              <span className="block text-sm font-semibold">{t.label} · {t.range}</span>
              <span className="block text-xs opacity-80">{d}/{total.length} done</span>
            </button>
          );
        })}
      </div>

      {TIERS.filter((t) => t.id === activeTier).map((t) => (
        <section key={t.id} role="tabpanel" className="space-y-4">
          <p className="text-muted-foreground">{t.blurb[lang]}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.filter((l) => l.difficulty === t.id).map((l) => (
              <LessonCard key={l.id} lesson={l} status={getLessonStatus(l, lessons, state)} progress={state.progress[l.id]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
