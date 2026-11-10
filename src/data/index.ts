import type { Language, Lesson } from "../lib/types";
import { englishLessons } from "./english";
import { khmerLessons } from "./khmer";

export const ALL_LESSONS: Lesson[] = [...englishLessons, ...khmerLessons];
const byId = new Map(ALL_LESSONS.map((l) => [l.id, l]));

export const lessonsFor = (lang: Language): Lesson[] => (lang === "en" ? englishLessons : khmerLessons);
export const getLesson = (id: string): Lesson | undefined => byId.get(id);
export const nextLesson = (l: Lesson): Lesson | undefined => lessonsFor(l.language)[l.number];
