"use client";

import { useState, useRef } from "react";
import { Search, Scale, BookOpen, Sparkles, ChevronDown, ChevronUp, FileText, Gavel, Shield, Building2, FolderOpen } from "lucide-react";

interface LegalResult {
  id: string;
  category: string;
  lawReference: string;
  articleNumber: string;
  title: string;
  content: string;
  score: number;
}

interface DossierResult {
  id: string;
  title: string;
  description?: string | null;
  caseType: string;
  status: string;
  caseNumber?: string | null;
  courtName?: string | null;
  score: number;
}

interface DocumentResult {
  id: string;
  title: string;
  category?: string | null;
  fileUrl: string;
  score: number;
}

type TabKey = "all" | "legal" | "dossiers" | "documents";
interface TabItem {
  key: TabKey;
  label: string;
  icon: typeof Search;
  count: number;
}

const categoryIcons: Record<string, typeof Scale> = {
  "قانون الأسرة": BookOpen,
  "القانون المدني": Scale,
  "قانون العقوبات": Gavel,
  "القانون التجاري": Building2,
  "قانون الإجراءات المدنية والإدارية": FileText,
  "القانون العقاري": Shield,
  "قانون العمل": Shield,
};

const sampleQueries = [
  "ما هي شروط فسخ عقد الإيجار بسبب عدم الدفع؟",
  "ما هي إجراءات الطلاق في الجزائر؟",
  "ما هي عقوبة السرقة؟",
  "كيف يتم نقل ملكية العقار؟",
  "ما هي حقوق العامل عند التسريح التعسفي؟",
  "ما هي شروط تأسيس شركة ذات مسؤولية محدودة؟",
];

