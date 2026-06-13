"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Shield,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Bot,
  Brain,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  Receipt,
  FileSearch,
  Bell,
  PenTool,
  Search,
  Sparkles,
  Clock,
  Gavel,
  Volume2,
  Printer,
  ListChecks,
  ArrowLeft,
  Gift,
  Rocket,
} from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";
import SplashScreen from "@/components/SplashScreen";

const features = [
  { icon: FileText, title: "إدارة الملفات", desc: "تنظيم ومتابعة جميع الملفات والقضايا بكفاءة عالية" },
  { icon: Users, title: "إدارة العملاء", desc: "قاعدة بيانات شاملة لعملائك مع معلومات التواصل" },
  { icon: Calendar, title: "إدارة المواعيد", desc: "جدولة ومتابعة المواعيد والجلسات القضائية" },
  { icon: MessageSquare, title: "مراسلات مهنية", desc: "تواصل مع زملائك في نفس المحكمة أو الولاية" },
  { icon: Bot, title: "مساعد ذكي", desc: "روبوت محادثة ذكي للإجابة على استفسارات الزوار" },
  { icon: Shield, title: "أمان متقدم", desc: "حماية بياناتك الشخصية والمهنية بأعلى معايير الأمان" },
  { icon: Scale, title: "متعدد المهن", desc: "مصمم خصيصاً للمحامين والموثقين والمحضرين القضائيين" },
  { icon: Receipt, title: "الفواتير والمدفوعات", desc: "إدارة فواتيرك ومتابعة المدفوعات بكل سهولة" },
];

const aiFeatures = [
  {
    icon: Brain,
    title: "المحادثة الذكية",
    subtitle: "AI Chat",
    desc: "تحدّث مع مساعد قانوني ذكي يفهم سياق ملفاتك ويساعدك على صياغة المذكرات، فهم المصطلحات القانونية، والاستعداد للجلسات.",
    points: ["اطرح أسئلة مفتوحة حول القانون الجزائري", "استشر المساعد في صياغة العقود أو المذكرات", "سجل محادثاتك للرجوع إليها لاحقاً"],
    color: "from-blue-500 to-indigo-600",
    badge: "مدعوم بالذكاء الاصطناعي",
  },
  {
    icon: FileSearch,
    title: "التلخيص التلقائي",
    subtitle: "Auto Summarization",
    desc: "ارفع مستنداتك القانونية (PDF, Word, TXT) واحصل على ملخص فوري ودقيق يركز على النقاط الأساسية.",
    points: ["يدعم ملفات PDF و Word و TXT", "تلخيص ذكي يركز على الجوهر القانوني", "نتائج فورية بالعربية الفصحى"],
    color: "from-emerald-500 to-teal-600",
    badge: "توفير الوقت",
  },
  {
    icon: Search,
    title: "البحث الدلالي",
    subtitle: "Semantic Search",
    desc: "بحث ذكي يفهم معنى سؤالك القانوني ولا يكتفي بالكلمات المفتاحية، فيجد لك النصوص القانونية الأكثر صلة.",
    points: ["يفهم الأسئلة بالعربية الفصحى والعامية", "يبحث في قاعدة بيانات قانونية شاملة", "ترتيب النتائج حسب درجة الصلة"],
    color: "from-purple-500 to-violet-600",
    badge: "بحث متقدم",
  },
  {
    icon: Bell,
    title: "التنبيهات الحية والمجدولة",
    subtitle: "Real-time Notifications",
    desc: "إشعارات فورية عند الساعة 8:00 صباحاً تلخص لك جدول أعمال اليوم وجلساتك وقضاياك التي تتطلب انتباهك.",
    points: ["تنبيه الثامنة صباحاً اليومي", "إشعارات فورية بدون تحديث الصفحة", "تنبيهات منبثقة مع صوت خفيف"],
    color: "from-orange-500 to-red-500",
    badge: "تنبيهات ذكية",
  },
];

