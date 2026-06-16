"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export default function HuissierSchedulePage() {
  const daysInMonth = 30;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="مواعيد الحجز والتنفيذ" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5" />
          إضافة موعد تنفيذ جديد
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* التقويم */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">يونيو 2026</h2>
              <div className="grid grid-cols-7 gap-2">
                {["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: 30 }, (_, i) => (
                  <button
                    key={i + 1}
                    className="aspect-square rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 text-sm font-medium text-gray-700 transition"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* الأحداث القادمة */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">مواعيد التنفيذ القادمة</h3>
            <div className="space-y-4">
              <EventCard date="16 يونيو 2026" title="جلسة حجز تنفيذي" time="10:00 صباحاً" />
              <EventCard date="18 يونيو 2026" title="متابعة إشعار التنفيذ" time="02:00 مساءً" />
              <EventCard date="20 يونيو 2026" title="تسليم أمر أداء" time="03:00 مساءً" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EventCard({ date, title, time }: { date: string; title: string; time: string }) {
  return (
    <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
      <p className="text-sm font-semibold text-indigo-600">{date}</p>
      <p className="font-bold text-gray-900 mt-1">{title}</p>
      <p className="text-sm text-gray-600 mt-1">🕐 {time}</p>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/huissier" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
