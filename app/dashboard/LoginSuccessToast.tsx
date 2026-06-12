"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function LoginSuccessToast() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus === "success") {
      setMessage("تم تسجيل الدخول بنجاح! مرحباً بك في لوحة التحكم.");
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto bg-white border border-emerald-200 shadow-2xl rounded-3xl p-5 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-emerald-700 mb-2">نجاح تسجيل الدخول</p>
            <p className="text-sm text-emerald-700 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
