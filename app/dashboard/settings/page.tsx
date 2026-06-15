"use client";

import { useState, useEffect } from "react";
import { User, Shield, CreditCard, Bell, Save, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { showToast } from "@/components/notifications/ToastContainer";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", officeName: "" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { "Cache-Control": "no-store" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setForm({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              officeName: data.user.officeName || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("نجاح", "تم حفظ التعديلات بنجاح!", "success");
      } else {
        showToast("خطأ", data.error || "حدث خطأ أثناء حفظ التعديلات.", "error");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("خطأ", "فشل الاتصال بالخادم.", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "security", label: "الأمان", icon: Shield },
    { id: "subscription", label: "الاشتراك", icon: CreditCard },
    { id: "notifications", label: "الإشعارات", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => {
              setActiveTab(tab.id);
            }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-white" : "bg-surface border border-border text-text-light hover:bg-gray-50"}`}
          >
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary mb-4">الملف الشخصي</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input required type="email" className="input-field" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الهاتف</label>
              <input className="input-field" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المكتب</label>
              <input className="input-field" value={form.officeName} onChange={(e) => setForm({ ...form, officeName: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2 mt-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <div className="card max-w-2xl space-y-4 opacity-70">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">تغيير كلمة المرور <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">قريباً</span></h2>
          <div><label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label><input disabled type="password" className="input-field bg-gray-50" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label><input disabled type="password" className="input-field bg-gray-50" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label><input disabled type="password" className="input-field bg-gray-50" dir="ltr" /></div>
          <button disabled className="btn-primary text-sm bg-gray-400 cursor-not-allowed">تحديث كلمة المرور</button>
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="space-y-4 max-w-2xl">
          <div className="card border-2 border-secondary">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-lg font-bold text-primary">الخطة الاحترافية</h3><p className="text-text-light text-sm">الاشتراك الحالي</p></div>
              <span className="badge-success px-4 py-1.5">نشط</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">∞</p><p className="text-xs text-text-light">ملف</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">∞</p><p className="text-xs text-text-light">عميل</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">0</p><p className="text-xs text-text-light">د.ج / شهر</p></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed">ترقية إلى المؤسسة</button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center justify-between">إعدادات الإشعارات <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">تُحفظ تلقائياً</span></h2>
          {[
            { label: "إشعارات المواعيد", desc: "تنبيهات قبل المواعيد والجلسات" },
            { label: "إشعارات الرسائل", desc: "عند استلام رسالة جديدة" },
            { label: "إشعارات الفواتير", desc: "عند إنشاء أو دفع فاتورة" },
            { label: "إشعارات الملفات", desc: "تحديثات حالة الملفات" },
            { label: "إشعارات بالبريد", desc: "إرسال نسخة من الإشعارات للبريد" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-text-light">{item.desc}</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
