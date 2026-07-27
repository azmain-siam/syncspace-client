'use client';

import * as React from 'react';
import { useState } from 'react';
import { Header } from '@/components/common/header';
import { Sidebar } from '@/components/common/sidebar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthGuard } from '@/features/auth/components/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {/* Desktop Sidebar Rail */}
        <Sidebar className="hidden lg:flex shrink-0 h-screen" />

        {/* Mobile Navigation Drawer Overlay */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="p-0 sm:max-w-[280px] h-full rounded-none border-r border-border bg-card">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} className="w-full h-full border-r-0" />
          </DialogContent>
        </Dialog>

        {/* Main Application Container */}
        <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
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
    </AuthGuard>
  );
}
