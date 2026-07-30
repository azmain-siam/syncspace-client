'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSelector } from '@/features/workspace/components/workspace-selector';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceSlug = activeWorkspace?.slug || activeWorkspace?.id;

  const navGroups = [
    {
      title: 'MENU',
      items: [
        {
          label: 'Dashboard',
          href: workspaceSlug ? `/workspaces/${workspaceSlug}` : '/',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: 'Projects',
          href: workspaceSlug ? `/workspaces/${workspaceSlug}/projects` : '/projects',
          icon: FolderKanban,
          exact: false,
        },
        {
          label: 'Members',
          href: workspaceSlug ? `/workspaces/${workspaceSlug}/members` : '/members',
          icon: Users,
          exact: false,
        },
        {
          label: 'Activity',
          href: workspaceSlug ? `/workspaces/${workspaceSlug}/activity` : '/activity',
          icon: Activity,
          exact: false,
        },
      ],
    },
    {
      title: 'GENERAL',
      items: [
        {
          label: 'Settings',
          href: workspaceSlug ? `/workspaces/${workspaceSlug}/settings` : '/settings',
          icon: Settings,
          exact: false,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'w-60 bg-card border-r border-border flex flex-col justify-between h-full p-4 selection:bg-primary/20 selection:text-primary',
        className,
      )}
    >
      {/* Top Section */}
      <div className="space-y-6">
        {/* Workspace Selector Dropdown */}
        <WorkspaceSelector />

        {/* Navigation Groups */}
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[2px] before:-translate-y-1/2 before:bg-primary before:rounded-r'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground">Sync Engine</span>
        </div>
        <span className="text-[10px] font-mono opacity-60">v1.0.0</span>
      </div>
    </aside>
  );
}
