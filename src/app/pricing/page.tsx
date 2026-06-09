import Link from "next/link";
import { Scale, CheckCircle2, ChevronLeft } from "lucide-react";

const plans = [
  {
    name: "الأساسية",
    price: "4,900",
    desc: "مناسبة للمكاتب الصغيرة",
    features: [
      "50 ملف نشط",
      "100 عميل",
      "إدارة المواعيد",
      "المراسلات المهنية",
      "إدارة الفواتير",
      "دعم فني بالبريد",
    ],
    popular: false,
  },
  {
    name: "الاحترافية",
    price: "9,900",
    desc: "الخيار الأمثل للمكاتب المتوسطة",
    features: [
      "200 ملف نشط",
      "500 عميل",
      "كل مميزات الأساسية",
      "المساعد الذكي (AI)",
      "تلخيص التقارير القانونية",
      "أولوية في الدعم الفني",
      "تقارير وإحصائيات متقدمة",
    ],
    popular: true,
  },
  {
    name: "المؤسسة",
    price: "19,900",
    desc: "للمكاتب الكبيرة والشركات",
    features: [
      "ملفات غير محدودة",
      "عملاء غير محدودين",
      "كل مميزات الاحترافية",
      "API للتكامل مع أنظمتك",
      "دعم فني مخصص 24/7",
      "تدريب الفريق",
      "تخصيص المنصة",
      "نسخ احتياطي يومي",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-secondary" />
              <span className="text-xl font-bold">المنصة القانونية الجزائرية</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="btn-secondary text-sm">اشتراك مجاني</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">خطط الأسعار</h1>
          <p className="text-text-light text-lg">اختر الخطة التي تناسب حجم مكتبك واحتياجاتك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`card relative ${plan.popular ? "border-secondary border-2 shadow-xl scale-105 z-10" : ""}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-primary-dark text-xs font-bold px-4 py-1 rounded-full">
                  الأكثر طلباً
                </span>
              )}
              <h3 className="text-2xl font-bold text-primary mb-1">{plan.name}</h3>
              <p className="text-text-light text-sm mb-4">{plan.desc}</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-text-light"> د.ج / شهر</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`w-full text-center block py-3 rounded-lg font-semibold ${
                  plan.popular ? "btn-secondary" : "btn-outline"
                }`}
              >
                اشترك الآن <ChevronLeft className="w-4 h-4 inline" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 card max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-primary mb-4">الأسئلة الشائعة</h3>
          <div className="space-y-4">
            {[
              { q: "هل يمكنني تغيير الخطة لاحقاً؟", a: "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت." },
              { q: "هل هناك فترة تجربة مجانية؟", a: "نعم، نوفر 14 يوم تجربة مجانية على جميع الخطط." },
              { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع عبر CIB، dahabia، والتحويل البنكي." },
              { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك." },
            ].map((faq, i) => (
              <div key={i} className="border-b border-border pb-4 last:border-0">
                <h4 className="font-semibold text-primary mb-1">{faq.q}</h4>
                <p className="text-text-light text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-dark text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2026 المنصة القانونية الجزائرية. جميع الحقوق محفوظة. المطور : بونمورة صالح الدين</p>
        </div>
      </footer>
    </div>
  );
}