const testimonials = [
  { name: "أستاذ بن علي محمد", role: "محامي - الجزائر العاصمة", text: "المنصة غيرت طريقة إدارة مكتبي بشكل كامل. أنجز المهام بسرعة أكبر." },
  { name: "الأستاذة فاطمة الزهراء", role: "موثقة - وهران", text: "أفضل استثمار قمت به لمكتبي. إدارة العقود أصبحت أسهل بكثير." },
  { name: "الأستاذ كريم حداد", role: "محضر قضائي - قسنطينة", text: "تتبع التبليغات والتنفيذات أصبح منظماً ومحترفاً." },
];

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true); // Commence à true
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const shouldShowSplash = !sessionStorage.getItem("splash-shown");
    setShowSplash(shouldShowSplash);
    
    // Si le splash doit être affiché, on le montre pendant 2 secondes
    if (shouldShowSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        try { sessionStorage.setItem("splash-shown", "true"); } catch {}
      }, 2500); // 2.5 secondes
      
      return () => clearTimeout(timer);
    } else {
      // Si pas de splash, on cache immédiatement
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    try { sessionStorage.setItem("splash-shown", "true"); } catch {}
  }, []);

  // Pendant le montage ou si le splash est visible, on montre uniquement le splash
  if (!isMounted || showSplash) {
    return (
      <>
        {isMounted && showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface" suppressHydrationWarning>
      {/* Navbar */}
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-secondary" />
              <span className="text-xl font-bold">المنصة القانونية الجزائرية</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-secondary transition-colors">المميزات</a>
              <a href="#pricing" className="hover:text-secondary transition-colors">الأسعار</a>
              <a href="#testimonials" className="hover:text-secondary transition-colors">آراء العملاء</a>
              <a href="#contact" className="hover:text-secondary transition-colors">تواصل معنا</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="btn-secondary text-sm">
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== BANNIÈRE OFFRE DE LANCEMENT (50%) ========== */}
      <Link href="/special-offer" className="block">
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white overflow-hidden relative group cursor-pointer">
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="max-w-7xl mx-auto px-4 py-3 text-center relative z-10">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                🎁 عرض خاص
              </span>
              <span className="text-lg font-bold">خصم 50%</span>
              <span className="text-sm">على جميع الاشتراكات خلال أول 30 يوماً</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                الخصم يطبق تلقائياً عند الاشتراك
              </span>
              <span className="text-sm font-semibold group-hover:translate-x-1 transition-transform">
                اكتشف العرض ←
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ========== BANDEAU NOUVEAUTÉ (Portail) ========== */}
      <section className="bg-gradient-to-r from-amber-50 to-primary/5 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">🆕 جديد</span>
              <p className="text-sm text-gray-700">
                ⚖️ بوابة التقديم والتأجيل – أطلقت المنصة خدمة جديدة لإدارة طلبات التأجيل إلكترونياً
              </p>
            </div>
            <Link 
              href="/portal/reports" 
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
            >
              اكتشف المزيد
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative bg-gradient-to-bl from-primary via-primary-light to-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-secondary rounded-full blur-3xl animate-hero-blob" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl animate-hero-blob" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-hero-heading">
              إدارة مكتبك القانوني <span className="text-secondary">بذكاء واحترافية</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-hero-text">
              منصة متكاملة مصممة خصيصاً للمحامين والموثقين والمحضرين القضائيين في الجزائر.
              أدِر ملفاتك، عملاءك، ومراسلاتك من مكان واحد مع ذكاء اصطناعي قانوني متقدم.
            </p>
            <div className="flex flex-wrap gap-4 animate-hero-buttons">
              <Link href="/register" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
                ابدأ مجاناً الآن
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3">
                اكتشف المميزات
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-300 animate-hero-badges">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-secondary" /> تجربة مجانية 30 يوم</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-secondary" /> بدون بطاقة بنكية</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-secondary" /> دعم فني متواصل</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION SERVICES VEDETTES ========== */}
      <section className="py-16 bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-primary">✨ خدمات جديدة على المنصة</h2>
            <p className="text-gray-600 mt-2">أدوات متطورة لتسهيل مهامك القانونية اليومية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte 1 - Portail des reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">بوابة التقديم والتأجيل</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3">
                  سجل طلبات التأجيل إلكترونياً، تابع حالتها، واحصل على إحصائيات دقيقة
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4 pr-4">
                  <li>✓ طلب تأجيل الجلسات</li>
                  <li>✓ متابعة حالة الطلب</li>
                  <li>✓ إرفاق المبررات والوثائق</li>
                </ul>
                <Link href="/portal/reports" className="text-primary font-medium text-sm hover:underline">
                  تفعيل الخدمة ←
                </Link>
              </div>
            </div>

            {/* Carte 2 - Impression des rapports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <Printer className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">طباعة التقارير المهنية</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3">
                  حوّل بياناتك إلى تقارير ورقية احترافية جاهزة للمحكمة
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4 pr-4">
                  <li>✓ ملخصات القضايا</li>
                  <li>✓ جداول الجلسات</li>
                  <li>✓ قوائم طلبات التأجيل</li>
                </ul>
                <Link href="/reports/hearings/print" className="text-primary font-medium text-sm hover:underline">
                  اكتشف المزيد ←
                </Link>
              </div>
            </div>

            {/* Carte 3 - Calendrier intelligent */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">جدول الجلسات الذكي</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3">
                  نظّم مواعيدك القضائية وتابع الجلسات المبرمجة في تقويم واحد
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4 pr-4">
                  <li>✓ عرض الجلسات بالأسبوع والشهر</li>
                  <li>✓ تنبيهات المواعيد</li>
                  <li>✓ تصدير إلى PDF</li>
                </ul>
                <Link href="/portal/calendar" className="text-primary font-medium text-sm hover:underline">
                  اكتشف المزيد ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">مميزات شاملة لإدارة مكتبك</h2>
            <p className="text-text-light text-lg max-w-2xl mx-auto">كل ما تحتاجه لإدارة مكتبك القانوني بكفاءة واحترافية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md hover:border-primary/20 transition-all group">
                <f.icon className="w-10 h-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
                <p className="text-text-light text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-secondary/10 text-primary-dark text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-secondary" /> ميزات حصرية بالذكاء الاصطناعي
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">خدمات ذكية لا تُقدَّر بثمن</h2>
            <p className="text-text-light text-lg max-w-2xl mx-auto">أدوات متقدمة مدعومة بالذكاء الاصطناعي لتمنحك تفوقاً حقيقياً في عملك القانوني</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {aiFeatures.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className={`bg-gradient-to-l ${f.color} p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{f.badge}</span>
                    <f.icon className="w-8 h-8 opacity-90 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mt-3">{f.title}</h3>
                  <p className="text-sm text-white/70">{f.subtitle}</p>
                </div>
                <div className="p-5">
                  <p className="text-text-light text-sm leading-relaxed mb-4">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-text">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {[
              { icon: Gavel, text: "فهم المصطلحات القانونية" },
              { icon: PenTool, text: "صياغة المذكرات والعقود" },
              { icon: Clock, text: "إشعار الساعة 8:00 صباحاً" },
              { icon: Volume2, text: "تنبيهات صوتية" },
              { icon: FileText, text: "تلخيص PDF و Word" },
              { icon: Search, text: "بحث بالمعنى لا بالكلمات" },
            ].map((pill, i) => (
              <span key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-text">
                <pill.icon className="w-4 h-4 text-secondary" />
                {pill.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">خطط اشتراك مرنة</h2>
            <p className="text-text-light text-lg">اختر الخطة التي تناسب احتياجاتك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "الأساسية", price: "4,900", features: ["50 ملف", "100 عميل", "مراسلات", "دعم فني"], popular: false },
              { name: "الاحترافية", price: "9,900", features: ["200 ملف", "500 عميل", "مراسلات + AI", "مساعد ذكي + تلخيص + بحث دلالي", "تنبيهات حية", "أولوية الدعم"], popular: true },
              { name: "المؤسسة", price: "19,900", features: ["ملفات غير محدودة", "عملاء غير محدودين", "جميع المميزات", "دعم مخصص", "API"], popular: false },
            ].map((plan, i) => (
              <div key={i} className={`card relative ${plan.popular ? "border-secondary border-2 shadow-lg scale-105" : ""}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-primary-dark text-xs font-bold px-3 py-1 rounded-full">
                    الأكثر طلباً
                  </span>
                )}
                <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-text-light text-sm"> د.ج / شهر</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.popular ? "btn-secondary w-full text-center block" : "btn-outline w-full text-center block"}>
                  اشترك الآن
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-primary hover:text-primary-light font-medium">
              عرض تفاصيل الخطط كاملة <ChevronLeft className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">ماذا يقول عملاؤنا</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-text mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-primary">{t.name}</p>
                  <p className="text-sm text-text-light">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 bg-gradient-to-bl from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">ابدأ في تحويل إدارة مكتبك اليوم</h2>
          <p className="text-xl text-gray-200 mb-8">انضم إلى مئات المحامين والموثقين الذين يثقون في منصتنا</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/register" className="btn-secondary text-lg px-8 py-3">
              ابدأ التجربة المجانية
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-secondary" />
              <span dir="ltr">0676 212 922</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-secondary" />
              <span>contact@el-minassa.com</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span>Rue Berdoudi Bachir, El Arrouch, Skikda</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-6 h-6 text-secondary" />
                <span className="text-lg font-bold text-white">المنصة القانونية الجزائرية</span>
              </div>
              <p className="text-sm">منصة جزائرية متكاملة لإدارة المكاتب القانونية</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-secondary">المميزات</a></li>
                <li><Link href="/pricing" className="hover:text-secondary">الأسعار</Link></li>
                <li><a href="#contact" className="hover:text-secondary">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">المهن</h4>
              <ul className="space-y-2 text-sm">
                <li>محامي</li>
                <li>موثق</li>
                <li>محضر قضائي</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">قانوني</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-secondary">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-secondary">شروط الاستخدام</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2026 المنصة القانونية الجزائرية. جميع الحقوق محفوظة. المطور : بونمورة صالح الدين</p>
          </div>
        </div>
      </footer>

      {/* Visitor Chatbot */}
      <ChatbotWidget />
    </div>
  );
}