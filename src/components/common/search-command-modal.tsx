'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CheckSquare,
  Folder,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Loader2,
  MessageSquare,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { useWorkspaceSearch, SearchType } from '@/features/dashboard';

interface SearchCommandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  id: string;
  type: 'NAV';
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface FlatSearchResult {
  id: string;
  type: 'PROJECT' | 'TASK' | 'COMMENT' | 'MEMBER' | 'NAV';
  title: string;
  subtitle?: string;
  category: string;
  href: string;
  badge?: string;
  badgeClass?: string;
  avatar?: string | null;
  key?: string | null;
}

const SEARCH_FILTER_OPTIONS: SegmentedControlOption<SearchType>[] = [
  { value: SearchType.ALL, label: 'All', icon: Layers },
  { value: SearchType.PROJECTS, label: 'Projects', icon: Folder },
  { value: SearchType.TASKS, label: 'Tasks', icon: CheckSquare },
  { value: SearchType.COMMENTS, label: 'Comments', icon: MessageSquare },
  { value: SearchType.MEMBERS, label: 'Members', icon: Users },
];

export function SearchCommandModal({ open, onOpenChange }: SearchCommandModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(SearchType.ALL);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceId = activeWorkspace?.id || '';
  const workspaceSlug = activeWorkspace?.slug || activeWorkspace?.id || '';

  const { data: searchResponse, isSearching, debouncedQuery } = useWorkspaceSearch(
    workspaceId,
    query,
    searchType,
    15,
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery('');
      setSearchType(SearchType.ALL);
      setSelectedIndex(0);
    }
    onOpenChange(newOpen);
  };

  const defaultNavItems: NavItem[] = useMemo(
    () => [
      {
        id: 'nav-dashboard',
        type: 'NAV',
        title: 'Executive Dashboard',
        subtitle: 'Overview KPIs, task progress & team workload',
        category: 'Navigation',
        icon: LayoutDashboard,
        href: workspaceSlug ? `/workspaces/${workspaceSlug}` : '/dashboard',
      },
      {
        id: 'nav-projects',
        type: 'NAV',
        title: 'Projects Directory',
        subtitle: 'Collaborative boards, roadmaps & deliverables',
        category: 'Navigation',
        icon: FolderKanban,
        href: workspaceSlug ? `/workspaces/${workspaceSlug}/projects` : '/dashboard',
      },
      {
        id: 'nav-members',
        type: 'NAV',
        title: 'Members & Roles',
        subtitle: 'Workspace team roster, invitations & roles',
        category: 'Navigation',
        icon: Users,
        href: workspaceSlug ? `/workspaces/${workspaceSlug}/members` : '/dashboard',
      },
      {
        id: 'nav-activity',
        type: 'NAV',
        title: 'Workspace Activity Feed',
        subtitle: 'Live timeline of task moves, comments & events',
        category: 'Navigation',
        icon: Activity,
        href: workspaceSlug ? `/workspaces/${workspaceSlug}/activity` : '/dashboard',
      },
      {
        id: 'nav-settings',
        type: 'NAV',
        title: 'Workspace Settings',
        subtitle: 'Configuration, trash bin & security audit logs',
        category: 'Navigation',
        icon: Settings,
        href: workspaceSlug ? `/workspaces/${workspaceSlug}/settings` : '/dashboard',
      },
    ],
    [workspaceSlug],
  );

  // Flatten search results for unified arrow navigation and rendering
  const flatResults = useMemo<FlatSearchResult[]>(() => {
    if (debouncedQuery.trim().length < 2 || !searchResponse?.results) {
      // Return filtered navigation items when query is short
      const q = query.toLowerCase().trim();
      return defaultNavItems
        .filter((item) => !q || item.title.toLowerCase().includes(q))
        .map((item) => ({
          id: item.id,
          type: 'NAV',
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          href: item.href,
        }));
    }

    const res = searchResponse.results;
    const list: FlatSearchResult[] = [];

    // 1. Projects
    if (res.projects && res.projects.length > 0) {
      res.projects.forEach((p) => {
        list.push({
          id: `project-${p.id}`,
          type: 'PROJECT',
          title: p.title,
          subtitle: p.description || undefined,
          category: 'Projects',
          badge: p.status,
          badgeClass: 'bg-primary/10 text-primary border-primary/25',
          href: `/workspaces/${workspaceSlug}/projects/${p.id}`,
        });
      });
    }

    // 2. Tasks
    if (res.tasks && res.tasks.length > 0) {
      res.tasks.forEach((t) => {
        const boardId = t.column?.board?.id;
        const projectId = t.column?.board?.projectId;
        const taskKeyOrId = t.key || t.id;
        const href = projectId
          ? `/workspaces/${workspaceSlug}/projects/${projectId}?task=${taskKeyOrId}${boardId ? `&tab=boards&board=${boardId}` : ''}`
          : `/tasks/${taskKeyOrId}`;

        list.push({
          id: `task-${t.id}`,
          type: 'TASK',
          title: t.title,
          key: t.key,
          subtitle: t.column?.title
            ? `${t.column.title} • in ${t.column.board?.title || 'Board'}`
            : undefined,
          category: 'Tasks',
          badge: t.status,
          badgeClass:
            t.status === 'DONE'
              ? 'bg-success text-success-foreground border-success/30'
              : 'bg-muted text-foreground border-border',
          href,
        });
      });
    }

    // 3. Comments
    if (res.comments && res.comments.length > 0) {
      res.comments.forEach((c) => {
        list.push({
          id: `comment-${c.id}`,
          type: 'COMMENT',
          title: c.content,
          subtitle: c.task?.title
            ? `on task "${c.task.title}" by ${c.user?.name || 'Someone'}`
            : undefined,
          category: 'Comments',
          avatar: c.user?.avatar,
          href: c.taskId
            ? `/tasks/${c.taskId}`
            : `/workspaces/${workspaceSlug}/projects`,
        });
      });
    }

    // 4. Members
    if (res.members && res.members.length > 0) {
      res.members.forEach((m) => {
        list.push({
          id: `member-${m.memberId || m.id}`,
          type: 'MEMBER',
          title: m.name,
          subtitle: m.email,
          category: 'Members',
          badge: m.role,
          badgeClass:
            m.role === 'OWNER'
              ? 'bg-primary/10 text-primary border-primary/25'
              : 'bg-muted text-muted-foreground border-border',
          avatar: m.avatar,
          href: `/workspaces/${workspaceSlug}/members`,
        });
      });
    }

    return list;
  }, [debouncedQuery, query, searchResponse, defaultNavItems, workspaceSlug]);

  const handleSelect = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelect(selected.href);
      }
    }
  };

  const getItemIcon = (type: FlatSearchResult['type']) => {
    switch (type) {
      case 'PROJECT':
        return Folder;
      case 'TASK':
        return CheckSquare;
      case 'COMMENT':
        return MessageSquare;
      case 'MEMBER':
        return User;
      default:
        return LayoutDashboard;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-[620px] rounded-2xl overflow-hidden gap-0 border border-border bg-card shadow-2xl" hideClose>
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
            placeholder="Search projects, tasks, comments, and members..."
            className="border-0 bg-transparent h-13 text-sm focus:shadow-none focus:border-transparent px-0 focus:ring-0 flex-1 placeholder:text-muted-foreground/70"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0 ml-2" />
          )}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 transition-colors cursor-pointer shrink-0 ml-2 outline-none"
            >
              Clear
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-bold text-muted-foreground shrink-0 ml-2">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Segmented Filter (Shown when searching) */}
        {query.trim().length >= 2 && (
          <div className="px-3 py-2 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <SegmentedControl
              options={SEARCH_FILTER_OPTIONS}
              value={searchType}
              onChange={(type) => {
                setSearchType(type);
                setSelectedIndex(0);
              }}
              className="h-8 p-0.5 rounded-lg text-xs"
            />
            <span className="text-[11px] text-muted-foreground font-medium shrink-0 pr-1">
              {flatResults.length} match{flatResults.length === 1 ? '' : 'es'}
            </span>
          </div>
        )}

        {/* Results Stream */}
        <div className="p-2 max-h-[380px] overflow-y-auto space-y-1">
          {flatResults.length === 0 ? (
            <div className="py-12 text-center select-none space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 border border-border/80 text-muted-foreground mx-auto">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No matching results found
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Try a different keyword or broaden your search filter category.
              </p>
            </div>
          ) : (
            flatResults.map((item, index) => {
              const Icon = getItemIcon(item.type);
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer group outline-none focus:outline-none',
                    isSelected
                      ? 'bg-accent text-foreground'
                      : 'hover:bg-muted/40 text-muted-foreground',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Icon or Avatar */}
                    {item.avatar !== undefined ? (
                      <Avatar className="h-8 w-8 border border-border shrink-0">
                        {item.avatar && <AvatarImage src={item.avatar} alt={item.title} />}
                        <AvatarFallback className="text-[10px] font-bold bg-muted">
                          {item.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/80 text-primary border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    )}

                    {/* Title & Context */}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.key && (
                          <span className="font-mono text-[10px] font-bold text-primary shrink-0">
                            {item.key}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0 h-4 rounded-full uppercase tracking-wider shrink-0',
                              item.badgeClass,
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span className="text-[10px] text-muted-foreground/75 font-semibold uppercase tracking-wider shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span>Navigate <kbd className="font-mono px-1 py-0.5 rounded bg-muted border border-border text-[9px]">↑</kbd> <kbd className="font-mono px-1 py-0.5 rounded bg-muted border border-border text-[9px]">↓</kbd></span>
            <span>•</span>
            <span>Open <kbd className="font-mono px-1 py-0.5 rounded bg-muted border border-border text-[9px]">↵</kbd></span>
          </div>
          <span>Press <kbd className="font-mono px-1 py-0.5 rounded bg-muted border border-border text-[9px]">ESC</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
