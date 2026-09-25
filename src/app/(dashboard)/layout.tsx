'use client';

import * as React from 'react';
import { useState } from 'react';
import { Header } from '@/components/common/header';
import { Sidebar } from '@/components/common/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import { SocketProvider } from '@/providers/socket-provider';
import { NotificationToastListener } from '@/features/notification';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <SocketProvider>
        <NotificationToastListener />
        <div className="flex h-screen h-dvh w-full overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
          {/* Desktop Sidebar Rail */}
          <Sidebar className="hidden lg:flex shrink-0 h-screen h-dvh" />

          {/* Mobile Navigation Drawer Overlay */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent
              side="left"
              className="p-0 w-64 max-w-[85vw] h-full border-r border-border bg-card shadow-2xl"
              hideClose
            >
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} className="w-full h-full border-r-0" />
            </SheetContent>
          </Sheet>

          {/* Main Application Container */}
          <div className="flex flex-1 flex-col min-w-0 h-screen h-dvh overflow-hidden">
            {/* Header */}
            <Header onMenuToggle={() => setMobileMenuOpen(true)} />

            {/* Main View Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SocketProvider>
    </AuthGuard>
  );
}
