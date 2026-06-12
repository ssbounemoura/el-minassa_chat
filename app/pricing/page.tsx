"use client";
import Link from "next/link";
import { Scale, CheckCircle2, ChevronLeft, X } from "lucide-react";
import { useState, useEffect } from "react";

// Configuration de l'offre spéciale lancement
const LAUNCH_OFFER_ACTIVE = true;
const LAUNCH_OFFER_DISCOUNT = 50; // 50% de réduction
const LAUNCH_OFFER_END_DATE = "2026-07-15"; // Date de fin (AAAA-MM-JJ)

const plans = [
  {
    name: "الأساسية",
    price: 2900,
    priceFormatted: "2,900",
    desc: "مناسبة للمكاتب الصغيرة والفردية",
    features: [
      "50 ملف نشط",
      "100 عميل",
      "إدارة المواعيد",
      "المراسلات المهنية",
      "إدارة الفواتير (5 فواتير/شهر)",
      "دعم فني بالبريد",
      "مستخدم واحد",
    ],
    popular: false,
  },
  {
    name: "الاحترافية",
    price: 5900,
    priceFormatted: "5,900",
    desc: "الخيار الأمثل للمكاتب المتوسطة",
    features: [
      "200 ملف نشط",
      "500 عميل",
      "كل مميزات الأساسية",
      "المساعد الذكي (AI)",
      "تلخيص التقارير القانونية",
      "أولوية في الدعم الفني",
      "تقارير وإحصائيات متقدمة",
      "فاتورة غير محدودة",
      "حتى 5 مستخدمين",
    ],
    popular: true,
  },
  {
    name: "المؤسسة",
    price: 9900,
    priceFormatted: "9,900",
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
      "مستخدمين غير محدودين",
    ],
    popular: false,
  },
];

