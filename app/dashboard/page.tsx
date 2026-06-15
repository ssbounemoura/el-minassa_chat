"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Scale, 
  Users, 
  FolderOpen, 
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowRight
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalDossiers: number;
  totalRendezVous: number;
  totalDocuments: number;
  dossiersByStatus: {
    EN_COURS: number;
    TERMINE: number;
    EN_ATTENTE: number;
    ANNULE: number;
    ARCHIVE: number;
  };
  rendezVousByMonth: { month: string; count: number }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
  }[];
  upcomingRendezVous: {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
  }[];
  subscription?: {
    planName: string;
    endDate: string;
    isActive: boolean;
    daysRemaining: number | null;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Charger les informations de l'utilisateur
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (userData.user) {
          setUserName(userData.user.name || userData.user.email?.split("@")[0] || "Utilisateur");
          
          // Rediriger les notaires vers leur dashboard
          if (userData.user.role === "NOTAIRE") {
            router.push("/dashboard/notaire");
            return;
          }
        }

        // Charger les statistiques
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      EN_COURS: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700" },
      TERMINE: { label: "منتهي", color: "bg-green-100 text-green-700" },
      EN_ATTENTE: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700" },
      ANNULE: { label: "ملغي", color: "bg-red-100 text-red-700" },
      ARCHIVE: { label: "مؤرشف", color: "bg-gray-100 text-gray-700" },
    };
    return config[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "client": return <Users className="w-4 h-4 text-blue-500" />;
      case "dossier": return <FolderOpen className="w-4 h-4 text-primary" />;
      case "rendez-vous": return <Calendar className="w-4 h-4 text-orange-500" />;
      case "document": return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            مرحباً بك، {userName} 👋
          </h1>
          <p className="text-text-light mt-1">مرحباً بعودتك! إليك ملخص نشاط مكتبك القانوني</p>
        </div>
        <Link 
          href="/dashboard/rendez-vous" 
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm"
        >
          <Calendar className="w-4 h-4" />
          جدولة موعد جديد
        </Link>
      </div>

      {/* Trial / Subscription Banner */}
      {stats?.subscription?.daysRemaining && stats.subscription.daysRemaining > 0 && (
        <div className={`rounded-2xl p-5 shadow-sm border ${stats.subscription.daysRemaining <= 7 ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-700">عرض تجريبي مجاني 30 يوم</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                تبقى لك {stats.subscription.daysRemaining} يوم{stats.subscription.daysRemaining === 1 ? "" : "ًا"} من الفترة التجريبية
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.subscription.daysRemaining <= 7
                  ? "أنت الآن في آخر أسبوع من الفترة التجريبية. ركب خطة مدفوعة الآن لتفادي انقطاع الخدمة."
                  : "استفد من هذه الفترة لمتابعة ملفاتك ومواعيدك ثم اختر الاشتراك الأنسب لك."}
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-all"
            >
              <ArrowRight className="w-4 h-4" /> الترقية إلى اشتراك مدفوع
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي العملاء</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats?.totalClients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link href="/dashboard/clients" className="text-xs text-primary hover:underline mt-3 inline-block">
            عرض العملاء →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الملفات النشطة</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats?.totalDossiers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link href="/dashboard/dossiers" className="text-xs text-primary hover:underline mt-3 inline-block">
            عرض الملفات →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المواعيد القادمة</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats?.upcomingRendezVous?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <Link href="/dashboard/rendez-vous" className="text-xs text-primary hover:underline mt-3 inline-block">
            جدولة موعد →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الوثائق</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats?.totalDocuments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link href="/dashboard/documents" className="text-xs text-primary hover:underline mt-3 inline-block">
            عرض الوثائق →
          </Link>
        </div>
      </div>

      {/* Second Row - Status & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dossiers by Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            حالة الملفات
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">قيد المعالجة</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{stats?.dossiersByStatus?.EN_COURS || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ 
                    width: `${((stats?.dossiersByStatus?.EN_COURS || 0) / (stats?.totalDossiers || 1)) * 100}% 
                  `}} />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">منتهي</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600">{stats?.dossiersByStatus?.TERMINE || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ 
                    width: `${((stats?.dossiersByStatus?.TERMINE || 0) / (stats?.totalDossiers || 1)) * 100}% 
                  `}} />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">في الانتظار</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-yellow-600">{stats?.dossiersByStatus?.EN_ATTENTE || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ 
                    width: `${((stats?.dossiersByStatus?.EN_ATTENTE || 0) / (stats?.totalDossiers || 1)) * 100}% 
                  `}} />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ملغي</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-600">{stats?.dossiersByStatus?.ANNULE || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ 
                    width: `${((stats?.dossiersByStatus?.ANNULE || 0) / (stats?.totalDossiers || 1)) * 100}% 
                  `}} />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">مؤرشف</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">{stats?.dossiersByStatus?.ARCHIVE || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 rounded-full" style={{ 
                    width: `${((stats?.dossiersByStatus?.ARCHIVE || 0) / (stats?.totalDossiers || 1)) * 100}% 
                  `}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              المواعيد القادمة
            </h3>
            <Link href="/dashboard/rendez-vous" className="text-xs text-primary hover:underline">
              عرض الكل →
            </Link>
          </div>
          {stats?.upcomingRendezVous && stats.upcomingRendezVous.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingRendezVous.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{apt.title}</p>
                      <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString("ar")} - {apt.time}</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/rendez-vous`} className="text-primary text-sm hover:underline">
                    تفاصيل
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد مواعيد قادمة</p>
              <Link href="/dashboard/rendez-vous" className="text-primary text-sm hover:underline mt-2 inline-block">
                + إضافة موعد جديد
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            النشاطات الأخيرة
          </h3>
          <span className="text-xs text-gray-400">آخر 7 أيام</span>
        </div>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => {
              const statusInfo = getStatusBadge(activity.status);
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString("ar")}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد نشاطات حديثة</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/clients/new" className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl text-center border border-blue-100 hover:shadow-md transition-all">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">إضافة عميل</p>
        </Link>
        <Link href="/dashboard/dossiers/new" className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl text-center border border-green-100 hover:shadow-md transition-all">
          <FolderOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">ملف جديد</p>
        </Link>
        <Link href="/dashboard/rendez-vous" className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl text-center border border-orange-100 hover:shadow-md transition-all">
          <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">موعد جديد</p>
        </Link>
        <Link href="/dashboard/documents" className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl text-center border border-purple-100 hover:shadow-md transition-all">
          <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">رفع وثيقة</p>
        </Link>
      </div>
    </div>
  );
}