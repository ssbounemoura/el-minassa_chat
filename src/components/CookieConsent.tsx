// src/components/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Settings } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà choisi
    const consent = localStorage.getItem("cookie-consent");
    const savedPrefs = localStorage.getItem("cookie-preferences");
    
    if (!consent) {
      // Afficher la bannière après un court délai
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
      applyConsent(JSON.parse(savedPrefs));
    } else {
      applyConsent(preferences);
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    // Appliquer les préférences cookies
    if (prefs.analytics) {
      console.log("✅ Analytics cookies activés");
      // Tu peux ajouter ici Google Analytics ou autre
    }
    if (prefs.marketing) {
      console.log("✅ Marketing cookies activés");
    }
    if (prefs.functional) {
      console.log("✅ Functional cookies activés");
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", "true");
    localStorage.setItem("cookie-preferences", JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    applyConsent(prefs);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
    setShowDetails(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Les cookies nécessaires ne peuvent pas être désactivés
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bannière principale */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-white border-t border-gray-200 shadow-2xl" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">🍪 نحترم خصوصيتك</h3>
              </div>
              <p className="text-sm text-gray-600">
                نستخدم ملفات تعريف الارتباط (كوكيز) لتحسين تجربتك على منصتنا، وتحليل حركة المرور، 
                وتخصيص المحتوى. يمكنك اختيار قبولها أو تخصيصها حسب رغبتك.
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  تخصيص الإعدادات
                </button>
                <Link href="/privacy#cookies" className="text-xs text-gray-500 hover:underline">
                  سياسة ملفات التعريف
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                رفض الكل
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                قبول التخصيص
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                قبول الكل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails pour personnalisation */}
      {showDetails && (
        <div className="fixed inset-0 z-[101] bg-black/50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">🍪 تخصيص ملفات التعريف</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                يمكنك اختيار أنواع ملفات تعريف الارتباط التي تريد قبولها. 
                ملفات الارتباط الضرورية مطلوبة لتشغيل المنصة ولا يمكن تعطيلها.
              </p>

              {/* Necessary Cookies - Toujours actifs */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">🔒 ملفات الارتباط الضرورية</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      ضرورية لتشغيل المنصة (تسجيل الدخول، الأمان، اللغة)
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">دائماً نشطة</span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">📊 ملفات التحليل</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      تساعدنا على فهم كيفية استخدامك للمنصة لتحسينها
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.analytics}
                      onChange={() => togglePreference("analytics")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">📢 ملفات التسويق</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      تستخدم لعرض محتوى وإعلانات مناسبة لك
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.marketing}
                      onChange={() => togglePreference("marketing")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">⚙️ ملفات وظيفية</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      تحسن أداء المنصة وتتذكر تفضيلاتك
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.functional}
                      onChange={() => togglePreference("functional")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={savePreferences}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                حفظ التفضيلات
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}