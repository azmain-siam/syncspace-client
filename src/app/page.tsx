import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header Bar */}
      <header className="px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto h-14 px-5 bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              SyncSpace
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-4 py-2 rounded-lg shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-8 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" /> Real-Time Team Collaboration
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Where teams build with{' '}
          <span className="text-primary">clarity & speed.</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-muted-foreground max-w-2xl font-medium leading-relaxed">
          Kanban boards, real-time presence, markdown comments, and
          event-driven notifications — built for engineering, product, and
          cross-functional teams.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Create Free Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto h-10 px-6 border border-border/80 bg-card hover:bg-accent text-foreground font-semibold text-sm rounded-xl flex items-center justify-center transition-colors shadow-xs"
          >
            Sign In to Existing Space
          </Link>
        </div>

        {/* Live Visual Showcase Container Card */}
        <div className="mt-14 w-full p-6 sm:p-8 rounded-2xl border border-border/60 bg-card shadow-sm text-left relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-border/60 gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Workspace Overview
              </div>
              <h2 className="text-xl font-bold text-foreground mt-1 tracking-tight">
                Engineering Sprint Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success text-success-foreground text-[11px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> 94.2% Completed
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning text-warning-foreground text-[11px] font-semibold">
                <Clock className="h-3 w-3" /> 2 Days Left
              </span>
            </div>
          </div>

          {/* Metric Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-secondary/40 border border-border/40">
              <div className="text-xs font-medium text-muted-foreground">
                Active Sprint Tasks
              </div>
              <div className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                48
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-success-foreground bg-success px-2.5 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3" /> +18.4% this week
              </div>
            </div>

            <div className="p-5 rounded-xl bg-secondary/40 border border-border/40">
              <div className="text-xs font-medium text-muted-foreground">
                Online Teammates
              </div>
              <div className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                12
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{' '}
                Socket connected
              </div>
            </div>

            <div className="p-5 rounded-xl bg-secondary/40 border border-border/40">
              <div className="text-xs font-medium text-muted-foreground">
                Completed Items
              </div>
              <div className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                142
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                Target achieved
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 text-left w-full">
          <div className="p-5 rounded-xl border border-border/60 bg-card shadow-xs hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Kanban & Board Views
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Drag-and-drop task card reordering across custom workflow
              columns powered by dnd-kit.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card shadow-xs hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Real-Time Sync
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Instant presence indicators and live task updates over
              Socket.IO — no page refresh needed.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border/60 bg-card shadow-xs hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Multi-Tenant Security
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Workspace isolation with granular role enforcement (Owner,
              Admin, Member) and audit trails.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 px-6 text-center text-xs text-muted-foreground">
        © 2026 SyncSpace Inc. All rights reserved.
      </footer>
    </div>
  );
}
