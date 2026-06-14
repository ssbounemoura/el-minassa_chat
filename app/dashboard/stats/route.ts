"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  FolderOpen, 
  Calendar,
  FileText,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalDossiers: number;
  totalRendezVous: number;
  totalDocuments: number;
  upcomingRendezVous: {
    id: string;
    title: string;
    date: string;
    time: string;
  }[];
}

export default function DashboardPage() {
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
  }, []);

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
              <p className="text-sm text-gray-500">الملفات</p>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            النشاطات الأخيرة
          </h3>
          <span className="text-xs text-gray-400">آخر 7 أيام</span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد نشاطات حديثة</p>
        </div>
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