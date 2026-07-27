'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '../schemas/reset-password.schema';
import { useResetPassword } from '../hooks/use-reset-password';

export function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen bg-muted/20 flex flex-col justify-between items-center p-4 sm:p-6 text-foreground">
      {/* Top Brand Mark */}
      <div className="pt-6 pb-2 text-center flex flex-col items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
          <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-xs">
            S
          </div>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-foreground">
          SyncSpace
        </span>
      </div>

      {/* Centered Card */}
      <div className="w-full max-w-[440px] my-auto">
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Set new password
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Please enter your new password below to secure your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <input type="hidden" {...register('token')} />

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  error={!!errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
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

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-xs gap-2 rounded-lg mt-2"
              isLoading={resetPasswordMutation.isPending}
            >
              Update Password <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="pt-3 border-t border-border/60 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-extrabold text-foreground tracking-tight">SyncSpace</div>
        <div className="flex flex-wrap items-center gap-6">
          <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
          <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
          <span className="hover:text-foreground cursor-pointer">Security</span>
          <span className="hover:text-foreground cursor-pointer">Help Center</span>
        </div>
        <div>© {new Date().getFullYear()} SyncSpace Technologies. All rights reserved.</div>
      </footer>
    </div>
  );
}
