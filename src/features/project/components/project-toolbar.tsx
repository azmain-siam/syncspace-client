import * as React from 'react';
import {
  ArrowUpDown,
  Filter,
  HeartPulse,
  LayoutGrid,
  Search,
  Table2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectHealth, ProjectPriority } from '@/types/domain';
import { cn } from '@/lib/utils';

export type ProjectSortOption = 'updatedAt' | 'dueDate' | 'title' | 'priority';
export type ProjectStatusTab = 'ALL' | 'ACTIVE' | 'ARCHIVED';

interface ProjectToolbarProps {
  statusTab: ProjectStatusTab;
  onStatusTabChange: (tab: ProjectStatusTab) => void;
  statusCounts: {
    all: number;
    active: number;
    archived: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  healthFilter: string;
  onHealthChange: (health: string) => void;
  sortBy: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function ProjectToolbar({
  statusTab,
  onStatusTabChange,
  statusCounts,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  healthFilter,
  onHealthChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: ProjectToolbarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Quick keyboard shortcut: press '/' to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-3">
      {/* Upper Segment: Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Segment Switcher */}
        <div className="inline-flex items-center rounded-xl p-1 bg-muted/50 border border-border self-start">
          <button
            type="button"
            onClick={() => onStatusTabChange('ALL')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              statusTab === 'ALL'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>All Projects</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                statusTab === 'ALL'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {statusCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusTabChange('ACTIVE')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              statusTab === 'ACTIVE'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>Active</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                statusTab === 'ACTIVE'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {statusCounts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusTabChange('ARCHIVED')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              statusTab === 'ARCHIVED'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>Archived</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                statusTab === 'ARCHIVED'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {statusCounts.archived}
            </span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center rounded-xl p-1 bg-muted/50 border border-border self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid Cards View"
            aria-label="Grid Cards View"
            className={cn(
              'p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium',
              viewMode === 'grid'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Table List View"
            aria-label="Table List View"
            className={cn(
              'p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium',
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden md:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by title, key, lead, or scope..."
            className="pl-9 pr-10 h-9 rounded-xl bg-card border-border/80 text-xs sm:text-sm focus-visible:ring-1"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 h-5 w-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-2 h-5 px-1.5 items-center justify-center text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60 rounded">
              /
            </kbd>
          )}
        </div>

        {/* Dropdowns Group (Single horizontal row with fixed widths) */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          {/* Health Filter */}
          <div className="w-[130px] shrink-0">
            <Select value={healthFilter} onValueChange={onHealthChange}>
              <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-card text-xs font-semibold gap-1.5 cursor-pointer">
                <HeartPulse className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Health" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl text-xs">
                <SelectItem value="ALL">All Health</SelectItem>
                <SelectItem value={ProjectHealth.ON_TRACK}>🟢 On Track</SelectItem>
                <SelectItem value={ProjectHealth.AT_RISK}>🟡 At Risk</SelectItem>
                <SelectItem value={ProjectHealth.OFF_TRACK}>🔴 Off Track</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="w-[135px] shrink-0">
            <Select value={priorityFilter} onValueChange={onPriorityChange}>
              <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-card text-xs font-semibold gap-1.5 cursor-pointer">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl text-xs">
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value={ProjectPriority.URGENT}>Urgent</SelectItem>
                <SelectItem value={ProjectPriority.HIGH}>High</SelectItem>
                <SelectItem value={ProjectPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={ProjectPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Selector */}
          <div className="w-[155px] shrink-0">
            <Select value={sortBy} onValueChange={(val) => onSortChange(val as ProjectSortOption)}>
              <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-card text-xs font-semibold gap-1.5 cursor-pointer">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl text-xs">
                <SelectItem value="updatedAt">Recently Updated</SelectItem>
                <SelectItem value="dueDate">Due Date (Earliest)</SelectItem>
                <SelectItem value="title">Name (A-Z)</SelectItem>
                <SelectItem value="priority">Priority (Urgent First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">
            Showing {filteredCount} of {totalCount} initiatives
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-medium">
              Search: &quot;{searchQuery}&quot;
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-primary/70 cursor-pointer"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {healthFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground">
              Health: {healthFilter.replace('_', ' ')}
              <button
                type="button"
                onClick={() => onHealthChange('ALL')}
                className="hover:text-muted-foreground cursor-pointer"
                aria-label="Remove health filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {priorityFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground">
              Priority: {priorityFilter}
              <button
                type="button"
                onClick={() => onPriorityChange('ALL')}
                className="hover:text-muted-foreground cursor-pointer"
                aria-label="Remove priority filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
