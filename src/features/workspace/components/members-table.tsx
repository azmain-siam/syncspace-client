'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Crown,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserCog,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { WorkspaceRole, type WorkspaceMember } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceMembers } from '../hooks/use-workspace-members';
import { useRemoveMember } from '../hooks/use-remove-member';
import { useUpdateMemberRole } from '../hooks/use-update-member-role';
import { InviteMemberModal } from './invite-member-modal';
import { TransferOwnershipModal } from './transfer-ownership-modal';
import { RemoveMemberDialog } from './remove-member-dialog';
import { useWorkspacePresence } from '@/features/realtime';

export function MembersTable({ workspaceId }: { workspaceId: string }) {
  const { isUserOnline } = useWorkspacePresence(workspaceId);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [transferMember, setTransferMember] = useState<WorkspaceMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { data: membersResponse, isLoading, isError } = useWorkspaceMembers(workspaceId);

  const removeMemberMutation = useRemoveMember(workspaceId, () => {
    setMemberToRemove(null);
  });
  const updateRoleMutation = useUpdateMemberRole(workspaceId);

  const members = membersResponse?.data || [];
  const currentMember = members.find((m) => m.userId === currentUser?.id);

  const isCurrentUserOwner = currentMember?.role === WorkspaceRole.OWNER;
  const isCurrentUserAdmin = currentMember?.role === WorkspaceRole.ADMIN;
  const canManage = isCurrentUserOwner || isCurrentUserAdmin;

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
            Manage team members, roles, and permission levels for this workspace.
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
            <TableHead className="px-3 sm:px-4">Member</TableHead>
            <TableHead className="px-3 sm:px-4">Role</TableHead>
            <TableHead className="hidden md:table-cell px-4">Joined Date</TableHead>
            {canManage && <TableHead className="text-right px-3 sm:px-4">Actions</TableHead>}
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
            const isTargetOwner = member.role === WorkspaceRole.OWNER;
            const isTargetAdmin = member.role === WorkspaceRole.ADMIN;

            // RBAC canEditMember permissions:
            // - Owner can edit anyone except themselves
            // - Admin can edit Members & Guests, but CANNOT edit Owner or other Admins
            const canEditTargetMember =
              !isSelf &&
              !isTargetOwner &&
              (isCurrentUserOwner || (isCurrentUserAdmin && !isTargetAdmin));

            return (
              <TableRow key={member.id}>
                {/* User Info */}
                <TableCell className="px-3 py-3 sm:p-4">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                        {memberUser?.avatar && (
                          <AvatarImage src={memberUser.avatar} alt={memberUser.name} />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      {isUserOnline(member.userId) && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
                          title="Online now"
                        />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
                        {memberUser?.name || 'User'}{' '}
                        {isSelf && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
                        {memberUser?.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell className="px-3 py-3 sm:p-4">
                  {member.role === WorkspaceRole.OWNER && (
                    <Badge variant="default" className="gap-1 text-[10px] sm:text-xs">
                      <Shield className="h-3 w-3" /> OWNER
                    </Badge>
                  )}
                  {member.role === WorkspaceRole.ADMIN && (
                    <Badge variant="warning" className="gap-1 text-[10px] sm:text-xs">
                      <Shield className="h-3 w-3" /> ADMIN
                    </Badge>
                  )}
                  {member.role === WorkspaceRole.MEMBER && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">MEMBER</Badge>
                  )}
                  {member.role === WorkspaceRole.GUEST && (
                    <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs">
                      GUEST
                    </Badge>
                  )}
                </TableCell>

                {/* Joined Date */}
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground px-4 py-3 sm:p-4">
                  {new Date(member.joinedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Actions Menu */}
                {canManage && (
                  <TableCell className="text-right px-3 py-3 sm:p-4">
                    {canEditTargetMember ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            disabled={updateRoleMutation.isPending || removeMemberMutation.isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Change Role
                          </DropdownMenuLabel>

                          {/* Owner can assign Admin, Member, Guest */}
                          {isCurrentUserOwner && (
                            <>
                              {member.role !== WorkspaceRole.ADMIN && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      memberId: member.userId,
                                      role: WorkspaceRole.ADMIN,
                                    })
                                  }
                                >
                                  <UserCog className="h-4 w-4 mr-2 text-warning" /> Make Admin
                                </DropdownMenuItem>
                              )}
                              {member.role !== WorkspaceRole.MEMBER && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      memberId: member.userId,
                                      role: WorkspaceRole.MEMBER,
                                    })
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-2 text-primary" /> Make Member
                                </DropdownMenuItem>
                              )}
                              {member.role !== WorkspaceRole.GUEST && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      memberId: member.userId,
                                      role: WorkspaceRole.GUEST,
                                    })
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" /> Make Guest
                                </DropdownMenuItem>
                              )}
                            </>
                          )}

                          {/* Admin can toggle Member <-> Guest */}
                          {isCurrentUserAdmin && !isCurrentUserOwner && (
                            <>
                              {member.role === WorkspaceRole.MEMBER && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      memberId: member.userId,
                                      role: WorkspaceRole.GUEST,
                                    })
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" /> Make Guest
                                </DropdownMenuItem>
                              )}
                              {member.role === WorkspaceRole.GUEST && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      memberId: member.userId,
                                      role: WorkspaceRole.MEMBER,
                                    })
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-2 text-primary" /> Make Member
                                </DropdownMenuItem>
                              )}
                            </>
                          )}

                          {/* Transfer Ownership (Owner only) */}
                          {isCurrentUserOwner && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setTransferMember(member)}
                                className="text-amber-600 dark:text-amber-400 focus:text-amber-600"
                              >
                                <Crown className="h-4 w-4 mr-2" /> Transfer Ownership
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* Remove Member */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMemberToRemove(member)}
                            className="text-danger hover:text-danger focus:text-danger"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {isSelf ? '—' : isTargetOwner ? 'Owner' : ''}
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Invite Member Modal */}
      <InviteMemberModal
        workspaceId={workspaceId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        workspaceId={workspaceId}
        member={transferMember}
        open={!!transferMember}
        onOpenChange={(open) => {
          if (!open) setTransferMember(null);
        }}
      />

      {/* Remove Member Confirmation Dialog */}
      <RemoveMemberDialog
        member={memberToRemove}
        open={!!memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
        onConfirm={() => {
          if (memberToRemove) {
            removeMemberMutation.mutate(memberToRemove.userId);
          }
        }}
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  );
}
