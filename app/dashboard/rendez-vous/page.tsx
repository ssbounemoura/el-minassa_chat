"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Calendar as CalIcon, Clock, MapPin, X, CheckCircle2, Edit2, Trash2, 
  Save, AlertCircle, ChevronLeft, ChevronRight, Bell, Repeat, Users, 
  Video, Phone, Briefcase, FileText, Star, CalendarDays, ListChecks,
  Grid3X3, Filter, Download, Printer, Settings, Share2, Copy, Check,
  Search
} from "lucide-react";

interface RendezVous {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  isDone: boolean;
  dossierId: string | null;
  dossier?: { title: string };
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  reminder?: boolean;
  reminderMinutes?: number;
  type?: string;
}

interface Dossier {
  id: string;
  title: string;
}

const appointmentTypes = [
  { id: "audience", name: "جلسة قضائية", icon: Gavel, color: "bg-red-100 text-red-600" },
  { id: "consultation", name: "استشارة", icon: Users, color: "bg-blue-100 text-blue-600" },
  { id: "meeting", name: "اجتماع", icon: Briefcase, color: "bg-green-100 text-green-600" },
  { id: "video", name: "مكالمة فيديو", icon: Video, color: "bg-purple-100 text-purple-600" },
  { id: "phone", name: "مكالمة هاتفية", icon: Phone, color: "bg-yellow-100 text-yellow-600" },
];

const reminderOptions = [
  { value: 0, label: "بدون تذكير" },
  { value: 5, label: "5 دقائق قبل" },
  { value: 15, label: "15 دقيقة قبل" },
  { value: 30, label: "30 دقيقة قبل" },
  { value: 60, label: "ساعة قبل" },
  { value: 120, label: "ساعتين قبل" },
  { value: 1440, label: "يوم قبل" },
];

function Gavel(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14.5 3.5 4 4" />
      <path d="m9 9-3.5 3.5L7 14l3.5-3.5L14 14l3.5-3.5L14 7Z" />
      <path d="M18 2l2 2" />
      <path d="M4 20l2 2" />
      <path d="M12 12l-2 2" />
    </svg>
  );
}

