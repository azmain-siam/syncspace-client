import Link from 'next/link';
import { ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            S
          </div>
          <span className="font-semibold text-lg tracking-tight">SyncSpace</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8">
          <Zap className="h-3.5 w-3.5" /> Real-time Team Collaboration Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Where modern teams build and ship <span className="text-primary">together.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
          SyncSpace combines high-speed Kanban boards, real-time presence, markdown task modal details, and event-driven notifications into a calm, focused workspace.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
          >
            Start Free Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto h-11 px-6 border border-border bg-card hover:bg-accent hover:text-accent-foreground font-medium rounded-lg flex items-center justify-center transition-colors"
          >
            Sign In to Existing Space
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Interactive Kanban</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-normal">
              Drag-and-drop task card reordering across custom workflow columns powered by dnd-kit.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Real-time Socket Sync</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-normal">
              Instant visual presence indicators and post-commit live updates over Socket.IO.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Enterprise RBAC</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-normal">
              Multi-tenant workspace isolation with granular role enforcement and audit trails.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        © 2026 SyncSpace Inc. All rights reserved.
      </footer>
    </div>
  );
}
