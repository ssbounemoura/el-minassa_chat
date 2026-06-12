"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin } from "lucide-react";

const mockClients: any[] = [];

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<typeof mockClients[0] | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", address: "", nationalId: "", notes: "" });

  const filtered = clients.filter((c) => c.fullName.includes(search) || c.phone.includes(search));

  const openNew = () => {
    setEditingClient(null);
    setForm({ fullName: "", phone: "", email: "", address: "", nationalId: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (client: typeof mockClients[0]) => {
    setEditingClient(client);
    setForm({ fullName: client.fullName, phone: client.phone, email: client.email, address: client.address, nationalId: client.nationalId, notes: client.notes });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingClient) {
      setClients((prev) => prev.map((c) => c.id === editingClient.id ? { ...c, ...form } : c));
    } else {
      const newClient = { ...form, id: Date.now().toString(), createdAt: new Date().toISOString().split("T")[0] };
      setClients((prev) => [newClient, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">إدارة العملاء</h1>
          <p className="text-text-light text-sm">{clients.length} عميل مسجل</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة عميل
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
        <input
          className="input-field pr-10"
          placeholder="البحث عن عميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">الاسم</th>
                <th className="table-header">الهاتف</th>
                <th className="table-header">البريد</th>
                <th className="table-header">العنوان</th>
                <th className="table-header">تاريخ التسجيل</th>
                <th className="table-header">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{client.fullName}</td>
                  <td className="table-cell text-text-light" dir="ltr">{client.phone}</td>
                  <td className="table-cell text-text-light" dir="ltr">{client.email || "-"}</td>
                  <td className="table-cell text-text-light">{client.address}</td>
                  <td className="table-cell text-text-light">{client.createdAt}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">{editingClient ? "تعديل عميل" : "إضافة عميل جديد"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
                <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1"><Phone className="w-4 h-4 inline" /> الهاتف</label>
                  <input className="input-field" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1"><Mail className="w-4 h-4 inline" /> البريد</label>
                  <input className="input-field" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1"><MapPin className="w-4 h-4 inline" /> العنوان</label>
                <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم التعريف الوطني</label>
                <input className="input-field" dir="ltr" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea className="input-field min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm">إلغاء</button>
              <button onClick={handleSave} className="btn-primary text-sm">{editingClient ? "حفظ التعديلات" : "إضافة العميل"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
