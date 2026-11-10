import type { Difficulty, Language, Lesson, LessonKind } from "./types";
import { splitClusters } from "./text";

export interface Group {
  category: string;
  kind: LessonKind;
  instructions: string;
  items: [title: string, text: string][];
}

const TARGET_CPM: Record<Language, Record<Difficulty, number>> = {
  en: { basic: 100, intermediate: 140, advanced: 170 },
  km: { basic: 60, intermediate: 90, advanced: 110 },
};
const ACCURACY: Record<Language, Record<Difficulty, number>> = {
  en: { basic: 85, intermediate: 90, advanced: 95 },
  km: { basic: 80, intermediate: 88, advanced: 92 },
};

export const difficultyFor = (n: number): Difficulty => (n <= 30 ? "basic" : n <= 70 ? "intermediate" : "advanced");

export function buildLessons(language: Language, groups: Group[]): Lesson[] {
  const lessons: Lesson[] = [];
  let n = 0;
  for (const g of groups) {
    for (const [title, text] of g.items) {
      n += 1;
      const difficulty = difficultyFor(n);
      const clusters = splitClusters(text, language).length;
      lessons.push({
        id: `${language}-${String(n).padStart(3, "0")}`,
        language,
        number: n,
        difficulty,
        category: g.category,
        kind: g.kind,
        title,
        instructions: g.instructions,
        text,
        estimatedMinutes: Math.max(1, Math.ceil(clusters / TARGET_CPM[language][difficulty])),
        recommendedAccuracy: ACCURACY[language][difficulty],
        completed: false,
      });
    }
  }
  return lessons;
}
