"use client";

import { useState } from "react";
import { User, Shield, CreditCard, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ name: "", email: "", phone: "", officeName: "" });

  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "security", label: "الأمان", icon: Shield },
    { id: "subscription", label: "الاشتراك", icon: CreditCard },
    { id: "notifications", label: "الإشعارات", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-white" : "bg-surface border border-border text-text-light hover:bg-gray-50"}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary mb-4">الملف الشخصي</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم الكامل</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">البريد الإلكتروني</label><input className="input-field" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">الهاتف</label><input className="input-field" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">اسم المكتب</label><input className="input-field" value={form.officeName} onChange={(e) => setForm({ ...form, officeName: e.target.value })} /></div>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2"><Save className="w-4 h-4" /> حفظ التعديلات</button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary mb-4">تغيير كلمة المرور</h2>
          <div><label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label><input type="password" className="input-field" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label><input type="password" className="input-field" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label><input type="password" className="input-field" dir="ltr" /></div>
          <button className="btn-primary text-sm">تحديث كلمة المرور</button>
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
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">—</p><p className="text-xs text-text-light">ملف</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">—</p><p className="text-xs text-text-light">عميل</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-primary">—</p><p className="text-xs text-text-light">د.ج / شهر</p></div>
            </div>
            <p className="text-sm text-text-light mt-4">—</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary text-sm">ترقية إلى المؤسسة</button>
            <button className="btn-outline text-sm">تخفيض إلى الأساسية</button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-primary mb-4">إعدادات الإشعارات</h2>
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
