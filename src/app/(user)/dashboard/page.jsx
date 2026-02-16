"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  LogOut,
  Ticket,
  Filter,
  CalendarDays,
  TicketCheck,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { TicketCard } from "@/components/dashboard/ticket-card";
import { useAuth } from "@/context/auth-context";
import { getEvent, subscribeToUserRegistrations } from "@/lib/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToUserRegistrations(user.id, async (regs) => {
      setRegistrations(regs);
      const eventsMap = new Map();
      for (const reg of regs) {
        if (!eventsMap.has(reg.eventId)) {
          const event = await getEvent(reg.eventId);
          if (event) eventsMap.set(reg.eventId, event);
        }
      }
      setEvents(eventsMap);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-violet-50 dark:bg-[#0a0c1c]">
        <div className="flex flex-col items-center gap-4 opacity-0 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-pulse-glow">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          <p className="text-gray-500 dark:text-slate-400">
            Loading your tickets...
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === "All") return true;
    return reg.status === filter;
  });

  const unusedCount = registrations.filter((r) => r.status === "Unused").length;
  const usedCount = registrations.filter((r) => r.status === "Used").length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white dark:from-[#0a0c1c] dark:via-[#0d0f1f] dark:to-[#0a0c1c] text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass-dark">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Ticket<span className="gradient-text">Lelo</span>
            </span>
          </Link>
          <div className="flex gap-3 items-center">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-violet-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 transition-all"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-violet-600" />
                )}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-slate-800/50 border border-violet-200 dark:border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {user.email}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="h-10 gap-2 border-violet-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-white hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="mb-10 opacity-0 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
              Welcome, <span className="gradient-text">{user.fullName}</span>!
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              Your event tickets, all in one place.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                label: "Total Tickets",
                value: registrations.length,
                icon: Ticket,
                color: "from-violet-500 to-purple-500",
                shadow: "shadow-violet-500/20",
                bg: "bg-violet-50 dark:bg-violet-500/10",
              },
              {
                label: "Upcoming",
                value: unusedCount,
                icon: CalendarDays,
                color: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-500/20",
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                label: "Used",
                value: usedCount,
                icon: TicketCheck,
                color: "from-amber-500 to-orange-500",
                shadow: "shadow-amber-500/20",
                bg: "bg-amber-50 dark:bg-amber-500/10",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-5 rounded-2xl border bg-white dark:bg-slate-900/50 border-violet-100 dark:border-slate-800 opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-in-up stagger-4">
            <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            {[
              { key: "All", label: `All (${registrations.length})` },
              { key: "Unused", label: `Upcoming (${unusedCount})` },
              { key: "Used", label: `Used (${usedCount})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.key
                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-500/30"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border border-transparent hover:border-violet-200 dark:hover:border-slate-800 hover:bg-violet-50 dark:hover:bg-slate-900/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tickets Grid */}
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-20 opacity-0 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-violet-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No tickets found
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                {filter === "All"
                  ? "You haven't registered for any events yet."
                  : `No ${filter.toLowerCase()} tickets.`}
              </p>
              {filter === "All" && (
                <Link href="/">
                  <Button className="h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 gap-2">
                    Browse Events
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegistrations.map((registration, i) => {
                const event = events.get(registration.eventId);
                if (!event) return null;
                return (
                  <div
                    key={registration.id}
                    className={`opacity-0 animate-fade-in-up stagger-${Math.min(i + 1, 6)} h-full`}
                  >
                    <TicketCard registration={registration} event={event} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
