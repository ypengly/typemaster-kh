import Link from "next/link";
import { CheckCircle2, Clock, Lock, Target } from "lucide-react";
import type { Lesson, LessonProgress } from "@/lib/types";
import type { LessonStatus } from "@/lib/progress";
import { Stars } from "@/components/Stars";
import { cn } from "@/lib/utils";

export function LessonCard({ lesson, status, progress }: { lesson: Lesson; status: LessonStatus; progress?: LessonProgress }) {
  const locked = status === "locked";
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 transition-all",
        locked ? "border-border opacity-60" : "border-border shadow-soft hover:-translate-y-0.5 hover:border-primary/50",
        status === "completed" && "border-success/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("grid h-9 min-w-9 place-items-center rounded-lg px-2 font-display text-sm font-semibold", status === "completed" ? "bg-success/15 text-success" : "bg-primary/10 text-primary")}>
          {lesson.number}
        </span>
        {locked ? <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" /> : status === "completed" ? <CheckCircle2 className="h-5 w-5 text-success" aria-label="Completed" /> : null}
      </div>
      <div className="min-h-[3rem]">
        <p className="font-semibold leading-snug">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">{lesson.category}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> ~{lesson.estimatedMinutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> {lesson.recommendedAccuracy}%
        </span>
        <Stars count={progress?.stars ?? 0} />
      </div>
    </div>
  );
  return locked ? (
    <div aria-disabled="true" title="Complete the previous lesson to unlock">
      {body}
    </div>
  ) : (
    <Link href={`/practice/${lesson.id}`} className="block">
      {body}
    </Link>
  );
}
