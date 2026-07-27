import { ThemeToggle } from '@/components/common/theme-toggle';
import { GuestGuard } from '@/features/auth/components/guest-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
        {/* Floating Top-Right Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex w-full">
          {children}
        </div>
      </div>
    </GuestGuard>
  );
}
