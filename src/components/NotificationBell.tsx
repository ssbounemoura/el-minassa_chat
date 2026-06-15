"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, X, AlertTriangle, Info, CheckCircle2, Clock, Gavel, Calendar, ExternalLink, MessageSquare } from "lucide-react";

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

const POLL_INTERVAL = 30_000; // 30 seconds

const typeIcons: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  message: { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50" },
  hearing: { icon: Gavel, color: "text-red-600", bg: "bg-red-50" },
  deadline: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  appointment: { icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
  "daily-summary": { icon: Info, color: "text-primary", bg: "bg-primary/5" },
};

// Generate a short notification sound using Web Audio API
async function playNotificationSound(priority: string = "normal"): Promise<boolean> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return false;

    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    // Different tones based on priority
    if (priority === "high") {
      // Two-tone chime for high priority
      [520, 780].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.2);
      });
    } else {
      // Single gentle tone
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 660;
      osc.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }

    setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 1000);
    return true;
  } catch {
    return false;
  }
}

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioUnlockedRef = useRef(false);

  // Unlock audio on first user interaction to satisfy browser autoplay policies
  useEffect(() => {
    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      try {
        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        await ctx.close();
        audioUnlockedRef.current = true;
      } catch {
        // ignore if audio cannot be unlocked
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();

      const notifs: Notification[] = data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(data.unreadCount || 0);

      // Show toasts only for new unread notifications (skip on first load)
      if (!isFirstLoadRef.current) {
        const newOnes = notifs.filter(
          (n: Notification) => !n.isRead && !seenIdsRef.current.has(n.id)
        );
        if (newOnes.length > 0) {
          setToasts((prev) => [...prev, ...newOnes.slice(0, 3)]);
          const played = await playNotificationSound(newOnes[0].priority);
          if (!played) setAudioBlocked(true);
        }
      }

      // Track all IDs
      notifs.forEach((n: Notification) => seenIdsRef.current.add(n.id));
      isFirstLoadRef.current = false;
    } catch {
      // Silently fail - will retry on next poll
    }
  }, []);

  // Poll every 30 seconds and refresh on focus/visibility change
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    const handleWindowFocus = () => {
      fetchNotifications();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchNotifications]);

  // Mark single as read
  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  // Dismiss toast
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-dismiss toasts after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <>
      {/* Bell Icon */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-text-light" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-96 max-h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-primary">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-text-light hover:text-primary transition-colors flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
              {audioBlocked && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  تعذر تشغيل صوت الإشعارات. تأكد من السماح لتشغيل الصوت في المتصفح.
                </div>
              )}
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = typeIcons[notif.type] || typeIcons.info;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !notif.isRead ? "bg-blue-50/30" : ""
                      }`}
                      onClick={() => {
                        if (!notif.isRead) markRead(notif.id);
                        if (notif.link) {
                          setIsOpen(false);
                          window.location.href = notif.link;
                        }
                      }}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${!notif.isRead ? "text-primary" : "text-text"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.content}</p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 text-center flex-shrink-0">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
              >
                عرض جميع الإشعارات <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast, index) => {
          const cfg = typeIcons[toast.type] || typeIcons.info;
          const Icon = cfg.icon;
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-slide-in flex items-start gap-3"
              style={{
                animation: "slideIn 0.4s ease-out",
                animationDelay: `${index * 100}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary">{toast.title}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">{toast.content}</p>
                {toast.link && (
                  <a
                    href={toast.link}
                    className="text-xs text-primary font-medium mt-2 inline-flex items-center gap-1 hover:underline"
                  >
                    عرض التفاصيل <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                {!toast.isRead && (
                  <button
                    onClick={() => {
                      markRead(toast.id);
                      dismissToast(toast.id);
                    }}
                    className="p-1 rounded hover:bg-green-50 transition-colors"
                    title="تحديد كمقروء"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
