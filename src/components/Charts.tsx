import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProgressRing({ pct, size = 112, stroke = 10, className, children }: { pct: number; size?: number; stroke?: number; className?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          className="stroke-current transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Small dependency-free line chart. `null` values are gaps (days without practice). */
export function LineChart({ values, labels, unit, className }: { values: (number | null)[]; labels: string[]; unit: string; className?: string }) {
  const W = 320;
  const H = 130;
  const pad = { l: 34, r: 8, t: 10, b: 22 };
  const pts = values.map((v, i) => (v === null ? null : { v, i })).filter(Boolean) as { v: number; i: number }[];
  if (pts.length === 0) {
    return (
      <div className={cn("grid h-[130px] place-items-center rounded-xl bg-muted/50 text-sm text-muted-foreground", className)}>
        No sessions in the last 14 days
      </div>
    );
  }
  const max = Math.max(10, Math.ceil(Math.max(...pts.map((p) => p.v)) / 10) * 10);
  const x = (i: number) => pad.l + (values.length === 1 ? 0 : (i / (values.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = pts.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts[pts.length - 1].i).toFixed(1)},${H - pad.b} L${x(pts[0].i).toFixed(1)},${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full text-primary", className)} role="img" aria-label={`Average ${unit} per day over the last 14 days`}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} className="stroke-border" strokeWidth={1} />
          <text x={pad.l - 6} y={y(max * t) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      <path d={area} className="fill-current opacity-10" />
      <path d={line} fill="none" className="stroke-current" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => (
        <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r={3.5} className="fill-card stroke-current" strokeWidth={2} />
      ))}
      <text x={pad.l} y={H - 6} className="fill-muted-foreground" fontSize={9}>
        {labels[0]}
      </text>
      <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-muted-foreground" fontSize={9}>
        {labels[labels.length - 1]}
      </text>
    </svg>
  );
}

export function BarList({ items }: { items: { label: string; value: number; total: number; tone?: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{it.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {it.value}/{it.total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full bg-primary", it.tone)} style={{ width: `${it.total ? (it.value / it.total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
