'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
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

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="w-full space-y-5 text-center sm:text-left">
        <div className="h-12 w-12 rounded-full bg-success/20 text-success-foreground flex items-center justify-center mx-auto sm:mx-0">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account exists for your email address, we have sent instructions to reset your password.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full h-10 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="pl-9"
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
          className="w-full h-10 font-semibold shadow-sm"
          isLoading={forgotPasswordMutation.isPending}
        >
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
