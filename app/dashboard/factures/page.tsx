"use client";

import { useState } from "react";
import { Plus, Search, Eye, X, Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const mockInvoices: any[] = [];

const statusConfig: Record<string, { badge: string; label: string; icon: typeof CheckCircle2 }> = {
  BROUILLON: { badge: "badge", label: "مسودة", icon: Clock },
  ENVOYEE: { badge: "badge-info", label: "مرسلة", icon: Clock },
  PAYEE: { badge: "badge-success", label: "مدفوعة", icon: CheckCircle2 },
  EN_RETARD: { badge: "badge-danger", label: "متأخرة", icon: AlertTriangle },
  ANNULEE: { badge: "badge", label: "ملغاة", icon: X },
};

export default function FacturesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: "", amount: "", description: "", dueDate: "" });

  const filtered = invoices.filter((inv) => inv.client.includes(search) || inv.invoiceNumber.includes(search));
  const totalPaid = invoices.filter((i) => i.status === "PAYEE").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "ENVOYEE" || i.status === "EN_RETARD").reduce((s, i) => s + i.amount, 0);

  const handleSave = () => {
    const newInv = { ...form, id: Date.now().toString(), invoiceNumber: `FAC-2026-${String(invoices.length + 1).padStart(3, "0")}`, amount: parseFloat(form.amount), status: "BROUILLON", createdAt: new Date().toISOString().split("T")[0] };
    setInvoices((p) => [newInv, ...p]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-primary">إدارة الفواتير</h1><p className="text-text-light text-sm">{invoices.length} فاتورة</p></div>
        <button onClick={() => { setForm({ client: "", amount: "", description: "", dueDate: "" }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> فاتورة جديدة</button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-sm text-text-light">إجمالي المدفوع</p><p className="text-2xl font-bold text-success">{totalPaid.toLocaleString()} د.ج</p></div>
        <div className="stat-card"><p className="text-sm text-text-light">إجمالي المعلق</p><p className="text-2xl font-bold text-warning">{totalPending.toLocaleString()} د.ج</p></div>
        <div className="stat-card"><p className="text-sm text-text-light">عدد الفواتير</p><p className="text-2xl font-bold text-primary">{invoices.length}</p></div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
        <input className="input-field pr-10" placeholder="البحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50">
            <th className="table-header">رقم الفاتورة</th><th className="table-header">العميل</th><th className="table-header">المبلغ</th>
            <th className="table-header">الحالة</th><th className="table-header">تاريخ الاستحقاق</th><th className="table-header">إجراءات</th>
          </tr></thead>
          <tbody>
            {filtered.map((inv) => {
              const cfg = statusConfig[inv.status];
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium" dir="ltr">{inv.invoiceNumber}</td>
                  <td className="table-cell">{inv.client}</td>
                  <td className="table-cell font-semibold" dir="ltr">{inv.amount.toLocaleString()} د.ج</td>
                  <td className="table-cell"><span className={cfg.badge}>{cfg.label}</span></td>
                  <td className="table-cell text-text-light">{inv.dueDate}</td>
                  <td className="table-cell">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">فاتورة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">العميل *</label><input className="input-field" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">المبلغ (د.ج) *</label><input type="number" className="input-field" dir="ltr" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label><input type="date" className="input-field" dir="ltr" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">الوصف</label><textarea className="input-field min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm">إلغاء</button>
              <button onClick={handleSave} className="btn-primary text-sm">إنشاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
