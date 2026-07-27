'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, LayoutDashboard, Search, Settings, Users } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

interface SearchCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommandModal({ open, onOpenChange }: SearchCommandModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceId = activeWorkspace?.id;

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const searchItems = [
    {
      title: 'Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      href: workspaceId ? `/workspaces/${workspaceId}` : '/',
    },
    {
      title: 'Projects',
      category: 'Navigation',
      icon: FolderKanban,
      href: workspaceId ? `/workspaces/${workspaceId}/projects` : '/projects',
    },
    {
      title: 'Workspace Members',
      category: 'Navigation',
      icon: Users,
      href: workspaceId ? `/workspaces/${workspaceId}/members` : '/members',
    },
    {
      title: 'Workspace Settings',
      category: 'Navigation',
      icon: Settings,
      href: workspaceId ? `/workspaces/${workspaceId}/settings` : '/settings',
    },
  ];

  const filteredItems = query
    ? searchItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      )
    : searchItems;

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[520px] rounded-2xl overflow-hidden gap-0">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/80 bg-card">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-accent text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
          <span>Navigate with arrows</span>
          <span>Press ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
