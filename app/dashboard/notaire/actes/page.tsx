"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, FileText, Trash2, Eye } from "lucide-react";

type ActeNotarie = {
  id: string;
  numeroActe: string;
  typeActe: string;
  dateActe: string;
  status: string;
  montantTransaction?: number;
  client?: { fullName: string };
};

export default function ActesPage() {
  const [actes, setActes] = useState<ActeNotarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    fetchActes();
  }, [filterStatus, filterType]);

  const fetchActes = async () => {
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.append("status", filterStatus);
      if (filterType) query.append("typeActe", filterType);

      const res = await fetch(`/api/notaire/actes?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setActes(data.actes);
      }
    } catch (error) {
      console.error("خطأ في تحميل العقود:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حقاً حذف هذا العقد؟")) return;

    try {
      const res = await fetch(`/api/notaire/actes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setActes(actes.filter((a) => a.id !== id));
      } else {
        alert("خطأ في حذف العقد");
      }
    } catch (error) {
      console.error("خطأ في حذف العقد:", error);
      alert("فشل الاتصال بالخادم");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      EN_COURS: { bg: "bg-yellow-100", text: "text-yellow-800", label: "قيد المعالجة" },
      SIGNE: { bg: "bg-blue-100", text: "text-blue-800", label: "موقعة" },
      ENREGISTRE: { bg: "bg-green-100", text: "text-green-800", label: "مسجلة" },
      ARCHIVE: { bg: "bg-gray-100", text: "text-gray-800", label: "مؤرشفة" },
    };
    const info = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.bg} ${info.text}`}>{info.label}</span>;
  };

  const TYPES_ACTE = {
    VENTE: "عقد بيع",
    DONATION: "عقد هبة",
    MARIAGE: "عقد زواج",
    SUCCESSION: "عقد توزيع التركة",
    HYPOTHEQUE: "عقد رهن",
    BAIL: "عقد إيجار",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notaire" className="text-blue-600 hover:text-blue-800">
                <ArrowRight size={20} />
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">إدارة العقود الموثقة</h1>
            </div>
            <Link
              href="/dashboard/notaire/nouveau-acte"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Plus size={20} />
              عقد جديد
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">نوع العقد</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الأنواع</option>
                {Object.entries(TYPES_ACTE).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">الحالة</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الحالات</option>
                <option value="EN_COURS">قيد المعالجة</option>
                <option value="SIGNE">موقعة</option>
                <option value="ENREGISTRE">مسجلة</option>
                <option value="ARCHIVE">مؤرشفة</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
          ) : actes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600 mb-4">لا توجد عقود بهذه المعايير</p>
              <Link
                href="/dashboard/notaire/nouveau-acte"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                إنشاء عقد جديد
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم العقد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الطرف الأساسي</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {actes.map((acte) => (
                    <tr key={acte.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{acte.numeroActe}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {TYPES_ACTE[acte.typeActe as keyof typeof TYPES_ACTE] || acte.typeActe}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(acte.dateActe).toLocaleDateString("ar-DZ")}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{acte.client?.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {acte.montantTransaction ? `${(acte.montantTransaction / 1000000).toFixed(2)}M` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(acte.status)}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Link
                          href={`/dashboard/notaire/actes/${acte.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Eye size={16} />
                          عرض
                        </Link>
                        <button
                          onClick={() => handleDelete(acte.id)}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
