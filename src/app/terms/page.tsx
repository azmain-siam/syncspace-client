import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

export const metadata: Metadata = {
  title: 'Terms of Service — SyncSpace',
  description: 'SyncSpace terms of service and workspace acceptable use policies.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 px-6 py-4 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              SyncSpace
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <FileText className="h-3.5 w-3.5" /> LEGAL AGREEMENT
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last updated: September 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SyncSpace, you agree to comply with and be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or legal entity, you represent that you have the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Workspace Roles &amp; Responsibilities</h2>
            <p>
              Workspace Owners and Administrators hold governance over workspace membership, access permissions, invitations, and project configurations. Users agree to maintain accurate account information and safeguard their credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Acceptable Use</h2>
            <p>
              You agree not to abuse the real-time collaboration gateway, transmit malicious code, attempt unauthorized access to other workspaces or infrastructure, or violate applicable local, national, or international regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Termination</h2>
            <p>
              You may terminate your account or leave any workspace at any time. SyncSpace reserves the right to suspend or terminate accounts that breach these terms or compromise platform integrity.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SyncSpace Inc. All rights reserved.
      </footer>
    </div>
  );
}
