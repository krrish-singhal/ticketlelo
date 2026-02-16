"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Package, Users, QrCode } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Check if user is admin
  if (!loading && (!user || !user.isAdmin)) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { href: "/admin/dashboard", icon: Calendar, label: "Events" },
    { href: "/admin/batches", icon: Package, label: "Batches" },
    { href: "/admin/registrations", icon: Users, label: "Registrations" },
    { href: "/admin/scanner", icon: QrCode, label: "QR Scanner" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">TicketLelo</h1>
          <p className="text-sm text-slate-400 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-sm">
            <p className="text-slate-400">Logged in as</p>
            <p className="font-medium text-white truncate">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
