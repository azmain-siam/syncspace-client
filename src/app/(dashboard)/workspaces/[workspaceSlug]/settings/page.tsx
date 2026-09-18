'use client';

import * as React from 'react';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  Building2,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  ShieldAlert,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkspaceVisibility } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import {
  updateWorkspaceSettingsSchema,
  type UpdateWorkspaceSettingsInput,
} from '@/features/workspace/schemas/update-settings.schema';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useUpdateWorkspace } from '@/features/workspace/hooks/use-update-workspace';
import { DeleteWorkspaceDialog } from '@/features/workspace/components/delete-workspace-dialog';
import { LeaveWorkspaceDialog } from '@/features/workspace/components/leave-workspace-dialog';

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading } = useCurrentWorkspace(workspaceSlug);
  const workspaceId = workspace?.id || '';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isOwner = !!(workspace && currentUser && workspace.ownerId === currentUser.id);

  const updateSettingsMutation = useUpdateWorkspace(workspaceId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceSettingsInput>({
    resolver: zodResolver(updateWorkspaceSettingsSchema),
    values: {
      name: workspace?.name || '',
      description: workspace?.description || '',
      logo: workspace?.logo || '',
      visibility: workspace?.visibility || WorkspaceVisibility.PUBLIC,
    },
  });

  const descriptionValue = watch('description') || '';
  const currentVisibility = watch('visibility');

  if (isLoading || !workspace) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit = (data: UpdateWorkspaceSettingsInput) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage workspace preferences, visibility, and team lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/workspaces/${workspaceSlug}/members`}>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <span>Members & Roles</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold rounded-lg">
              <UserIcon className="h-4 w-4 text-primary" />
              <span>Personal Profile →</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Permissions notice if non-owner */}
      {!isOwner && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground flex items-center gap-3">
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>
            Only the <strong>Workspace Owner</strong> can modify general settings and workspace visibility.
          </span>
        </div>
      )}

      {/* Settings Form Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> General Information
          </CardTitle>
          <CardDescription>
            Update your workspace branding and basic attributes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Workspace Name */}
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Workspace Name</Label>
              <Input
                id="settings-name"
                placeholder="Workspace name"
                className="h-11 rounded-lg"
                disabled={!isOwner}
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="settings-description">Description</Label>
                <span className="text-[11px] text-muted-foreground">
                  {descriptionValue.length}/255
                </span>
              </div>
              <Textarea
                id="settings-description"
                placeholder="Briefly describe the purpose of this workspace..."
                className="rounded-lg resize-none min-h-[90px]"
                maxLength={255}
                disabled={!isOwner}
                error={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="settings-logo">Logo Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="settings-logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="pl-10 h-11 rounded-lg"
                  disabled={!isOwner}
                  error={!!errors.logo}
                  {...register('logo')}
                />
              </div>
              {errors.logo && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.logo.message}
                </p>
              )}
            </div>

            {/* Workspace Visibility */}
            <div className="space-y-1.5">
              <Label htmlFor="settings-visibility">Workspace Visibility</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    currentVisibility === WorkspaceVisibility.PUBLIC
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-card opacity-80 hover:opacity-100'
                  } ${!isOwner ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    value={WorkspaceVisibility.PUBLIC}
                    disabled={!isOwner}
                    {...register('visibility')}
                    className="mt-1 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" /> Public
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      Visible to all team members and allows link-based resource sharing.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    currentVisibility === WorkspaceVisibility.PRIVATE
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-card opacity-80 hover:opacity-100'
                  } ${!isOwner ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    value={WorkspaceVisibility.PRIVATE}
                    disabled={!isOwner}
                    {...register('visibility')}
                    className="mt-1 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Private
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      Restricted strictly to explicitly invited members of this workspace.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {isOwner && (
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="h-11 font-semibold rounded-lg shadow-xs"
                  isLoading={updateSettingsMutation.isPending}
                  disabled={!isDirty}
                >
                  Save Settings
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="rounded-2xl border-danger/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-danger">
            <ShieldAlert className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>
            {isOwner
              ? 'Destructive actions for this workspace.'
              : 'Membership actions for this workspace.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwner ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-danger/5 border border-danger/20">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-foreground">
                  Delete Workspace
                </div>
                <div className="text-xs text-muted-foreground">
                  Permanently delete this workspace and all associated projects, boards, and tasks.
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-10 rounded-lg shrink-0 gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Workspace
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-foreground">
                  Leave Workspace
                </div>
                <div className="text-xs text-muted-foreground">
                  Relinquish your access to this workspace and its associated projects.
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setLeaveDialogOpen(true)}
                className="h-10 rounded-lg shrink-0 gap-2"
              >
                <LogOut className="h-4 w-4" /> Leave Workspace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Workspace Confirmation Dialog */}
      {workspace && (
        <DeleteWorkspaceDialog
          workspace={workspace}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}

      {/* Leave Workspace Confirmation Dialog */}
      {workspace && (
        <LeaveWorkspaceDialog
          workspace={workspace}
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
        />
      )}
    </div>
  );
}
