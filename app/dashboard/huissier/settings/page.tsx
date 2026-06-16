"use client";

import Link from "next/link";
import { ArrowRight, Save, Bell, Lock, User, Zap } from "lucide-react";

export default function HuissierSettingsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="الإعدادات" />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* إعدادات الملف الشخصي */}
          <SettingsSection
            icon={<User className="w-5 h-5" />}
            title="معلومات الملف الشخصي"
            description="تحديث بيانات حاسب التنفيذ وبيانات المكتب"
          >
            <div className="space-y-4">
              <InputField label="الاسم الكامل" placeholder="أدخل اسم الحاسب" />
              <InputField label="البريد الإلكتروني" placeholder="سامي@مثال.dz" />
              <InputField label="رقم الهاتف" placeholder="+213 555 123 456" />
              <InputField label="مسمى المكتب" placeholder="مكتب الحاسب القضائي" />
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>
          </SettingsSection>

          {/* إعدادات الأمان */}
          <SettingsSection
            icon={<Lock className="w-5 h-5" />}
            title="الأمان"
            description="إدارة كلمة المرور والأمان"
          >
            <div className="space-y-4">
              <InputField label="كلمة المرور الحالية" type="password" placeholder="أدخل كلمة المرور الحالية" />
              <InputField label="كلمة المرور الجديدة" type="password" placeholder="أدخل كلمة مرور جديدة" />
              <InputField label="تأكيد كلمة المرور" type="password" placeholder="تأكيد كلمة المرور الجديدة" />
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
                <Lock className="w-4 h-4" />
                تحديث كلمة المرور
              </button>
            </div>
          </SettingsSection>

          {/* الإشعارات */}
          <SettingsSection
            icon={<Bell className="w-5 h-5" />}
            title="الإشعارات"
            description="تخصيص تفضيلات الإشعارات"
          >
            <div className="space-y-3">
              <ToggleSetting label="إشعارات الإدخالات التنفيذية الجديدة" defaultChecked={true} />
            <ToggleSetting label="إشعارات المواعيد القضائية" defaultChecked={true} />
            <ToggleSetting label="تنبيهات حالة الحجز والتنفيذ" defaultChecked={true} />
            <ToggleSetting label="تلقي تقارير التتبع الأسبوعية" defaultChecked={false} />
            </div>
          </SettingsSection>

          {/* التخزين والترقية */}
          <SettingsSection
            icon={<Zap className="w-5 h-5" />}
            title="التخزين والاشتراك"
            description="إدارة المساحة المتاحة والاشتراك"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">المساحة المستخدمة</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">6 جيجابايت من 10 جيجابايت</p>
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                ترقية الخطة
              </button>
            </div>
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">{icon}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function ToggleSetting({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4 rounded" />
    </label>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/huissier" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