// Composant Tableau Comparatif
function ComparisonTable() {
  const comparisonData = [
    { feature: "السعر الشهري", competitor: "608 دج", us: LAUNCH_OFFER_ACTIVE ? "من 1,450 دج" : "من 2,900 دج" },
    { feature: "عدد المستخدمين", competitor: "مستخدم واحد", us: "غير محدود" },
    { feature: "المحامون", competitor: "✓", us: "✓" },
    { feature: "الموثقون", competitor: "✗", us: "✓" },
    { feature: "المحضرون القضائيون", competitor: "✗", us: "✓" },
    { feature: "مديرو المنصة", competitor: "✗", us: "✓" },
    { feature: "مساعد الذكاء الاصطناعي", competitor: "✗", us: "✓" },
    { feature: "البحث القانوني المتقدم", competitor: "✗", us: "✓" },
    { feature: "القيمة الإجمالية", competitor: "محدودة", us: "شاملة ومتكاملة", isHighlight: true },
  ];

  return (
    <section className="mt-20 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          لماذا تختار المنصة القانونية الجزائرية "المِنَصَّة"؟
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          المنصة الوحيدة في الجزائر التي تجمع جميع المهن القانونية في حل واحد متكامل
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-lg border border-border">
          <thead>
            <tr className="bg-primary/5 border-b border-border">
              <th className="text-right p-4 font-bold text-primary">الميزة</th>
              <th className="text-center p-4 font-bold text-gray-500">المنافس</th>
              <th className="text-center p-4 font-bold text-secondary">المِنَصَّة</th>
             </tr>
          </thead>
          <tbody>
            {comparisonData.map((item, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-border hover:bg-gray-50 transition-colors ${
                  item.isHighlight ? "bg-secondary/5" : ""
                }`}
              >
                <td className={`text-right p-4 font-medium text-primary-dark ${item.isHighlight ? "font-bold" : ""}`}>
                  {item.feature}
                </td>
                <td className={`text-center p-4 ${item.competitor === "✓" ? "text-green-600" : item.competitor === "✗" ? "text-red-500" : "text-gray-600"}`}>
                  {item.competitor === "✓" ? <CheckCircle2 className="w-5 h-5 inline text-green-600" /> : item.competitor === "✗" ? <X className="w-5 h-5 inline text-red-500" /> : item.competitor}
                </td>
                <td className={`text-center p-4 font-medium ${item.us === "✓" ? "text-green-600" : item.us === "✗" ? "text-red-500" : "text-secondary font-bold"}`}>
                  {item.us === "✓" ? <CheckCircle2 className="w-5 h-5 inline text-green-600" /> : item.us === "✗" ? <X className="w-5 h-5 inline text-red-500" /> : item.us}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8 p-6 bg-primary/5 rounded-xl">
        <p className="text-text-light text-sm max-w-3xl mx-auto">
          تعد <strong className="text-secondary">"المِنَصَّة"</strong> المنصة القانونية الجزائرية الوحيدة التي تغطي جميع المهن: 
          المحامون، الموثقون، المحضرون القضائيون، والمديرون. مع مساعد الذكاء الاصطناعي ونظام البحث 
          القانوني المتقدم، أدر مكتبك بالكامل، سواء كنت تعمل بمفردك أو ضمن فريق. الحلول منخفضة 
          التكلفة لا يمكنها توفير هذه الإمكانيات.
        </p>
      </div>
    </section>
  );
}

// Composant Compteur à rebours
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(interval);
        setIsActive(false);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6 mb-12 text-center">
      <h3 className="text-xl font-bold mb-2">🎁 عرض خاص بمناسبة الإطلاق</h3>
      <p className="text-white/80 mb-4">خصم 50% على جميع الاشتراكات خلال أول 30 يوماً</p>
      <div className="flex justify-center gap-4 text-center">
        <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[70px]">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs">أيام</div>
        </div>
        <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[70px]">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs">ساعات</div>
        </div>
        <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[70px]">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs">دقائق</div>
        </div>
        <div className="bg-white/20 rounded-lg px-4 py-2 min-w-[70px]">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs">ثواني</div>
        </div>
      </div>
      <p className="text-white/70 text-sm mt-4">الخصم يطبق تلقائياً عند الاشتراك</p>
    </div>
  );
}

export default function PricingPage() {
  // Calcul du prix promotionnel
  const getPromoPrice = (originalPrice: number) => {
    if (!LAUNCH_OFFER_ACTIVE) return null;
    return Math.floor(originalPrice * (1 - LAUNCH_OFFER_DISCOUNT / 100));
  };

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
              <Link href="/register" className="bg-secondary text-primary-dark px-4 py-2 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">اشتراك مجاني</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">خطط الأسعار</h1>
          <p className="text-text-light text-lg">اختر الخطة التي تناسب حجم مكتبك واحتياجاتك</p>
        </div>

        {/* Bandeau offre spéciale en arabe */}
        {LAUNCH_OFFER_ACTIVE && (
          <div className="bg-gradient-to-r from-secondary to-yellow-500 text-primary-dark rounded-xl p-4 mb-8 text-center">
            <p className="font-bold text-lg">🎁 عرض خاص بمناسبة الإطلاق 🎁</p>
            <p className="text-sm font-semibold">خصم 50% على جميع الاشتراكات خلال أول 30 يوماً</p>
            <p className="text-xs mt-1">الخصم يطبق تلقائياً عند الاشتراك</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => {
            const promoPrice = getPromoPrice(plan.price);
            
            return (
              <div key={i} className={`relative bg-white rounded-xl shadow-md overflow-hidden border border-border transition-transform hover:scale-105 flex flex-col ${plan.popular ? "border-secondary border-2 shadow-xl" : ""}`}>
                
                {/* Badge Offre Spéciale (en haut à droite) */}
                {LAUNCH_OFFER_ACTIVE && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      -{LAUNCH_OFFER_DISCOUNT}% عرض الإطلاق
                    </div>
                  </div>
                )}
                
                {/* Badge الأكثر طلباً - Version corrigée */}
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center z-20">
                    <span className="bg-secondary text-primary-dark text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      الأكثر طلباً
                    </span>
                  </div>
                )}
                
                <div className="p-6 pt-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-primary mb-1 text-center">{plan.name}</h3>
                  <p className="text-text-light text-sm mb-4 text-center">{plan.desc}</p>
                  
                  {/* Prix avec offre spéciale */}
                  <div className="mb-6 text-center">
                    {LAUNCH_OFFER_ACTIVE && promoPrice && promoPrice !== plan.price ? (
                      <>
                        <span className="text-3xl font-bold text-secondary">{promoPrice.toLocaleString()}</span>
                        <span className="text-text-light"> د.ج / شهر</span>
                        <span className="block text-sm text-gray-400 line-through">{plan.price.toLocaleString()} د.ج</span>
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mt-1">
                          وفر {(plan.price - promoPrice).toLocaleString()} د.ج
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-primary">{plan.priceFormatted}</span>
                        <span className="text-text-light"> د.ج / شهر</span>
                      </>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-8 flex-grow">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-primary-dark">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href="/register"
                    className={`w-full text-center block py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular 
                        ? "bg-secondary text-primary-dark hover:bg-secondary/90" 
                        : "border border-primary text-primary hover:bg-primary/5"
                    }`}
                  >
                    اشترك الآن <ChevronLeft className="w-4 h-4 inline" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compteur à rebours */}
        {LAUNCH_OFFER_ACTIVE && <CountdownTimer targetDate={LAUNCH_OFFER_END_DATE} />}

        {/* Tableau Comparatif */}
        <ComparisonTable />

        {/* FAQ */}
        <div className="mt-20 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-border p-6">
          <h3 className="text-xl font-bold text-primary mb-6 text-center">الأسئلة الشائعة</h3>
          <div className="space-y-4">
            {[
              { q: "هل يمكنني تغيير الخطة لاحقاً؟", a: "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت." },
              { q: "هل هناك فترة تجربة مجانية؟", a: "نعم، نوفر 14 يوم تجربة مجانية على جميع الخطط." },
              { q: "هل الخصم على الاشتراك السنوي؟", a: "الخصم ساري على جميع الخطط والاشتراكات الشهرية والسنوية." },
              { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع عبر CIB، CCP، والتحويل البنكي." },
              { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك." },
              { q: "هل المنصة متاحة لغير المحامين؟", a: "نعم، المنصة متاحة للمحامين والموثقين والمحضرين القضائيين." },
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