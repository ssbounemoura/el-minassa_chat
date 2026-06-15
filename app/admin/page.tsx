"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, CreditCard, DollarSign, FolderOpen, UserCheck, UserX,
  TrendingUp, Loader2, FileText, Bell, ArrowLeft,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  AVOCAT: "محامي",
  NOTAIRE: "موثق",
  HUISSIER: "محضر قضائي",
};

const roleColors: Record<string, string> = {
  AVOCAT: "bg-blue-100 text-blue-700",
  NOTAIRE: "bg-purple-100 text-purple-700",
  HUISSIER: "bg-orange-100 text-orange-700",
};

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalDossiers: number;
  totalClients: number;
  monthlyRevenue: number;
  plans: { id: string; name: string; price: number; count: number }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    officeName: string | null;
    isActive: boolean;
    wilaya: string | null;
    plan: string | null;
    createdAt: string;
  }[];
  roleDistribution: { role: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      await fetchStats();
    };
    void loadStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!stats) return <p className="text-center text-red-500 py-20">خطأ في تحميل البيانات</p>;

  const totalPlanSubs = stats.plans.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المشتركين", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600", sub: `${stats.activeUsers} نشط` },
          { label: "الاشتراكات النشطة", value: stats.activeSubscriptions, icon: CreditCard, color: "bg-green-50 text-green-600", sub: `${stats.totalSubscriptions} إجمالي` },
          { label: "الإيرادات الشهرية", value: `${stats.monthlyRevenue.toLocaleString("ar-DZ")}`, icon: DollarSign, color: "bg-purple-50 text-purple-600", sub: "د.ج (تقديري)" },
          { label: "الملفات والعملاء", value: `${stats.totalDossiers} / ${stats.totalClients}`, icon: FolderOpen, color: "bg-orange-50 text-orange-600", sub: "ملفات / عملاء" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
              <TrendingUp className="w-4 h-4 text-text-light" />
            </div>
            <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
            <p className="text-sm text-text-light">{stat.label}</p>
            <p className="text-xs text-success">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Role Distribution + Plan Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="card">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> توزيع المهن
          </h3>
          <div className="space-y-3">
            {stats.roleDistribution.map((r) => {
              const percent = stats.totalUsers > 0 ? Math.round((r.count / stats.totalUsers) * 100) : 0;
              return (
                <div key={r.role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`badge ${roleColors[r.role] || "bg-gray-100"}`}>{ROLE_LABELS[r.role] || r.role}</span>
                    <span className="text-sm font-bold text-primary">{r.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> توزيع الخطط
          </h3>
          <div className="space-y-3">
            {stats.plans.map((plan, i) => {
              const colors = ["bg-blue-500", "bg-secondary", "bg-purple-500"];
              const percent = totalPlanSubs > 0 ? Math.round((plan.count / totalPlanSubs) * 100) : 0;
              return (
                <div key={plan.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-sm font-bold text-primary">{plan.count} مشترك</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${colors[i % 3]} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs text-text-light mt-0.5">{percent}% — {plan.price.toLocaleString("ar-DZ")} د.ج/شهر</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Subscribers */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">آخر المشتركين</h3>
          <Link href="/admin/subscribers" className="text-sm text-primary hover:underline flex items-center gap-1">
            عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">الاسم</th>
                <th className="table-header">المهنة</th>
                <th className="table-header">الولاية</th>
                <th className="table-header">الخطة</th>
                <th className="table-header">الحالة</th>
                <th className="table-header">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">
                    <div>
                      <p>{user.name}</p>
                      <p className="text-xs text-text-light">{user.email}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${roleColors[user.role] || "bg-gray-100"}`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="table-cell text-text-light">{user.wilaya || "—"}</td>
                  <td className="table-cell">{user.plan || "—"}</td>
                  <td className="table-cell">
                    {user.isActive ? (
                      <span className="badge-success flex items-center gap-1 w-fit"><UserCheck className="w-3 h-3" /> نشط</span>
                    ) : (
                      <span className="badge-danger flex items-center gap-1 w-fit"><UserX className="w-3 h-3" /> معلق</span>
                    )}
                  </td>
                  <td className="table-cell text-text-light text-xs">
                    {new Date(user.createdAt).toLocaleDateString("ar-DZ")}
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center text-text-light py-8">لا يوجد مشتركون بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إدارة المشتركين", icon: Users, href: "/admin/subscribers" },
          { label: "إدارة الخطط", icon: CreditCard, href: "/admin/plans" },
          { label: "الملفات المسجلة", icon: FileText, href: "/admin/subscribers" },
          { label: "الإشعارات المرسلة", icon: Bell, href: "/admin/messages" },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="card flex flex-col items-center gap-3 hover:shadow-md transition-shadow text-center group">
            <div className="p-4 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
              <action.icon className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <span className="font-medium text-sm">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
