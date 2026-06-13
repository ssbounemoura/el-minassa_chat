"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Bell, Download, Plus, ArrowRight } from "lucide-react";

type Hearing = {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  date: Date;
  time: string;
  status: "upcoming" | "completed" | "postponed";
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [hearings, setHearings] = useState<Hearing[]>([]);

  useEffect(() => {
    // Données de démonstration
    const mockHearings: Hearing[] = [
      {
        id: "1",
        title: "قضية تجارية",
        caseNumber: "2024-001",
        court: "محكمة سيدي أمحمد",
        date: new Date(2026, 5, 20),
        time: "10:00",
        status: "upcoming",
      },
      {
        id: "2",
        title: "نزاع عمالي",
        caseNumber: "2024-002",
        court: "محكمة باب الوادي",
        date: new Date(2026, 5, 20),
        time: "11:30",
        status: "upcoming",
      },
      {
        id: "3",
        title: "قضية مدنية",
        caseNumber: "2024-003",
        court: "محكمة حسين داي",
        date: new Date(2026, 5, 21),
        time: "09:00",
        status: "upcoming",
      },
      {
        id: "4",
        title: "طلب تأجيل",
        caseNumber: "2024-004",
        court: "محكمة الحراش",
        date: new Date(2026, 5, 22),
        time: "14:00",
        status: "postponed",
      },
    ];
    setHearings(mockHearings);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDay = firstDay.getDay();
    
    // Ajuster pour commencer par dimanche (0) au lieu de samedi (6)
    let startOffset = startDay === 6 ? 0 : startDay + 1;
    
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = () => {
    const weekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return weekDays;
  };

  const getHearingsForDate = (date: Date) => {
    if (!date) return [];
    return hearings.filter(h => 
      h.date.getDate() === date.getDate() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getFullYear() === date.getFullYear()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "postponed": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming": return "قادمة";
      case "completed": return "منجزة";
      case "postponed": return "مؤجلة";
      default: return "";
    }
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const exportToPDF = () => {
    window.open("/reports/hearings/print", "_blank");
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();
  const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">جدول الجلسات الذكي</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/portal/reports/new"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                طلب تأجيل جديد
              </Link>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                تصدير PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Bouton retour à l'accueil */}
        <div className="mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded-lg text-sm ${view === "month" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
              >
                عرض شهري
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded-lg text-sm ${view === "week" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
              >
                عرض أسبوعي
              </button>
            </div>
          </div>
        </div>

        {/* Vue Mensuelle */}
        {view === "month" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, idx) => (
                <div key={idx} className="p-3 text-center font-semibold text-gray-600 border-l">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((date, idx) => {
                const dayHearings = date ? getHearingsForDate(date) : [];
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 border-l border-b ${!date ? "bg-gray-50" : ""}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${isToday ? "text-primary font-bold" : "text-gray-700"}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayHearings.slice(0, 3).map((hearing) => (
                            <div
                              key={hearing.id}
                              className={`text-xs p-1 rounded ${getStatusColor(hearing.status)}`}
                            >
                              <div className="font-medium">{hearing.title}</div>
                              <div className="text-xs opacity-75">{hearing.time}</div>
                            </div>
                          ))}
                          {dayHearings.length > 3 && (
                            <div className="text-xs text-gray-400">+{dayHearings.length - 3} أخرى</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vue Hebdomadaire */}
        {view === "week" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="space-y-4 p-4">
              {hearings.map((hearing) => (
                <div
                  key={hearing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{hearing.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(hearing.status)}`}>
                        {getStatusText(hearing.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                      <div>📋 {hearing.caseNumber}</div>
                      <div>🏛️ {hearing.court}</div>
                      <div>📅 {hearing.date.toLocaleDateString("ar")}</div>
                      <div>⏰ {hearing.time}</div>
                    </div>
                  </div>
                  <Link
                    href={`/portal/reports/${hearing.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    تفاصيل
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu des notifications */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">⏰ تذكير يومي</h3>
              <p className="text-sm text-amber-700">
                لديك {hearings.filter(h => h.status === "upcoming" && h.date > new Date()).length} جلسات قادمة هذا الأسبوع
              </p>
            </div>
            <button className="text-amber-700 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}