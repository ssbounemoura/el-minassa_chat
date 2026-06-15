import Link from "next/link";
import { ShieldAlert, LogIn, Scale, Mail } from "lucide-react";

export const metadata = {
  title: "الموقع تحت الصيانة | المنصة القانونية الجزائرية",
  description: "نعتذر، الموقع حالياً في وضع الصيانة وسنعود قريباً.",
};

export default function MaintenancePage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto z-10">
        
        {/* Logo Section */}
        <div className="mb-12 text-center animate-hero-heading">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-primary">المنصة القانونية الجزائرية</h2>
        </div>

        {/* Maintenance Box */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-14 shadow-2xl shadow-gray-200/50 w-full max-w-2xl text-center relative">
          
          {/* Badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full shadow-lg shadow-red-500/30 border-4 border-white text-white">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-4">
            نحن نقوم ببعض التحديثات!
          </h1>
          
          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            عذراً على الإزعاج، لكننا نقوم حالياً بصيانة مجدولة للمنصة وإضافة ميزات جديدة لتحسين تجربتكم. سنعود للعمل في أقرب وقت ممكن.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <a 
              href="mailto:contact@el-minassa.com" 
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 group"
            >
              <Mail className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              تواصل مع الدعم
            </a>
          </div>
          
        </div>

        {/* Admin Login Link */}
        <div className="mt-12 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            <LogIn className="w-4 h-4" />
            دخول المشرفين
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-gray-400 border-t border-gray-100 bg-white/50 backdrop-blur-sm z-10">
        <p>© {currentYear} المنصة القانونية الجزائرية. جميع الحقوق محفوظة.</p>
        <p className="text-xs mt-1 text-gray-300">النسخة المحدثة 2026</p>
      </footer>

    </main>
  );
}
