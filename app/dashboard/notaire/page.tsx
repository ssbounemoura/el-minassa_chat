"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, FileText, Users, Calendar, Book, HelpCircle, Plus, Filter } from "lucide-react";

type ActeNotarie = {
  id: string;
  numeroActe: string;
  typeActe: string;
  dateActe: string;
  status: string;
  montantTransaction?: number;
  client?: { fullName: string };
};

type Stats = {
  totalActes: number;
  actesEnCours: number;
  actesSignes: number;
  actesEnregistres: number;
  montantTotal: number;
};

export default function NotairePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalActes: 0,
    actesEnCours: 0,
    actesSignes: 0,
    actesEnregistres: 0,
    montantTotal: 0,
  });
  const [actes, setActes] = useState<ActeNotarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      const query = filterStatus ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/notaire/actes${query}`);
      const data = await res.json();

      if (data.success) {
        setActes(data.actes);
        
        // Calculer les statistiques
        const stats: Stats = {
          totalActes: data.actes.length,
          actesEnCours: data.actes.filter((a: any) => a.status === "EN_COURS").length,
          actesSignes: data.actes.filter((a: any) => a.status === "SIGNE").length,
          actesEnregistres: data.actes.filter((a: any) => a.status === "ENREGISTRE").length,
          montantTotal: data.actes.reduce((sum: number, a: any) => sum + (a.montantTransaction || 0), 0),
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Erreur chargement actes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      EN_COURS: { bg: "bg-yellow-100", text: "text-yellow-800" },
      SIGNE: { bg: "bg-blue-100", text: "text-blue-800" },
      ENREGISTRE: { bg: "bg-green-100", text: "text-green-800" },
      ARCHIVE: { bg: "bg-gray-100", text: "text-gray-800" },
    };
    const { bg, text } = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800" };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>{status}</span>;
  };

  const getTypeActeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      VENTE: "🏠",
      DONATION: "🎁",
      MARIAGE: "💍",
      SUCCESSION: "📋",
      HYPOTHEQUE: "🏦",
      BAIL: "📄",
    };
    return typeMap[type] || "📋";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">لوحة تحكم الموثق</h1>
              <p className="text-slate-600 mt-1">إدارة الأعمال الموثقة والعقود القانونية</p>
            </div>
            <Link
              href="/dashboard/notaire/nouveau-acte"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Plus size={20} />
              <span>عقد جديد</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm mb-2">إجمالي العقود</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalActes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-slate-600 text-sm mb-2">قيد المعالجة</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.actesEnCours}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm mb-2">موقعة</p>
            <p className="text-3xl font-bold text-purple-600">{stats.actesSignes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm mb-2">مسجلة</p>
            <p className="text-3xl font-bold text-green-600">{stats.actesEnregistres}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <p className="text-slate-600 text-sm mb-2">الإجمالي المالي</p>
            <p className="text-2xl font-bold text-indigo-600">{(stats.montantTotal / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/notaire/actes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:translate-y-[-2px] border border-slate-200"
          >
            <FileText className="text-blue-600 mb-4" size={24} />
            <h3 className="font-semibold text-slate-900">إدارة العقود</h3>
            <p className="text-slate-600 text-sm mt-2">عرض وتحرير العقود الموثقة</p>
          </Link>
          <Link
            href="/dashboard/notaire/registre"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:translate-y-[-2px] border border-slate-200"
          >
            <Book className="text-green-600 mb-4" size={24} />
            <h3 className="font-semibold text-slate-900">السجل الموثقي</h3>
            <p className="text-slate-600 text-sm mt-2">سجل التسجيل والعقود الموثقة</p>
          </Link>
          <Link
            href="/dashboard/notaire/aide"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:translate-y-[-2px] border border-slate-200"
          >
            <HelpCircle className="text-orange-600 mb-4" size={24} />
            <h3 className="font-semibold text-slate-900">نظام المساعدة</h3>
            <p className="text-slate-600 text-sm mt-2">استشارة قانونية ومساعدة</p>
          </Link>
        </div>

        {/* Recent Acts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">العقود الأخيرة</h2>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الحالات</option>
                <option value="EN_COURS">قيد المعالجة</option>
                <option value="SIGNE">موقعة</option>
                <option value="ENREGISTRE">مسجلة</option>
                <option value="ARCHIVE">مؤرشفة</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم العقد</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الطرف الأساسي</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : actes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      لا توجد عقود
                    </td>
                  </tr>
                ) : (
                  actes.map((acte) => (
                    <tr key={acte.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {getTypeActeBadge(acte.typeActe)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{acte.numeroActe}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(acte.dateActe).toLocaleDateString("ar-DZ")}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{acte.client?.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {acte.montantTransaction ? `${(acte.montantTransaction / 1000000).toFixed(2)}M` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(acte.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/dashboard/notaire/actes/${acte.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          تفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Resources */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <HelpCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">هل تحتاج إلى مساعدة؟</h3>
              <p className="text-slate-600 mb-4">
                نظام متكامل لمساعدة الموثقين مع قوانين التوثيق الجزائرية والإجراءات القانونية.
              </p>
              <Link
                href="/dashboard/notaire/aide"
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                عرض النصائح والإرشادات →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
