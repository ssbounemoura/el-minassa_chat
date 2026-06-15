"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Send, Calendar, Bell, Users, Trash2, Loader2,
  CheckCircle, AlertTriangle, HelpCircle, Eye, Info
} from "lucide-react";

interface NotificationLog {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  link: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TYPE_LABELS: Record<string, string> = {
  info: "معلومات عمومی",
  warning: "تنبيه هام",
  success: "نجاح العملية",
  hearing: "جلسة قضائية",
  deadline: "موعد نهائي",
  "daily-summary": "ملخص يومي",
};

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  success: "bg-green-100 text-green-700",
  hearing: "bg-purple-100 text-purple-700",
  deadline: "bg-red-100 text-red-700",
  "daily-summary": "bg-gray-100 text-gray-700",
};

const ROLE_LABELS: Record<string, string> = {
  AVOCAT: "محامي",
  NOTAIRE: "موثق",
  HUISSIER: "محضر قضائي",
};

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<"all" | "role" | "user">("all");
  const [targetRole, setTargetRole] = useState("AVOCAT");
  const [targetUserId, setTargetUserId] = useState("");
  const [type, setType] = useState("info");
  const [priority, setPriority] = useState("normal");
  const [link, setLink] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.users || []);
        if (data.users && data.users.length > 0) {
          setTargetUserId(data.users[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchLogs();
      await fetchSubscribers();
    };
    void loadData();
  }, [fetchLogs, fetchSubscribers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSending(true);
    setAlertMessage(null);

    const payload = {
      title,
      content,
      targetType,
      targetRole: targetType === "role" ? targetRole : undefined,
      targetUserId: targetType === "user" ? targetUserId : undefined,
      type,
      priority,
      link: link.trim() || undefined,
    };

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setAlertMessage({
          type: "success",
          text: `تم إرسال الإشعار بنجاح! تم استهداف ${data.count} مستخدم.`,
        });
        // Reset form
        setTitle("");
        setContent("");
        setLink("");
        fetchLogs(); // Refresh history
      } else {
        setAlertMessage({ type: "error", text: data.error || "خطأ أثناء إرسال الإشعار" });
      }
    } catch {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالخادم لإرسال الإشعار" });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟ سيختفي من صندوق إشعارات المستخدم.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((log) => log.id !== id));
      } else {
        const data = await res.json();
        window.alert(data.error || "خطأ أثناء الحذف");
      }
    } catch {
      window.alert("فشل الاتصال بالخادم لحذف الإشعار");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-secondary" /> إدارة الإعلانات والإشعارات
        </h1>
        <p className="text-text-light text-sm">بث وتوجيه الإعلانات والتنبيهات المباشرة إلى المشتركين</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "new"
              ? "border-primary text-primary"
              : "border-transparent text-text-light hover:text-primary"
          }`}
        >
          بث إشعار جديد
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-text-light hover:text-primary"
          }`}
        >
          سجل الإرسال التاريخي ({logs.length})
        </button>
      </div>

      {/* Alert banner */}
      {alertMessage && (
        <div
          className={`px-4 py-3 rounded-xl text-sm flex items-center gap-3 border ${
            alertMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {alertMessage.type === "success" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
          <span>{alertMessage.text}</span>
          <button className="mr-auto font-bold" onClick={() => setAlertMessage(null)}>×</button>
        </div>
      )}

      {/* Tab 1: New Announcement Form */}
      {activeTab === "new" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="card md:col-span-2">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-border pb-3">
              <Send className="w-5 h-5 text-secondary" /> إعداد الرسالة والتوجيه
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-text-light mb-1 block">الجهة المستهدفة</label>
                  <select
                    className="input-field"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as "all" | "role" | "user")}
                  >
                    <option value="all">جميع المشتركين</option>
                    <option value="role">فئة مهنية معينة</option>
                    <option value="user">مشترك محدد</option>
                  </select>
                </div>

                {targetType === "role" && (
                  <div>
                    <label className="text-sm text-text-light mb-1 block">الفئة المستهدفة</label>
                    <select
                      className="input-field"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    >
                      <option value="AVOCAT">المحامين فقط</option>
                      <option value="NOTAIRE">الموثقين فقط</option>
                      <option value="HUISSIER">المحضرين القضائيين فقط</option>
                    </select>
                  </div>
                )}

                {targetType === "user" && (
                  <div>
                    <label className="text-sm text-text-light mb-1 block">اختر المشترك</label>
                    {loadingSubs ? (
                      <div className="py-2 text-text-light text-xs flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" /> جاري التحميل...
                      </div>
                    ) : (
                      <select
                        className="input-field"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                      >
                        {subscribers.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.email} - {ROLE_LABELS[sub.role] || sub.role})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-text-light mb-1 block">عنوان الإشعار</label>
                  <input
                    className="input-field"
                    placeholder="مثال: تحديث أمني عاجل بالنظام"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-text-light mb-1 block">نوع الإشعار</label>
                  <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="info">معلومات (Info)</option>
                    <option value="warning">تنبيه هام (Warning)</option>
                    <option value="success">نجاح عملية (Success)</option>
                    <option value="hearing">جلسة (Hearing)</option>
                    <option value="deadline">موعد أخير (Deadline)</option>
                  </select>
                </div>
              </div>

              {/* Content text */}
              <div>
                <label className="text-sm text-text-light mb-1 block">نص الإعلان بالتفصيل</label>
                <textarea
                  rows={5}
                  className="input-field"
                  placeholder="اكتب هنا محتوى الرسالة التي ستصل للجهة المستهدفة..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* Priority & Link */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-text-light mb-1 block">الأولوية</label>
                  <select
                    className="input-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="normal">عادية (Normal)</option>
                    <option value="high">مرتفعة (High)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-text-light mb-1 block">رابط التوجيه (اختياري)</label>
                  <input
                    className="input-field text-left"
                    dir="ltr"
                    placeholder="/dashboard/factures"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                  <span className="text-[10px] text-text-light">رابط نسبي في المنصة يتم نقله عند الضغط.</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button type="submit" disabled={sending} className="btn-primary text-sm flex items-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} بث الإعلان الآن
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info & Preview */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-1.5">
                <Eye className="w-5 h-5 text-secondary" /> معاينة الإشعار الحيّ
              </h3>
              <div className="border border-border rounded-xl p-4 bg-gray-50/50 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className={`badge ${TYPE_COLORS[type] || "bg-gray-100"}`}>
                    {TYPE_LABELS[type] || type}
                  </span>
                  {priority === "high" && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                      عاجل
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-primary text-sm">{title || "عنوان الإشعار المعروض"}</h4>
                <p className="text-xs text-text-light leading-relaxed whitespace-pre-wrap">
                  {content || "محتوى الرسالة سيظهر للمشترك هنا بشكل مباشر..."}
                </p>
                <div className="text-[10px] text-text-light flex justify-between border-t border-gray-100 pt-2">
                  <span>المرسل: إدارة النظام</span>
                  <span>الآن</span>
                </div>
              </div>
            </div>

            <div className="card bg-primary text-white space-y-2">
              <h3 className="font-semibold flex items-center gap-1.5 text-sm text-secondary">
                <Info className="w-4 h-4" /> نصيحة الإرسال
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                استخدم الإرسال المستهدف بالفئة عندما تود توجيه إعلانات تخص مهنة معينة كالمحامين أو المحضرين فقط. الإعلانات العامة تظهر لجميع المستخدمين في المنصة مباشرة دون الحاجة لتحديث الصفحة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sent History Logs */}
      {activeTab === "history" && (
        <div className="card p-0 overflow-hidden">
          {loadingLogs ? (
            <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-light">لم يتم إرسال أي إشعار حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header">المستلم</th>
                    <th className="table-header">نوع المهنة</th>
                    <th className="table-header">عنوان الإعلان</th>
                    <th className="table-header">المحتوى</th>
                    <th className="table-header">التصنيف</th>
                    <th className="table-header">تاريخ الإرسال</th>
                    <th className="table-header">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <p className="font-medium text-sm">{log.user?.name || "مستخدم غير معرف"}</p>
                        <p className="text-xs text-text-light">{log.user?.email || "—"}</p>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-primary">
                          {ROLE_LABELS[log.user?.role] || log.user?.role || "—"}
                        </span>
                      </td>
                      <td className="table-cell font-medium text-sm">{log.title}</td>
                      <td className="table-cell max-w-xs truncate text-xs text-text-light" title={log.content}>
                        {log.content}
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`badge ${TYPE_COLORS[log.type] || "bg-gray-100"}`}>
                            {TYPE_LABELS[log.type] || log.type}
                          </span>
                          {log.priority === "high" && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full font-bold">عاجل</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-xs text-text-light">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(log.createdAt).toLocaleString("ar-DZ", {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          disabled={deletingId === log.id}
                          onClick={() => handleDelete(log.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-500 disabled:opacity-50"
                          title="سحب الإشعار / حذف"
                        >
                          {deletingId === log.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
