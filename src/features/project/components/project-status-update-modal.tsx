'use client';

import * as React from 'react';
import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectHealth } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useCreateProjectStatusUpdate } from '../hooks/use-project-status-updates';

interface ProjectStatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  currentHealth?: ProjectHealth;
  projectTitle?: string;
}

const HEALTH_OPTIONS: Array<{
  value: ProjectHealth;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  activeColor: string;
  badgeColor: string;
  dotColor: string;
}> = [
  {
    value: ProjectHealth.ON_TRACK,
    label: 'On Track',
    description: 'Progressing according to plan and schedule.',
    icon: CheckCircle2,
    activeColor: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  {
    value: ProjectHealth.AT_RISK,
    label: 'At Risk',
    description: 'Obstacles or delays require attention.',
    icon: AlertTriangle,
    activeColor: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  {
    value: ProjectHealth.OFF_TRACK,
    label: 'Off Track',
    description: 'Deadlines breached or critical blockers halted work.',
    icon: XCircle,
    activeColor: 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    dotColor: 'bg-rose-500',
  },
];

export function ProjectStatusUpdateModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  currentHealth = ProjectHealth.ON_TRACK,
  projectTitle,
}: ProjectStatusUpdateModalProps) {
  const [health, setHealth] = useState<ProjectHealth>(currentHealth || ProjectHealth.ON_TRACK);
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useCreateProjectStatusUpdate(workspaceId, projectId, () => {
    setMessage('');
    setValidationError(null);
    onOpenChange(false);
  });

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setMessage('');
      setValidationError(null);
      setHealth(currentHealth || ProjectHealth.ON_TRACK);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setValidationError('Please provide a brief message summarizing progress or blockers.');
      return;
    }

    if (message.trim().length < 5) {
      setValidationError('Status message must be at least 5 characters long.');
      return;
    }

    setValidationError(null);
    mutation.mutate({
      health,
      message: message.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Post Status Update
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {projectTitle
                ? `Update executive health and progress log for ${projectTitle}.`
                : 'Update executive health and record a progress milestone for this project.'}
            </DialogDescription>
          </DialogHeader>

          {/* 1. Health Status Selector */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-foreground">
              Project Health Status
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {HEALTH_OPTIONS.map((option) => {
                const isSelected = health === option.value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setHealth(option.value)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isSelected
                        ? option.activeColor
                        : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">{option.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Message / Progress Summary */}
          <div className="space-y-2">
            <Label htmlFor="status-message" className="text-xs font-bold text-foreground">
              Progress & Blockers Summary
            </Label>
            <Textarea
              id="status-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="E.g., Completed core API integration and migration spike. Blocked on OAuth client registration with Google, contacting platform lead..."
              className="min-h-[100px] text-xs sm:text-sm rounded-xl resize-none"
              error={Boolean(validationError)}
            />
            {validationError ? (
              <p className="text-[11px] text-destructive font-medium">
                {validationError}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                This update will be logged in the project timeline and notify workspace stakeholders.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={mutation.isPending}
              className="rounded-xl text-xs font-semibold cursor-pointer gap-2"
            >
              Post Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
