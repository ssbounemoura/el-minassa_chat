"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Gavel, FileText, ShieldCheck, Check, User, Mail, Phone, Building2, Lock, Hash, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const professions = [
  { value: "AVOCAT", label: "محامي", desc: "إدارة القضايا والمرافعات", Icon: Gavel },
  { value: "NOTAIRE", label: "موثق", desc: "تحرير العقود والوثائق الرسمية", Icon: FileText },
  { value: "HUISSIER", label: "محضر قضائي", desc: "التبليغات والتنفيذات القضائية", Icon: ShieldCheck },
];

const barreaux = [
  "محكمة أدرار",
  "محكمة الشلف",
  "محكمة الأغواط",
  "محكمة أم البواقي",
  "محكمة باتنة",
  "محكمة بجاية",
  "محكمة بسكرة",
  "محكمة بشار",
  "محكمة البليدة",
  "محكمة البويرة",
  "محكمة تمنراست",
  "محكمة تبسة",
  "محكمة تلمسان",
  "محكمة تيارت",
  "محكمة تيزي وزو",
  "محكمة الجزائر",
  "محكمة الجلفة",
  "محكمة جيجل",
  "محكمة سطيف",
  "محكمة سعيدة",
  "محكمة سكيكدة",
  "محكمة سيدي بلعباس",
  "محكمة عنابة",
  "محكمة قالمة",
  "محكمة قسنطينة",
  "محكمة المدية",
  "محكمة مستغانم",
  "محكمة المسيلة",
  "محكمة معسكر",
  "محكمة ورقلة",
  "محكمة وهران",
  "محكمة البيض",
  "محكمة إليزي",
  "محكمة برج بوعريريج",
  "محكمة بومرداس",
  "محكمة الطارف",
  "محكمة تندوف",
  "محكمة تيسمسيلت",
  "محكمة الوادي",
  "محكمة خنشلة",
  "محكمة سوق أهراس",
  "محكمة تيبازة",
  "محكمة ميلة",
  "محكمة عين الدفلى",
  "محكمة النعامة",
  "محكمة عين تموشنت",
  "محكمة غرداية",
  "محكمة غليزان",
  "محكمة أفلو",
  "محكمة باريكة",
  "محكمة قصر الشلالة",
  "محكمة المسعد",
  "محكمة عين وسارة",
  "محكمة بوسعادة",
  "محكمة الأبيض سيدي الشيخ",
  "محكمة القنطرة",
  "محكمة بئر العاتر",
  "محكمة قصر البخاري",
  "محكمة العريش",
  "محكمة تقرت",
  "محكمة بني عباس",
  "محكمة تيميمون",
  "محكمة أولاد جلال",
  "محكمة المنيعة",
  "محكمة برج باجي مختار",
  "محكمة عين قزام",
  "محكمة عين صالح",
  "محكمة جانت",
  "محكمة المغار",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [useCustomCourt, setUseCustomCourt] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "AVOCAT", phone: "", officeName: "", wilaya: "",
    manualWilaya: "",
    unoaNumber: "", cnnNumber: "", cnhjNumber: "",
  });

  const updateForm = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const handleCourtChange = (value: string) => {
    if (value === "OTHER") {
      setUseCustomCourt(true);
      updateForm("wilaya", "");
      return;
    }
    setUseCustomCourt(false);
    updateForm("wilaya", value);
    updateForm("manualWilaya", "");
  };

  const registrationNumberField = (() => {
    switch (form.role) {
      case "NOTAIRE":
        return { label: "رقم تسجيل CNN *", field: "cnnNumber", value: form.cnnNumber, placeholder: "CNN-XXXX" };
      case "HUISSIER":
        return { label: "رقم تسجيل CNHJ *", field: "cnhjNumber", value: form.cnhjNumber, placeholder: "CNHJ-XXXX" };
      default:
        return { label: "رقم تسجيل UNOA *", field: "unoaNumber", value: form.unoaNumber, placeholder: "UNOA-XXXX" };
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!termsAccepted) {
      setError("يجب عليك قبول شروط الخدمة والسياسات");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!registrationNumberField.value) {
      setError(`الرجاء إدخال ${registrationNumberField.label}`);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        wilaya: useCustomCourt ? form.manualWilaya : form.wilaya,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "خطأ في التسجيل");
      } else {
        setSuccess(true);
        // Account created — require email verification, then redirect to login.
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => {
      router.push("/login");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [success, router]);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[35%] bg-gradient-to-br from-primary via-primary-light to-primary-dark flex-col justify-between p-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -right-16 w-48 h-48 rounded-full bg-secondary/10" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-white mb-12">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Scale className="w-7 h-7 text-secondary" />
            </div>
            <span className="text-xl font-bold">المنصة القانونية الجزائرية</span>
          </Link>

          <h2 className="text-3xl font-bold text-white leading-relaxed mb-4">
            انضم إلى المنصة القانونية<br />الأكثر احترافية في الجزائر
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-md">
            منصة متكاملة مصممة خصيصاً للمحامين والموثقين والمحضرين القضائيين لإدارة مكاتبهم بكفاءة عالية
          </p>
        </div>

        {/* Features list */}
        <div className="relative z-10 space-y-4">
          {[
            "إدارة الملفات والعملاء بسهولة",
            "نظام مراسلات آمن ومشفر",
            "مساعد ذكاء اصطناعي قانوني",
            "تقارير وإحصائيات مفصلة",
            "دعم فني على مدار الساعة",
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-white/90 text-sm">{feat}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { num: "+2,500", label: "محترف قانوني" },
            { num: "48", label: "ولاية مغطاة" },
            { num: "99.9%", label: "وقت التشغيل" },
          ].map((s, i) => (
            <div key={i} className="text-center bg-white/5 rounded-xl py-3 px-2 backdrop-blur-sm">
              <div className="text-xl font-bold text-secondary">{s.num}</div>
              <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-background overflow-y-auto flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden text-center py-5 bg-primary">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <Scale className="w-8 h-8 text-secondary" />
            <span className="text-lg font-bold">المنصة القانونية الجزائرية</span>
          </Link>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 sm:px-8 py-6">
          <div className="w-full max-w-xl">
            {/* Success Modal */}
            {success && (
              <div className="fixed bottom-5 left-5 z-50 w-full max-w-sm">
                <div className="bg-white border border-primary/10 shadow-2xl rounded-3xl p-5 animate-in fade-in slide-in-from-left duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                      <Mail className="w-7 h-7 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-primary mb-2">تم إنشاء الحساب بنجاح!</p>
                      <p className="text-sm text-text-light leading-relaxed">
                        تم إرسال رسالة تفعيل إلى <span className="font-semibold">{form.email}</span>.
                        يرجى التحقق من بريدك والنقر على رابط التفعيل.
                      </p>
                      <p className="text-xs text-text-light/70 mt-3">
                        تم إنشاء الحساب بنجاح، ويمكنك تسجيل الدخول بعد تفعيل بريدك الإلكتروني.
                      </p>
                      <p className="text-xs text-text-light/70 mt-2">
                        سيتم إعادة التوجيه تلقائياً إلى صفحة تسجيل الدخول خلال 5 ثوانٍ.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href="/login" className="btn-secondary px-4 py-2 text-sm">
                          الانتقال إلى تسجيل الدخول الآن
                        </Link>
                        <Link href="/" className="btn-outline px-4 py-2 text-sm">
                          العودة إلى الصفحة الرئيسية
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content - Hidden when success */}
            {!success && (
              <>
                {/* Back to home */}
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors mb-4 group">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>العودة للصفحة الرئيسية</span>
                </Link>

                {/* Title */}
                <div className="mb-5">
                  <h1 className="text-2xl font-bold text-primary">إنشاء حساب جديد</h1>
                  <p className="text-text-light text-sm mt-1">انضم إلى المنصة القانونية الأكثر احترافية في الجزائر</p>
                </div>


                {error && (
                  <div className="fixed bottom-5 left-5 z-50 w-full max-w-sm">
                    <div className="bg-white border border-red-200 shadow-2xl rounded-3xl p-5 animate-in fade-in slide-in-from-left duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                          <AlertCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-red-700 mb-2">خطأ في التسجيل</p>
                          <p className="text-sm text-text-light leading-relaxed">{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section: Personal info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-primary">المعلومات الشخصية</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">الاسم الكامل <span className="text-danger">*</span></label>
                    <input type="text" className="input-field text-sm" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required placeholder="الأستاذ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input type="tel" className="input-field text-sm pr-10" dir="ltr" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="0555XXXXXX" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-text-light mb-1.5">البريد الإلكتروني <span className="text-danger">*</span></label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                    <input type="email" className="input-field text-sm pr-10" dir="ltr" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required placeholder="example@email.com" />
                  </div>
                </div>
              </div>

              {/* Section: Profession */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gavel className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-primary">المهنة والمحاكم</h3>
                </div>

                <label className="block text-xs font-medium text-text-light mb-2">اختر المهنة <span className="text-danger">*</span></label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {professions.map(({ value, label, desc, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateForm("role", value)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                        form.role === value
                          ? "border-primary bg-gradient-to-b from-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/10"
                          : "border-border bg-surface text-text-light hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        form.role === value ? "bg-primary text-white shadow-md" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{label}</span>
                      <span className="text-[10px] text-center leading-tight text-text-light">{desc}</span>
                      {form.role === value && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">المحكمة <span className="text-danger">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                      <select className="input-field text-sm pr-10 appearance-none" value={useCustomCourt ? "OTHER" : form.wilaya} onChange={(e) => handleCourtChange(e.target.value)} required>
                        <option value="">اختر المحكمة</option>
                        {barreaux.map((b, i) => (
                          <option key={i} value={String(i + 1).padStart(2, "0")}>{b}</option>
                        ))}
                        <option value="OTHER">أخرى</option>
                      </select>
                    </div>
                    {useCustomCourt && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-text-light mb-1.5">أدخل المحكمة يدوياً <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="input-field text-sm pr-10"
                          value={form.manualWilaya}
                          onChange={(e) => updateForm("manualWilaya", e.target.value)}
                          placeholder="اكتب اسم المحكمة هنا..."
                          required={useCustomCourt}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">اسم المكتب</label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input type="text" className="input-field text-sm pr-10" value={form.officeName} onChange={(e) => updateForm("officeName", e.target.value)} placeholder="مكتب الأستاذ..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Registration numbers */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-primary">أرقام التسجيل المهني</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">{registrationNumberField.label}</label>
                    <input
                      type="text"
                      className="input-field text-sm font-mono"
                      dir="ltr"
                      value={registrationNumberField.value}
                      onChange={(e) => updateForm(registrationNumberField.field, e.target.value)}
                      placeholder={registrationNumberField.placeholder}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Security */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-primary">الأمان</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">كلمة المرور <span className="text-danger">*</span></label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input type={showPass ? "text" : "password"} className="input-field text-sm pr-10 pl-10" dir="ltr" value={form.password} onChange={(e) => updateForm("password", e.target.value)} required minLength={8} placeholder="8 أحرف على الأقل" />
                      <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary transition-colors" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1.5">تأكيد كلمة المرور <span className="text-danger">*</span></label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input type="password" className="input-field text-sm pr-10" dir="ltr" value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} required placeholder="أعد كتابة كلمة المرور" />
                    </div>
                  </div>
                </div>
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        form.password.length >= 12 ? "w-full bg-green-500" :
                        form.password.length >= 8 ? "w-2/3 bg-yellow-500" : "w-1/3 bg-red-400"
                      }`} />
                    </div>
                    <span className={`text-[10px] font-medium ${
                      form.password.length >= 12 ? "text-green-600" :
                      form.password.length >= 8 ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {form.password.length >= 12 ? "قوية جداً" : form.password.length >= 8 ? "جيدة" : "ضعيفة"}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms & Conditions checkbox */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-2 border-amber-300 checked:bg-primary checked:border-primary cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-1">قبول شروط الخدمة</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      أقر بأنني قرأت ووافقت على{" "}
                      <Link href="/terms" target="_blank" className="font-bold text-primary hover:underline transition-colors">
                        شروط الاستخدام والسياسات
                      </Link>
                      {" "}و{" "}
                      <Link href="/privacy" target="_blank" className="font-bold text-primary hover:underline transition-colors">
                        سياسة الخصوصية
                      </Link>
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-l from-primary to-primary-light text-white py-3 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري إنشاء الحساب...</>
                ) : (
                  <>إنشاء حساب <Scale className="w-5 h-5" /></>
                )}
              </button>
                </form>

                <div className="mt-5 pb-6 text-center text-sm text-text-light">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="text-center text-xs text-text-light/60 py-3 border-t border-border">
          © 2026 المنصة القانونية الجزائرية. جميع الحقوق محفوظة. المطور : بونمورة صالح الدين
        </footer>
      </div>
    </div>
  );
}
