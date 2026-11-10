"use client";

import { useState } from "react";
import { CalendarDays, Crosshair, Gauge, ListChecks, Type } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Language } from "@/lib/types";
import { PageHeader, PageSkeleton } from "@/components/PageHeader";
import { LangTabs } from "@/components/LangTabs";
import { KeyboardTip } from "@/components/KeyboardTip";
import { Button } from "@/components/ui/button";
import { SpeedChallenge, WordChallenge, SentenceChallenge, AccuracyChallenge, DailyChallenge } from "@/components/Games";

const GAMES = [
  { id: "speed", title: "Speed Challenge", body: "Type as many correct characters as you can before time runs out.", icon: Gauge },
  { id: "word", title: "Word Challenge", body: "Random words, one at a time. Space or Enter sends a word.", icon: Type },
  { id: "sentence", title: "Sentence Challenge", body: "Five sentences, typed accurately one after another.", icon: ListChecks },
  { id: "accuracy", title: "Accuracy Challenge", body: "Hit your target accuracy to pass.", icon: Crosshair },
  { id: "daily", title: "Daily Challenge", body: "A new text every day. Finish it once for bonus XP.", icon: CalendarDays },
] as const;
type GameId = (typeof GAMES)[number]["id"];

export default function GamesPage() {
  const { ready } = useStore();
  const [lang, setLang] = useState<Language>("en");
  const [game, setGame] = useState<GameId | null>(null);
  if (!ready) return <PageSkeleton />;

  return (
    <div className="space-y-5">
      <PageHeader title="Typing games" subtitle="Short rounds that train speed and accuracy. Every game works in English and Khmer." action={<LangTabs value={lang} onChange={(l) => { setLang(l); }} />} />
      <KeyboardTip language={lang} />

      {game === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map(({ id, title, body, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setGame(id)} className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/50">
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-3 font-display text-lg font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setGame(null)}>← All games</Button>
          {game === "speed" && <SpeedChallenge key={lang} lang={lang} />}
          {game === "word" && <WordChallenge key={lang} lang={lang} />}
          {game === "sentence" && <SentenceChallenge key={lang} lang={lang} />}
          {game === "accuracy" && <AccuracyChallenge key={lang} lang={lang} />}
          {game === "daily" && <DailyChallenge key={lang} lang={lang} />}
        </div>
      )}
    </div>
  );
}
