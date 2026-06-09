"use client";

import {
  FolderOpen, Users, Calendar, Receipt, Clock, TrendingUp,
  AlertTriangle, CheckCircle2, ArrowUpLeft,
} from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import LoginSuccessToast from "./LoginSuccessToast";
import { useCurrentUser } from "@/lib/useCurrentUser";

const stats: any[] = [];
const recentDossiers: any[] = [];
const upcomingAppointments: any[] = [];

const statusBadge: Record<string, string> = {
  EN_COURS: "badge-info",
  EN_ATTENTE: "badge-warning",
  TERMINE: "badge-success",
};

const statusLabel: Record<string, string> = {
  EN_COURS: "قيد المعالجة",
  EN_ATTENTE: "في الانتظار",
  TERMINE: "منتهي",
};

export default function DashboardHome() {
  const { user } = useCurrentUser();
  const displayName = user?.name ?? "الزائر";

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <LoginSuccessToast />
      </Suspense>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">مرحباً، {displayName}</h1>
          <p className="text-text-light text-sm">إليك ملخص نشاط مكتبك</p>
        </div>
        <Link href="/dashboard/dossiers" className="btn-primary text-sm">
          إضافة ملف جديد
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpLeft className="w-4 h-4 text-text-light" />
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-text-light">{stat.label}</p>
            </div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Dossiers */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">آخر الملفات</h2>
            <Link href="/dashboard/dossiers" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">الملف</th>
                  <th className="table-header">العميل</th>
                  <th className="table-header">الحالة</th>
                  <th className="table-header">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentDossiers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{d.title}</td>
                    <td className="table-cell text-text-light">{d.client}</td>
                    <td className="table-cell">
                      <span className={statusBadge[d.status]}>{statusLabel[d.status]}</span>
                    </td>
                    <td className="table-cell text-text-light">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">المواعيد القادمة</h2>
            <Link href="/dashboard/rendez-vous" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{apt.title}</p>
                  <p className="text-xs text-text-light">{apt.date} - {apt.time}</p>
                  <span className="badge-info text-xs mt-1">{apt.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "ملف جديد", icon: FolderOpen, href: "/dashboard/dossiers", color: "bg-blue-500" },
          { label: "عميل جديد", icon: Users, href: "/dashboard/clients", color: "bg-green-500" },
          { label: "موعد جديد", icon: Calendar, href: "/dashboard/rendez-vous", color: "bg-purple-500" },
          { label: "فاتورة جديدة", icon: Receipt, href: "/dashboard/factures", color: "bg-orange-500" },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card border-r-4 border-r-warning">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <div>
              <p className="font-semibold">3 مواعيد نهائية هذا الأسبوع</p>
              <p className="text-sm text-text-light">تأكد من تجهيز جميع المستندات المطلوبة</p>
            </div>
          </div>
        </div>
        <div className="card border-r-4 border-r-success">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-success" />
            <div>
              <p className="font-semibold">اشتراكك نشط</p>
              <p className="text-sm text-text-light">الخطة الاحترافية - ينتهي في 2026-07-08</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
