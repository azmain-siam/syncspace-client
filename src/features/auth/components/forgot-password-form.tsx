'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../schemas/forgot-password.schema';
import { useForgotPassword } from '../hooks/use-forgot-password';

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data);
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

      {/* Centered Card (Image 2) */}
      <div className="w-full max-w-[440px] my-auto">
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6 sm:p-8 text-center space-y-6">
          {/* Top Key Icon Badge */}
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <KeyRound className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enter your email and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {forgotPasswordMutation.isSuccess ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success-foreground text-xs font-semibold">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                Password reset instructions have been sent to your email.
              </div>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full h-11 gap-2 rounded-lg">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11"
                    error={!!errors.email}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-danger font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold shadow-xs gap-2 rounded-lg mt-2"
                isLoading={forgotPasswordMutation.isPending}
              >
                Send Reset Link <ArrowRight className="h-4 w-4" />
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
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Having trouble? <span className="font-semibold text-primary hover:underline cursor-pointer">Contact Support</span>
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
