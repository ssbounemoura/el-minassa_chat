"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X, Sparkles, Copy, AlertCircle, File, ClipboardPaste } from "lucide-react";

type TabMode = "upload" | "paste";

const SUPPORTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function getFileLabel(type: string): string {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word") || type.includes("document")) return "Word";
  if (type.includes("text")) return "TXT";
  return "ملف";
}

async function extractText(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return await file.text();
  }

  if (file.type === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: unknown) => (item as { str: string }).str).join(" ") + "\n\n";
    }
    return fullText.trim();
  }

  if (
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error("صيغة الملف غير مدعومة");
}

export default function SummarizePage() {
  const [tab, setTab] = useState<TabMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    setError("");
    setSummary("");
    setExtractedText("");

    if (!SUPPORTED_TYPES.includes(f.type)) {
      setError("صيغة الملف غير مدعومة. الصيغ المدعومة: PDF, Word (DOC/DOCX), TXT");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("حجم الملف يتجاوز 10 ميغابايت.");
      return;
    }
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const summarize = async () => {
    setError("");
    setSummary("");
    setIsProcessing(true);

    try {
      let textToSummarize = "";

      if (tab === "upload" && file) {
        setProgress("جاري استخراج النص من الملف...");
        textToSummarize = await extractText(file);
        setExtractedText(textToSummarize);
      } else if (tab === "paste") {
        textToSummarize = pastedText;
      }

      if (!textToSummarize.trim()) {
        setError("لم يتم العثور على نص في الملف. يرجى التحقق من المحتوى.");
        setIsProcessing(false);
        return;
      }

      if (textToSummarize.length < 100) {
        setError("النص قصير جداً للتلخيص. يرجى استخدام مستند أطول.");
        setIsProcessing(false);
        return;
      }

      // Truncate to max ~12000 chars to avoid token limits
      if (textToSummarize.length > 12000) {
        textToSummarize = textToSummarize.substring(0, 12000) + "\n... [تم اقتطاع النص بسبب الطول]";
      }

      setProgress("جاري تحليل وتلخيص المستند بالذكاء الاصطناعي...");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summarize",
          text: textToSummarize,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ في التلخيص.");
        setIsProcessing(false);
        return;
      }

      setSummary(data.content);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ غير متوقع أثناء المعالجة.");
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const reset = () => {
    setFile(null);
    setPastedText("");
    setExtractedText("");
    setSummary("");
    setError("");
    setProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText className="w-7 h-7 text-secondary" /> التلخيص التلقائي للمستندات
          </h1>
          <p className="text-text-light text-sm mt-1">
            تلخيص المحاضر والمستندات القانونية بالذكاء الاصطناعي
          </p>
        </div>
        {(file || pastedText || summary) && (
          <button onClick={reset} className="btn-secondary text-sm flex items-center gap-2">
            <X className="w-4 h-4" /> مسح الكل
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-semibold">كيف تستخدم هذه الأداة؟</p>
          <p>ارفع مستنداً (PDF / Word / TXT) أو الصق النص مباشرة. سيقوم الذكاء الاصطناعي بتحليله واستخراج الأطراف، المواد القانونية، والالتزامات الجوهرية في ثوانٍ.</p>
          <p className="text-xs text-blue-600">الصيغ المدعومة: PDF — Word (DOC/DOCX) — TXT | الحجم الأقصى: 10 ميغابايت</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span className="text-red-500 font-bold">!</span> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("upload"); setError(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "upload" ? "bg-primary text-white shadow" : "bg-white border border-border text-text-light hover:border-primary/30"
          }`}
        >
          <Upload className="w-4 h-4" /> رفع ملف
        </button>
        <button
          onClick={() => { setTab("paste"); setError(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "paste" ? "bg-primary text-white shadow" : "bg-white border border-border text-text-light hover:border-primary/30"
          }`}
        >
          <ClipboardPaste className="w-4 h-4" /> لصق النص
        </button>
      </div>

      {/* Upload Zone */}
      {tab === "upload" && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : file ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-primary/40 hover:bg-gray-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <File className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700">{file.name}</p>
                <p className="text-sm text-green-600">
                  {getFileLabel(file.type)} — {(file.size / 1024 / 1024).toFixed(2)} ميغابايت
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> إزالة الملف
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-text">اسحب الملف هنا أو انقر للاختيار</p>
                <p className="text-sm text-text-light">PDF, Word (DOC/DOCX), TXT — حتى 10 ميغابايت</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Zone */}
      {tab === "paste" && (
        <div>
          <textarea
            className="w-full h-64 border border-border rounded-2xl p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-white"
            placeholder="الصق نص المستند هنا (عقد، محضر، عريضة...)..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <p className="text-xs text-text-light mt-1 text-left">{pastedText.length} حرف</p>
        </div>
      )}

      {/* Summarize Button */}
      <button
        onClick={summarize}
        disabled={isProcessing || (tab === "upload" ? !file : !pastedText.trim())}
        className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{progress}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>تلخيص المستند بالذكاء الاصطناعي</span>
          </>
        )}
      </button>

      {/* Summary Result */}
      {summary && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" /> الملخص الذكي
            </h2>
            <button onClick={copySummary} className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors bg-gray-100 px-3 py-1.5 rounded-lg">
              <Copy className="w-4 h-4" /> نسخ الملخص
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-sm leading-loose whitespace-pre-line">
            {summary.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace("## ", "")}</h3>;
              if (line.startsWith("### ")) return <h4 key={i} className="text-base font-semibold text-primary mt-3 mb-1">{line.replace("### ", "")}</h4>;
              if (line.startsWith("- ")) return <p key={i} className="flex items-start gap-2 mr-2"><span className="text-secondary mt-1">•</span>{line.replace("- ", "")}</p>;
              if (line.match(/^\d+\./)) return <p key={i} className="mr-4">{line}</p>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
              return <p key={i}>{line}</p>;
            })}
          </div>
          <p className="text-xs text-text-light text-center italic">
            هذا الملخص تم إنشاؤه بواسطة الذكاء الاصطناعي وهو استرشادي. يرجى مراجعة المستند الأصلي للتفاصيل الكاملة.
          </p>
        </div>
      )}
    </div>
  );
}
