"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, CheckCheck, Trash2, Clock, Gavel, Calendar, RefreshCw, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  priority: string;
  link: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  hearing: { icon: Gavel, color: "text-red-600", bg: "bg-red-50" },
  deadline: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  appointment: { icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
  "daily-summary": { icon: Info, color: "text-primary", bg: "bg-primary/5" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return date.toLocaleDateString("ar-DZ");
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const unreadParam = filter === "unread" ? "&unread=true" : "";
      const res = await fetch(`/api/notifications?limit=50${unreadParam}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const triggerDaily = async () => {
    setTriggering(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger-daily" }),
      });
      await fetchNotifications();
    } catch { /* ignore */ }
    finally { setTriggering(false); }
  };

  const deleteNotif = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const n = notifications.find((x) => x.id === id);
    if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Bell className="w-7 h-7" /> الإشعارات
          </h1>
          <p className="text-text-light text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerDaily}
            disabled={triggering}
            className="btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث الملخص اليومي
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-primary text-sm flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">تنبيه الثامنة صباحاً</p>
          <p className="text-xs text-text-light mt-1">
            يتم إرسال ملخص يومي تلقائي الساعة 8:00 صباحاً يتضمن جدول أعمال اليوم والجلسات المبرمجة.
            الإشعارات تظهر فوراً بدون تحديث الصفحة مع صوت تنبيه خفيف.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "unread" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          غير مقروء {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-text-light text-sm mt-3">جاري تحميل الإشعارات...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-light text-sm">لا توجد إشعارات</p>
          <button onClick={triggerDaily} className="btn-outline text-sm mt-4">
            إنشاء ملخص يومي الآن
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const cfg = typeConfig[notif.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                className={`card flex items-start gap-4 ${!notif.isRead ? "border-r-4 border-r-primary" : ""} hover:shadow-sm transition-shadow group`}
              >
                <div className={`p-3 rounded-lg ${cfg.bg} flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium ${!notif.isRead ? "text-primary" : "text-text"}`}>{notif.title}</p>
                    <span className="text-xs text-text-light flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-light mt-1 whitespace-pre-line leading-relaxed">{notif.content}</p>
                  {notif.link && (
                    <a href={notif.link} className="text-xs text-primary font-medium mt-2 inline-flex items-center gap-1 hover:underline">
                      عرض التفاصيل →
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-2 rounded-lg hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="تحديد كمقروء"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
