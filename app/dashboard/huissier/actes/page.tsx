"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Search, Filter } from "lucide-react";

export default function HuissierActesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="الأعمال القانونية" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-6">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إنشاء عمل جديد
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن العمل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition flex items-center gap-2">
              <Filter className="w-5 h-5" />
              تصفية
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-lg">لا توجد أعمال بعد</p>
          <p className="text-gray-400 text-sm mt-2">اضغط على 'إنشاء عمل جديد' لبدء العمل</p>
        </div>
      </main>
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
