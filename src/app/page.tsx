"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layers,
  LayoutDashboard,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
      {/* ─── 1. Header Bar ─── */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 py-3.5 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              SyncSpace
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#kanban"
              className="hover:text-foreground transition-colors"
            >
              Kanban
            </a>
            <a
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#company"
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-4 py-2 rounded shadow-sm border-t border-white/20 active:scale-[0.98]"
            >
              Start Building
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. Hero Section ─── */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Top Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-8 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" /> The Workspace for Teams
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] max-w-4xl leading-[1.15] text-foreground">
          The workspace for the{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#6063ee] to-[#7c3aed]">
            next generation
          </span>{" "}
          of teams.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
          SyncSpace brings all your team&apos;s tools into one seamless
          workflow. Spend less time switching contexts and more time building
          what matters.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto h-11 px-7 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded shadow-sm border-t border-white/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Start for free now <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto h-11 px-6 border border-border bg-card hover:bg-accent text-foreground font-semibold text-sm rounded flex items-center justify-center transition-colors shadow-xs"
          >
            Book a demo
          </a>
        </div>

        {/* ─── Product Showcase Container Card ─── */}
        <div className="mt-14 w-full max-w-5xl relative">
          {/* Diffused Aura Glow Background */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/30 rounded-3xl blur-2xl opacity-60 -z-10" />

          {/* Window Shell */}
          <div className="rounded-2xl border border-border/80 bg-[#09090b] text-white shadow-2xl overflow-hidden text-left">
            {/* Window Header */}
            <div className="h-10 px-4 bg-[#141417] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs font-mono text-white/40">
                syncspace.app/workspace/engineering
              </div>
              <div className="w-12" />
            </div>

            {/* Showcase Dashboard Mockup Interior */}
            <div className="p-6 sm:p-8 bg-[#0c0c0e] grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left Mini Sidebar */}
              <div className="hidden md:flex flex-col space-y-4 border-r border-white/10 pr-6">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <LayoutDashboard className="h-4 w-4 text-primary" />{" "}
                  Engineering
                </div>
                <div className="space-y-1 text-xs font-medium text-white/60">
                  <div className="p-2 rounded bg-white/10 text-white font-semibold flex items-center justify-between">
                    <span>Sprint 42</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="p-2 hover:bg-white/5 rounded transition-colors">
                    Kanban Board
                  </div>
                  <div className="p-2 hover:bg-white/5 rounded transition-colors">
                    Team Activity
                  </div>
                  <div className="p-2 hover:bg-white/5 rounded transition-colors">
                    Backlog
                  </div>
                  <div className="p-2 hover:bg-white/5 rounded transition-colors">
                    Analytics
                  </div>
                </div>
              </div>

              {/* Main Preview Content */}
              <div className="md:col-span-3 space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-white/50 font-medium">
                      Sprint Progress
                    </div>
                    <div className="text-xl font-bold text-white mt-1">69%</div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "69%" }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-white/50 font-medium">
                      Velocity
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      84 pts
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      ↑ +14% vs last week
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-white/50 font-medium">
                      Open Issues
                    </div>
                    <div className="text-xl font-bold text-white mt-1">12</div>
                    <div className="text-[10px] text-amber-400 mt-1">
                      4 High Priority
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-white/50 font-medium">
                      Completed
                    </div>
                    <div className="text-xl font-bold text-white mt-1">28</div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Target Met
                    </div>
                  </div>
                </div>

                {/* Sample Kanban Columns Mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Todo */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-xs font-semibold text-white/70 flex justify-between">
                      <span>TODO</span>
                      <span className="text-white/40">3</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                        HIGH
                      </span>
                      <div className="text-xs font-medium text-white">
                        OAuth Refresh Token Logic
                      </div>
                      <div className="text-[10px] text-white/40">
                        Updated 2h ago
                      </div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-xs font-semibold text-white/70 flex justify-between">
                      <span>IN PROGRESS</span>
                      <span className="text-white/40">2</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        URGENT
                      </span>
                      <div className="text-xs font-medium text-white">
                        Realtime Socket Gateway Sync
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        ● 3 Users Editing
                      </div>
                    </div>
                  </div>

                  {/* Done */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-xs font-semibold text-white/70 flex justify-between">
                      <span>DONE</span>
                      <span className="text-white/40">5</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        COMPLETED
                      </span>
                      <div className="text-xs font-medium text-white">
                        PostgreSQL Migration Schema
                      </div>
                      <div className="text-[10px] text-white/40">
                        Merged to main
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Trust Bar ─── */}
      <section className="py-12 border-y border-border/60 bg-muted/30 text-center px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-8">
            TRUSTED BY HIGH-PERFORMING TEAMS AT
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <Cpu className="h-5 w-5" /> Acme Corp
            </div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <Zap className="h-5 w-5" /> Vercel
            </div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <Globe className="h-5 w-5" /> Supabase
            </div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <Layers className="h-5 w-5" /> Linear
            </div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <Code2 className="h-5 w-5" /> Raycast
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Feature Grid ─── */}
      <section
        id="features"
        className="py-24 px-6 max-w-6xl mx-auto text-center"
      >
        <div className="space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything you need to ship faster.
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Powerful features that adapt to your team&apos;s unique workflow,
            not the other way around.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Real-time collaboration
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Work together seamlessly with live presence indicators, instant
              comments, and automated change synchronization across all devices.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Project Planning
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Organize complex sprints, map out long-term roadmaps, and track
              milestone dependencies with zero friction.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-6">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Task Management
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Keep work organized with customizable workflow columns, subtasks,
              priorities, and rich markdown detail view overlays.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mb-6">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Activity tracking
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Real-time dashboard insights into velocity, sprint distribution,
                and workload allocation across team members.
              </p>
            </div>

            {/* Embedded Mini Area Chart Graphic */}
            <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-foreground">Productivity Growth</span>
                <span className="text-emerald-500 font-bold">+24.8%</span>
              </div>
              <svg className="w-full h-16" viewBox="0 0 300 60">
                <path
                  d="M0,50 Q40,45 80,30 T160,25 T240,15 T300,5 L300,60 L0,60 Z"
                  fill="url(#indigoGradient)"
                  opacity="0.2"
                />
                <path
                  d="M0,50 Q40,45 80,30 T160,25 T240,15 T300,5"
                  fill="none"
                  stroke="#4648d4"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient
                    id="indigoGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4648d4" />
                    <stop offset="100%" stopColor="#4648d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Kanban Deep Dive Section ─── */}
      <section
        id="kanban"
        className="py-20 px-6 bg-muted/20 border-y border-border/60"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Seamless Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              The Kanban experience, refined.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We&apos;ve reimagined the traditional task board for modern
              software teams. Drag and drop with zero latency, customize
              workflow stages, and collaborate in real time.
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                Real-time task reordering & status sync
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                Customizable workflow stage columns
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                Rich task details with markdown & file attachments
              </li>
            </ul>

            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Explore Kanban Features <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-lg relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="font-bold text-base text-foreground">
                  Sprint Kanban Board
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                  Live Sync
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Implement JWT Refresh Rotation
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Assigned to Alex Doe
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                    IN PROGRESS
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Socket Room Gateways
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Assigned to Sarah Chen
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-warning/10 text-warning-foreground text-[10px] font-bold">
                    REVIEW
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Prisma PostgreSQL Schema
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Assigned to John Smith
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-success/10 text-success-foreground text-[10px] font-bold">
                    DONE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Pricing Section ─── */}
      <section
        id="pricing"
        className="py-24 px-6 max-w-6xl mx-auto text-center"
      >
        <div className="space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Simple, transparent pricing.
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Start for free, upgrade when your team grows. No hidden fees.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly",
                )
              }
              className="w-12 h-6 rounded-full bg-primary/20 p-1 flex items-center transition-colors"
            >
              <div
                className={`h-4 w-4 rounded-full bg-primary transition-transform ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span
              className={`text-xs font-semibold ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly{" "}
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Starter Card */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Starter</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Perfect for small teams and side projects.
                </p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                $0{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  / month
                </span>
              </div>
              <ul className="space-y-3 text-xs font-medium text-muted-foreground border-t border-border pt-6">
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Up to
                  5 Team Members
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Unlimited Kanban Boards
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Real-time Socket Sync
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-muted-foreground/40 shrink-0" />{" "}
                  1GB Cloud Storage
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/register">
                <button className="w-full h-10 rounded border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-colors">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>

          {/* Pro Card (FEATURED) */}
          <div className="p-8 rounded-2xl border-2 border-primary bg-card shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              MOST POPULAR
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For growing teams that need workspace power.
                </p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                ${billingCycle === "yearly" ? "10" : "12"}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  / user / month
                </span>
              </div>
              <ul className="space-y-3 text-xs font-medium text-muted-foreground border-t border-border pt-6">
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Unlimited Team Members
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Advanced Analytics & Reports
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Cloudinary File Attachments
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Priority Support
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/register">
                <button className="w-full h-10 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold shadow-xs border-t border-white/20 transition-colors">
                  Start Free Trial
                </button>
              </Link>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Enterprise
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For large organizations requiring custom scale.
                </p>
              </div>
              <div className="text-4xl font-extrabold text-foreground">
                Custom
              </div>
              <ul className="space-y-3 text-xs font-medium text-muted-foreground border-t border-border pt-6">
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  Dedicated Account Manager
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Custom
                  SSO & Audit Logs
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> 99.9%
                  SLA Uptime
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Custom
                  Billing
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <a href="#company">
                <button className="w-full h-10 rounded border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-colors">
                  Contact Sales
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Dark CTA Banner ─── */}
      <section className="py-20 px-6 bg-[#09090b] text-white border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to build better?
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto">
            Join thousands of high-performing teams who have already upgraded
            their workflow.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded shadow-md border-t border-white/20 items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Start For Free Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. Footer ─── */}
      <footer
        id="company"
        className="border-t border-border bg-card py-16 px-6 text-sm"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                SyncSpace
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              The workspace for the next generation of teams. Real-time
              collaboration, Kanban boards, and workflow clarity.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              PRODUCT
            </div>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#kanban"
                  className="hover:text-foreground transition-colors"
                >
                  Kanban Board
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              PLATFORM
            </div>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Realtime Gateway
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  REST API
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Security
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Status Page
                </span>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              COMPANY
            </div>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  About Us
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Careers
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-border/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div>
            © {new Date().getFullYear()} SyncSpace Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
