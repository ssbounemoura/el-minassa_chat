"use client";

import Link from "next/link";
import { Plus, ArrowRight, Users } from "lucide-react";

export default function HuissierPartiesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header title="الأطراف المعنية" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5" />
          إضافة طرف جديد
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PartyCard name="أحمد محمد السيد" role="مدعي" phone="+213 555 123 456" email="ahmad@example.com" />
          <PartyCard name="فاطمة علي حسن" role="مدعى عليه" phone="+213 555 789 012" email="fatima@example.com" />
          <PartyCard name="محمود سالم كريم" role="محامي" phone="+213 555 345 678" email="mahmoud@example.com" />
        </div>
      </main>
    </div>
  );
}

function PartyCard({ name, role, phone, email }: { name: string; role: string; phone: string; email: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-indigo-600 font-semibold">{role}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>📞 {phone}</p>
        <p>📧 {email}</p>
      </div>
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
