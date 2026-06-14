"use client";

import { useState, useEffect } from "react";
import { 
  Upload, Search, FileText, FolderOpen, Download, Trash2, X, Grid3X3, List, 
  Eye, Plus, AlertCircle, CheckCircle2, File, Image, FileArchive, FileCode,
  Loader2, Sparkles, Clock, Tag, Database, Link as LinkIcon, RefreshCw
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: number;
  dossierId: string | null;
  createdAt: string;
}

const categories = ["الكل", "عقود", "محاضر", "إنذارات", "تقارير", "وكالات", "مذكرات", "أخرى"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `قبل ${diffDays} أيام`;
  return date.toLocaleDateString("ar");
}

function getFileIcon(fileName: string, size?: "sm" | "lg") {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const sizeClass = size === "lg" ? "w-10 h-10" : "w-6 h-6";
  
  if (ext === 'pdf') return <FileText className={`${sizeClass} text-red-500`} />;
  if (ext === 'doc' || ext === 'docx') return <FileText className={`${sizeClass} text-blue-500`} />;
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') return <Image className={`${sizeClass} text-green-500`} />;
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className={`${sizeClass} text-yellow-500`} />;
  return <File className={`${sizeClass} text-gray-500`} />;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ title: "", category: "عقود" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      showToastMessage("خطأ في تحميل المستندات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = documents.filter((d) => {
    const matchSearch = d.title.includes(search);
    const matchCat = category === "الكل" || d.category === category;
    return matchSearch && matchCat;
  });

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!form.title || !selectedFile) {
      showToastMessage("الرجاء إدخال اسم المستند واختيار ملف", "error");
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        showToastMessage("✅ تم رفع المستند بنجاح", "success");
        loadDocuments();
        setShowModal(false);
        setForm({ title: "", category: "عقود" });
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      } else {
        const error = await res.json();
        showToastMessage(error.error || "❌ خطأ في رفع المستند", "error");
      }
    } catch (error) {
      console.error("Erreur upload document:", error);
      showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستند؟")) {
      try {
        const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToastMessage("✅ تم حذف المستند بنجاح", "success");
          await loadDocuments();
        } else {
          showToastMessage("❌ خطأ في حذف المستند", "error");
        }
      } catch (error) {
        console.error("Erreur suppression document:", error);
        showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
      }
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const stats = {
    total: documents.length,
    recent: documents.filter(d => {
      const daysAgo = (new Date().getTime() - new Date(d.createdAt).getTime()) / (1000 * 3600 * 24);
      return daysAgo <= 7;
    }).length,
    categories: new Set(documents.map(d => d.category)).size
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light">جاري تحميل المستندات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-5 duration-300 backdrop-blur-sm ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            📄 إدارة الوثائق
          </h1>
          <p className="text-text-light mt-1">إدارة وتنظيم جميع مستنداتك في مكان واحد</p>
        </div>
        <button 
          onClick={() => { 
            setForm({ title: "", category: "عقود" }); 
            setSelectedFile(null); 
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setShowModal(true); 
          }} 
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Upload className="w-5 h-5" /> رفع وثيقة جديدة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الوثائق</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الوثائق الجديدة</p>
              <p className="text-2xl font-bold text-primary">{stats.recent}</p>
              <p className="text-xs text-gray-400">آخر 7 أيام</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">التصنيفات</p>
              <p className="text-2xl font-bold text-primary">{stats.categories}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pr-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
              placeholder="ابحث عن وثيقة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button 
              onClick={() => setView("grid")} 
              className={`p-3 transition-all duration-200 ${view === "grid" ? "bg-primary text-white" : "hover:bg-gray-50"}`}
              title="عرض شبكي"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView("list")} 
              className={`p-3 transition-all duration-200 ${view === "list" ? "bg-primary text-white" : "hover:bg-gray-50"}`}
              title="عرض جدولي"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        {selectedDocs.length > 0 && (
          <button className="text-red-600 text-sm flex items-center gap-1 hover:underline">
            <Trash2 className="w-4 h-4" /> حذف المحدد ({selectedDocs.length})
          </button>
        )}
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg text-gray-500">لا توجد وثائق</p>
                <button onClick={() => setShowModal(true)} className="text-primary text-sm font-medium hover:underline">
                  + رفع وثيقة جديدة
                </button>
              </div>
            </div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                        {getFileIcon(doc.title, "lg")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1" title={doc.title}>{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {doc.category}
                          </span>
                          <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSelectDoc(doc.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 pt-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <a href={doc.fileUrl} target="_blank" className="flex-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200">
                    <Eye className="w-3 h-3" /> معاينة
                  </a>
                  <a href={doc.fileUrl} download className="flex-1 bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-600 text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200">
                    <Download className="w-3 h-3" /> تحميل
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View - Style tableau moderne */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <th className="w-10 px-4 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">الوثيقة</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">التصنيف</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">الحجم</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700">تاريخ الرفع</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-t hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleSelectDoc(doc.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.title)}
                        <span className="font-medium text-gray-800">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm" dir="ltr">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={doc.fileUrl} target="_blank" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all" title="معاينة">
                          <Eye className="w-4 h-4" />
                        </a>
                        <a href={doc.fileUrl} download className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all" title="تحميل">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'upload - Design Premium */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Header avec motif */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark px-6 py-5">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    رفع وثيقة جديدة
                  </h2>
                  <p className="text-white/80 text-sm mt-1">أضف مستنداً إلى مكتبتك الشخصية</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Nom du document */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  اسم الوثيقة <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    placeholder="مثال: عقد بيع - قضية رقم 001"
                    autoFocus
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Tag className="w-4 h-4 inline ml-1" /> التصنيف
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none appearance-none bg-white"
                    value={form.category} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.filter((c) => c !== "الكل").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Zone d'upload design premium */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Upload className="w-4 h-4 inline ml-1" /> الملف
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : selectedFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {/* Icône de succès */}
                  {selectedFile && (
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {previewUrl ? (
                    <div className="space-y-3 animate-in zoom-in duration-300">
                      <div className="relative inline-block">
                        <img src={previewUrl} alt="Aperçu" className="max-h-32 mx-auto rounded-lg shadow-md" />
                      </div>
                      <p className="text-sm font-medium text-primary">{selectedFile?.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile?.size || 0) / 1024} KB</p>
                      <button 
                        onClick={() => handleFileSelect(null)}
                        className="text-xs text-red-500 hover:underline transition-all inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> تغيير الملف
                      </button>
                    </div>
                  ) : (
                    <div className="relative z-20">
                      <div className={`transition-all duration-300 ${isDragging ? "scale-110" : ""}`}>
                        <Upload className={`w-16 h-16 mx-auto mb-3 transition-all duration-300 ${isDragging ? "text-primary scale-110" : "text-gray-400"}`} />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">اسحب ملفك هنا أو</p>
                      
                      <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        اختر من جهازك
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt,.zip,.rar"
                          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} 
                        />
                      </label>
                      
                      <p className="text-xs text-gray-400 mt-3">
                        PDF, DOCX, DOC, JPG, PNG, TXT, ZIP - حتى 10 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations supplémentaires */}
              {selectedFile && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Database className="w-3 h-3" />
                    الملف جاهز للرفع
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
                disabled={uploading}
              >
                إلغاء
              </button>
              <button 
                onClick={handleUpload} 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !form.title || !selectedFile}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    رفع المستند
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}