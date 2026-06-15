"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Book, Scale, DollarSign, File, Clock, AlertCircle } from "lucide-react";

type Aide = {
  id: string;
  titre: string;
  description: string;
  contenu: string;
  typeActe?: string;
  categorie: string;
};

const CATEGORIES = [
  { value: "PROCEDURE", label: "📋 الإجراءات", icon: File, color: "blue" },
  { value: "LEGAL", label: "⚖️ النصائح القانونية", icon: Scale, color: "purple" },
  { value: "TARIF", label: "💰 الرسوم والتعريفات", icon: DollarSign, color: "green" },
  { value: "MODELE", label: "📄 نماذج العقود", icon: Book, color: "orange" },
  { value: "DELAI", label: "⏰ المواعيد القانونية", icon: Clock, color: "red" },
  { value: "EXCEPTION", label: "⚠️ حالات خاصة", icon: AlertCircle, color: "yellow" },
];

const AIDES_PAR_DEFAUT = [
  {
    id: "1",
    titre: "إجراء توثيق عقد البيع",
    description: "خطوات توثيق عقد بيع عقار حسب القانون الجزائري",
    categorie: "PROCEDURE",
    contenu: "1. التحقق من هوية الأطراف\n2. التأكد من ملكية العقار\n3. كتابة العقد وقراءته على الأطراف\n4. التوقيع والشهادة",
  },
  {
    id: "2",
    titre: "حقوق وواجبات الموثق",
    description: "ما يجب أن يعرفه الموثق عن حقوقه وواجباته",
    categorie: "LEGAL",
    contenu: "الموثق مسؤول عن عدم القيام بأعمال تعارض القانون...",
  },
  {
    id: "3",
    titre: "حساب الرسوم والضرائب",
    description: "كيفية حساب الرسوم المستحقة على العقود",
    categorie: "TARIF",
    contenu: "الرسوم تحسب على أساس مبلغ العقد وفقاً للجدول المعدل سنوياً...",
  },
  {
    id: "4",
    titre: "نموذج عقد بيع عقار",
    description: "نموذج قياسي لعقد بيع عقار",
    categorie: "MODELE",
    contenu: "بسم الله الرحمن الرحيم\nعقد البيع والشراء\nتم الاتفاق في...",
  },
  {
    id: "5",
    titre: "المواعيد القانونية الهامة",
    description: "أهم المواعيد التي يجب أن يتذكرها الموثق",
    categorie: "DELAI",
    contenu: "- المدة المقررة للاستفسار عن العقار: 15 يوم\n- مدة حفظ العقد: 25 سنة",
  },
];

export default function AideNotairePage() {
  const [aides, setAides] = useState<Aide[]>(AIDES_PAR_DEFAUT);
  const [filteredAides, setFilteredAides] = useState<Aide[]>(AIDES_PAR_DEFAUT);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAide, setSelectedAide] = useState<Aide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les aides depuis l'API
    const fetchAides = async () => {
      try {
        const res = await fetch("/api/notaire/aides");
        const data = await res.json();
        if (data.success && data.aides.length > 0) {
          setAides([...AIDES_PAR_DEFAUT, ...data.aides]);
          setFilteredAides([...AIDES_PAR_DEFAUT, ...data.aides]);
        }
      } catch (error) {
        console.error("Error fetching aides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAides();
  }, []);

  useEffect(() => {
    let filtered = aides;

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.categorie === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAides(filtered);
  }, [selectedCategory, searchTerm, aides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notaire" className="text-blue-600 hover:text-blue-800">
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">نظام المساعدة والاستشارة</h1>
              <p className="text-slate-600 mt-1">مركز مساعدة متكامل للموثقين - إجراءات قانونية وقوانين جزائرية</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن المساعدة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory("")}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedCategory === ""
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-blue-400"
            }`}
          >
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-xs font-semibold text-slate-900">الجميع</div>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedCategory === cat.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-400"
              }`}
            >
              <div className="text-2xl mb-2">{cat.label.split(" ")[0]}</div>
              <div className="text-xs font-semibold text-slate-900">{cat.label.split(" ").slice(1).join(" ")}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-slate-500">جاري التحميل...</div>
              ) : filteredAides.length === 0 ? (
                <div className="p-6 text-center text-slate-500">لا توجد نتائج</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredAides.map((aide) => (
                    <button
                      key={aide.id}
                      onClick={() => setSelectedAide(aide)}
                      className={`w-full text-right p-4 transition-all hover:bg-slate-50 ${
                        selectedAide?.id === aide.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                      }`}
                    >
                      <div className="font-semibold text-slate-900 text-sm line-clamp-2">{aide.titre}</div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-1">{aide.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            {selectedAide ? (
              <div className="bg-white rounded-lg shadow p-8">
                <div className="mb-6">
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    {CATEGORIES.find((c) => c.value === selectedAide.categorie)?.label || selectedAide.categorie}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedAide.titre}</h2>
                  <p className="text-slate-600">{selectedAide.description}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 text-right">
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
                    {selectedAide.contenu}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-semibold mb-2">💡 نصيحة مهمة:</p>
                  <p>
                    تأكد من الامتثال الكامل للقوانين الجزائرية والمراسيم المتعلقة بالتوثيق. عند الشك، استشر الجهات
                    المختصة.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Book className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-slate-600 mb-4">اختر موضوعاً من القائمة لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-slate-900 mb-4">📌 نصائح سريعة مهمة:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm text-slate-700">
              <strong>✓</strong> تحقق دائماً من صحة الوثائق والمستندات قبل التوقيع
            </div>
            <div className="text-sm text-slate-700">
              <strong>✓</strong> احتفظ بسجلات دقيقة لجميع العقود والتوقيعات
            </div>
            <div className="text-sm text-slate-700">
              <strong>✓</strong> تابع المواعيد القانونية بدقة وفي الوقت المحدد
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
