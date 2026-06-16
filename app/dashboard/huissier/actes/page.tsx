"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Search, Filter, Eye, Trash2 } from "lucide-react";

const sampleActes = [
  {
    id: "A-2026-101",
    numero: "ح-2026-101",
    type: "إشعار تنفيذ",
    debtor: "محسن بلعربي",
    tribunal: "محكمة الجزائر الوسطى",
    executionType: "حجز على سيارة",
    status: "قيد التنفيذ",
  },
  {
    id: "A-2026-102",
    numero: "ح-2026-102",
    type: "محضر حجز",
    debtor: "ريم شريف",
    tribunal: "محكمة سيدي أمحمد",
    executionType: "حجز على أجر",
    status: "تم التبليغ",
  },
  {
    id: "A-2026-103",
    numero: "ح-2026-103",
    type: "أمر أداء",
    debtor: "شركه الصفاء",
    tribunal: "محكمة الهيكل",
    executionType: "تنفيذ على أموال",
    status: "تنفيذ مكتمل",
  },
];

export default function HuissierActesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actes] = useState(sampleActes);

  const filteredActes = actes.filter((acte) =>
    !searchQuery ||
    acte.numero.includes(searchQuery) ||
    acte.debtor.includes(searchQuery) ||
    acte.tribunal.includes(searchQuery) ||
    acte.type.includes(searchQuery)
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="سجل الإشعارات التنفيذية" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة إشعار تنفيذ جديد
          </button>
          <div className="w-full md:w-96 relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن رقم التنفيذ أو المدين أو المحكمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">رقم الإشعار</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">نوع التنفيذ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المدين</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المحكمة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">إجراء التنفيذ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActes.map((acte) => (
                <tr key={acte.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{acte.numero}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{acte.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{acte.debtor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{acte.tribunal}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{acte.executionType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{acte.status}</td>
                  <td className="px-6 py-4 text-sm flex gap-2 justify-end">
                    <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="عرض">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition" title="حذف">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredActes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    لم يتم العثور على إشعارات تنفيذية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/huissier" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
