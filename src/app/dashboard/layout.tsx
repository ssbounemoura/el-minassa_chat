"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FolderOpen, Calendar, FileText,
  Receipt, MessageSquare, Bell, Brain, Settings, LogOut, Scale,
  Menu, X, ChevronDown, FileSearch, Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { ROLE_LABELS } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";

const baseNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/dashboard/clients", icon: Users, label: "العملاء" },
  { href: "/dashboard/dossiers", icon: FolderOpen, label: "الملفات" },
  { href: "/dashboard/rendez-vous", icon: Calendar, label: "المواعيد" },
  { href: "/dashboard/documents", icon: FileText, label: "الوثائق" },
  { href: "/dashboard/factures", icon: Receipt, label: "الفواتير" },
  { href: "/dashboard/messagerie", icon: MessageSquare, label: "المراسلات" },
  { href: "/dashboard/summarize", icon: FileSearch, label: "تلخيص المستندات" },
  { href: "/dashboard/notifications", icon: Bell, label: "الإشعارات" },
  { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
];

const mockUser = {
  name: "الزائر",
  email: "guest@example.com",
  role: "AVOCAT" as const,
  officeName: "لوحة التحكم",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useCurrentUser();
  const currentUser = user ?? mockUser;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-primary text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-secondary" />
            <span className="text-lg font-bold">المنصة القانونية الجزائرية</span>
          </Link>
          <button className="lg:hidden absolute top-4 left-4 text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-300">{ROLE_LABELS[currentUser.role] || currentUser.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {baseNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "sidebar-link-active" : "sidebar-link text-gray-300 hover:bg-white/10 hover:text-white"}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">تسجيل الخروج</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-surface border-b border-border px-4 lg:px-8 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="font-bold text-primary text-lg">{currentUser.officeName || mockUser.officeName}</h2>
              </div>
              <nav className="flex flex-wrap items-center gap-3 ml-8">
                <Link href="/dashboard/legal-search" className="text-base font-semibold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-all">
                  البحث الذكي
                </Link>
                <Link href="/ai-chat" className="text-base font-semibold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-all">
                  المساعد الذكي
                </Link>
                <Link href="/dashboard/messagerie" className="text-base font-semibold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-all">
                  المراسلة
                </Link>
                <Link href="/dashboard/summarize" className="text-base font-semibold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-all">
                  تلخيص المستندات
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-light" />
                </button>
                {profileOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-2 z-50">
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                      الإعدادات
                    </Link>
                    <Link href="/login" className="block px-4 py-2 text-sm text-danger hover:bg-red-50">
                      تسجيل الخروج
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