export default function LegalSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LegalResult[]>([]);
  const [dossierResults, setDossierResults] = useState<DossierResult[]>([]);
  const [documentResults, setDocumentResults] = useState<DocumentResult[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "legal" | "dossiers" | "documents">("all");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const search = async (text?: string) => {
    const q = text || query;
    if (!q.trim() || isSearching) return;

    setIsSearching(true);
    setError("");
    setResults([]);
    setDossierResults([]);
    setDocumentResults([]);
    setAiAnalysis("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai/legal-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ في البحث.");
        setIsSearching(false);
        return;
      }

      setResults(data.results || []);
      setDossierResults(data.dossierResults || []);
      setDocumentResults(data.documentResults || []);
      setAiAnalysis(data.aiAnalysis || "");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch {
      setError("تعذر الاتصال بخادم البحث. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsSearching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return "bg-green-100 text-green-700 border-green-300";
    if (score >= 8) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 15) return "صلة عالية";
    if (score >= 8) return "صلة متوسطة";
    return "صلة منخفضة";
  };

  const tabItems: TabItem[] = [
    { key: "all", label: "كل النتائج", icon: Search, count: results.length + dossierResults.length + documentResults.length },
    { key: "legal", label: "نصوص قانونية", icon: FileText, count: results.length },
    { key: "dossiers", label: "دفاتر", icon: FolderOpen, count: dossierResults.length },
    { key: "documents", label: "مستندات", icon: BookOpen, count: documentResults.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Search className="w-7 h-7 text-secondary" /> البحث الدلالي في النصوص القانونية
        </h1>
        <p className="text-text-light text-sm mt-1">
          محرك بحث ذكي يفهم معنى سؤالك القانوني ويجد أكثر المواد والأحكام صلة
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-0">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full px-5 py-3.5 pr-12 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50"
                placeholder="اطرح سؤالك القانوني هنا... مثال: ما هي شروط فسخ عقد الإيجار؟"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                disabled={isSearching}
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => search()}
              disabled={!query.trim() || isSearching}
              className="btn-primary px-8 py-3.5 flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>بحث</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample Queries */}
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          <span className="text-xs text-text-light">جرب:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => { setQuery(sq); search(sq); }}
              disabled={isSearching}
              className="text-xs px-3 py-1.5 bg-primary/5 text-primary rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <span className="font-bold">!</span> {error}
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-primary font-semibold">جاري تحليل سؤالك والبحث في النصوص القانونية...</p>
          <p className="text-text-light text-sm mt-1">يتم ترتيب النتائج حسب درجة الصلة</p>
        </div>
      )}

      {/* Results */}
      {!isSearching && hasSearched && (
        <div ref={resultsRef} className="space-y-6">
          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="card border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="text-lg font-bold text-primary">التحليل الذكي</h2>
              </div>
              <div className="text-sm leading-loose whitespace-pre-line">
                {aiAnalysis.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h3 key={i} className="text-base font-bold text-primary mt-3 mb-2">{line.replace("## ", "")}</h3>;
                  if (line.startsWith("### ")) return <h4 key={i} className="text-sm font-semibold text-primary mt-2 mb-1">{line.replace("### ", "")}</h4>;
                  if (line.startsWith("- ")) return <p key={i} className="flex items-start gap-2 mr-2"><span className="text-secondary mt-1">•</span>{line.replace("- ", "")}</p>;
                  if (line.match(/^\d+\./)) return <p key={i} className="mr-4">{line}</p>;
                  if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {tabItems.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-medium px-3 py-2 rounded-full inline-flex items-center gap-2 transition ${activeTab === tab.key ? "bg-primary text-white" : "bg-surface text-text hover:bg-gray-100"}`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="text-xs text-text-light">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Results List */}
          {((activeTab === "all" || activeTab === "legal") && results.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-text-light mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                النصوص القانونية ذات الصلة ({results.length} نتيجة)
              </h3>
              <div className="space-y-3">
                {results.map((result, index) => {
                  const Icon = categoryIcons[result.category] || Scale;
                  const isExpanded = expandedId === result.id;

                  return (
                    <div
                      key={result.id}
                      className="card p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setExpandedId(isExpanded ? null : result.id)}
                    >
                      <div className="p-4 flex items-start gap-4">
                        {/* Rank */}
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getScoreColor(result.score)}`}>
                              {getScoreLabel(result.score)}
                            </span>
                            <span className="text-xs text-text-light flex items-center gap-1">
                              <Icon className="w-3 h-3" /> {result.category}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full mb-2">
                            <FileText className="w-3 h-3" /> نص قانوني
                          </div>
                          <h4 className="font-bold text-primary text-sm">
                            {result.articleNumber} — {result.title}
                          </h4>
                          <p className="text-xs text-text-light mt-0.5">{result.lawReference}</p>
                          {!isExpanded && (
                            <p className="text-sm text-text-light mt-2 line-clamp-2">{result.content}</p>
                          )}
                        </div>

                        {/* Expand icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text-light" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-light" />
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 mr-12">
                          <div className="bg-gray-50 rounded-xl p-4 text-sm leading-loose text-text border border-border">
                            {result.content}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-text-light">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {result.lawReference}</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {result.articleNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dashboard Results */}
          {((activeTab === "all" || activeTab === "dossiers") && dossierResults.length > 0) && (
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" /> الدفاتر ذات الصلة ({dossierResults.length})
              </h3>
              <div className="space-y-3">
                {dossierResults.map((dossier) => (
                  <div key={dossier.id} className="border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full mb-2">
                          <FolderOpen className="w-3 h-3" /> دفتر
                        </div>
                        <h4 className="font-bold text-primary">{dossier.title}</h4>
                        <p className="text-sm text-text-light mt-1">{dossier.description || "لا يوجد وصف"}</p>
                      </div>
                      <span className="text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-full">{dossier.score} نقطة</span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-text-light">
                      <span>نوع القضية: {dossier.caseType}</span>
                      <span>الحالة: {dossier.status}</span>
                      {dossier.caseNumber && <span>رقم القضية: {dossier.caseNumber}</span>}
                      {dossier.courtName && <span>المحكمة: {dossier.courtName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {((activeTab === "all" || activeTab === "documents") && documentResults.length > 0) && (
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> المستندات ذات الصلة ({documentResults.length})
              </h3>
              <div className="space-y-3">
                {documentResults.map((document) => (
                  <a
                    key={document.id}
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded-full mb-2">
                          <FileText className="w-3 h-3" /> مستند
                        </div>
                        <h4 className="font-bold text-primary">{document.title}</h4>
                        <p className="text-sm text-text-light mt-1">{document.category || "بدون فئة"}</p>
                      </div>
                      <span className="text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-full">{document.score} نقطة</span>
                    </div>
                    <p className="text-xs text-text-light mt-3">رابط الملف: {document.fileUrl}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {((activeTab === "all" && results.length === 0 && dossierResults.length === 0 && documentResults.length === 0) || (activeTab === "legal" && results.length === 0) || (activeTab === "dossiers" && dossierResults.length === 0) || (activeTab === "documents" && documentResults.length === 0)) && !error && aiAnalysis && (
            <div className="card text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-light">لم يتم العثور على نتائج مطابقة في قاعدة البيانات</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !isSearching && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">البحث الدلالي في النصوص القانونية</h2>
          <p className="text-text-light text-sm max-w-md mx-auto leading-relaxed">
            اطرح سؤالك القانوني بلغة طبيعية وسيتولى محرك البحث الذكي إيجاد أكثر النصوص القانونية والأحكام صلة بسؤالك من قاعدة بيانات مُفهرسة.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-text-light">
            <span className="flex items-center gap-1"><Scale className="w-4 h-4" /> القانون المدني</span>
            <span className="flex items-center gap-1"><Gavel className="w-4 h-4" /> قانون العقوبات</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> قانون الأسرة</span>
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> القانون التجاري</span>
          </div>
        </div>
      )}
    </div>
  );
}
