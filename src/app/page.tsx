"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Cpu,
  Globe,
  Layers,
  LayoutDashboard,
  Menu,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { useMounted } from "@/hooks/use-mounted";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isAuth = mounted && isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-background text-foreground transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
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

          {/* Navigation Links (Desktop) */}
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

          {/* Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg"
                >
                  <Avatar className="h-7 w-7 border border-border">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-3 sm:px-4 py-2 rounded-lg shadow-xs border-t border-white/20 flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <span className="hidden xs:inline">Go to Workspace</span>
                  <span className="xs:hidden">Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all px-3.5 sm:px-4 py-2 rounded-lg shadow-xs border-t border-white/20 active:scale-[0.98]"
                >
                  Start Building
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <SheetHeader className="text-left pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
                  S
                </div>
                <SheetTitle className="font-extrabold text-xl tracking-tight text-foreground">
                  SyncSpace
                </SheetTitle>
              </div>
            </SheetHeader>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Kanban', href: '#kanban' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'About', href: '#company' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom Auth / Action Section */}
          <div className="pt-6 border-t border-border/60 space-y-3">
            {isAuth ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50">
                  <Avatar className="h-8 w-8 border border-border">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {user?.name || 'Account'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs"
                >
                  Go to Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-border font-semibold text-sm text-foreground hover:bg-accent transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs"
                >
                  Start Building Free
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Main Content Landmark ─── */}
      <main id="main-content" className="flex-1">
        {/* ─── 2. Hero Section ─── */}
        <section className="relative px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-6xl mx-auto flex flex-col items-center text-center w-full">
        {/* Top Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-8 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" /> The Workspace for Teams
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] max-w-4xl leading-[1.15] text-foreground break-words">
          The workspace for the{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#6063ee] to-[#7c3aed]">
            next generation
          </span>{" "}
          of teams.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
          SyncSpace brings all your team&apos;s tools into one seamless
          workflow. Spend less time switching contexts and more time building
          what matters.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {isAuth ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto h-11 px-7 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded-lg shadow-sm border-t border-white/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Go to Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-7 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded shadow-sm border-t border-white/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Start for free now <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <a
            href="#pricing"
            className="w-full sm:w-auto h-11 px-6 border border-border bg-card hover:bg-accent text-foreground font-semibold text-sm rounded flex items-center justify-center transition-colors shadow-xs"
          >
            Book a demo
          </a>
        </div>

        {/* ─── Product Showcase Container Card ─── */}
        <div className="mt-10 sm:mt-14 w-full max-w-5xl relative">
          {/* Diffused Aura Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/30 rounded-3xl blur-xl opacity-60 -z-10" />

          {/* Window Shell */}
          <div className="rounded-2xl border border-border/80 bg-[#09090b] text-white shadow-2xl overflow-hidden text-left w-full">
            {/* Window Header */}
            <div className="h-10 px-3 sm:px-4 bg-[#141417] border-b border-white/10 flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-[11px] sm:text-xs font-mono text-white/40 truncate text-center min-w-0 px-2">
                syncspace.app/workspace/engineering
              </div>
              <div className="w-8 sm:w-12 shrink-0" />
            </div>

            {/* Showcase Dashboard Mockup Interior */}
            <div className="p-3.5 sm:p-6 lg:p-8 bg-[#0c0c0e] grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
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
              <div className="md:col-span-3 space-y-4 sm:space-y-6 min-w-0">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-white/50 font-medium truncate">
                      Sprint Progress
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-1">69%</div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "69%" }}
                      />
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-white/50 font-medium truncate">
                      Velocity
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-1">
                      84 pts
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 truncate">
                      ↑ +14% vs last week
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-white/50 font-medium truncate">
                      Open Issues
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-1">12</div>
                    <div className="text-[10px] text-amber-400 mt-1 truncate">
                      4 High Priority
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-white/50 font-medium truncate">
                      Completed
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-1">28</div>
                    <div className="text-[10px] text-emerald-400 mt-1 truncate">
                      Target Met
                    </div>
                  </div>
                </div>

                {/* Sample Kanban Columns Mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Todo */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 min-w-0">
                    <div className="text-xs font-semibold text-white/70 flex justify-between items-center">
                      <span>TODO</span>
                      <span className="text-white/40">3</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                        HIGH
                      </span>
                      <div className="text-xs font-medium text-white truncate">
                        OAuth Refresh Token Logic
                      </div>
                      <div className="text-[10px] text-white/40 truncate">
                        Updated 2h ago
                      </div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 min-w-0">
                    <div className="text-xs font-semibold text-white/70 flex justify-between items-center">
                      <span>IN PROGRESS</span>
                      <span className="text-white/40">2</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        URGENT
                      </span>
                      <div className="text-xs font-medium text-white truncate">
                        Realtime Socket Gateway Sync
                      </div>
                      <div className="text-[10px] text-emerald-400 truncate">
                        ● 3 Users Editing
                      </div>
                    </div>
                  </div>

                  {/* Done */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 min-w-0">
                    <div className="text-xs font-semibold text-white/70 flex justify-between items-center">
                      <span>DONE</span>
                      <span className="text-white/40">5</span>
                    </div>
                    <div className="p-3 rounded bg-[#18181c] border border-white/10 space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        COMPLETED
                      </span>
                      <div className="text-xs font-medium text-white truncate">
                        PostgreSQL Migration Schema
                      </div>
                      <div className="text-[10px] text-white/40 truncate">
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

      {/* ─── 3. Capabilities Highlight Bar ─── */}
      <section className="py-10 sm:py-12 border-y border-border/60 bg-muted/30 text-center px-4 sm:px-6 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6 sm:mb-8">
            ENGINEERED FOR HIGH-VELOCITY AGILE TEAMS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 text-muted-foreground">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Real-time WebSockets
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Interactive Kanban
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Sprint Planning &amp; SP
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Velocity Analytics
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-foreground">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Role Governance
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
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
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
                  1GB Cloud Storage
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/register">
                <button className="w-full h-10 rounded-lg border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-colors cursor-pointer">
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
                <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold shadow-xs border-t border-white/20 transition-colors cursor-pointer">
                  Start Free Trial
                </button>
              </Link>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="p-8 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
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
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> High Availability &amp; Resilient Sync
                </li>
                <li className="flex items-center gap-2.5 text-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Custom
                  Billing
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <a href="#company">
                <button className="w-full h-10 rounded-lg border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-colors cursor-pointer">
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
              href={isAuth ? "/dashboard" : "/register"}
              className="inline-flex h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg shadow-md border-t border-white/20 items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isAuth ? "Open Workspace" : "Start For Free Now"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* ─── 8. Footer ─── */}
      <footer
        id="company"
        className="border-t border-border bg-card py-16 px-6 text-sm"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Col */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                SyncSpace
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              The modern workspace for agile engineering and product teams. Real-time
              collaboration, interactive Kanban boards, and workflow clarity.
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

          {/* Legal Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              LEGAL &amp; POLICIES
            </div>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-border/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div>
            © {new Date().getFullYear()} SyncSpace Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
