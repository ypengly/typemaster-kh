"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BarChart3, BookOpen, Flame, Gamepad2, Gauge, Home, Languages, LayoutGrid, Menu, Settings, Trophy, User, X, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { displayStreak, levelProgress, levelTitle } from "@/lib/progress";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/academy/english", label: "English Academy", icon: BookOpen },
  { href: "/academy/khmer", label: "Khmer Academy", icon: Languages, khmer: true },
  { href: "/lessons", label: "All lessons", icon: LayoutGrid },
  { href: "/speed-test", label: "Speed test", icon: Gauge },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];
const TABS = [NAV[1], NAV[4], NAV[5], NAV[6], NAV[9]];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`) || (href === "/lessons" && path.startsWith("/practice"));
}

function NavList({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(path, href) ? "page" : undefined}
          className={cn(
            "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
            isActive(path, href) ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted",
          )}
        >
          <Icon className="h-5 w-5" /> {label}
        </Link>
      ))}
    </nav>
  );
}

function PlayerChip() {
  const { state, ready } = useStore();
  if (!ready) return <div className="h-20 animate-pulse rounded-xl bg-muted" />;
  const lp = levelProgress(state.xp);
  return (
    <Link href="/profile" className="block rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          Level {lp.level} · {levelTitle(lp.level)}
        </span>
        <span className="inline-flex items-center gap-1 text-accent">
          <Flame className="h-4 w-4" />
          <span className="font-semibold text-foreground">{displayStreak(state)}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${lp.pct}%` }} />
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" /> {state.xp} XP
      </p>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-4 overflow-y-auto border-r border-border bg-card/60 p-4 backdrop-blur md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight">TypeMaster KH</span>
        </Link>
        <NavList path={path} />
        <div className="mt-auto">
          <PlayerChip />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg font-semibold">TypeMaster KH</span>
          </Link>
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" aria-label="Close menu" className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] animate-pop flex-col gap-4 overflow-y-auto bg-background p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">Menu</span>
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavList path={path} onNavigate={() => setOpen(false)} />
              <PlayerChip />
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-10 lg:px-8">{children}</main>

        <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {TABS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={isActive(path, href) ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", isActive(path, href) ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />
              {label === "All lessons" ? "Lessons" : label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <rect width="40" height="40" rx="11" className="fill-primary" />
      <path d="M11 13h18M20 13v15" stroke="hsl(var(--primary-foreground))" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="30" cy="29" r="3" className="fill-accent" />
    </svg>
  );
}
