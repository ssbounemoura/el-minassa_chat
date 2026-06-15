"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Search, Book } from "lucide-react";

type RegistreEntry = {
  id: string;
  acte: {
    id: string;
    numeroActe: string;
    typeActe: string;
    dateActe: string;
    montantTransaction?: number;
    client?: { fullName: string };
  };
  numeroRegistre: string;
  dateEnregistrement: string;
  volume?: number;
  page?: number;
  statusLegal: string;
  fraisRegistre?: number;
};

export default function RegistrePage() {
  const [registres, setRegistres] = useState<RegistreEntry[]>([]);
  const [filteredRegistres, setFilteredRegistres] = useState<RegistreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchRegistres();
  }, []);

  useEffect(() => {
    let filtered = registres;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.numeroRegistre.includes(searchTerm) ||
          r.acte.numeroActe.includes(searchTerm) ||
          r.acte.client?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((r) => r.statusLegal === filterStatus);
    }

    setFilteredRegistres(filtered);
  }, [searchTerm, filterStatus, registres]);

  const fetchRegistres = async () => {
    try {
      // En réalité, il faudrait créer une route pour récupérer tous les registres
      // Pour l'instant, on simule avec un fetch depuis chaque acte
      // Dans une vraie application, il y aurait une route dédiée
      setRegistres([]);
    } catch (error) {
      console.error("Error fetching registres:", error);
    } finally {
      setLoading(false);
    }
  };

  const TYPES_ACTE = {
    VENTE: "عقد بيع",
    DONATION: "عقد هبة",
    MARIAGE: "عقد زواج",
    SUCCESSION: "عقد توزيع التركة",
    HYPOTHEQUE: "عقد رهن",
    BAIL: "عقد إيجار",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> = {
      ENREGISTRE: { bg: "bg-green-100", text: "text-green-800", label: "مسجل" },
      TRANSCRIT: { bg: "bg-blue-100", text: "text-blue-800", label: "منقول" },
      RETIRE: { bg: "bg-yellow-100", text: "text-yellow-800", label: "مسحوب" },
      ANNULE: { bg: "bg-red-100", text: "text-red-800", label: "ملغى" },
    };
    return colors[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notaire" className="text-blue-600 hover:text-blue-800">
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">السجل الموثقي</h1>
              <p className="text-slate-600 mt-1">سجل جميع العقود المسجلة والموثقة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="ابحث برقم التسجيل أو رقم العقد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="ENREGISTRE">مسجل</option>
              <option value="TRANSCRIT">منقول</option>
              <option value="RETIRE">مسحوب</option>
              <option value="ANNULE">ملغى</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm mb-2">إجمالي المسجل</p>
            <p className="text-3xl font-bold text-green-600">{registres.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm mb-2">منقول</p>
            <p className="text-3xl font-bold text-blue-600">
              {registres.filter((r) => r.statusLegal === "TRANSCRIT").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-slate-600 text-sm mb-2">مسحوب</p>
            <p className="text-3xl font-bold text-yellow-600">
              {registres.filter((r) => r.statusLegal === "RETIRE").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-slate-600 text-sm mb-2">ملغى</p>
            <p className="text-3xl font-bold text-red-600">
              {registres.filter((r) => r.statusLegal === "ANNULE").length}
            </p>
          </div>
        </div>

        {/* Registry List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
          ) : filteredRegistres.length === 0 ? (
            <div className="p-8 text-center">
              <Book className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600 mb-4">لا توجد عقود مسجلة بعد</p>
              <Link href="/dashboard/notaire/actes" className="text-blue-600 hover:text-blue-800 font-medium">
                عرض جميع العقود
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم التسجيل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم العقد</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">تاريخ التسجيل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الطرف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistres.map((registre) => {
                    const color = getStatusColor(registre.statusLegal);
                    return (
                      <tr key={registre.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{registre.numeroRegistre}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{registre.acte.numeroActe}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {TYPES_ACTE[registre.acte.typeActe as keyof typeof TYPES_ACTE] || registre.acte.typeActe}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(registre.dateEnregistrement).toLocaleDateString("ar-DZ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{registre.acte.client?.fullName || "-"}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {registre.acte.montantTransaction
                            ? `${(registre.acte.montantTransaction / 1000000).toFixed(2)}M`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
                            {color.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/dashboard/notaire/actes/${registre.acte.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Download size={16} />
                            عرض
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-slate-900 mb-4">📌 معلومات عن السجل الموثقي:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div>
              <strong>✓</strong> يحتفظ الموثق بسجل مفصل لجميع العقود الموثقة
            </div>
            <div>
              <strong>✓</strong> كل عقد يحصل على رقم تسجيل فريد في السجل
            </div>
            <div>
              <strong>✓</strong> المعلومات سرية ولا يمكن الوصول إليها إلا بطلب رسمي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
