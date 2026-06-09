import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "الموقع تحت الصيانة",
  description: "نعتذر، الموقع حالياً في وضع الصيانة وسنعود قريباً.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-3xl bg-primary/10 p-4 text-primary">
            <ShieldAlert className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center mb-4">الموقع تحت الصيانة</h1>
        <p className="text-center text-slate-300 mb-8 leading-relaxed">
          نعمل حالياً على تحديث النظام وتحسين الأداء. نعتذر عن الإزعاج، وسيعود الموقع للعمل في أقرب وقت ممكن.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/" className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm text-white hover:bg-white/15 transition">
            العودة إلى الصفحة الرئيسية
          </Link>
          <Link href="/admin/settings" className="rounded-2xl bg-primary px-5 py-3 text-center text-sm text-slate-950 hover:bg-primary/90 transition">
            إعدادات الصيانة <ArrowLeft className="inline-block w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
