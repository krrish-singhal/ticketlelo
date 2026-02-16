"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/lib/auth";
import {
  Ticket,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = await login(data.email, data.password);
      toast.success("Logged in successfully!");
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (userData?.isAdmin) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-violet-50 via-white to-white dark:from-[#0a0c1c] dark:via-[#0d0f1f] dark:to-[#0a0c1c] text-gray-900 dark:text-white transition-colors">
      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-5 right-5 z-50 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-violet-500" />
          )}
        </button>
      )}

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950" style={{backgroundSize: '400% 400%', animation: 'gradientShift 12s ease infinite'}} />
        <div className="absolute inset-0 dots-bg opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative z-10 max-w-md px-12 opacity-0 animate-slide-in-left">
          <Image
            src="/logo.png"
            alt="TicketLelo"
            width={64}
            height={64}
            className="rounded-2xl mb-8 shadow-2xl shadow-violet-500/30"
          />
          <h2 className="text-4xl font-extrabold mb-4 leading-tight text-white">
            Welcome back to
            <br />
            <span className="gradient-text">TicketLelo</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Access your tickets, manage registrations, and never miss an event.
          </p>
          <div className="mt-10 flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${i === 1 ? "w-8 bg-violet-500" : "w-4 bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md opacity-0 animate-slide-in-right">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <Image
              src="/logo.png"
              alt="TicketLelo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Ticket<span className="gradient-text">Lelo</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative input-glow rounded-xl">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative input-glow rounded-xl">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                  className="h-12 pl-10 pr-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all rounded-xl gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
