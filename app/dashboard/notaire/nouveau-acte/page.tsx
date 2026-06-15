"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, X } from "lucide-react";

const TYPES_ACTE = [
  { value: "VENTE", label: "🏠 عقد بيع", description: "عقد بيع عقار أو منقول" },
  { value: "DONATION", label: "🎁 عقد هبة", description: "عقد هبة ووصية" },
  { value: "MARIAGE", label: "💍 عقد زواج", description: "عقد زواج وشروط" },
  { value: "SUCCESSION", label: "📋 عقد توزيع التركة", description: "توزيع التركة والوصايا" },
  { value: "HYPOTHEQUE", label: "🏦 عقد رهن", description: "عقد رهن عقار" },
  { value: "BAIL", label: "📄 عقد إيجار", description: "عقد إيجار سكني أو تجاري" },
];

export default function NouveauActePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    numeroActe: "",
    typeActe: "",
    dateActe: new Date().toISOString().split("T")[0],
    clientId: "",
    montantTransaction: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/notaire/actes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroActe: form.numeroActe,
          typeActe: form.typeActe,
          dateActe: form.dateActe,
          montantTransaction: form.montantTransaction ? parseFloat(form.montantTransaction) : 0,
          description: form.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/notaire/actes/${data.acte.id}`);
      } else {
        alert(data.error || "خطأ في إنشاء العقد");
      }
    } catch (error) {
      console.error("خطأ في إنشاء العقد:", error);
      alert("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/notaire"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <ArrowRight size={20} />
              العودة
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">إنشاء عقد موثق جديد</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-24 mx-2 transition-all ${
                    step > s ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Type d'acte */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">اختر نوع العقد</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TYPES_ACTE.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, typeActe: type.value }));
                          setStep(2);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-right ${
                          form.typeActe === type.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        <div className="text-lg font-semibold text-slate-900">{type.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Informations de base */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">معلومات العقد الأساسية</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">رقم العقد *</label>
                      <input
                        type="text"
                        name="numeroActe"
                        value={form.numeroActe}
                        onChange={handleChange}
                        required
                        placeholder="مثال: ACT-2026-001"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">تاريخ العقد *</label>
                      <input
                        type="date"
                        name="dateActe"
                        value={form.dateActe}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">المبلغ (د.ج)</label>
                      <input
                        type="number"
                        name="montantTransaction"
                        value={form.montantTransaction}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">الوصف</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="وصف مختصر للعقد"
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmations */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">تأكيد البيانات</h2>

                  <div className="space-y-4 bg-slate-50 rounded-lg p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-slate-600">النوع:</span>
                      <span className="font-semibold text-slate-900">
                        {TYPES_ACTE.find((t) => t.value === form.typeActe)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-slate-600">رقم العقد:</span>
                      <span className="font-semibold text-slate-900">{form.numeroActe}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-slate-600">التاريخ:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(form.dateActe).toLocaleDateString("ar-DZ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">المبلغ:</span>
                      <span className="font-semibold text-slate-900">
                        {form.montantTransaction ? `${parseFloat(form.montantTransaction).toLocaleString()} د.ج` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-all"
                >
                  السابق
                </button>
              )}
              <div className="flex-1"></div>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && (!form.numeroActe || !form.typeActe)) {
                      alert("يرجى ملء البيانات المطلوبة");
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:bg-slate-400"
                >
                  <Save size={20} />
                  {loading ? "جاري الحفظ..." : "حفظ العقد"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
