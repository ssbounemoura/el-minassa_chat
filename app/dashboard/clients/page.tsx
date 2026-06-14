"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, User, Save, CheckCircle, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
  notes: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", address: "", nationalId: "", notes: "" });

  // Validation des champs
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validateForm = () => {
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      showToast("خطأ في تحميل العملاء", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = clients.filter((c) => 
    c.fullName.includes(search) || c.phone.includes(search)
  );

  const openNew = () => {
    setEditingClient(null);
    setForm({ fullName: "", phone: "", email: "", address: "", nationalId: "", notes: "" });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({ 
      fullName: client.fullName, 
      phone: client.phone || "", 
      email: client.email || "", 
      address: client.address || "", 
      nationalId: client.nationalId || "", 
      notes: client.notes || "" 
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      if (editingClient) {
        const res = await fetch("/api/clients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingClient.id, ...form }),
        });
        if (res.ok) {
          showToast("✅ تم تعديل العميل بنجاح", "success");
          await loadClients();
        } else {
          showToast("❌ خطأ في تعديل العميل", "error");
        }
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast("✅ تم إضافة العميل بنجاح", "success");
          await loadClients();
        } else {
          showToast("❌ خطأ في إضافة العميل", "error");
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde client:", error);
      showToast("❌ خطأ في الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      try {
        const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("✅ تم حذف العميل بنجاح", "success");
          await loadClients();
        } else {
          showToast("❌ خطأ في حذف العميل", "error");
        }
      } catch (error) {
        console.error("Erreur suppression client:", error);
        showToast("❌ خطأ في الاتصال بالخادم", "error");
      }
    }
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
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-primary">👥 إدارة العملاء</h1>
          <p className="text-text-light text-sm mt-1">{clients.length} عميل مسجل</p>
        </div>
        <button 
          onClick={openNew} 
          className="btn-primary text-sm flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> إضافة عميل
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
        <input
          className="input-field pr-10 bg-white"
          placeholder="البحث عن عميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <th className="table-header text-right">الاسم</th>
                <th className="table-header text-right">الهاتف</th>
                <th className="table-header text-right">البريد</th>
                <th className="table-header text-right">العنوان</th>
                <th className="table-header text-right">تاريخ التسجيل</th>
                <th className="table-header text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-light">
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-12 h-12 opacity-30" />
                      <p>لا توجد عملاء</p>
                      <button onClick={openNew} className="text-primary text-sm hover:underline">
                        + إضافة عميل جديد
                      </button>
                    </div>
                  </td>
                 </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors border-b">
                    <td className="table-cell font-medium">{client.fullName}</td>
                    <td className="table-cell text-text-light" dir="ltr">{client.phone || "-"}</td>
                    <td className="table-cell text-text-light" dir="ltr">{client.email || "-"}</td>
                    <td className="table-cell text-text-light">{client.address || "-"}</td>
                    <td className="table-cell text-text-light">{new Date(client.createdAt).toLocaleDateString("ar")}</td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openEdit(client)} 
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)} 
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="حذف"
                        >
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
                  {editingClient ? "✏️ تعديل عميل" : "➕ عميل جديد"}
                </h2>
                <p className="text-xs text-text-light mt-0.5">
                  {editingClient ? "تعديل معلومات العميل" : "إضافة عميل جديد إلى قاعدة البيانات"}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-primary">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input 
                    className={`input-field pr-10 ${errors.fullName ? "border-red-500 focus:border-red-500" : ""}`}
                    value={form.fullName} 
                    onChange={(e) => {
                      setForm({ ...form, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }} 
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Téléphone et Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Phone className="w-3.5 h-3.5 inline ml-1" /> رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                    <input 
                      className="input-field pr-10" 
                      dir="ltr" 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      placeholder="05XX XX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Mail className="w-3.5 h-3.5 inline ml-1" /> البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                    <input 
                      className={`input-field pr-10 ${errors.email ? "border-red-500" : ""}`}
                      dir="ltr" 
                      value={form.email} 
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }} 
                      placeholder="client@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline ml-1" /> العنوان
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input 
                    className="input-field pr-10" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    placeholder="العنوان الكامل"
                  />
                </div>
              </div>

              {/* Numéro d'identification */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  🆔 رقم التعريف الوطني
                </label>
                <input 
                  className="input-field" 
                  dir="ltr" 
                  value={form.nationalId} 
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })} 
                  placeholder="رقم البطاقة الوطنية"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  📝 ملاحظات
                </label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button 
                onClick={() => setShowModal(false)} 
                className="btn-outline text-sm px-6 py-2 rounded-lg"
                disabled={saving}
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave} 
                className="btn-primary text-sm px-6 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingClient ? "حفظ التعديلات" : "إضافة العميل"}
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