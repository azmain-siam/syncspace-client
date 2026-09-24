'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flag,
  Layers,
  ListTodo,
  Plus,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProjectBoards } from '@/features/board/hooks/use-project-boards';
import { CreateTaskModal } from '@/features/task/components/create-task-modal';
import { TaskDetailSheet } from '@/features/task/components/task-detail-sheet';
import { useProjectSprints } from '../hooks/use-project-sprints';
import { useSprintDetails } from '../hooks/use-sprint-details';
import { useSprintSocket } from '../hooks/use-sprint-socket';
import type { Sprint, SprintTask } from '../types/sprint.types';
import { SprintCard } from './sprint-card';
import { SprintTaskItem } from './sprint-task-item';
import { BacklogSection } from './backlog-section';
import { CreateSprintModal } from './create-sprint-modal';

interface SprintBacklogViewProps {
  workspaceId: string;
  projectId: string;
  canManage?: boolean;
}

/**
 * Inner component to render the task list for a sprint, fetching tasks if not present in the sprint summary.
 */
function SprintTasksList({
  sprint,
  projectId,
  allSprints,
  onSelectTask,
  canManage,
  onQuickAddTask,
}: {
  sprint: Sprint;
  projectId: string;
  allSprints: Sprint[];
  onSelectTask?: (taskId: string) => void;
  canManage?: boolean;
  onQuickAddTask?: () => void;
}) {
  const needsFetch = !sprint.tasks;
  const { data: detailRes, isLoading } = useSprintDetails(
    needsFetch ? sprint.id : null,
  );

  const tasks = sprint.tasks || detailRes?.data?.tasks || [];

  if (isLoading && needsFetch) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-12 w-full rounded-xl bg-muted/40 animate-pulse border border-border/40"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center bg-background/50">
        <Layers className="h-7 w-7 text-muted-foreground/40 mb-1.5" />
        <p className="text-xs font-semibold text-foreground">
          No tasks planned in this sprint
        </p>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
          Move items here from the product backlog below or create a new issue.
        </p>
        {onQuickAddTask && canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={onQuickAddTask}
            className="mt-3 gap-1.5 h-7 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task: SprintTask) => (
        <SprintTaskItem
          key={task.id}
          task={task}
          projectId={projectId}
          sprints={allSprints}
          currentSprintId={sprint.id}
          onSelectTask={onSelectTask}
          canManage={canManage}
        />
      ))}
    </div>
  );
}

