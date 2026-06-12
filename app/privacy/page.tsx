import Link from "next/link";
import { Scale, ArrowRight, Shield } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية - المنصة القانونية الجزائرية",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="w-7 h-7 text-secondary" />
              <span className="text-lg font-bold">المنصة القانونية الجزائرية</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">سياسة الخصوصية</h1>
            <p className="text-text-light text-sm mt-1">آخر تحديث: جانفي 2026</p>
          </div>
        </div>

        <div className="card space-y-8">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">1. مقدمة</h2>
            <p className="text-text-light leading-relaxed">
              مرحباً بكم في المنصة القانونية الجزائرية. نحن نلتزم بحماية خصوصية وسرية البيانات الشخصية لمستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">2. المعلومات التي نجمعها</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <p>نقوم بجمع المعلومات التالية عند التسجيل واستخدام المنصة:</p>
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <span><strong>معلومات التسجيل:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، المهنة، المحكمة التابع لها.</span></li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <span><strong>أرقام التسجيل المهني:</strong> رقم UNOA، رقم CNN، رقم CNHJ.</span></li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <span><strong>بيانات المكتب:</strong> اسم المكتب وعنوانه.</span></li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <span><strong>بيانات الاستخدام:</strong> الملفات والعملاء والمواعيد والوثائق التي تديرها على المنصة.</span></li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <span><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل، سجل النشاط.</span></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">3. كيفية استخدام المعلومات</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> توفير وإدارة خدمات المنصة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> التحقق من هويتك وضمان أمان حسابك.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> معالجة الاشتراكات والمدفوعات.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> إرسال إشعارات تتعلق بالخدمة والتحديثات.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تحسين خدماتنا وتجربة المستخدم.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تقديم الدعم الفني والرد على الاستفسارات.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> الامتثال للالتزامات القانونية والتنظيمية.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">4. حماية البيانات</h2>
            <p className="text-text-light leading-relaxed">
              نتخذ إجراءات أمنية صارمة لحماية بياناتك الشخصية، بما في ذلك تشفير كلمات المرور باستخدام تقنيات التشفير المتقدمة، تشفير البيانات المنقولة عبر بروتوكول HTTPS، تقييد الوصول إلى البيانات الشخصية للموظفين المخولين فقط، ونسخ احتياطية منتظمة للبيانات.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">5. مشاركة البيانات</h2>
            <p className="text-text-light leading-relaxed">
              نحن لا نبيع أو نؤجر بياناتك الشخصية لأي طرف ثالث. قد نشارك بياناتك فقط في الحالات التالية: بموافقتك الصريحة، عند الضرورة القانونية أو بأمر قضائي، لمقدمي خدمات موثوقين (مثل معالجة المدفوعات) مع ضمان سرية البيانات.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">6. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-text-light leading-relaxed">
              تستخدم المنصة ملفات تعريف الارتباط لتحسين تجربتك، بما في ذلك حفظ تفضيلاتك، إدارة جلسة تسجيل الدخول، وتحليل استخدام المنصة لتحسين الأداء. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">7. حقوقك</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <p>لديك الحق في:</p>
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> الوصول إلى بياناتك الشخصية التي نحتفظ بها.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تصحيح أو تحديث بياناتك غير الدقيقة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> طلب حذف حسابك وبياناتك الشخصية.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> الاعتراض على معالجة بياناتك في حالات معينة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> سحب موافقتك على معالجة البيانات في أي وقت.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">8. الاحتفاظ بالبيانات</h2>
            <p className="text-text-light leading-relaxed">
              نحتفظ ببياناتك الشخصية طالما أن حسابك نشط أو حسب الحاجة لتقديم الخدمات لك. عند حذف حسابك، سيتم حذف بياناتك الشخصية خلال 30 يوماً، باستثناء البيانات التي يتعين علينا الاحتفاظ بها وفقاً للقانون.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">9. التغييرات على سياسة الخصوصية</h2>
            <p className="text-text-light leading-relaxed">
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة بعد التغييرات يعد قبولاً لك بالسياسة المحدثة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">10. تواصل معنا</h2>
            <p className="text-text-light leading-relaxed">
              إذا كان لديك أي استفسار حول سياسة الخصوصية هذه أو ممارسات حماية البيانات، يرجى التواصل معنا عبر:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-2 text-sm text-text-light">
              <p>📧 البريد الإلكتروني: <span dir="ltr" className="inline-block text-primary font-medium">privacy@el-minassa.com</span></p>
              <p>📞 الهاتف: <span dir="ltr" className="inline-block text-primary font-medium">0676 212 922</span></p>
              <p>📍 العنوان: Rue Berdoudi Bachir, El Arrouch, Skikda</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary-dark text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>© 2026 المنصة القانونية الجزائرية. جميع الحقوق محفوظة. المطور : بونمورة صالح الدين</p>
        </div>
      </footer>
    </div>
  );
}
