"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/forms/registration-form";
import { getActiveEvents } from "@/lib/firestore";
import {
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  QrCode,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const activeEvents = await getActiveEvents();
        setEvents(activeEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const handleEventSelect = (event) => setSelectedEvent(event);
  const handleBack = () => setSelectedEvent(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white dark:from-[#0a0c1c] dark:via-[#0d0f1f] dark:to-[#0a0c1c] text-gray-900 dark:text-white transition-colors">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 glass-dark">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-[2.5px] shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-110 transition-all duration-300">
              <div className="w-full h-full rounded-[13px] overflow-hidden bg-white dark:bg-slate-900">
                <Image
                  src="/logo.png"
                  alt="TicketLelo"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
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
            <Link href="/signup">
              <Button className="h-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="h-10 border-violet-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-violet-700 dark:hover:text-white hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 dots-bg opacity-40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/15 dark:bg-violet-600/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/15 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-300/50 dark:border-violet-500/30 bg-violet-100/80 dark:bg-violet-500/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              India&apos;s Smartest Event Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 opacity-0 animate-fade-in-up text-gray-900 dark:text-white">
            Event Registration
            <br />
           <div className="mt-5">
             <span className="gradient-text">Made Effortless</span>
           </div>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up stagger-2">
            Register for events, receive your digital ticket with QR code
            instantly on email, and walk in like a VIP.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up stagger-3">
            <a href="#events">
              <Button className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all gap-2">
                Browse Events <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Link href="/login">
              <Button
                variant="outline"
                className="h-12 px-8 text-base border-violet-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-violet-700 dark:hover:text-white hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
              >
                View My Tickets
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex justify-center animate-bounce opacity-40">
            <ChevronDown className="w-6 h-6 text-violet-500 dark:text-violet-400" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dots-bg opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Registration",
                desc: "Register in seconds. No queues, no hassle.",
                color: "from-amber-500 to-orange-500",
                shadow: "shadow-amber-500/20",
                bg: "bg-amber-50 dark:bg-amber-500/10",
              },
              {
                icon: QrCode,
                title: "QR Code Tickets",
                desc: "Get a unique QR code. Scan & enter at the gate.",
                color: "from-violet-500 to-purple-500",
                shadow: "shadow-violet-500/20",
                bg: "bg-violet-50 dark:bg-violet-500/10",
              },
              {
                icon: Shield,
                title: "Secure & Verified",
                desc: "Each ticket is verified to prevent duplication.",
                color: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-500/20",
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`group p-8 rounded-2xl border bg-white dark:bg-slate-900/50 border-violet-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 card-hover opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform`}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 relative scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
              <p className="text-gray-500 dark:text-slate-400">
                Loading events...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 opacity-0 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-violet-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-500 dark:text-slate-400">
                Check back soon for upcoming events!
              </p>
            </div>
          ) : selectedEvent ? (
            <div className="max-w-2xl mx-auto opacity-0 animate-scale-in">
              <Button
                onClick={handleBack}
                variant="outline"
                className="mb-8 gap-2 border-violet-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-white hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Events
              </Button>
              <div className="p-8 rounded-2xl border bg-white dark:bg-slate-900/80 border-violet-100 dark:border-slate-800 backdrop-blur">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Register for {selectedEvent.name}
                  </h2>
                </div>
                <p className="text-gray-500 dark:text-slate-400 mb-8 ml-[52px]">
                  Fill in your details below to secure your spot.
                </p>
                <RegistrationForm
                  events={events}
                  preSelectedEventId={selectedEvent.id}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 opacity-0 animate-fade-in-up">
                  Upcoming <span className="gradient-text">Events</span>
                </h2>
                <p className="text-gray-500 dark:text-slate-400 opacity-0 animate-fade-in-up stagger-1">
                  Pick an event and register in seconds
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className={`group relative rounded-2xl border bg-white dark:bg-slate-900/60 border-violet-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-300 cursor-pointer card-hover overflow-hidden flex flex-col opacity-0 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {event.name}
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 line-clamp-2 min-h-[2.5rem]">
                        {event.description}
                      </p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <span className="text-gray-700 dark:text-slate-300 truncate">
                            {event.date?.toDate
                              ? event.date
                                  .toDate()
                                  .toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                              : new Date(event.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-gray-700 dark:text-slate-300 truncate">
                            {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-gray-700 dark:text-slate-300">
                            {event.totalTickets} tickets available
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-all gap-2">
                          Register Now{" "}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-100 dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 dark:text-slate-500 text-sm mb-3">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors"
            >
              Sign in to view your tickets
            </Link>
          </p>
          <p className="text-gray-400 dark:text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} TicketLelo. Built with ❤️
          </p>
        </div>
      </footer>
    </main>
  );
}
