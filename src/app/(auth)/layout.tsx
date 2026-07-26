import Link from 'next/link';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { GuestGuard } from '@/features/auth/components/guest-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="relative flex min-h-screen flex-col justify-between bg-background text-foreground transition-colors duration-200">
        {/* Top-Right Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-[440px]">
            {/* Logo & Brand Header */}
            <div className="mb-6 flex justify-center">
              <Link
                href="/"
                className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-sm">
                  S
                </div>
                <span className="font-extrabold text-xl tracking-tight text-foreground">
                  SyncSpace
                </span>
              </Link>
            </div>

            {/* Auth Form Card Shell */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>

        {/* Auth Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SyncSpace Inc. All rights reserved.
        </footer>
      </div>
    </GuestGuard>
  );
}
