/* Run with: npm run check:lessons — validates the 200-lesson dataset. */
import { ALL_LESSONS } from "../src/data";
import { splitClusters } from "../src/lib/text";

const errors: string[] = [];
const expect = (cond: boolean, msg: string) => { if (!cond) errors.push(msg); };

for (const lang of ["en", "km"] as const) {
  const ls = ALL_LESSONS.filter((l) => l.language === lang);
  expect(ls.length === 100, `${lang}: expected 100 lessons, got ${ls.length}`);
  for (const [d, n] of [["basic", 30], ["intermediate", 40], ["advanced", 30]] as const)
    expect(ls.filter((l) => l.difficulty === d).length === n, `${lang}: expected ${n} ${d} lessons`);
}
expect(new Set(ALL_LESSONS.map((l) => l.id)).size === 200, "lesson ids must be unique");
expect(new Set(ALL_LESSONS.map((l) => l.text)).size === 200, "every lesson text must be unique");
for (const l of ALL_LESSONS) {
  expect(l.title.length > 0 && l.instructions.length > 0 && l.text.length > 0, `${l.id}: missing field`);
  expect(!/[\u200B\uFEFF\n\r]/.test(l.text), `${l.id}: text has zero-width or newline characters`);
  if (l.language === "km") {
    for (const c of splitClusters(l.text, "km")) {
      const first = c.codePointAt(0)!;
      if (first >= 0x17b4 && first <= 0x17d3) errors.push(`${l.id}: cluster starts with a combining mark: ${c}`);
    }
  }
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`OK — ${ALL_LESSONS.length} lessons validated.`);
