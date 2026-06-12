"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, Settings, LogOut, Scale,
  Bell, BarChart3, Shield, Menu, X,
} from "lucide-react";
import { useState } from "react";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "لوحة التحكم", exact: true },
  { href: "/admin/subscribers", icon: Users, label: "المشتركين" },
  { href: "/admin/plans", icon: CreditCard, label: "الخطط والأسعار" },
  { href: "/admin/messages", icon: MessageSquare, label: "الإعلانات" },
  { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

const mockAdmin = {
  name: "مدير النظام",
  email: "admin@elminassa.dz",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-danger/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-danger" />
            </div>
            <div>
              <span className="text-lg font-bold">إدارة المنصة</span>
              <p className="text-[10px] text-gray-400">SUPER ADMIN</p>
            </div>
          </Link>
          <button className="lg:hidden absolute top-4 left-4 text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger rounded-full flex items-center justify-center text-white font-bold text-sm">
              {mockAdmin.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mockAdmin.name}</p>
              <p className="text-xs text-gray-400 truncate">{mockAdmin.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive
                  ? "flex items-center gap-3 px-4 py-2.5 rounded-lg bg-danger/20 text-danger font-medium"
                  : "flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Scale className="w-5 h-5" />
            <span className="text-sm">العودة للموقع</span>
          </Link>
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
        <header className="bg-white border-b border-border px-4 lg:px-8 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="font-bold text-primary text-lg">لوحة الإدارة</h2>
                <p className="text-xs text-gray-400">المنصة القانونية الجزائرية</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> عرض الموقع
              </Link>
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
