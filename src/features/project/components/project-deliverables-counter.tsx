import * as React from 'react';
import { Columns3, ExternalLink, GitBranch, Link2, Timer, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectDeliverablesCounterProps {
  boardsCount?: number;
  sprintsCount?: number;
  linksCount?: number;
  membersCount?: number;
  repoUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProjectDeliverablesCounter({
  boardsCount,
  sprintsCount,
  linksCount,
  membersCount,
  repoUrl,
  size = 'sm',
  className,
}: ProjectDeliverablesCounterProps) {
  const isSm = size === 'sm';
  const iconSize = isSm ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = isSm ? 'text-[11px]' : 'text-xs';

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex items-center gap-2 flex-wrap text-muted-foreground', className)}>
        {typeof boardsCount === 'number' && boardsCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 font-medium transition-colors cursor-default',
                  textSize,
                )}
              >
                <Columns3 className={cn(iconSize, 'text-primary/70')} />
                <span>{boardsCount}</span>
                <span className="sr-only">boards</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {boardsCount} {boardsCount === 1 ? 'board' : 'boards'}
            </TooltipContent>
          </Tooltip>
        )}

        {typeof sprintsCount === 'number' && sprintsCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 font-medium transition-colors cursor-default',
                  textSize,
                )}
              >
                <Timer className={cn(iconSize, 'text-amber-500/80')} />
                <span>{sprintsCount}</span>
                <span className="sr-only">sprints</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {sprintsCount} active {sprintsCount === 1 ? 'sprint' : 'sprints'}
            </TooltipContent>
          </Tooltip>
        )}

        {typeof linksCount === 'number' && linksCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 font-medium transition-colors cursor-default',
                  textSize,
                )}
              >
                <Link2 className={cn(iconSize, 'text-blue-500/70')} />
                <span>{linksCount}</span>
                <span className="sr-only">links</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {linksCount} documentation {linksCount === 1 ? 'link' : 'links'}
            </TooltipContent>
          </Tooltip>
        )}

        {typeof membersCount === 'number' && membersCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 font-medium transition-colors cursor-default',
                  textSize,
                )}
              >
                <Users className={cn(iconSize, 'text-muted-foreground')} />
                <span>{membersCount}</span>
                <span className="sr-only">members</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {membersCount} team {membersCount === 1 ? 'member' : 'members'}
            </TooltipContent>
          </Tooltip>
        )}

        {repoUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-primary/10 hover:text-primary px-1.5 py-0.5 font-medium transition-colors',
                  textSize,
                )}
              >
                <GitBranch className={iconSize} />
                <span className="max-w-[100px] truncate">Repo</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Open repository ({repoUrl})</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
