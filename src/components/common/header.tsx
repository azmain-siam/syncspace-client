'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileMenu } from '@/features/workspace/components/user-profile-menu';
import { Breadcrumb } from './breadcrumb';
import { SearchCommandModal } from './search-command-modal';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 selection:bg-primary/20 selection:text-primary">
        {/* Left Section: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden h-9 w-9 rounded-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Breadcrumb />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Palette Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-3 h-9 px-3 rounded-lg border border-border/80 bg-background text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all shadow-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search workspace...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-bold text-muted-foreground">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchModalOpen(true)}
            className="sm:hidden h-9 w-9 rounded-lg text-muted-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Online Presence Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Menu Dropdown */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Global Search Command Modal */}
      <SearchCommandModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />
    </>
  );
}
