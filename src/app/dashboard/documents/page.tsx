"use client";

import { useState } from "react";
import { Upload, Search, FileText, FolderOpen, Download, Trash2, X, Grid3X3, List } from "lucide-react";

const mockDocuments: any[] = [];

const categories = ["الكل", "عقود", "محاضر", "إنذارات", "تقارير", "وكالات", "مذكرات", "أخرى"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "عقود" });

  const filtered = documents.filter((d) => {
    const matchSearch = d.title.includes(search);
    const matchCat = category === "الكل" || d.category === category;
    return matchSearch && matchCat;
  });

  const handleUpload = () => {
    const newDoc = { ...form, id: Date.now().toString(), fileUrl: "#", fileSize: Math.floor(Math.random() * 500000), dossier: "", createdAt: new Date().toISOString().split("T")[0] };
    setDocuments((p) => [newDoc, ...p]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-primary">إدارة الوثائق</h1><p className="text-text-light text-sm">{documents.length} وثيقة</p></div>
        <button onClick={() => { setForm({ title: "", category: "عقود" }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> رفع وثيقة</button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input className="input-field pr-10" placeholder="البحث عن وثيقة..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-white" : "bg-surface"}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-white" : "bg-surface"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-primary/10 rounded-lg"><FileText className="w-8 h-8 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-text-light mt-1">{doc.category} • {formatFileSize(doc.fileSize)}</p>
                  <p className="text-xs text-text-light">{doc.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 btn-outline text-xs py-1.5 flex items-center justify-center gap-1"><Download className="w-3 h-3" /> تحميل</button>
                <button onClick={() => setDocuments((p) => p.filter((d) => d.id !== doc.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="table-header">الوثيقة</th><th className="table-header">التصنيف</th><th className="table-header">الحجم</th><th className="table-header">التاريخ</th><th className="table-header">إجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{doc.title}</div></td>
                  <td className="table-cell"><span className="badge bg-gray-100 text-gray-700">{doc.category}</span></td>
                  <td className="table-cell text-text-light" dir="ltr">{formatFileSize(doc.fileSize)}</td>
                  <td className="table-cell text-text-light">{doc.createdAt}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Download className="w-4 h-4" /></button>
                      <button onClick={() => setDocuments((p) => p.filter((d) => d.id !== doc.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">رفع وثيقة جديدة</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">اسم الوثيقة *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">التصنيف</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.filter((c) => c !== "الكل").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 text-text-light mx-auto mb-3" />
                <p className="text-text-light text-sm">اسحب الملف هنا أو انقر للاختيار</p>
                <p className="text-xs text-text-light mt-1">PDF, DOCX, JPG - حتى 10 MB</p>
                <input type="file" className="hidden" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm">إلغاء</button>
              <button onClick={handleUpload} className="btn-primary text-sm">رفع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
