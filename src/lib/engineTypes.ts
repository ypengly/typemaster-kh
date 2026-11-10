import type { Stats } from "./stats";

export type FinishReason = "complete" | "time" | "manual";
export interface RunStats extends Stats {
  total: number; // number of characters (clusters) in the target text at the time of finishing
  reason: FinishReason;
}
