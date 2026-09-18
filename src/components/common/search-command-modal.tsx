'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, LayoutDashboard, Search, Settings, Users } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

interface SearchCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommandModal({ open, onOpenChange }: SearchCommandModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceSlug = activeWorkspace?.slug || activeWorkspace?.id;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
    onOpenChange(newOpen);
  };

  const searchItems = [
    {
      title: 'Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      href: workspaceSlug ? `/workspaces/${workspaceSlug}` : '/dashboard',
    },
    {
      title: 'Projects',
      category: 'Navigation',
      icon: FolderKanban,
      href: workspaceSlug ? `/workspaces/${workspaceSlug}/projects` : '/dashboard',
    },
    {
      title: 'Workspace Members',
      category: 'Navigation',
      icon: Users,
      href: workspaceSlug ? `/workspaces/${workspaceSlug}/members` : '/dashboard',
    },
    {
      title: 'Workspace Settings',
      category: 'Navigation',
      icon: Settings,
      href: workspaceSlug ? `/workspaces/${workspaceSlug}/settings` : '/dashboard',
    },
  ];

  const filteredItems = query
    ? searchItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      )
    : searchItems;

  const handleSelect = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        handleSelect(selected.href);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-[520px] rounded-2xl overflow-hidden gap-0">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/80 bg-card">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search workspace..."
            className="border-0 bg-transparent h-12 text-sm focus:shadow-none focus:border-transparent px-0 focus:ring-0"
            autoFocus
          />
        </div>

        {/* Results Stream */}
        <div className="p-2 max-h-[320px] overflow-y-auto space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching workspace results found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.title}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer group',
                    isSelected ? 'bg-accent text-foreground' : 'hover:bg-accent text-muted-foreground',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with arrows (↑ ↓) • Enter to select</span>
          <span>Press ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
