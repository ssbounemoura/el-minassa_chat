"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Clock, Scale } from "lucide-react";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رمز التحقق مفقود");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.status === 200) {
          setStatus("success");
          setMessage(data.message);
          setEmail(data.email);
        } else if (res.status === 410) {
          setStatus("expired");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage("حدث خطأ أثناء التحقق من البريد الإلكتروني");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 text-primary mb-8">
          <Scale className="w-6 h-6 text-secondary" />
          <span className="font-bold">المنصة القانونية الجزائرية</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {status === "loading" && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">جاري التحقق...</h2>
              <p className="text-text-light text-sm">يرجى الانتظار قليلاً</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-2">تم التحقق بنجاح! ✨</h2>
              <p className="text-text-light text-sm mb-6">{message}</p>

              {/* Info box */}
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-success font-medium mb-2">حسابك مفعل الآن</p>
                <p className="text-xs text-success/80 leading-relaxed">
                  يمكنك الآن تسجيل الدخول والاستفادة من جميع المميزات المتاحة للتجربة المجانية لمدة 14 يوم
                </p>
              </div>

              {/* Action button */}
              <Link
                href="/login"
                className="inline-block w-full bg-gradient-to-l from-primary to-primary-light text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center py-8">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-warning" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-2">انتهت صلاحية الرمز</h2>
              <p className="text-text-light text-sm mb-6">{message}</p>

              {/* Info box */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-warning font-medium mb-2">الحل:</p>
                <p className="text-xs text-warning/80 leading-relaxed">
                  الرسالة صلاحية الرمز محدودة. يرجى إعادة التسجيل أو الاتصال بالدعم الفني
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="inline-block w-full bg-gradient-to-l from-primary to-primary-light text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  إعادة التسجيل
                </Link>
                <Link href="/login" className="inline-block w-full border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all duration-300">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-danger" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mb-2">خطأ في التحقق</h2>
              <p className="text-text-light text-sm mb-6">{message}</p>

              {/* Info box */}
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-danger font-medium mb-2">تحقق من الرابط:</p>
                <p className="text-xs text-danger/80 leading-relaxed">
                  تأكد من نسخ الرابط الكامل بشكل صحيح من البريد الإلكتروني
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="inline-block w-full bg-gradient-to-l from-primary to-primary-light text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  التسجيل من جديد
                </Link>
                <Link href="/" className="inline-block w-full border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all duration-300">
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-text-light/60">
            <p>© 2026 المنصة القانونية الجزائرية</p>
          </div>
        </div>
      </div>
    </div>
  );
}
