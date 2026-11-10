"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, Gauge, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";
import { lessonsFor } from "@/data";
import { nextLessonToPractice } from "@/lib/progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function DemoLine({ text, typed, bad, lang }: { text: string[]; typed: number; bad?: number; lang: "en" | "km" }) {
  return (
    <p lang={lang} className={cn("rounded-2xl border border-border bg-card px-5 py-4 shadow-soft", lang === "km" ? "font-khmer text-3xl leading-[2.2]" : "font-display text-3xl leading-[1.8]")}>
      {text.map((c, i) => (
        <span key={i} className={cn("rounded-[3px]", i < typed ? (i === bad ? "bg-danger/20 text-danger" : "bg-success/10 text-success") : "text-muted-foreground", i === typed && "cursor-mark")}>
          {c}
        </span>
      ))}
    </p>
  );
}

export default function HomePage() {
  const { state, ready } = useStore();
  const started = ready && Object.keys(state.progress).length > 0;
  const en = lessonsFor("en");
  const km = lessonsFor("km");
  const enDone = en.filter((l) => state.progress[l.id]?.completed).length;
  const kmDone = km.filter((l) => state.progress[l.id]?.completed).length;
  const nextEn = nextLessonToPractice(en, state);

  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 pt-2 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Type with confidence in English and Khmer.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            200 lessons take you from the home row and the Khmer consonants to full essays — with live feedback that understands Khmer subscripts and vowels as single characters.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/practice/${started ? nextEn.id : "en-001"}`} className={buttonVariants({ size: "lg" })}>
              {started ? "Continue learning" : "Start with lesson 1"} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/academy/khmer" lang="km" className={buttonVariants({ size: "lg", variant: "outline" })}>
              <span className="font-khmer">មេរៀនភាសាខ្មែរ</span>
            </Link>
          </div>
        </div>
        <div className="space-y-3" aria-hidden>
          <DemoLine lang="en" text={Array.from("Cambodia is beautiful.")} typed={14} bad={9} />
          <DemoLine lang="km" text={["ក្រុ", "ង", "ភ្នំ", "ពេ", "ញ"]} typed={3} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          { href: "/academy/english", title: "English Academy", sub: "Home row to complete essays", done: enDone, total: en.length, khmer: false },
          { href: "/academy/khmer", title: "Khmer Academy", sub: "ព្យញ្ជនៈ ស្រៈ ជើង ដល់អត្ថបទពេញ", done: kmDone, total: km.length, khmer: true },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl font-semibold">{a.title}</h2>
                  <span className="text-sm tabular-nums text-muted-foreground">{a.done}/{a.total}</span>
                </div>
                <p lang={a.khmer ? "km" : "en"} className={cn("text-muted-foreground", a.khmer && "font-khmer")}>{a.sub}</p>
                <Progress value={(a.done / a.total) * 100} label={`${a.title} progress`} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Gauge, title: "Speed test", body: "Timed runs from one to ten minutes, or your own length.", href: "/speed-test" },
          { icon: Gamepad2, title: "Five typing games", body: "Speed, words, sentences, accuracy and a new daily challenge.", href: "/games" },
          { icon: Trophy, title: "XP, streaks and badges", body: "Earn stars for every lesson and keep your daily streak alive.", href: "/achievements" },
        ].map(({ icon: Icon, title, body, href }) => (
          <Link key={href} href={href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
            <Icon className="h-6 w-6 text-primary" />
            <p className="mt-3 font-display text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
