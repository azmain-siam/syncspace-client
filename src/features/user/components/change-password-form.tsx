/* eslint-disable react-hooks/incompatible-library */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/types/domain';
import { authApi } from '@/features/auth/api/auth.api';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '../schemas/change-password.schema';
import { useChangePassword } from '../hooks/use-change-password';

interface ChangePasswordFormProps {
  user: UserProfile;
}

export function ChangePasswordForm({ user }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword') || '';
  const newPasswordLength = newPasswordValue.length;

  const isOAuthUser = user.provider === 'GOOGLE';

  const handleRequestPasswordSetLink = async () => {
    if (!user.email) return;
    setIsSendingResetEmail(true);
    try {
      await authApi.forgotPassword({ email: user.email });
      toast.success(
        'Password setup instructions have been sent to your email address.',
        { duration: 6000 },
      );
    } catch {
      toast.error('Failed to send password setup email. Please try again later.');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const onSubmit = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <KeyRound className="h-5 w-5 text-primary" /> Security & Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google OAuth Banner */}
        {isOAuthUser ? (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground">
                  Google Social Account
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account was created via Google Sign-In and does not currently have a local password. If you would like to set a direct password, you can request a setup link.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold gap-1.5 mt-2 cursor-pointer"
                  onClick={handleRequestPasswordSetLink}
                  isLoading={isSendingResetEmail}
                >
                  Send Password Setup Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Session Invalidation Warning Box */
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1 text-left">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Active Session Termination Warning
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed mt-0.5">
                  Changing your password will immediately revoke all other active refresh sessions on other devices and log you out. You will need to sign in again with your new password.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-lg"
                error={!!errors.currentPassword}
                disabled={isOAuthUser}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-lg"
                error={!!errors.newPassword}
                disabled={isOAuthUser}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator Bars */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <div
                className={`h-1 rounded-full ${
                  newPasswordLength > 0 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 rounded-full ${
                  newPasswordLength >= 8 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 rounded-full ${
                  newPasswordLength >= 10 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 rounded-full ${
                  newPasswordLength >= 12 ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Minimum 8 characters (different from current password)
            </p>

            {errors.newPassword && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-lg"
                error={!!errors.confirmPassword}
                disabled={isOAuthUser}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="default"
              className="h-11 font-semibold rounded-lg shadow-xs gap-2 cursor-pointer"
              isLoading={changePasswordMutation.isPending}
              disabled={isOAuthUser}
            >
              <AlertTriangle className="h-4 w-4" /> Update Password & Sign Out
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
