"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bell, FileText, Users, Calendar, Book, LifeBuoy, Plus, Filter, Upload, Loader2, X, CheckCircle2, AlertCircle, FolderOpen } from "lucide-react";

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

type SubscriptionInfo = {
  planName: string;
  endDate: string | null;
  daysRemaining: number | null;
  isActive: boolean;
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
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [actes, setActes] = useState<ActeNotarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("عقود");

  useEffect(() => {
    fetchData();
    fetchSubscription();
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
      console.error("خطأ في تحميل العقود:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setSubscription(data.subscription ?? null);
    } catch (error) {
      console.error("خطأ في تحميل حالة الاشتراك:", error);
      setSubscription(null);
    } finally {
      setSubscriptionLoaded(true);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadCategory("عقود");
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setUploadError(null);
    }
  };

  const uploadDocument = () => {
    if (!uploadTitle.trim() || !selectedFile) {
      setUploadError("الرجاء إدخال اسم الملف واختيار ملف للرفع.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("category", uploadCategory);
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documents/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadSuccess("تم رفع الملف بنجاح.");
        setTimeout(() => {
          setShowUploadModal(false);
          resetUploadForm();
        }, 2000);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          setUploadError(errorData.error || "حدث خطأ أثناء رفع الملف.");
        } catch {
          setUploadError("حدث خطأ أثناء رفع الملف.");
        }
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setUploadError("فشل الاتصال بالخادم أثناء رفع الملف.");
    };
    xhr.send(formData);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      EN_COURS: { bg: "bg-yellow-100", text: "text-yellow-800", label: "قيد المعالجة" },
      SIGNE: { bg: "bg-blue-100", text: "text-blue-800", label: "موقعة" },
      ENREGISTRE: { bg: "bg-green-100", text: "text-green-800", label: "مسجلة" },
      ARCHIVE: { bg: "bg-gray-100", text: "text-gray-800", label: "مؤرشفة" },
    };
    const { bg, text, label } = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>{label}</span>;
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

  useEffect(() => {
    const endDate = subscription?.endDate;

    if (!subscription || !endDate) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diffMs = end.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown("انتهت الفترة التجريبية");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdown(`${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  const subscriptionBanner = subscriptionLoaded ? (
    subscription ? (
      subscription.daysRemaining != null && subscription.daysRemaining > 0 ? (
        <div className={`rounded-2xl p-5 shadow-sm border mb-8 ${subscription.daysRemaining <= 7 ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">حساب تجريبي مجاني لمدة 30 يومًا</p>
              <p className="mt-2 text-lg font-bold text-slate-900">تبقى لك {subscription.daysRemaining} يوم{subscription.daysRemaining === 1 ? "" : "ًا"} من التجربة</p>
              {countdown ? (
                <p className="mt-2 text-sm text-slate-700">
                  العد التنازلي: <span className="font-semibold">{countdown}</span>
                </p>
              ) : null}
              {subscription.endDate && (
                <p className="mt-1 text-sm text-slate-600">
                  ينتهي في {(() => {
                    const endDateStr = subscription.endDate;
                    return new Date(endDateStr).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
                  })()}
                </p>
              )}
              <p className="mt-1 text-sm text-slate-600">
                {subscription.daysRemaining <= 7
                  ? "أنت الآن في آخر أسبوع من التجربة. قم بالترقية الآن لتجنب أي انقطاع في الخدمة."
                  : "استمر في استخدام المنصة خلال الفترة التجريبية ثم اختر الخطة المناسبة لك قبل انتهائها."}
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-all"
            >
              <ArrowRight className="w-4 h-4" /> الترقية إلى اشتراك مدفوع
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 shadow-sm border border-gray-200 bg-white mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">أنت الآن على الخطة المجانية</p>
              <p className="mt-2 text-lg font-bold text-slate-900">لا يوجد اشتراك مرتبط بحسابك حاليا.</p>
              <p className="mt-1 text-sm text-slate-600">
                هذا يعني أنك تستخدم النسخة المجانية. إذا أردت ترقية قدراتك، قم باختيار خطة مدفوعة.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              <ArrowRight className="w-4 h-4" /> عرض الخطط
            </Link>
          </div>
        </div>
      )
    ) : (
      <div className="rounded-2xl p-5 shadow-sm border border-gray-200 bg-white mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-700">أنت الآن على الخطة المجانية</p>
            <p className="mt-2 text-lg font-bold text-slate-900">لا يوجد اشتراك مرتبط بحسابك حاليا.</p>
            <p className="mt-1 text-sm text-slate-600">
              هذا يعني أنك تستخدم النسخة المجانية. إذا أردت ترقية قدراتك، قم باختيار خطة مدفوعة.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> عرض الخطط
          </Link>
        </div>
      </div>
    )
  ) : null;

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
        {subscriptionBanner}

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
            href="/dashboard/documents"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:translate-y-[-2px] border border-slate-200"
          >
            <FolderOpen className="text-indigo-600 mb-4" size={24} />
            <h3 className="font-semibold text-slate-900">المستندات</h3>
            <p className="text-slate-600 text-sm mt-2">عرض الملفات المرفوعة والمستندات الخاصة بك</p>
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
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
              <LifeBuoy size={22} />
            </div>
            <h3 className="font-semibold text-slate-900">نظام المساعدة</h3>
            <p className="text-slate-600 text-sm mt-2">استشارة قانونية ومساعدة</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                <Upload size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">رفع ملفات الموثق</h3>
                <p className="text-slate-600 text-sm mt-2">قم برفع الملفات القانونية والعقود مباشرةً من لوحة الموثق مع رؤية تقدم الرفع.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  resetUploadForm();
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                <Upload className="w-4 h-4" /> رفع ملف
              </button>
              <div className="rounded-2xl bg-slate-50 p-3 text-slate-700 text-sm">
                يمكنك رفع ملف PDF، Word، أو أي مستند قانوني وحفظه في المستندات الخاصة بك.
              </div>
            </div>
          </div>
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

        {showUploadModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">رفع ملف جديد</h3>
                  <p className="text-slate-600 text-sm">اختر اسم المستند والصنف ثم تابع عملية الرفع.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">عنوان المستند</span>
                    <input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="مثال: عقد بيع عقار"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">نوع الملف</span>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="عقود">عقود</option>
                      <option value="محاضر">محاضر</option>
                      <option value="تقارير">تقارير</option>
                      <option value="مراسلات">مراسلات</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">اسحب الملف هنا أو اضغط لتحديده</p>
                  <p className="mt-2 text-sm text-slate-500">PDF، Word، صورة أو أي مستند قانوني</p>
                  <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100">
                    <input
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                    <Upload className="w-4 h-4" /> اختيار ملف
                  </label>
                  {selectedFile ? (
                    <p className="mt-3 text-sm text-slate-700">الملف المحدد: <span className="font-semibold">{selectedFile.name}</span></p>
                  ) : null}
                </div>

                {uploadError ? (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{uploadError}</div>
                ) : null}
                {uploadSuccess ? (
                  <div className="rounded-2xl bg-green-50 p-4 text-sm text-emerald-700">{uploadSuccess}</div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>تقدم الرفع</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    disabled={uploading}
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={uploadDocument}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    رفع الملف
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Help Resources */}
        <div className="mt-8 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg">
              <LifeBuoy size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">هل تحتاج إلى مساعدة؟</h3>
              <p className="text-slate-600 mb-4">
                نظام متكامل لمساعدة الموثقين مع قوانين التوثيق الجزائرية والإجراءات القانونية.
              </p>
              <Link
                href="/dashboard/notaire/aide"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                عرض النصائح والإرشادات <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
