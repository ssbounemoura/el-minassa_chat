"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Eye, Filter } from "lucide-react";

const mockDossiers: any[] = [];

const caseTypes = ["الكل", "عقاري", "تجاري", "أحوال شخصية", "عقد", "تبليغ", "جزائي", "إداري"];
const statuses = [
  { value: "ALL", label: "جميع الحالات" },
  { value: "EN_COURS", label: "قيد المعالجة" },
  { value: "EN_ATTENTE", label: "في الانتظار" },
  { value: "TERMINE", label: "منتهي" },
  { value: "ANNULE", label: "ملغي" },
  { value: "ARCHIVE", label: "مؤرشف" },
];
const statusBadge: Record<string, string> = { EN_COURS: "badge-info", EN_ATTENTE: "badge-warning", TERMINE: "badge-success", ANNULE: "badge-danger", ARCHIVE: "badge" };
const statusLabel: Record<string, string> = { EN_COURS: "قيد المعالجة", EN_ATTENTE: "في الانتظار", TERMINE: "منتهي", ANNULE: "ملغي", ARCHIVE: "مؤرشف" };

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState(mockDossiers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<typeof mockDossiers[0] | null>(null);
  const [form, setForm] = useState({ title: "", client: "", caseType: "عقاري", status: "EN_COURS", courtName: "", caseNumber: "", nextHearing: "", description: "" });

  const filtered = dossiers.filter((d) => {
    const matchSearch = d.title.includes(search) || d.client.includes(search);
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchType = typeFilter === "الكل" || d.caseType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const openNew = () => { setEditing(null); setForm({ title: "", client: "", caseType: "عقاري", status: "EN_COURS", courtName: "", caseNumber: "", nextHearing: "", description: "" }); setShowModal(true); };
  const openEdit = (d: typeof mockDossiers[0]) => { setEditing(d); setForm({ title: d.title, client: d.client, caseType: d.caseType, status: d.status, courtName: d.courtName, caseNumber: d.caseNumber, nextHearing: d.nextHearing || "", description: "" }); setShowModal(true); };

  const handleSave = () => {
    if (editing) { setDossiers((p) => p.map((d) => d.id === editing.id ? { ...d, ...form, nextHearing: form.nextHearing || null } : d)); }
    else { setDossiers((p) => [{ ...form, id: Date.now().toString(), nextHearing: form.nextHearing || null, createdAt: new Date().toISOString().split("T")[0] }, ...p]); }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-primary">إدارة الملفات</h1><p className="text-text-light text-sm">{dossiers.length} ملف</p></div>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> ملف جديد</button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input className="input-field pr-10" placeholder="البحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input-field w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="table-header">الملف</th><th className="table-header">العميل</th><th className="table-header">النوع</th>
              <th className="table-header">المحكمة</th><th className="table-header">الحالة</th><th className="table-header">الجلسة القادمة</th><th className="table-header">إجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="table-cell"><div className="font-medium">{d.title}</div><div className="text-xs text-text-light">{d.caseNumber}</div></td>
                  <td className="table-cell text-text-light">{d.client}</td>
                  <td className="table-cell"><span className="badge bg-gray-100 text-gray-700">{d.caseType}</span></td>
                  <td className="table-cell text-text-light">{d.courtName || "-"}</td>
                  <td className="table-cell"><span className={statusBadge[d.status]}>{statusLabel[d.status]}</span></td>
                  <td className="table-cell text-text-light">{d.nextHearing || "-"}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("حذف؟")) setDossiers((p) => p.filter((x) => x.id !== d.id)); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">{editing ? "تعديل ملف" : "ملف جديد"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">عنوان الملف *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">العميل</label><input className="input-field" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">النوع</label>
                  <select className="input-field" value={form.caseType} onChange={(e) => setForm({ ...form, caseType: e.target.value })}>
                    {caseTypes.filter((t) => t !== "الكل").map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">المحكمة</label><input className="input-field" value={form.courtName} onChange={(e) => setForm({ ...form, courtName: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">رقم القضية</label><input className="input-field" dir="ltr" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">الحالة</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {statuses.filter((s) => s.value !== "ALL").map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">الجلسة القادمة</label><input type="date" className="input-field" dir="ltr" value={form.nextHearing} onChange={(e) => setForm({ ...form, nextHearing: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">وصف / ملاحظات</label><textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm">إلغاء</button>
              <button onClick={handleSave} className="btn-primary text-sm">{editing ? "حفظ" : "إضافة"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