export default function RendezVousPage() {
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    date: "", 
    time: "", 
    duration: "30", 
    location: "",
    dossierId: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    type: "audience",
    reminder: false,
    reminderMinutes: 30,
    repeat: "none"
  });

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/rendez-vous");
      const data = await res.json();
      if (data.rendezVous) {
        setAppointments(data.rendezVous);
      }
    } catch (error) {
      console.error("Erreur chargement rendez-vous:", error);
      showToastMessage("خطأ في تحميل المواعيد", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDossiers = async () => {
    try {
      const res = await fetch("/api/dossiers");
      const data = await res.json();
      if (data.dossiers) {
        setDossiers(data.dossiers);
      }
    } catch (error) {
      console.error("Erreur chargement dossiers:", error);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadDossiers();
  }, []);

  const getTypeIcon = (type: string) => {
    const found = appointmentTypes.find(t => t.id === type);
    return found?.icon || Briefcase;
  };

  const getTypeColor = (type: string) => {
    const found = appointmentTypes.find(t => t.id === type);
    return found?.color || "bg-gray-100 text-gray-600";
  };

  const filteredAppointments = appointments.filter(a => {
    if (selectedType !== "all" && a.type !== selectedType) return false;
    if (search && !a.title.includes(search) && !a.clientName?.includes(search)) return false;
    return true;
  });

  const upcoming = filteredAppointments
    .filter(a => !a.isDone)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const past = filteredAppointments.filter(a => a.isDone).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "اليوم";
    if (date.toDateString() === tomorrow.toDateString()) return "غداً";
    return date.toLocaleDateString("ar", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'مساءً' : 'صباحاً';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const openNew = () => {
    setEditing(null);
    const today = new Date();
    setForm({ 
      title: "", description: "", 
      date: today.toISOString().split("T")[0], 
      time: "10:00", duration: "30", location: "",
      dossierId: "", clientName: "", clientPhone: "", clientEmail: "",
      type: "audience", reminder: false, reminderMinutes: 30, repeat: "none"
    });
    setShowModal(true);
  };

  const openEdit = (apt: RendezVous) => {
    setEditing(apt);
    setForm({
      title: apt.title,
      description: apt.description || "",
      date: apt.date,
      time: apt.time,
      duration: apt.duration.toString(),
      location: apt.location || "",
      dossierId: apt.dossierId || "",
      clientName: apt.clientName || "",
      clientPhone: apt.clientPhone || "",
      clientEmail: apt.clientEmail || "",
      type: apt.type || "audience",
      reminder: apt.reminder || false,
      reminderMinutes: apt.reminderMinutes || 30,
      repeat: "none"
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time) {
      showToastMessage("الرجاء إدخال العنوان والتاريخ والوقت", "error");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch("/api/rendez-vous", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: editing.id,
            title: form.title,
            description: form.description,
            date: form.date,
            time: form.time,
            duration: parseInt(form.duration),
            location: form.location,
            dossierId: form.dossierId || null,
            type: form.type,
            clientName: form.clientName,
            clientPhone: form.clientPhone,
            clientEmail: form.clientEmail,
            reminder: form.reminder,
            reminderMinutes: form.reminderMinutes,
          }),
        });
        if (res.ok) {
          showToastMessage("✅ تم تعديل الموعد بنجاح", "success");
          await loadAppointments();
        } else {
          showToastMessage("❌ خطأ في تعديل الموعد", "error");
        }
      } else {
        const res = await fetch("/api/rendez-vous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToastMessage("✅ تم إضافة الموعد بنجاح", "success");
          await loadAppointments();
        } else {
          showToastMessage("❌ خطأ في إضافة الموعد", "error");
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde rendez-vous:", error);
      showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/rendez-vous", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDone: !currentStatus }),
      });
      if (res.ok) {
        showToastMessage(currentStatus ? "✅ تم إعادة فتح الموعد" : "✅ تم إنجاز الموعد", "success");
        await loadAppointments();
      }
    } catch (error) {
      console.error("Erreur mise à jour rendez-vous:", error);
      showToastMessage("❌ خطأ في تحديث الحالة", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الموعد؟")) {
      try {
        const res = await fetch(`/api/rendez-vous?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          showToastMessage("✅ تم حذف الموعد بنجاح", "success");
          await loadAppointments();
        } else {
          showToastMessage("❌ خطأ في حذف الموعد", "error");
        }
      } catch (error) {
        console.error("Erreur suppression rendez-vous:", error);
        showToastMessage("❌ خطأ في الاتصال بالخادم", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light">جاري تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-5 duration-300 backdrop-blur-sm ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            📅 جدول المواعيد
          </h1>
          <p className="text-text-light mt-1">تنظيم ومتابعة جميع مواعيدك في تقويم ذكي</p>
        </div>
        <button 
          onClick={openNew} 
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" /> موعد جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المواعيد القادمة</p>
              <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المواعيد المنجزة</p>
              <p className="text-2xl font-bold text-green-600">{past.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">هذا الأسبوع</p>
              <p className="text-2xl font-bold text-orange-600">
                {appointments.filter(a => {
                  const weekStart = new Date();
                  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekEnd.getDate() + 7);
                  const aptDate = new Date(a.date);
                  return aptDate >= weekStart && aptDate <= weekEnd && !a.isDone;
                }).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">معدل شهري</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(appointments.filter(a => !a.isDone).length / 4) || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* List View - Modern Cards */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pr-10 p-2.5 bg-white border border-gray-200 rounded-lg text-sm"
              placeholder="بحث عن موعد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            {appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-primary" />
            المواعيد القادمة
          </h3>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <CalIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد مواعيد قادمة</p>
              </div>
            ) : (
              upcoming.map((apt) => {
                const TypeIcon = getTypeIcon(apt.type || "audience");
                const typeColor = getTypeColor(apt.type || "audience");
                return (
                  <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-3 rounded-xl ${typeColor}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{apt.title}</h4>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalIcon className="w-4 h-4" /> {formatDate(apt.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {formatTime(apt.time)}
                            </span>
                            {apt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {apt.location}
                              </span>
                            )}
                            {apt.dossier && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" /> {apt.dossier.title}
                              </span>
                            )}
                            {apt.clientName && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {apt.clientName}
                              </span>
                            )}
                          </div>
                          {apt.description && (
                            <p className="text-sm text-gray-500 mt-2">{apt.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleDone(apt.id, apt.isDone)}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                          title="إنجاز"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEdit(apt)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Past Appointments */}
        {past.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              المواعيد المنجزة
            </h3>
            <div className="space-y-2">
              {past.slice(0, 5).map((apt) => (
                <div key={apt.id} className="bg-gray-50 rounded-lg p-3 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium line-through text-gray-500">{apt.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(apt.date)} - {apt.time}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDone(apt.id, apt.isDone)}
                      className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-all"
                      title="إعادة فتح"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {past.length > 5 && (
                <p className="text-center text-sm text-gray-400 mt-2">
                  + {past.length - 5} مواعيد أخرى
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Premium */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark px-6 py-5 sticky top-0">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalIcon className="w-6 h-6" />
                    {editing ? "تعديل موعد" : "موعد جديد"}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {editing ? "تعديل معلومات الموعد" : "إضافة موعد جديد إلى التقويم"}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Type d'événement */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">نوع الموعد</label>
                <div className="flex flex-wrap gap-2">
                  {appointmentTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.id })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        form.type === type.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">عنوان الموعد <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: جلسة محكمة - قضية رقم 001"
                  />
                </div>
              </div>

              {/* Date et Heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <CalIcon className="w-4 h-4 inline ml-1" /> التاريخ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <Clock className="w-4 h-4 inline ml-1" /> الوقت <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Durée et Lieu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">المدة (دقيقة)</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  >
                    <option value="15">15 دقيقة</option>
                    <option value="30">30 دقيقة</option>
                    <option value="45">45 دقيقة</option>
                    <option value="60">1 ساعة</option>
                    <option value="90">1.5 ساعة</option>
                    <option value="120">2 ساعات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <MapPin className="w-4 h-4 inline ml-1" /> المكان
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="عنوان الموعد"
                  />
                </div>
              </div>

              {/* Client (optionnel) */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" /> معلومات العميل (اختياري)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    placeholder="اسم العميل"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                  <input 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    placeholder="رقم الهاتف"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  />
                  <input 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl col-span-full"
                    placeholder="البريد الإلكتروني"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* Dossier lié */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <FileText className="w-4 h-4 inline ml-1" /> ملف مرتبط (اختياري)
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                  value={form.dossierId}
                  onChange={(e) => setForm({ ...form, dossierId: e.target.value })}
                >
                  <option value="">اختر ملف</option>
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              {/* Rappel */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={form.reminder}
                    onChange={(e) => setForm({ ...form, reminder: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> تذكير
                  </span>
                </label>
                {form.reminder && (
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    value={form.reminderMinutes}
                    onChange={(e) => setForm({ ...form, reminderMinutes: parseInt(e.target.value) })}
                  >
                    {reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">وصف / ملاحظات</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none min-h-[100px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="تفاصيل إضافية عن الموعد..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all" disabled={saving}>
                إلغاء
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editing ? "حفظ التعديلات" : "إضافة الموعد"}
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