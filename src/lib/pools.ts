import type { Language } from "./types";
import { lessonsFor } from "../data";
import { splitClusters } from "./text";

const cache: Record<string, string[]> = {};

/** Single words, taken from the vocabulary lessons of each academy. */
export function getWords(lang: Language): string[] {
  const key = `w-${lang}`;
  if (cache[key]) return cache[key];
  const set = new Set<string>();
  for (const l of lessonsFor(lang)) {
    if (l.kind !== "words") continue;
    for (const w of l.text.split(/\s+/)) {
      const n = splitClusters(w, lang).length;
      if (n >= 2 && n <= 14 && (lang === "km" ? /^[\u1780-\u17FF]+$/.test(w) : /^[A-Za-z]+$/.test(w))) set.add(w);
    }
  }
  return (cache[key] = [...set]);
}

/** Sentences, split out of the sentence/conversation/paragraph/article lessons. */
export function getSentences(lang: Language): string[] {
  const key = `s-${lang}`;
  if (cache[key]) return cache[key];
  const splitter = lang === "km" ? /(?<=[។?!៕])\s*/ : /(?<=[.!?])\s+/;
  const set = new Set<string>();
  for (const l of lessonsFor(lang)) {
    if (l.kind !== "text") continue;
    for (const raw of l.text.split(splitter)) {
      const s = raw.trim();
      const n = splitClusters(s, lang).length;
      if (n >= (lang === "km" ? 14 : 28) && n <= (lang === "km" ? 140 : 140)) set.add(s);
    }
  }
  return (cache[key] = [...set]);
}

/** Longer passages for the speed test (whole paragraph/article lessons). */
export function getPassages(lang: Language): string[] {
  const key = `p-${lang}`;
  if (cache[key]) return cache[key];
  return (cache[key] = lessonsFor(lang)
    .filter((l) => l.kind === "text" && splitClusters(l.text, lang).length >= 120)
    .map((l) => l.text));
}

export function pickRandom<T>(arr: T[], n = 1): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
