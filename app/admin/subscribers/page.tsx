"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, UserCheck, UserX, Trash2, Loader2, Eye, Shield, Filter,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = { AVOCAT: "محامي", NOTAIRE: "موثق", HUISSIER: "محضر قضائي" };
const roleColors: Record<string, string> = { AVOCAT: "bg-blue-100 text-blue-700", NOTAIRE: "bg-purple-100 text-purple-700", HUISSIER: "bg-orange-100 text-orange-700" };

interface Subscriber {
  id: string; name: string; email: string; phone: string | null; role: string;
  officeName: string | null; isActive: boolean; wilaya: string | null;
  plan: string | null; subscriptionActive: boolean; createdAt: string;
}

export default function SubscribersPage() {
  const [users, setUsers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<Subscriber | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/subscribers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (id: string) => {
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-active", id }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: data.isActive } : u));
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشترك وجميع بياناته؟")) return;
    const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users className="w-7 h-7" /> إدارة المشتركين
          </h1>
          <p className="text-text-light text-sm mt-1">{users.length} مشترك — {activeCount} نشط</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pr-10"
            placeholder="بحث بالاسم أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">جميع المهن</option>
          <option value="AVOCAT">محامي</option>
          <option value="NOTAIRE">موثق</option>
          <option value="HUISSIER">محضر قضائي</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-light">لا يوجد مشتركون</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">الاسم</th>
                  <th className="table-header">المهنة</th>
                  <th className="table-header">الولاية</th>
                  <th className="table-header">الخطة</th>
                  <th className="table-header">الحالة</th>
                  <th className="table-header">التاريخ</th>
                  <th className="table-header">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-text-light">{user.email}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${roleColors[user.role] || "bg-gray-100"}`}>{ROLE_LABELS[user.role] || user.role}</span>
                    </td>
                    <td className="table-cell text-text-light text-sm">{user.wilaya || "—"}</td>
                    <td className="table-cell text-sm">{user.plan || "—"}</td>
                    <td className="table-cell">
                      {user.isActive ? (
                        <span className="badge-success flex items-center gap-1 w-fit"><UserCheck className="w-3 h-3" /> نشط</span>
                      ) : (
                        <span className="badge-danger flex items-center gap-1 w-fit"><UserX className="w-3 h-3" /> معلق</span>
                      )}
                    </td>
                    <td className="table-cell text-text-light text-xs">{new Date(user.createdAt).toLocaleDateString("ar-DZ")}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedUser(user)} className="p-1.5 rounded hover:bg-blue-50" title="عرض">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => toggleActive(user.id)} className="p-1.5 rounded hover:bg-yellow-50" title={user.isActive ? "تعطيل" : "تفعيل"}>
                          <Shield className={`w-4 h-4 ${user.isActive ? "text-yellow-500" : "text-green-500"}`} />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded hover:bg-red-50" title="حذف">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">تفاصيل المشترك</h3>
            <div className="space-y-3 text-sm">
              {[
                ["الاسم", selectedUser.name],
                ["البريد", selectedUser.email],
                ["الهاتف", selectedUser.phone || "—"],
                ["المهنة", ROLE_LABELS[selectedUser.role] || selectedUser.role],
                ["المكتب", selectedUser.officeName || "—"],
                ["الولاية", selectedUser.wilaya || "—"],
                ["الخطة", selectedUser.plan || "لا يوجد"],
                ["الحالة", selectedUser.isActive ? "نشط ✓" : "معلق ✗"],
                ["تاريخ التسجيل", new Date(selectedUser.createdAt).toLocaleDateString("ar-DZ")],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-text-light">{label}</span>
                  <span className="font-medium text-primary">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedUser(null)} className="btn-outline w-full mt-6 text-sm">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
