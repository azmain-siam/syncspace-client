import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — SyncSpace',
  description: 'SyncSpace privacy policy and personal data management policies.',
};

export default function PrivacyPage() {
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
            <Shield className="h-3.5 w-3.5" /> SECURITY &amp; PRIVACY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last updated: September 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
            <p>
              SyncSpace collects account information such as your name, email address, avatar, and authentication credentials when you create an account or authenticate via OAuth. We also collect workspace metadata, project configurations, task assignments, and activity events required to deliver real-time collaboration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. How We Use Your Data</h2>
            <p>
              Your data is exclusively used to provide and enhance SyncSpace services: synchronizing task state via WebSockets, processing sprint backlogs, routing notifications, and providing secure session management. We do not sell or monetize personal user information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Security &amp; Storage</h2>
            <p>
              Authentication tokens and credentials are encrypted in transit using industry-standard TLS. Tokens stored in browser storage are scoped strictly to your authenticated session. You can revoke sessions and terminate connections at any time via Account Settings or by signing out.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Contact Us</h2>
            <p>
              If you have any questions or data removal requests regarding this Privacy Policy, please reach out to our team at support@syncspace.local.
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
