"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import { signup } from "@/lib/auth";
import {
  Ticket,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  ChevronDown,
  Check,
  Sun,
  Moon,
} from "lucide-react";

/* ─── Country codes ─── */
const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", len: 10 },
  { code: "+1", country: "United States", flag: "🇺🇸", len: 10 },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", len: 10 },
  { code: "+1", country: "Canada", flag: "🇨🇦", len: 10 },
  { code: "+61", country: "Australia", flag: "🇦🇺", len: 9 },
  { code: "+49", country: "Germany", flag: "🇩🇪", len: 11 },
  { code: "+33", country: "France", flag: "🇫🇷", len: 9 },
  { code: "+39", country: "Italy", flag: "🇮🇹", len: 10 },
  { code: "+34", country: "Spain", flag: "🇪🇸", len: 9 },
  { code: "+31", country: "Netherlands", flag: "🇳🇱", len: 9 },
  { code: "+971", country: "UAE", flag: "🇦🇪", len: 9 },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", len: 9 },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", len: 10 },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", len: 10 },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", len: 9 },
  { code: "+977", country: "Nepal", flag: "🇳🇵", len: 10 },
  { code: "+65", country: "Singapore", flag: "🇸🇬", len: 8 },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", len: 10 },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", len: 11 },
  { code: "+81", country: "Japan", flag: "🇯🇵", len: 10 },
];

/* ─── Password strength ─── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    whatsappPhone: z.string().min(8, "Phone number is too short"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const passwordRef = useRef(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: zodResolver(signupSchema) });

  const strength = getPasswordStrength(passwordValue);

  const handlePhoneChange = useCallback(
    (e) => {
      const digits = e.target.value.replace(/\D/g, "");
      const maxLen = selectedCountry.len;
      const trimmed = digits.slice(0, maxLen);
      setPhoneValue(trimmed);
      setValue("whatsappPhone", selectedCountry.code + trimmed, {
        shouldValidate: trimmed.length >= maxLen,
      });
      if (trimmed.length >= maxLen && passwordRef.current) {
        passwordRef.current.focus();
      }
    },
    [selectedCountry, setValue],
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup(
        data.email,
        data.password,
        data.fullName,
        data.whatsappPhone,
      );
      toast.success("Account created successfully!");
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.replace("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed");
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
        <div className="absolute top-32 left-16 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-24 right-12 w-72 h-72 bg-violet-600/15 rounded-full blur-[120px] animate-float"
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
            Join the
            <br />
            <span className="gradient-text">TicketLelo</span> family
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Create your account and start registering for amazing events with
            instant digital tickets.
          </p>
          <div className="mt-10 space-y-3">
            {[
              "Instant QR code tickets",
              "Email delivery of PDF",
              "One-tap check-in",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-slate-200">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md opacity-0 animate-slide-in-right">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
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
            Create Account
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mb-8">
            Start your journey with TicketLelo
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative input-glow rounded-xl">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  placeholder="John Doe"
                  {...register("fullName")}
                  disabled={isLoading}
                  className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
                  className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* WhatsApp Phone with Country Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                WhatsApp Phone
              </label>
              <div className="flex gap-2">
                {/* Country code dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="h-12 px-3 flex items-center gap-1.5 border border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500/50 transition-colors min-w-[100px]"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="font-medium">{selectedCountry.code}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 transition-transform ${countryOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {countryOpen && (
                    <div className="absolute left-0 top-full mt-1 w-64 max-h-56 overflow-y-auto z-50 bg-white dark:bg-slate-900 border border-violet-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-violet-500/10 dark:shadow-black/50">
                      {COUNTRY_CODES.map((c, idx) => (
                        <button
                          key={`${c.code}-${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setCountryOpen(false);
                            setPhoneValue("");
                            setValue("whatsappPhone", "");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors ${
                            selectedCountry === c
                              ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400"
                              : "text-gray-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-lg">{c.flag}</span>
                          <span className="flex-1 text-left">{c.country}</span>
                          <span className="text-gray-400 dark:text-slate-500 font-mono text-xs">
                            {c.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <div className="relative flex-1 input-glow rounded-xl">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    type="tel"
                    placeholder={`${"0".repeat(selectedCountry.len)}`}
                    value={phoneValue}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    maxLength={selectedCountry.len}
                    className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl font-mono tracking-wider"
                  />
                  {/* Length indicator */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-600 font-mono">
                    {phoneValue.length}/{selectedCountry.len}
                  </span>
                </div>
              </div>
              {/* Hidden field for validation */}
              <input type="hidden" {...register("whatsappPhone")} />
              {errors.whatsappPhone && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.whatsappPhone.message}
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
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                  disabled={isLoading}
                  className="h-12 pl-10 pr-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
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

              {/* Strength meter */}
              {passwordValue && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strength.color
                            : "bg-gray-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      strength.score <= 1
                        ? "text-red-500 dark:text-red-400"
                        : strength.score === 2
                          ? "text-amber-500 dark:text-amber-400"
                          : strength.score === 3
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-emerald-500 dark:text-emerald-400"
                    }`}
                  >
                    {strength.label}
                    {strength.score < 4 && (
                      <span className="text-gray-400 dark:text-slate-600 font-normal ml-2">
                        {strength.score <= 1 &&
                          "Add uppercase, numbers & symbols"}
                        {strength.score === 2 &&
                          "Add numbers or special characters"}
                        {strength.score === 3 &&
                          "Almost there! Add a special character"}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative input-glow rounded-xl">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="h-12 pl-10 pr-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.confirmPassword.message}
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
