"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Upload, Download, Trash2, Eye, ArrowRight } from "lucide-react";

export default function HuissierDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) router.push("/login");
      else setLoading(false);
    } catch {
      router.push("/login");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="مستودع تنفيذ الأحكام" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الوثائق التنفيذية الرئيسية</h2>
          <p className="text-gray-600 mb-6">
            إدارة ملفات التنفيذ مثل إشعارات التنفيذ، محاضر الحجز، أوامر الأداء، وسندات التنفيذ.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع وثيقة تنفيذية جديدة
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإشعار / الملف</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">نوع الوثيقة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحجم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ الإضافة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">حالة الملف</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    إشعار تنفيذ-2026.pdf
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">PDF</td>
                <td className="px-6 py-4 text-sm text-gray-600">2.5 ميجابايت</td>
                <td className="px-6 py-4 text-sm text-gray-600">15 يونيو 2026</td>
                <td className="px-6 py-4 text-sm text-gray-600">قيد المعالجة</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg" title="تحميل">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    محضر-حجز-عقاري.docx
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">DOCX</td>
                <td className="px-6 py-4 text-sm text-gray-600">1.2 ميجابايت</td>
                <td className="px-6 py-4 text-sm text-gray-600">14 يونيو 2026</td>
                <td className="px-6 py-4 text-sm text-gray-600">تم التبليغ</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg" title="تحميل">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
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

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-indigo-600 font-semibold">جاري التحميل...</p>
      </div>
    </div>
  );
}
