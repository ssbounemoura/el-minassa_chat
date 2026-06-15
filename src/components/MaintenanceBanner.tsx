import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MaintenanceBanner() {
  return (
    <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium z-[100] relative shadow-md">
      <AlertTriangle className="w-5 h-5 animate-pulse" />
      <span>
        تنبيه: الموقع حالياً في <strong>وضع الصيانة</strong>. أنت ترى هذه الصفحة لأنك مسجل الدخول كمدير للنظام. الزوار العاديون محظورون.
      </span>
      <Link 
        href="/admin/settings" 
        className="mr-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs transition-colors"
      >
        إعدادات الصيانة
      </Link>
    </div>
  );
}
