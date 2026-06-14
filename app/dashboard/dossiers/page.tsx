"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, X, Eye, Filter, FolderOpen, Calendar, 
  Building2, Gavel, Save, CheckCircle, AlertCircle, User
} from "lucide-react";

interface Client {
  id: string;
  fullName: string;
}

interface Dossier {
  id: string;
  title: string;
  clientId: string | null;
  client?: { fullName: string };
  caseType: string;
  status: string;
  courtName: string;
  caseNumber: string;
  nextHearing: string | null;
  description: string;
  createdAt: string;
}

const caseTypes = ["عقاري", "تجاري", "أحوال شخصية", "عقد", "تبليغ", "جزائي", "إداري"];
const statuses = [
  { value: "ALL", label: "جميع الحالات" },
  { value: "EN_COURS", label: "قيد المعالجة", color: "bg-blue-100 text-blue-700" },
  { value: "EN_ATTENTE", label: "في الانتظار", color: "bg-yellow-100 text-yellow-700" },
  { value: "TERMINE", label: "منتهي", color: "bg-green-100 text-green-700" },
  { value: "ANNULE", label: "ملغي", color: "bg-red-100 text-red-700" },
  { value: "ARCHIVE", label: "مؤرشف", color: "bg-gray-100 text-gray-700" },
];

