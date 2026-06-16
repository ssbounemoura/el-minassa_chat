"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Upload,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit,
  HelpCircle,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface Acte {
  id: string;
  numero: string;
  type?: string;
  clientName?: string;
  referenceNumber?: string;
  executionType: string;
  dateCreation: string;
  dueDate?: string;
  status: string;
  montant?: number;
  creditorName?: string;
  debtorName?: string;
  district?: string;
  asset?: string;
  tribunal?: string;
}

interface Stats {
  totalActes: number;
  actesEnCours: number;
  actesSignes: number;
  actesEnregistres: number;
  montantTotal: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HuissierPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalActes: 0,
    actesEnCours: 0,
    actesSignes: 0,
    actesEnregistres: 0,
    montantTotal: 0,
  });
  const [actes, setActes] = useState<Acte[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAideModal, setShowAideModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("عريضة");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const userData = await res.json();
      if (userData.role !== "HUISSIER" && userData.role !== "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }
      setUser(userData);
      await fetchData();
    } catch (error) {
      console.error("خطأ في التحقق:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/huissier/actes");
      if (res.ok) {
        const data = await res.json();
        if (data.actes) {
          setActes(data.actes);
          const stats = {
            totalActes: data.actes.length,
            actesEnCours: data.actes.filter((a: Acte) => a.status === "قيد_التنفيذ").length,
            actesSignes: data.actes.filter((a: Acte) => a.status === "تم_التبليغ").length,
            actesEnregistres: data.actes.filter((a: Acte) => a.status === "تم_الإنجاز").length,
            montantTotal: data.actes.reduce((sum: number, a: Acte) => sum + (a.montant || 0), 0),
          };
          setStats(stats);
        }
      }
    } catch (error) {
      console.error("خطأ في تحميل الأعمال:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError("حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)");
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) {
      setUploadError("الرجاء إدخال رقم الإشعار التنفيذي واختيار ملف");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", uploadTitle);
    formData.append("type", uploadType);

    try {
      const res = await fetch("/api/huissier/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadSuccess("تم رفع الملف بنجاح");
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadTitle("");
        setUploadType("عريضة");
        await fetchData();
      } else {
        const error = await res.json();
        setUploadError(error.message || "فشل رفع الملف");
      }
    } catch (error) {
      console.error("خطأ في الرفع:", error);
      setUploadError("حدث خطأ أثناء رفع الملف");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/huissier/actes/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("خطأ في الحذف:", error);
    }
  };

  const filteredActes = actes.filter((acte) => {
    const matchFilter = !filterStatus || acte.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      acte.numero.includes(searchQuery) ||
      acte.clientName?.includes(searchQuery) ||
      acte.debtorName?.includes(searchQuery) ||
      acte.tribunal?.includes(searchQuery) ||
      acte.executionType?.includes(searchQuery);
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      قيد_التنفيذ: { bg: "bg-yellow-100", text: "text-yellow-800", label: "قيد التنفيذ", icon: <Clock className="w-4 h-4" /> },
      تم_التبليغ: { bg: "bg-blue-100", text: "text-blue-800", label: "تم التبليغ للمدين", icon: <CheckCircle className="w-4 h-4" /> },
      تم_الإنجاز: { bg: "bg-green-100", text: "text-green-800", label: "تنفيذ مكتمل", icon: <CheckCircle className="w-4 h-4" /> },
      مرفوضة: { bg: "bg-red-100", text: "text-red-800", label: "مرفوضة", icon: <AlertCircle className="w-4 h-4" /> },
      مسجلة: { bg: "bg-purple-100", text: "text-purple-800", label: "مسجلة في المحكمة", icon: <AlertCircle className="w-4 h-4" /> },
      في_الانتظار: { bg: "bg-gray-100", text: "text-gray-800", label: "في الانتظار", icon: <Clock className="w-4 h-4" /> },
    };
    const config = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status, icon: <AlertCircle className="w-4 h-4" /> };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} inline-flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      "تبليغ حكم": "⚖️",
      "أمر أداء": "💸",
      "محضر حجز": "🏛️",
      "إشعار تنفيذ": "📢",
      "إعلان تحضير": "📝",
      "عريضة": "📄",
      "محضر": "📋",
      "إعلان": "📢",
      "حكم": "⚖️",
      "سند": "📑",
      "تقرير": "📊",
    };
    return icons[type] || "📄";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* الشريط الجانبي */}
      <div
        className={`fixed right-0 top-0 h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* الشعار */}
        <div className="p-6 border-b border-indigo-600 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <h1 className="font-bold text-sm">حاسبة العدل</h1>
                <p className="text-xs text-indigo-200">نظام الحاسبين</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-indigo-600 p-2 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* الملاحة */}
        <nav className="p-4 space-y-3">
          <NavLink
            icon={<BarChart3 className="w-5 h-5" />}
            label="لوحة التحكم"
            href="/dashboard/huissier"
            open={sidebarOpen}
          />
          <NavLink
            icon={<FileText className="w-5 h-5" />}
            label="سجل التنفيذ"
            href="/dashboard/huissier/actes"
            open={sidebarOpen}
          />
          <NavLink
            icon={<Upload className="w-5 h-5" />}
            label="مستودع الوثائق"
            href="/dashboard/huissier/documents"
            open={sidebarOpen}
          />
          <NavLink
            icon={<Users className="w-5 h-5" />}
            label="الأطراف التنفيذية"
            href="/dashboard/huissier/parties"
            open={sidebarOpen}
          />
          <NavLink
            icon={<Calendar className="w-5 h-5" />}
            label="مواعيد التنفيذ"
            href="/dashboard/huissier/schedule"
            open={sidebarOpen}
          />
          <NavLink
            icon={<HelpCircle className="w-5 h-5" />}
            label="دليل التنفيذ"
            href="#"
            onClick={() => setShowAideModal(true)}
            open={sidebarOpen}
          />
          <NavLink
            icon={<Settings className="w-5 h-5" />}
            label="الإعدادات"
            href="/dashboard/huissier/settings"
            open={sidebarOpen}
          />
        </nav>

        {/* التذييل */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "تسجيل الخروج"}
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "mr-64" : "mr-20"}`}>
        {/* الرأس */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">مرحباً بك، {user?.name}</h2>
              <p className="text-sm text-gray-500">لوحة قيادة تنفيذ الأحكام القضائية، الإشعارات، الحجز والتنفيذ العاجل</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* الإجراءات السريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-3 transition shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              تسجيل إشعار تنفيذ جديد
            </button>
            <Link
              href="/dashboard/huissier/actes"
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-3 transition shadow-lg hover:shadow-xl text-center justify-center"
            >
              <Plus className="w-5 h-5" />
              الانتقال إلى سجل الإشعارات التنفيذية
            </Link>
            <button
              onClick={() => setShowAideModal(true)}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-3 transition shadow-lg hover:shadow-xl"
            >
              <HelpCircle className="w-5 h-5" />
              دليل الحجز والتنفيذ العاجل
            </button>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="إجمالي إشعارات التنفيذ" value={stats.totalActes} icon="📢" color="blue" />
            <StatCard label="في مرحلة التنفيذ" value={stats.actesEnCours} icon="⏳" color="yellow" />
            <StatCard label="تم الإبلاغ" value={stats.actesSignes} icon="✅" color="green" />
            <StatCard label="تنفيذ مكتمل" value={stats.actesEnregistres} icon="📝" color="purple" />
            <StatCard label="إجمالي المطالبات" value={`${stats.montantTotal.toLocaleString()} د.ج`} icon="💰" color="indigo" />
          </div>

          {/* التصفية والبحث */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن رقم الإشعار أو اسم المدين أو المحكمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">جميع حالات التنفيذ</option>
                <option value="قيد_التنفيذ">قيد التنفيذ</option>
                <option value="تم_التبليغ">تم التبليغ</option>
                <option value="تم_الإنجاز">تم الإنجاز</option>
                <option value="مرفوضة">مرفوضة</option>
              </select>
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition flex items-center gap-2">
                <Filter className="w-5 h-5" />
                تصفية متقدمة
              </button>
            </div>
          </div>

          {/* جدول الإشعارات */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">رقم الإشعار</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">نوع التنفيذ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المدين</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المحكمة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">إجراء التنفيذ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ الإشعار</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">حالة التنفيذ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActes.length > 0 ? (
                  filteredActes.slice(0, 10).map((acte) => (
                    <tr key={acte.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{acte.numero}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="text-lg mr-2">{getTypeIcon(acte.type || "")}</span>
                        {acte.type || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{acte.debtorName || acte.clientName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{acte.tribunal || acte.district || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{acte.executionType || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(acte.dateCreation).toLocaleDateString("ar-DZ")}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(acte.status)}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="عرض">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition" title="تعديل">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(acte.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      لا توجد إجراءات تنفيذية حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredActes.length > 10 && (
            <div className="mt-6 text-center">
              <Link
                href="/dashboard/huissier/actes"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                عرض جميع الإجراءات التنفيذية
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* نافذة التحميل */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          onFileChange={handleFileChange}
          title={uploadTitle}
          setTitle={setUploadTitle}
          type={uploadType}
          setType={setUploadType}
          error={uploadError}
          setError={setUploadError}
          success={uploadSuccess}
          setSuccess={setUploadSuccess}
        />
      )}

      {/* نافذة الدليل */}
      {showAideModal && <AideModal onClose={() => setShowAideModal(false)} />}

      {/* تأكيد الحذف */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// مكونات مساعدة

function NavLink({
  icon,
  label,
  href,
  open,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  open: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="p-2 bg-indigo-600 rounded-lg">{icon}</div>
      {open && <span className="text-sm font-medium">{label}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition">
      {content}
    </Link>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  };

  return (
    <div className={`${colors[color].bg} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${colors[color].text}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function UploadModal({
  onClose,
  onUpload,
  onFileChange,
  title,
  setTitle,
  type,
  setType,
  error,
  setError,
  success,
  setSuccess,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
<h2 className="text-2xl font-bold text-gray-900 mb-4">رفع إخطار تنفيذ جديد</h2>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الإشعار التنفيذي</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل رقم الإشعار أو عنوان المحضر"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوثيقة التنفيذية</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>إشعار تنفيذ</option>
              <option>محضر حجز</option>
              <option>أمر أداء</option>
              <option>عريضة تنفيذ</option>
              <option>سند تنفيذ</option>
              <option>تقرير تنفيذ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر الملف</label>
            <input
              type="file"
              onChange={onFileChange}
              accept=".pdf,.doc,.docx,.xlsx,.txt"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">الملفات المدعومة: PDF, DOC, DOCX, XLSX, TXT</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onUpload}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            رفع الملف
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function AideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">المساعدة والأسئلة الشائعة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
                  <AideItem
            q="كيف أرفع إشعار تنفيذ جديد؟"
            a="اضغط على زر 'تسجيل إشعار تنفيذ جديد' ثم املأ رقم الإشعار، نوع الوثيقة التنفيذية، واختر الملف المطلوب."
          />
          <AideItem
            q="ما هي أنواع الوثائق التنفيذية المدعومة؟"
            a="يدعم النظام إشعارات التنفيذ، محاضر الحجز، أوامر الأداء، عرائض التنفيذ، سندات التنفيذ، وتقرير التنفيذ."
          />
          <AideItem
            q="كيف أتابع حالة التنفيذ؟"
            a="في الشاشة الرئيسية سترى حالات التنفيذ: قيد التنفيذ، تم التبليغ، تنفيذ مكتمل، أو مرفوضة. يمكنك استخدام البحث والتصفية لتحديد الحالة."
          />
          <AideItem
            q="هل يمكنني حذف إشعار؟"
            a="يمكن حذف الإشعارات التنفيذية قبل أن يتم تأكيد التبليغ أو توقيعها. اضغط على أيقونة الحذف إذا كانت متاحة."
          />
          <AideItem
            q="كيف أضيف طرفاً في قضية التنفيذ؟"
            a="انتقل إلى قسم 'الأطراف المعنية' وأضف بيانات المدين أو الدائن أو المحامي المرتبط بالقضية."
          />
          <AideItem
            q="كيف أتلقى تنبيهات جلسات الحجز والتنفيذ؟"
            a="تأكد من تفعيل إشعارات 'جلسات قضائية' و'التنفيذ الجديد' في صفحة الإعدادات."
          />
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

function AideItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-right font-semibold text-gray-900 hover:text-indigo-600 transition"
      >
        {q}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && <p className="mt-3 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">تأكيد الحذف</h2>
        <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            حذف
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
