"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Plus, Trash2, FileText } from "lucide-react";

type ActeNotarie = {
  id: string;
  numeroActe: string;
  typeActe: string;
  dateActe: string;
  status: string;
  montantTransaction?: number;
  description?: string;
  nombrePages?: number;
  dateSignature?: string;
  client?: { fullName: string; email: string; phone: string };
  registreNotariae?: any;
  parties?: any[];
};

export default function ActeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const acteId = params.id as string;

  const [acte, setActe] = useState<ActeNotarie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPartie, setShowAddPartie] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [form, setForm] = useState({
    status: "",
    nombrePages: 0,
    remarques: "",
    controleLegalite: false,
  });

  const [partieForm, setPartieForm] = useState({
    nomComplet: "",
    qualite: "VENDEUR",
    telephone: "",
    email: "",
  });

  const [registreForm, setRegistreForm] = useState({
    numeroRegistre: "",
    volume: "",
    page: "",
    fraisRegistre: "",
  });

  useEffect(() => {
    fetchActe();
  }, [acteId]);

  const fetchActe = async () => {
    try {
      const res = await fetch(`/api/notaire/actes/${acteId}`);
      const data = await res.json();

      if (data.success) {
        setActe(data.acte);
        setForm({
          status: data.acte.status,
          nombrePages: data.acte.nombrePages || 0,
          remarques: data.acte.remarques || "",
          controleLegalite: data.acte.controleLegalite || false,
        });
      }
    } catch (error) {
      console.error("خطأ في جلب العقد:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notaire/actes/${acteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("تم حفظ التعديلات بنجاح");
        fetchActe();
      } else {
        alert("خطأ في الحفظ");
      }
    } catch (error) {
      console.error("خطأ في الحفظ:", error);
      alert("فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPartie = async () => {
    try {
      const res = await fetch("/api/notaire/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acteId,
          ...partieForm,
        }),
      });

      if (res.ok) {
        alert("تم إضافة الطرف بنجاح");
        setPartieForm({ nomComplet: "", qualite: "VENDEUR", telephone: "", email: "" });
        setShowAddPartie(false);
        fetchActe();
      } else {
        alert("خطأ في إضافة الطرف");
      }
    } catch (error) {
      console.error("خطأ في إضافة الطرف:", error);
      alert("فشل الاتصال بالخادم");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/notaire/registre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acteId,
          numeroRegistre: registreForm.numeroRegistre,
          volume: registreForm.volume ? parseInt(registreForm.volume) : undefined,
          page: registreForm.page ? parseInt(registreForm.page) : undefined,
          fraisRegistre: registreForm.fraisRegistre ? parseFloat(registreForm.fraisRegistre) : undefined,
        }),
      });

      if (res.ok) {
        alert("تم تسجيل العقد بنجاح");
        setShowRegister(false);
        fetchActe();
      } else {
        const data = await res.json();
        alert(data.error || "خطأ في التسجيل");
      }
    } catch (error) {
      console.error("خطأ في تسجيل العقد:", error);
      alert("فشل الاتصال بالخادم");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!acte) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-600 mb-4">لم يتم العثور على العقد</p>
          <Link href="/dashboard/notaire/actes" className="text-blue-600 hover:text-blue-800 font-medium">
            العودة إلى القائمة
          </Link>
        </div>
      </div>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    VENTE: "عقد بيع",
    DONATION: "عقد هبة",
    MARIAGE: "عقد زواج",
    SUCCESSION: "عقد توزيع التركة",
    HYPOTHEQUE: "عقد رهن",
    BAIL: "عقد إيجار",
  };

  const STATUS_LABELS: Record<string, string> = {
    EN_COURS: "قيد المعالجة",
    SIGNE: "موقعة",
    ENREGISTRE: "مسجلة",
    ARCHIVE: "مؤرشفة",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      EN_COURS: "text-yellow-600 bg-yellow-50",
      SIGNE: "text-blue-600 bg-blue-50",
      ENREGISTRE: "text-green-600 bg-green-50",
      ARCHIVE: "text-gray-600 bg-gray-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notaire/actes" className="text-blue-600 hover:text-blue-800">
                <ArrowRight size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">تفاصيل العقد</h1>
                <p className="text-slate-600 mt-1">{acte.numeroActe}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(acte.status)}`}>
              {STATUS_LABELS[acte.status] || acte.status}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Information */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">معلومات العقد</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm mb-1">رقم العقد</p>
                  <p className="font-semibold text-slate-900">{acte.numeroActe}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">نوع العقد</p>
                  <p className="font-semibold text-slate-900">{TYPE_LABELS[acte.typeActe] || acte.typeActe}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">التاريخ</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(acte.dateActe).toLocaleDateString("ar-DZ")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">المبلغ</p>
                  <p className="font-semibold text-slate-900">
                    {acte.montantTransaction ? `${(acte.montantTransaction / 1000000).toFixed(2)}M` : "-"}
                  </p>
                </div>
              </div>
              {acte.description && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-2">الوصف</p>
                  <p className="text-slate-900">{acte.description}</p>
                </div>
              )}
            </div>

            {/* Parties */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">الأطراف</h2>
                <button
                  onClick={() => setShowAddPartie(!showAddPartie)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Plus size={18} />
                  إضافة طرف
                </button>
              </div>

              {showAddPartie && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={partieForm.nomComplet}
                    onChange={(e) => setPartieForm({ ...partieForm, nomComplet: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                  <select
                    value={partieForm.qualite}
                    onChange={(e) => setPartieForm({ ...partieForm, qualite: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VENDEUR">بائع</option>
                    <option value="ACQUEREUR">مشتري</option>
                    <option value="DONOR">واهب</option>
                    <option value="DONATAIRE">موهوب له</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="الهاتف"
                    value={partieForm.telephone}
                    onChange={(e) => setPartieForm({ ...partieForm, telephone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                  <button
                    onClick={handleAddPartie}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    حفظ الطرف
                  </button>
                </div>
              )}

              {acte.parties && acte.parties.length > 0 ? (
                <div className="space-y-3">
                  {acte.parties.map((partie: any) => (
                    <div key={partie.id} className="p-4 border border-slate-200 rounded-lg">
                      <p className="font-semibold text-slate-900">{partie.nomComplet}</p>
                      <p className="text-sm text-slate-600 mt-1">الصفة: {partie.qualite}</p>
                      {partie.telephone && <p className="text-sm text-slate-600">الهاتف: {partie.telephone}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">لا توجد أطراف مسجلة</p>
              )}
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">تحديث الحالة</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">الحالة</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EN_COURS">قيد المعالجة</option>
                    <option value="SIGNE">موقعة</option>
                    <option value="ENREGISTRE">مسجلة</option>
                    <option value="ARCHIVE">مؤرشفة</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">عدد الصفحات</label>
                    <input
                      type="number"
                      value={form.nombrePages}
                      onChange={(e) => setForm({ ...form, nombrePages: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">فحص القانونية</label>
                    <label className="flex items-center gap-2 pt-3">
                      <input
                        type="checkbox"
                        checked={form.controleLegalite}
                        onChange={(e) => setForm({ ...form, controleLegalite: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-slate-900">تم فحص القانونية</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">ملاحظات</label>
                  <textarea
                    value={form.remarques}
                    onChange={(e) => setForm({ ...form, remarques: e.target.value })}
                    placeholder="أضف ملاحظات إن لزم الأمر"
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-400"
                >
                  <Save size={20} />
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Registration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">التسجيل</h3>
              {acte.registreNotariae ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">✓ مسجل</p>
                    <p className="text-sm text-green-700 mt-2">رقم التسجيل: {acte.registreNotariae.numeroRegistre}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegister(!showRegister)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                >
                  تسجيل العقد
                </button>
              )}

              {showRegister && !acte.registreNotariae && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="رقم التسجيل"
                    value={registreForm.numeroRegistre}
                    onChange={(e) => setRegistreForm({ ...registreForm, numeroRegistre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm"
                  />
                  <input
                    type="number"
                    placeholder="المجلد"
                    value={registreForm.volume}
                    onChange={(e) => setRegistreForm({ ...registreForm, volume: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleRegister}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                  >
                    حفظ التسجيل
                  </button>
                </div>
              )}
            </div>

            {/* Client Info */}
            {acte.client && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">الطرف الأساسي</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-600 text-sm">الاسم</p>
                    <p className="font-semibold text-slate-900">{acte.client.fullName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">البريد الإلكتروني</p>
                    <p className="font-semibold text-slate-900">{acte.client.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">الهاتف</p>
                    <p className="font-semibold text-slate-900">{acte.client.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">الإجراءات</h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all">
                <FileText size={18} />
                تحميل المستند
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