export function SprintBacklogView({
  workspaceId,
  projectId,
  canManage = true,
}: SprintBacklogViewProps) {
  // Subscribe to real-time sprint Socket.IO updates
  useSprintSocket(projectId);

  // Queries
  const { data: sprintsRes, isLoading: sprintsLoading } = useProjectSprints(projectId);
  const { data: boardsRes } = useProjectBoards(workspaceId, projectId);

  const sprints = React.useMemo(() => sprintsRes?.data?.data || [], [sprintsRes?.data?.data]);
  const boards = boardsRes?.data || [];
  const firstBoard = boards[0];
  const firstColumn = firstBoard?.columns?.[0];

  // Modals state
  const [isCreateSprintOpen, setIsCreateSprintOpen] = React.useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Expanded/collapsed states for sprints
  const [expandedSprints, setExpandedSprints] = React.useState<Record<string, boolean>>({});
  const [showCompletedSprints, setShowCompletedSprints] = React.useState(false);

  // Identify active sprint, planned sprints, and completed sprints
  const activeSprint = React.useMemo(() => {
    return sprints.find((s) => s.status === 'ACTIVE') || null;
  }, [sprints]);

  const plannedSprints = React.useMemo(() => {
    return sprints.filter((s) => s.status === 'PLANNING');
  }, [sprints]);

  const completedSprints = React.useMemo(() => {
    return sprints.filter((s) => s.status === 'COMPLETED');
  }, [sprints]);

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: prev[sprintId] !== undefined ? !prev[sprintId] : false,
    }));
  };

  const handleOpenCreateTask = () => {
    if (!firstBoard || !firstColumn) {
      toast.info('Please create a board column first in the Boards tab to add issues.');
      return;
    }
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Flag className="h-6 w-6 text-primary" />
            Sprints & Backlog Planning
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Plan Scrum iterations, track story point velocity, and triage your backlog.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {canManage && (
            <Button
              onClick={() => setIsCreateSprintOpen(true)}
              className="gap-2 h-9 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Create Sprint
            </Button>
          )}
        </div>
      </div>

      {/* Sprints Section */}
      <div className="space-y-4">
        {sprintsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 w-full rounded-2xl bg-card border border-border/70 animate-pulse"
              />
            ))}
          </div>
        ) : sprints.length > 0 ? (
          <div className="space-y-4">
            {/* 1. Active Sprint */}
            {activeSprint && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Current Active Sprint
                </div>
                <SprintCard
                  sprint={activeSprint}
                  projectId={projectId}
                  activeSprint={activeSprint}
                  futureSprints={plannedSprints}
                  isExpanded={expandedSprints[activeSprint.id] !== false}
                  onToggleExpand={() => toggleExpand(activeSprint.id)}
                  canManageSprint={canManage}
                  onQuickAddTask={handleOpenCreateTask}
                >
                  <SprintTasksList
                    sprint={activeSprint}
                    projectId={projectId}
                    allSprints={sprints}
                    onSelectTask={setSelectedTaskId}
                    canManage={canManage}
                    onQuickAddTask={handleOpenCreateTask}
                  />
                </SprintCard>
              </div>
            )}

            {/* 2. Planned Sprints */}
            {plannedSprints.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ListTodo className="h-3.5 w-3.5" />
                  Upcoming Planned Sprints ({plannedSprints.length})
                </div>
                {plannedSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    projectId={projectId}
                    activeSprint={activeSprint}
                    futureSprints={plannedSprints}
                    isExpanded={expandedSprints[sprint.id] !== false}
                    onToggleExpand={() => toggleExpand(sprint.id)}
                    canManageSprint={canManage}
                    onQuickAddTask={handleOpenCreateTask}
                  >
                    <SprintTasksList
                      sprint={sprint}
                      projectId={projectId}
                      allSprints={sprints}
                      onSelectTask={setSelectedTaskId}
                      canManage={canManage}
                      onQuickAddTask={handleOpenCreateTask}
                    />
                  </SprintCard>
                ))}
              </div>
            )}

            {/* 3. Completed Sprints Accordion */}
            {completedSprints.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletedSprints((prev) => !prev)}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1.5"
                >
                  {showCompletedSprints ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                  Completed Sprints ({completedSprints.length})
                </button>

                {showCompletedSprints && (
                  <div className="space-y-3 pt-2 pl-2 sm:pl-4 border-l-2 border-purple-500/20 mt-1">
                    {completedSprints.map((sprint) => (
                      <SprintCard
                        key={sprint.id}
                        sprint={sprint}
                        projectId={projectId}
                        activeSprint={activeSprint}
                        futureSprints={plannedSprints}
                        isExpanded={Boolean(expandedSprints[sprint.id])}
                        onToggleExpand={() => toggleExpand(sprint.id)}
                        canManageSprint={canManage}
                      >
                        <SprintTasksList
                          sprint={sprint}
                          projectId={projectId}
                          allSprints={sprints}
                          onSelectTask={setSelectedTaskId}
                          canManage={canManage}
                        />
                      </SprintCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty Sprints Callout */
          <Card className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-foreground text-base">
                No Sprints Created Yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Start your team&apos;s agile planning cycle by creating your first sprint. You can then assign tasks from the backlog below.
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => setIsCreateSprintOpen(true)}
                className="mt-2 gap-1.5 h-9 text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                Create First Sprint
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Product Backlog Section */}
      <div className="pt-4">
        <BacklogSection
          projectId={projectId}
          workspaceId={workspaceId}
          sprints={sprints}
          onSelectTask={setSelectedTaskId}
          onOpenCreateTaskModal={handleOpenCreateTask}
          canManage={canManage}
        />
      </div>

      {/* Create Sprint Modal */}
      <CreateSprintModal
        open={isCreateSprintOpen}
        onOpenChange={setIsCreateSprintOpen}
        projectId={projectId}
        defaultSprintNumber={sprints.length + 1}
      />

      {/* Create Task Modal (if columns exist) */}
      {firstBoard && firstColumn && (
        <CreateTaskModal
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          workspaceId={workspaceId}
          projectId={projectId}
          boardId={firstBoard.id}
          columnId={firstColumn.id}
          columns={firstBoard.columns}
        />
      )}

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskIdOrKey={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        workspaceId={workspaceId}
        projectId={projectId}
        boardId={firstBoard?.id}
        canManage={canManage}
      />
    </div>
  );
}
