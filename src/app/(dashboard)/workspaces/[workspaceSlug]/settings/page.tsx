'use client';

import * as React from 'react';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  updateWorkspaceSettingsSchema,
  type UpdateWorkspaceSettingsInput,
} from '@/features/workspace/schemas/update-settings.schema';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { useUpdateWorkspace } from '@/features/workspace/hooks/use-update-workspace';

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading } = useCurrentWorkspace(workspaceSlug);
  const workspaceId = workspace?.id || '';

  const updateSettingsMutation = useUpdateWorkspace(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateWorkspaceSettingsInput>({
    resolver: zodResolver(updateWorkspaceSettingsSchema),
    defaultValues: {
      name: workspace?.name || '',
      logo: workspace?.logo || '',
    },
  });

  React.useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        logo: workspace.logo || '',
      });
    }
  }, [workspace, reset]);

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Update general preferences and branding for this workspace.
        </p>
      </div>

      {/* Settings Form Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> General Information
          </CardTitle>
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
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="settings-logo">Logo Image URL</Label>
              <div className="relative">
                <Image className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="settings-logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="pl-10 h-11 rounded-lg"
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

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                className="h-11 font-semibold rounded-lg shadow-xs"
                isLoading={updateSettingsMutation.isPending}
              >
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="rounded-2xl border-danger/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-danger">
            <ShieldAlert className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-danger/5 border border-danger/20">
            <div>
              <div className="font-bold text-sm text-foreground">
                Delete Workspace
              </div>
              <div className="text-xs text-muted-foreground">
                Permanently delete this workspace and all associated projects, boards, and tasks.
              </div>
            </div>
            <Button variant="destructive" className="h-10 rounded-lg shrink-0">
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
