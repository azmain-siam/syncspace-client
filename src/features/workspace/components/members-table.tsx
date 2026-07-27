'use client';

import * as React from 'react';
import { useState } from 'react';
import { MoreHorizontal, Shield, ShieldAlert, Trash2, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkspaceRole } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceMembers } from '../hooks/use-workspace-members';
import { useRemoveMember } from '../hooks/use-remove-member';
import { useUpdateMemberRole } from '../hooks/use-update-member-role';
import { InviteMemberModal } from './invite-member-modal';

export function MembersTable({ workspaceId }: { workspaceId: string }) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { data: membersResponse, isLoading, isError } = useWorkspaceMembers(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);

  const members = membersResponse?.data || [];
  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const canManage =
    currentMember?.role === WorkspaceRole.OWNER ||
    currentMember?.role === WorkspaceRole.ADMIN;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted/40 animate-pulse rounded-xl" />
        <div className="h-64 w-full bg-card animate-pulse rounded-2xl border border-border/80" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center rounded-2xl border border-border bg-card space-y-3">
        <ShieldAlert className="h-8 w-8 text-danger mx-auto" />
        <h3 className="text-base font-bold text-foreground">Failed to load members</h3>
        <p className="text-xs text-muted-foreground">
          You may not have permission to view members for this workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Workspace Members
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage team members and role permissions for this workspace.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="h-10 font-semibold rounded-lg shadow-xs gap-2 shrink-0"
          >
            <UserCheck className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      {/* Members Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Joined Date</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const memberUser = member.user;
            const initials = memberUser?.name
              ? memberUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'U';

            const isSelf = member.userId === currentUser?.id;
            const isOwner = member.role === WorkspaceRole.OWNER;

            return (
              <TableRow key={member.id}>
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {memberUser?.avatar && (
                        <AvatarImage src={memberUser.avatar} alt={memberUser.name} />
                      )}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {memberUser?.name || 'User'}{' '}
                        {isSelf && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {memberUser?.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  {member.role === WorkspaceRole.OWNER && (
                    <Badge variant="default" className="gap-1">
                      <Shield className="h-3 w-3" /> OWNER
                    </Badge>
                  )}
                  {member.role === WorkspaceRole.ADMIN && (
                    <Badge variant="warning" className="gap-1">
                      <Shield className="h-3 w-3" /> ADMIN
                    </Badge>
                  )}
                  {member.role === WorkspaceRole.MEMBER && (
                    <Badge variant="secondary">MEMBER</Badge>
                  )}
                </TableCell>

                {/* Joined Date */}
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Actions Menu */}
                {canManage && (
                  <TableCell className="text-right">
                    {!isOwner && !isSelf && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-44">
                          {member.role === WorkspaceRole.MEMBER ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateRoleMutation.mutate({
                                  memberId: member.id,
                                  role: WorkspaceRole.ADMIN,
                                })
                              }
                            >
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                updateRoleMutation.mutate({
                                  memberId: member.id,
                                  role: WorkspaceRole.MEMBER,
                                })
                              }
                            >
                              Make Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => removeMemberMutation.mutate(member.userId)}
                            className="text-danger hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <InviteMemberModal
        workspaceId={workspaceId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}
