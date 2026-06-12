import Link from "next/link";
import { Scale, ArrowRight, FileText } from "lucide-react";

export const metadata = {
  title: "شروط الاستخدام - المنصة القانونية الجزائرية",
};

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">شروط الاستخدام</h1>
            <p className="text-text-light text-sm mt-1">آخر تحديث: جانفي 2026</p>
          </div>
        </div>

        <div className="card space-y-8">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">1. القبول بالشروط</h2>
            <p className="text-text-light leading-relaxed">
              باستخدامك للمنصة القانونية الجزائرية، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة. نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إخطارك بالتغييرات عبر البريد الإلكتروني أو إشعار على المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">2. وصف الخدمة</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <p>المنصة القانونية الجزائرية هي منصة إلكترونية متكاملة تقدم خدمات إدارة المكاتب القانونية للمهن التالية:</p>
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <strong>المحامون:</strong> إدارة القضايا والمرافعات والملفات القانونية.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <strong>الموثقون:</strong> تحرير العقود والوثائق الرسمية وإدارة المعاملات.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> <strong>المحضرين القضائيين:</strong> إدارة التبليغات والتنفيذات القضائية.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">3. التسجيل والحساب</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يجب أن تكون مؤهلاً قانونياً لممارسة المهنة التي تسجل بها.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يجب تقديم معلومات دقيقة وصحيحة عند التسجيل.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> أنت مسؤول عن جميع الأنشطة التي تتم تحت حسابك.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يحق لنا تعليق أو إغلاق الحساب في حالة مخالفة الشروط.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">4. الاشتراكات والدفع</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تُقدم المنصة خطط اشتراك متعددة (الأساسية، الاحترافية، المؤسسة) بأسعار محددة بالدينار الجزائري.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يتم تجديد الاشتراك تلقائياً ما لم يتم إلغاؤه قبل تاريخ الانتهاء.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> جميع الأسعار قابلة للتغيير مع إشعار مسبق لا يقل عن 30 يوماً.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> فترة التجربة المجانية مدتها 14 يوماً وتنتهي تلقائياً.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يتم معالجة المدفوعات عبر وسائل دفع آمنة ومعتمدة.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">5. الاستخدام المقبول</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <p>عند استخدام المنصة، توافق على عدم:</p>
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> استخدام المنصة لأي غرض غير قانوني أو مخالف للقوانين الجزائرية.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> انتحال هوية شخص آخر أو تقديم معلومات مضللة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> محاولة الوصول غير المصرح به إلى أنظمة المنصة أو حسابات المستخدمين الآخرين.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> نشر أو نقل أي محتوى ضار أو مسيء أو مخالف للآداب العامة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> استخدام المنصة لإرسال رسائل غير مرغوب فيها (Spam).</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> محاولة عكس هندسة البرمجيات أو استخراج الكود المصدري للمنصة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> استخدام أي أدوات آلية أو سكريبتات للوصول إلى المنصة بشكل غير مشروع.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">6. الملكية الفكرية</h2>
            <p className="text-text-light leading-relaxed">
              جميع المحتويات والتصاميم والبرمجيات والشعارات والعلامات التجارية الموجودة على المنصة هي ملكية حصرية للمنصة القانونية الجزائرية ومحمية بموجب قوانين الملكية الفكرية الجزائرية والدولية. لا يجوز نسخ أو توزيع أو تعديل أي جزء من المنصة دون إذن كتابي مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">7. بيانات المستخدم والمحتوى</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تحتفظ بملكية جميع البيانات والمحتوى الذي تقوم بتحميله على المنصة.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> تمنحنا ترخيصاً محدوداً لمعالجة بياناتك بغرض تقديم الخدمة فقط.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> أنت مسؤول عن دقة وقانونية المحتوى الذي تنشره أو تحمله.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يحق لنا إزالة أي محتوى يخالف هذه الشروط أو القوانين المعمول بها.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">8. إخلاء المسؤولية</h2>
            <p className="text-text-light leading-relaxed">
              تُقدم المنصة &quot;كما هي&quot; دون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة، بما في ذلك على سبيل المثال لا الحصر: فقدان البيانات، انقطاع الخدمة، أو أي خسائر مالية. نلتزم ببذل أقصى جهد ممكن لضمان استمرارية الخدمة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">9. تحديد المسؤولية</h2>
            <p className="text-text-light leading-relaxed">
              في أقصى حد يسمح به القانون، لا تتجاوز مسؤوليتنا الإجمالية تجاهك عن أي مطالبات ناشئة عن استخدام المنصة المبلغ الذي دفعته كاشتراك خلال الاثني عشر شهراً السابقة لتاريخ المطالبة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">10. الإنهاء</h2>
            <div className="space-y-3 text-text-light leading-relaxed">
              <ul className="space-y-2 mr-4">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يمكنك إلغاء حسابك في أي وقت من خلال إعدادات الحساب.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> يحق لنا تعليق أو إنهاء حسابك في حالة مخالفة شروط الاستخدام.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> عند الإنهاء، يتم حذف بياناتك خلال 30 يوماً وفقاً لسياسة الخصوصية.</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span> لا يتم استرداد المبالغ المدفوعة عن الاشتراكات الملغاة.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">11. القانون الواجب التطبيق</h2>
            <p className="text-text-light leading-relaxed">
              تخضع شروط الاستخدام هذه وتُفسر وفقاً لقوانين الجمهورية الجزائرية الديمقراطية الشعبية. أي نزاع ينشأ عن استخدام المنصة يُعرض على المحاكم الجزائرية المختصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">12. تواصل معنا</h2>
            <p className="text-text-light leading-relaxed">
              لأي استفسار حول شروط الاستخدام، يرجى التواصل معنا عبر:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-2 text-sm text-text-light">
              <p>📧 البريد الإلكتروني: <span dir="ltr" className="inline-block text-primary font-medium">legal@el-minassa.com</span></p>
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