const statusLabels: Record<string, string> = {
  EN_COURS: "قيد المعالجة",
  EN_ATTENTE: "في الانتظار",
  TERMINE: "منتهي",
  ANNULE: "ملغي",
  ARCHIVE: "مؤرشف",
};

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ 
    title: "", 
    clientId: "", 
    caseType: "عقاري", 
    status: "EN_COURS", 
    courtName: "", 
    caseNumber: "", 
    nextHearing: "", 
    description: "" 
  });

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDossiers = async () => {
    try {
      const res = await fetch("/api/dossiers");
      const data = await res.json();
      if (data.dossiers) {
        setDossiers(data.dossiers);
      }
    } catch (error) {
      console.error("Erreur chargement dossiers:", error);
      showToastMessage("خطأ في تحميل الملفات", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    }
  };

  useEffect(() => {
    loadDossiers();
    loadClients();
  }, []);

  const filtered = dossiers.filter((d) => {
    const matchSearch = d.title.includes(search) || (d.client?.fullName || "").includes(search);
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchType = typeFilter === "الكل" || d.caseType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const openNew = () => { 
    setEditing(null); 
    setForm({ title: "", clientId: "", caseType: "عقاري", status: "EN_COURS", courtName: "", caseNumber: "", nextHearing: "", description: "" }); 
    setShowModal(true); 
  };
  
  const openEdit = (d: Dossier) => { 
    setEditing(d); 
    setForm({ 
      title: d.title, 
      clientId: d.clientId || "", 
      caseType: d.caseType, 
      status: d.status, 
      courtName: d.courtName || "", 
      caseNumber: d.caseNumber || "", 
      nextHearing: d.nextHearing ? new Date(d.nextHearing).toISOString().split("T")[0] : "", 
      description: d.description || "" 
    }); 
    setShowModal(true); 
  };

  const handleSave = async () => {
    if (!form.title) {
      showToastMessage("الرجاء إدخال عنوان الملف", "error");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch("/api/dossiers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (res.ok) {
          showToastMessage("✅ تم تعديل الملف بنجاح", "success");
          await loadDossiers();
        } else {
          showToastMessage("❌ خطأ في تعديل الملف", "error");
        }
      } else {
        const res = await fetch("/api/dossiers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToastMessage("✅ تم إضافة الملف بنجاح", "success");
          await loadDossiers();
        } else {
          showToastMessage("❌ خطأ في إضافة الملف", "error");
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde dossier:", error);
      showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      try {
        const res = await fetch(`/api/dossiers?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToastMessage("✅ تم حذف الملف بنجاح", "success");
          await loadDossiers();
        } else {
          showToastMessage("❌ خطأ في حذف الملف", "error");
        }
      } catch (error) {
        console.error("Erreur suppression dossier:", error);
        showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      EN_COURS: "bg-blue-100 text-blue-700",
      EN_ATTENTE: "bg-yellow-100 text-yellow-700",
      TERMINE: "bg-green-100 text-green-700",
      ANNULE: "bg-red-100 text-red-700",
      ARCHIVE: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 duration-300 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">📁 إدارة الملفات</h1>
          <p className="text-text-light text-sm mt-1">{dossiers.length} ملف مسجل</p>
        </div>
        <button 
          onClick={openNew} 
          className="btn-primary text-sm flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> ملف جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input 
            className="input-field pr-10 bg-white" 
            placeholder="البحث عن ملف أو عميل..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="input-field w-auto bg-white" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select 
          className="input-field w-auto bg-white" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="الكل">جميع الأنواع</option>
          {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <th className="table-header text-right">الملف</th>
                <th className="table-header text-right">العميل</th>
                <th className="table-header text-right">النوع</th>
                <th className="table-header text-right">المحكمة</th>
                <th className="table-header text-right">الحالة</th>
                <th className="table-header text-right">الجلسة القادمة</th>
                <th className="table-header text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-light">
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="w-12 h-12 opacity-30" />
                      <p>لا توجد ملفات</p>
                      <button onClick={openNew} className="text-primary text-sm hover:underline">
                        + إضافة ملف جديد
                      </button>
                    </div>
                    </td>
                  </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors border-b">
                    <td className="table-cell">
                      <div className="font-medium">{d.title}</div>
                      <div className="text-xs text-text-light">{d.caseNumber}</div>
                    </td>
                    <td className="table-cell text-text-light">{d.client?.fullName || "-"}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {d.caseType}
                      </span>
                    </td>
                    <td className="table-cell text-text-light">{d.courtName || "-"}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(d.status)}`}>
                        {statusLabels[d.status]}
                      </span>
                    </td>
                    <td className="table-cell text-text-light">
                      {d.nextHearing ? new Date(d.nextHearing).toLocaleDateString("ar") : "-"}
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="تعديل">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal améliorée */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {editing ? "✏️ تعديل ملف" : "📁 ملف جديد"}
                </h2>
                <p className="text-xs text-text-light mt-0.5">
                  {editing ? "تعديل معلومات الملف القضائي" : "إضافة ملف قضائي جديد"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-primary">
                  عنوان الملف <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FolderOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input 
                    className="input-field pr-10" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    placeholder="أدخل عنوان الملف"
                  />
                </div>
              </div>

              {/* Client et Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <User className="w-3.5 h-3.5 inline ml-1" /> العميل
                  </label>
                  <select 
                    className="input-field" 
                    value={form.clientId} 
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    <option value="">اختر عميل</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Gavel className="w-3.5 h-3.5 inline ml-1" /> النوع
                  </label>
                  <select 
                    className="input-field" 
                    value={form.caseType} 
                    onChange={(e) => setForm({ ...form, caseType: e.target.value })}
                  >
                    {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Tribunal et Numéro */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Building2 className="w-3.5 h-3.5 inline ml-1" /> المحكمة
                  </label>
                  <input 
                    className="input-field" 
                    value={form.courtName} 
                    onChange={(e) => setForm({ ...form, courtName: e.target.value })} 
                    placeholder="اسم المحكمة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    🔢 رقم القضية
                  </label>
                  <input 
                    className="input-field" 
                    dir="ltr" 
                    value={form.caseNumber} 
                    onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} 
                    placeholder="رقم القضية"
                  />
                </div>
              </div>

              {/* Statut et Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    📊 الحالة
                  </label>
                  <select 
                    className="input-field" 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {statuses.filter((s) => s.value !== "ALL").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline ml-1" /> الجلسة القادمة
                  </label>
                  <input 
                    type="date" 
                    className="input-field" 
                    dir="ltr" 
                    value={form.nextHearing} 
                    onChange={(e) => setForm({ ...form, nextHearing: e.target.value })} 
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  📝 وصف / ملاحظات
                </label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="وصف الملف أو ملاحظات إضافية..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm px-6 py-2 rounded-lg" disabled={saving}>
                إلغاء
              </button>
              <button onClick={handleSave} className="btn-primary text-sm px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all" disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "حفظ التعديلات" : "إضافة الملف"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}