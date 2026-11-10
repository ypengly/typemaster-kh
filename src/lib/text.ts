import type { Language } from "./types";

const COENG = 0x17d2;

/** Khmer dependent vowels, signs, coeng, bathamasat, atthacan + joiners attach to the previous base. */
const isCombining = (cp: number) =>
  (cp >= 0x17b4 && cp <= 0x17d3) || cp === 0x17dd || cp === 0x200c || cp === 0x200d;

/** Remove zero-width spaces some Khmer keyboards insert, flatten newlines, normalise to NFC. */
export function normalizeText(s: string): string {
  return s
    .replace(/[\u200B\uFEFF]/g, "")
    .replace(/\s*[\r\n]+\s*/g, " ")
    .normalize("NFC");
}

/**
 * Split text into user-perceived characters.
 * English: one code point each. Khmer: a base letter plus its coeng (subscript) sequences,
 * dependent vowels and signs form ONE cluster, so they are never counted as separate characters.
 */
export function splitClusters(text: string, lang: Language): string[] {
  if (lang !== "km") return Array.from(text);
  const out: string[] = [];
  let afterCoeng = false;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (out.length > 0 && (afterCoeng || isCombining(cp))) out[out.length - 1] += ch;
    else out.push(ch);
    afterCoeng = cp === COENG;
  }
  return out;
}

function parts(cluster: string) {
  const cps = Array.from(cluster);
  const base = cps[0] ?? "";
  const pairs: string[] = [];
  let i = 1;
  while (i < cps.length && cps[i] === "\u17D2") {
    pairs.push(cps[i] + (cps[i + 1] ?? ""));
    i += 2;
  }
  return { base, pairs: pairs.join("|"), tail: cps.slice(i).sort().join("") };
}

/**
 * Cluster equality. For Khmer, vowels/signs typed after the subscripts in a different order
 * (a common keyboard-layout difference) are accepted as the same cluster.
 */
export function clustersEqual(a: string, b: string, lang: Language): boolean {
  if (a === b) return true;
  if (lang !== "km") return false;
  const pa = parts(a);
  const pb = parts(b);
  return pa.base === pb.base && pa.pairs === pb.pairs && pa.tail === pb.tail;
}

/**
 * True while a Khmer cluster is still being composed (e.g. typed "ក" while the target is "កា").
 * Such a cluster is shown as "pending" instead of being marked as an error.
 */
export function isPartial(typed: string, target: string, lang: Language): boolean {
  if (lang !== "km" || typed === target) return false;
  const t = Array.from(typed);
  const g = Array.from(target);
  if (t.length >= g.length || t[0] !== g[0]) return false;
  const pool = [...g];
  for (const ch of t) {
    const idx = pool.indexOf(ch);
    if (idx < 0) return false;
    pool.splice(idx, 1);
  }
  return true;
}
