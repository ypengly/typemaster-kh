"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALL_LESSONS, lessonsFor } from "@/data";
import { getLessonStatus } from "@/lib/progress";
import type { Difficulty, Language } from "@/lib/types";
import { PageHeader, PageSkeleton, EmptyState } from "@/components/PageHeader";
import { LessonCard } from "@/components/LessonCard";
import { cn } from "@/lib/utils";

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={cn("h-9 rounded-lg border px-3 text-sm font-medium", value === o.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function LessonsPage() {
  const { state, ready } = useStore();
  const [lang, setLang] = useState<Language | "all">("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<"all" | "available" | "completed" | "locked">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_LESSONS.filter((l) => (lang === "all" || l.language === lang) && (diff === "all" || l.difficulty === diff))
      .filter((l) => !needle || l.title.toLowerCase().includes(needle) || l.category.toLowerCase().includes(needle) || l.text.includes(q.trim()))
      .map((l) => ({ l, s: getLessonStatus(l, lessonsFor(l.language), state) }))
      .filter((r) => status === "all" || r.s === status);
  }, [lang, diff, status, q, state]);

  if (!ready) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader title="All lessons" subtitle="Find any of the 200 lessons. Lessons unlock in order inside each academy." />
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label className="relative block">
          <span className="sr-only">Search lessons</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, topic or text" className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3" />
        </label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Chips label="Language" value={lang} onChange={setLang} options={[{ id: "all", label: "Both" }, { id: "en", label: "English" }, { id: "km", label: "Khmer" }]} />
          <Chips label="Difficulty" value={diff} onChange={setDiff} options={[{ id: "all", label: "Any level" }, { id: "basic", label: "Basic" }, { id: "intermediate", label: "Intermediate" }, { id: "advanced", label: "Advanced" }]} />
          <Chips label="Status" value={status} onChange={setStatus} options={[{ id: "all", label: "All" }, { id: "available", label: "Ready" }, { id: "completed", label: "Completed" }, { id: "locked", label: "Locked" }]} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{rows.length} lesson{rows.length === 1 ? "" : "s"}</p>
      {rows.length === 0 ? (
        <EmptyState title="No lessons match" body="Try a different search or clear a filter." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ l, s }) => (
            <LessonCard key={l.id} lesson={l} status={s} progress={state.progress[l.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
