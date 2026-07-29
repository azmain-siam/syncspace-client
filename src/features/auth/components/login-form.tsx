"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginInput } from "../schemas/login.schema";
import { AuthDivider } from "./auth-divider";
import { SocialAuthButtons } from "./social-auth-buttons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* ─── Left Hero Side (Desktop Only) ─── */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#e0e7ff] via-[#dbeafe] to-[#ecfdf5] dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#020617] p-12 flex-col justify-between relative overflow-hidden border-r border-border/40">
        {/* Top Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-primary-foreground">
            SyncSpace
          </span>
        </div>

        {/* Center Visual Mockup & Hero Copy */}
        <div className="space-y-8 my-auto max-w-lg mx-auto text-center">
          {/* Mockup Tablet Screen */}
          <div className="rounded-2xl border border-white/20 bg-[#09090b] text-white p-4 shadow-2xl space-y-3 text-left transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-white">SyncSpace</span>
              </div>
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">To Do</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Engine keyword optimization
                </div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">In Progress</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Marketing & Application
                </div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">Done</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Create development plan
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground">
              Master your workflow.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Experience a high-fidelity workspace designed for focused
              engineering and creative teams.
            </p>
          </div>
        </div>

        {/* Bottom Left Brand Mark */}
        <div className="text-xs text-white/70 font-semibold">SyncSpace</div>
      </div>

      {/* ─── Right Form Side (Mobile & Desktop) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 min-h-screen bg-background">
        {/* Top Mobile Brand Mark */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            SyncSpace
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-100 mx-auto my-auto space-y-6">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to continue your projects.
            </p>
          </div>

          {/* Social Auth Grid */}
          <SocialAuthButtons />

          {/* Divider */}
          <AuthDivider text="OR CONTINUE WITH EMAIL" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-11"
                  error={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  error={!!errors.password}
                  {...register("password")}
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-xs gap-2 rounded-lg"
              isLoading={loginMutation.isPending}
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="w-full max-w-100 mx-auto pt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
          <div>© {new Date().getFullYear()} SyncSpace</div>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
