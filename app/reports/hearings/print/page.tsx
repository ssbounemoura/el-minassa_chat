"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, Calendar, Printer, ArrowRight } from "lucide-react";

export default function HearingsPrintPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Déclencher l'impression après le chargement
    setTimeout(() => window.print(), 800);
    setLoading(false);
  }, []);

  // Données de démonstration (à remplacer par tes vraies données plus tard)
  const hearings = [
    { id: "1", caseNumber: "2024-001", caseTitle: "قضية تجارية", court: "محكمة سيدي أمحمد", date: "2026-06-20", time: "10:00", status: "مبرمجة" },
    { id: "2", caseNumber: "2024-002", caseTitle: "نزاع عمالي", court: "محكمة باب الوادي", date: "2026-06-20", time: "11:30", status: "مبرمجة" },
    { id: "3", caseNumber: "2024-003", caseTitle: "قضية مدنية", court: "محكمة حسين داي", date: "2026-06-21", time: "09:00", status: "مؤجلة" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحضير جدول الجلسات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Bouton retour à l'accueil */}
      <div style={{ marginBottom: "20px" }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#f0f0f0",
            color: "#333",
            padding: "8px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          <ArrowRight size={16} />
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>

      {/* Bouton impression */}
      <button 
        onClick={() => window.print()} 
        style={{ 
          position: "fixed", 
          bottom: "20px", 
          left: "20px", 
          background: "#1a472a", 
          color: "white", 
          padding: "10px 20px", 
          border: "none", 
          borderRadius: "8px", 
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 100
        }}
      >
        <Printer size={18} />
        طباعة / حفظ PDF
      </button>

      {/* En-tête */}
      <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #1a472a", paddingBottom: "20px" }}>
        <Scale size={50} style={{ color: "#1a472a", marginBottom: "10px" }} />
        <h1 style={{ margin: 0, fontSize: "24px" }}>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
        <h2 style={{ margin: "5px 0", fontSize: "18px", color: "#555" }}>وزارة العدل</h2>
        <p style={{ margin: "10px 0 0", fontSize: "16px", fontWeight: "bold" }}>جدول الجلسات المبرمجة</p>
        <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#666" }}>{new Date().toLocaleDateString("ar")}</p>
      </div>

      {/* Tableau */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>رقم القضية</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>عنوان القضية</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>المحكمة</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>التاريخ</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>التوقيت</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {hearings.map((hearing) => (
            <tr key={hearing.id}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{hearing.caseNumber}</td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{hearing.caseTitle}</td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{hearing.court}</td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{new Date(hearing.date).toLocaleDateString("ar")}</td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{hearing.time}</td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                <span style={{ 
                  color: hearing.status === "مبرمجة" ? "green" : hearing.status === "مؤجلة" ? "orange" : "blue",
                  fontWeight: "bold"
                }}>
                  {hearing.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pied de page */}
      <div style={{ textAlign: "center", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #ddd", fontSize: "12px", color: "#666" }}>
        <p>إجمالي الجلسات: {hearings.length}</p>
        <p>المنصة القانونية الجزائرية - نظام إدارة القضايا</p>
      </div>

      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          button {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}