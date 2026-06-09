"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Plus, Edit3, Trash2, Loader2, X, CheckCircle2, Save } from "lucide-react";

interface Plan {
  id: string; name: string; price: number; durationDays: number;
  features: string; maxDossiers: number; maxClients: number;
  isActive: boolean; subscriberCount: number; activeCount: number;
}

const emptyPlan = { name: "", price: 0, durationDays: 30, features: "", maxDossiers: 50, maxClients: 100, isActive: true };

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) { const data = await res.json(); setPlans(data.plans || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const savePlan = async () => {
    if (!editing?.name || editing.price === undefined) { setError("الاسم والسعر مطلوبان"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); return; }
      setEditing(null);
      fetchPlans();
    } catch { setError("خطأ في الحفظ"); }
    finally { setSaving(false); }
  };

  const deletePlan = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (plan && plan.subscriberCount > 0) {
      setError(`لا يمكن حذف "${plan.name}" — يوجد ${plan.subscriberCount} مشترك نشط`);
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذه الخطة؟")) return;
    const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } else {
      const data = await res.json();
      setError(data.error || "خطأ في الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <CreditCard className="w-7 h-7" /> الخطط والأسعار
          </h1>
          <p className="text-text-light text-sm mt-1">{plans.length} خطة متاحة</p>
        </div>
        <button onClick={() => setEditing({ ...emptyPlan })} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة خطة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span className="text-red-500 font-bold">!</span> {error}
          <button onClick={() => setError("")} className="mr-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`card relative ${!plan.isActive ? "opacity-60" : ""}`}>
              {!plan.isActive && (
                <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">معطلة</span>
              )}
              <h3 className="text-xl font-bold text-primary mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">{plan.price.toLocaleString("ar-DZ")}</span>
                <span className="text-text-light text-sm"> د.ج / {plan.durationDays} يوم</span>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> {plan.maxDossiers} ملف</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> {plan.maxClients} عميل</p>
                {plan.features.split(",").filter(Boolean).map((f, i) => (
                  <p key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> {f.trim()}</p>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 mb-4">
                <p className="text-sm text-text-light">{plan.subscriberCount} مشترك ({plan.activeCount} نشط)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing({ ...plan })}
                  className="btn-outline text-sm flex-1 flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-4 h-4" /> تعديل
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">{editing.id ? "تعديل الخطة" : "خطة جديدة"}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-light mb-1 block">اسم الخطة</label>
                  <input className="input-field" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-text-light mb-1 block">السعر (د.ج)</label>
                  <input className="input-field" type="number" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-text-light mb-1 block">المدة (أيام)</label>
                  <input className="input-field" type="number" value={editing.durationDays || 30} onChange={(e) => setEditing({ ...editing, durationDays: parseInt(e.target.value) || 30 })} />
                </div>
                <div>
                  <label className="text-sm text-text-light mb-1 block">أقصى ملفات</label>
                  <input className="input-field" type="number" value={editing.maxDossiers || 50} onChange={(e) => setEditing({ ...editing, maxDossiers: parseInt(e.target.value) || 50 })} />
                </div>
                <div>
                  <label className="text-sm text-text-light mb-1 block">أقصى عملاء</label>
                  <input className="input-field" type="number" value={editing.maxClients || 100} onChange={(e) => setEditing({ ...editing, maxClients: parseInt(e.target.value) || 100 })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-light mb-1 block">المميزات (مفصولة بفاصلة)</label>
                <input className="input-field" value={editing.features || ""} onChange={(e) => setEditing({ ...editing, features: e.target.value })} placeholder="مراسلات,AI,تلخيص" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                <span>الخطة نشطة</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={savePlan} disabled={saving} className="btn-primary text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
              </button>
              <button onClick={() => setEditing(null)} className="btn-outline text-sm flex-1">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
