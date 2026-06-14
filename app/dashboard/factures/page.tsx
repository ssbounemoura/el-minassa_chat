"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, X, Receipt, CheckCircle2, Clock, AlertTriangle, 
  Trash2, Edit2, Save, AlertCircle, Calendar, CreditCard, User, 
  Phone, Mail, FileText, DollarSign, Wallet, Banknote, Landmark,
  Bell, MapPin, Hash, MessageCircle, Repeat, Printer,
  Globe, Shield, Award, Zap, ChevronDown, ChevronUp, Building2, Briefcase
} from "lucide-react";

interface Facture {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  description: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  officeName: string;
  phone: string;
  address: string;
  barNumber?: string;
  nationalId?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  BROUILLON: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  ENVOYEE: { label: "مرسلة", color: "bg-blue-100 text-blue-700" },
  PAYEE: { label: "مدفوعة", color: "bg-green-100 text-green-700" },
  EN_RETARD: { label: "متأخرة", color: "bg-red-100 text-red-700" },
  ANNULEE: { label: "ملغاة", color: "bg-gray-100 text-gray-700" },
};

const paymentMethods = [
  { id: "cash", name: "نقدي", icon: Banknote },
  { id: "bank", name: "تحويل بنكي", icon: Landmark },
  { id: "check", name: "شيك", icon: Receipt },
  { id: "cib", name: "بطاقة بنكية", icon: CreditCard },
];

const reminderOptions = [
  { value: "0", label: "لا تذكير" },
  { value: "1", label: "قبل يوم واحد" },
  { value: "2", label: "قبل يومين" },
  { value: "3", label: "قبل 3 أيام" },
  { value: "5", label: "قبل 5 أيام" },
  { value: "7", label: "قبل 7 أيام" },
  { value: "14", label: "قبل 14 يوماً" },
];

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Facture[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const [form, setForm] = useState({ 
    client: "", clientEmail: "", clientPhone: "", clientAddress: "", clientVat: "",
    amount: "", description: "", dueDate: "", issueDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash", notes: "", reminderDays: "3",
    taxRate: "19", discount: "", discountType: "percentage", reference: "",
    bankAccount: "", iban: "", swift: "", paymentTerms: "30",
    signature: false, stamp: false, includeVat: true
  });

  // Charger les informations de l'utilisateur connecté
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUserInfo(data.user);
        }
      } catch (error) {
        console.error("Erreur chargement user info:", error);
      }
    };
    loadUserInfo();
  }, []);

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFactures = async () => {
    try {
      const res = await fetch("/api/factures");
      const data = await res.json();
      if (data.factures) {
        setInvoices(data.factures);
      }
    } catch (error) {
      console.error("Erreur chargement factures:", error);
      showToastMessage("خطأ في تحميل الفواتير", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFactures(); }, []);

  useEffect(() => {
    const overdue = invoices.filter(inv => inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "PAYEE");
    if (overdue.length > 0) showToastMessage(`⚠️ ${overdue.length} فاتورة متأخرة`, "error");
  }, [invoices]);

  const getReminderDate = () => {
    if (!form.dueDate || !form.reminderDays || form.reminderDays === "0") return null;
    const dueDate = new Date(form.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(dueDate.getDate() - parseInt(form.reminderDays));
    return reminderDate;
  };

  const filtered = invoices.filter(inv => inv.client.includes(search) || inv.invoiceNumber.includes(search));
  const totalPaid = invoices.filter(i => i.status === "PAYEE").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "ENVOYEE" || i.status === "EN_RETARD").reduce((s, i) => s + i.amount, 0);
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const overdueInvoices = invoices.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== "PAYEE").length;

  const calculateTotals = () => {
    const subtotal = parseFloat(form.amount) || 0;
    const tax = form.includeVat ? (subtotal * (parseFloat(form.taxRate) || 0)) / 100 : 0;
    let discount = 0;
    if (form.discount) {
      if (form.discountType === "percentage") discount = (subtotal * parseFloat(form.discount)) / 100;
      else discount = parseFloat(form.discount);
    }
    return { subtotal, tax, discount, total: subtotal + tax - discount };
  };

  const handleSave = async () => {
    if (!form.client || !form.amount) { showToastMessage("الرجاء إدخال اسم العميل والمبلغ", "error"); return; }
    setSaving(true);
    try {
      const invoiceData = { client: form.client, amount: calculateTotals().total, description: form.description, dueDate: form.dueDate || null };
      const res = await fetch("/api/factures", { method: editingInvoice ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingInvoice ? { id: editingInvoice.id, ...invoiceData } : invoiceData) });
      if (res.ok) {
        showToastMessage(editingInvoice ? "✅ تم تعديل الفاتورة بنجاح" : "✅ تم إنشاء الفاتورة بنجاح", "success");
        await loadFactures();
        if (!editingInvoice && form.reminderDays && form.reminderDays !== "0") {
          const reminderDate = getReminderDate();
          showToastMessage(`🔔 تم جدولة التذكير يوم ${reminderDate?.toLocaleDateString("ar")}`, "success");
        }
        setShowModal(false);
      } else showToastMessage("❌ حدث خطأ", "error");
    } catch (error) { showToastMessage("❌ خطأ في الاتصال بالخادم", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      const res = await fetch(`/api/factures?id=${id}`, { method: "DELETE" });
      if (res.ok) { showToastMessage("✅ تم حذف الفاتورة بنجاح", "success"); await loadFactures(); }
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/factures", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
    if (res.ok) { showToastMessage("✅ تم تغيير الحالة بنجاح", "success"); await loadFactures(); }
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat('ar-DZ').format(amount);
  const totals = calculateTotals();
  const reminderDate = getReminderDate();

  // Fonction pour obtenir le rôle en arabe
  const getRoleInArabic = (role: string | undefined) => {
    const roleUpper = role?.toUpperCase();
    if (roleUpper === "AVOCAT") return "محامي";
    if (roleUpper === "NOTAIRE") return "موثق";
    if (roleUpper === "HUISSIER") return "محضر قضائي";
    return "محامي";
  };

  // Fonction d'impression
  const printInvoice = (invoice: Facture) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const taxAmount = invoice.amount * 0.19;
    const totalWithTax = invoice.amount + taxAmount;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة رسمية - ${userInfo?.name || "المحامي"} | ${invoice.invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Arial', sans-serif;
            background: #f0f2f5;
            padding: 40px 20px;
            color: #1a202c;
          }
          .invoice-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .invoice-header {
            background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
            padding: 30px 35px;
            position: relative;
          }
          .invoice-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ffd700, #ff8c00, #ffd700);
          }
          .lawyer-name {
            font-size: 32px;
            font-weight: 800;
            color: #ffd700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
          }
          .lawyer-profession {
            font-size: 18px;
            color: rgba(255,215,0,0.9);
            margin-bottom: 5px;
          }
          .lawyer-details {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            line-height: 1.6;
          }
          .lawyer-extra {
            font-size: 13px;
            color: rgba(255,255,255,0.7);
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed rgba(255,215,0,0.3);
          }
          .invoice-title-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .invoice-title {
            font-size: 28px;
            font-weight: 800;
            color: white;
            letter-spacing: 1px;
          }
          .invoice-number {
            font-size: 16px;
            color: rgba(255,255,255,0.7);
            font-family: monospace;
            background: rgba(255,255,255,0.15);
            padding: 5px 12px;
            border-radius: 30px;
          }
          .info-grid {
            display: flex;
            justify-content: space-between;
            padding: 25px 35px;
            background: #f8f9fc;
            border-bottom: 1px solid #e2e8f0;
            flex-wrap: wrap;
            gap: 20px;
          }
          .info-card {
            flex: 1;
            min-width: 180px;
          }
          .info-card h4 {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .info-card p {
            font-size: 16px;
            font-weight: 600;
            color: #1a202c;
          }
          .items-table {
            padding: 0 35px;
            margin: 30px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #f1f3f5;
            padding: 14px 12px;
            text-align: right;
            font-weight: 700;
            font-size: 14px;
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #edf2f7;
            font-size: 14px;
          }
          .totals-section {
            padding: 20px 35px 30px;
            background: #fafbfc;
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .totals-box {
            width: 320px;
            margin-right: auto;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .totals-row.total {
            font-weight: 800;
            font-size: 20px;
            border-top: 2px solid #1a472a;
            margin-top: 10px;
            padding-top: 12px;
            color: #1a472a;
          }
          .footer {
            text-align: center;
            padding: 25px 35px;
            background: #f8f9fc;
            border-top: 1px solid #e2e8f0;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: ${invoice.status === "PAYEE" ? "#c6f6d5" : invoice.status === "EN_RETARD" ? "#fed7d7" : "#e2e8f0"};
            color: ${invoice.status === "PAYEE" ? "#22543d" : invoice.status === "EN_RETARD" ? "#742a2a" : "#4a5568"};
          }
          @media print {
            body { background: white; padding: 0; }
            .invoice-wrapper { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <div class="invoice-header">
            <div class="lawyer-name">${userInfo?.name || "المحامي"}</div>
            <div class="lawyer-profession">${getRoleInArabic(userInfo?.role)}</div>
            <div class="lawyer-details">
              ${userInfo?.officeName ? `🏛️ ${userInfo.officeName}<br>` : ''}
              ${userInfo?.address ? `📍 ${userInfo.address}<br>` : ''}
              ${userInfo?.phone ? `📞 ${userInfo.phone}<br>` : ''}
              ${userInfo?.email ? `✉️ ${userInfo.email}` : ''}
            </div>
            <div class="lawyer-extra">
              ${userInfo?.barNumber ? `📋 رقم التسجيل المهني: ${userInfo.barNumber}<br>` : ''}
              ${userInfo?.nationalId ? `🆔 رقم التعريف الوطني: ${userInfo.nationalId}` : ''}
            </div>
            <div class="invoice-title-section">
              <div class="invoice-title">فاتورة</div>
              <div class="invoice-number">#${invoice.invoiceNumber}</div>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-card">
              <h4>العميل</h4>
              <p>${invoice.client}</p>
            </div>
            <div class="info-card">
              <h4>تاريخ الإصدار</h4>
              <p>${new Date(invoice.createdAt).toLocaleDateString('ar')}</p>
            </div>
            <div class="info-card">
              <h4>تاريخ الاستحقاق</h4>
              <p>${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar') : 'غير محدد'}</p>
            </div>
            <div class="info-card">
              <h4>الحالة</h4>
              <p><span class="status-badge">${
                invoice.status === "PAYEE" ? "مدفوعة" : 
                invoice.status === "EN_RETARD" ? "متأخرة" : 
                invoice.status === "ENVOYEE" ? "مرسلة" :
                invoice.status === "ANNULEE" ? "ملغاة" : "مسودة"
              }</span></p>
            </div>
          </div>
          
          <div class="items-table">
            <table>
              <thead>
                <tr><th style="text-align:right">الخدمة / المنتج</th><th style="text-align:center">المبلغ (د.ج)</th></tr>
              </thead>
              <tbody>
                <tr><td style="text-align:right">${invoice.description || 'خدمات مهنية'}</td><td style="text-align:center">${formatAmount(invoice.amount)}</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row"><span>المبلغ بدون ضريبة:</span><span><strong>${formatAmount(invoice.amount)}</strong> د.ج</span></div>
              <div class="totals-row"><span>الضريبة (TVA 19%):</span><span><strong>${formatAmount(taxAmount)}</strong> د.ج</span></div>
              <div class="totals-row total"><span>الإجمالي شامل الضريبة:</span><span>${formatAmount(totalWithTax)} د.ج</span></div>
            </div>
          </div>
          
          <div class="footer">
            <p>شكراً لثقتكم في خدماتنا المهنية</p>
            <p style="margin-top:8px; font-size:10px;">هذه فاتورة رسمية معتمدة</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <div className="flex justify-center p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {toast && <div className={`fixed top-24 right-4 z-50 px-5 py-3 rounded-xl shadow-xl ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{toast.message}</div>}

      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-primary">💰 إدارة الفواتير</h1><p className="text-text-light">{invoices.length} فاتورة مسجلة</p></div>
        <button onClick={() => { setEditingInvoice(null); setForm({ client: "", clientEmail: "", clientPhone: "", clientAddress: "", clientVat: "", amount: "", description: "", dueDate: "", issueDate: new Date().toISOString().split("T")[0], paymentMethod: "cash", notes: "", reminderDays: "3", taxRate: "19", discount: "", discountType: "percentage", reference: "", bankAccount: "", iban: "", swift: "", paymentTerms: "30", signature: false, stamp: false, includeVat: true }); setShowReminder(false); setShowAdvanced(false); setShowModal(true); }} className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"><Plus className="w-5 h-5" /> فاتورة جديدة</button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-green-100 rounded-xl p-4"><p className="text-green-700">المدفوع</p><p className="text-2xl font-bold">{formatAmount(totalPaid)} د.ج</p></div>
        <div className="bg-yellow-100 rounded-xl p-4"><p className="text-yellow-700">المعلق</p><p className="text-2xl font-bold">{formatAmount(totalPending)} د.ج</p></div>
        <div className="bg-blue-100 rounded-xl p-4"><p className="text-blue-700">الإجمالي</p><p className="text-2xl font-bold">{formatAmount(totalAmount)} د.ج</p></div>
        <div className="bg-red-100 rounded-xl p-4"><p className="text-red-700">المتأخرة</p><p className="text-2xl font-bold">{overdueInvoices}</p></div>
        <div className="bg-purple-100 rounded-xl p-4"><p className="text-purple-700">الضريبة</p><p className="text-2xl font-bold">19%</p></div>
      </div>

      <div className="relative max-w-md"><Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" /><input className="w-full pr-10 p-3 border rounded-xl" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="p-3 text-right">رقم الفاتورة</th><th className="p-3 text-right">العميل</th><th className="p-3 text-right">المبلغ</th><th className="p-3 text-right">الحالة</th><th className="p-3 text-right">تاريخ الاستحقاق</th><th className="p-3 text-center">إجراءات</th></tr></thead>
          <tbody>
            {filtered.map(inv => {
              const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "PAYEE";
              return (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.client}</td>
                  <td className="p-3 font-bold">{formatAmount(inv.amount)} د.ج</td>
                  <td className="p-3">
                    <select value={inv.status} onChange={(e) => updateStatus(inv.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs ${statusConfig[inv.status]?.color}`}>
                      <option value="BROUILLON">مسودة</option>
                      <option value="ENVOYEE">مرسلة</option>
                      <option value="PAYEE">مدفوعة</option>
                      <option value="EN_RETARD">متأخرة</option>
                      <option value="ANNULEE">ملغاة</option>
                    </select>
                  </td>
                  <td className="p-3"><div className="flex items-center gap-2"><span className={isOverdue ? "text-red-600 font-bold" : ""}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("ar") : "-"}</span>{isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}</div></td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => printInvoice(inv)} className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-all duration-200 hover:scale-110" title="طباعة الفاتورة"><Printer className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingInvoice(inv); setForm({ client: inv.client, clientEmail: "", clientPhone: "", clientAddress: "", clientVat: "", amount: inv.amount.toString(), description: inv.description || "", dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "", issueDate: new Date(inv.createdAt).toISOString().split("T")[0], paymentMethod: "cash", notes: "", reminderDays: "3", taxRate: "19", discount: "", discountType: "percentage", reference: "", bankAccount: "", iban: "", swift: "", paymentTerms: "30", signature: false, stamp: false, includeVat: true }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200 hover:scale-110" title="تعديل"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 hover:scale-110" title="حذف"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-primary p-5 sticky top-0"><div className="flex justify-between"><div><h2 className="text-2xl font-bold text-white">{editingInvoice ? "✏️ تعديل فاتورة" : "💰 فاتورة جديدة"}</h2><p className="text-white/80 text-sm">جميع الخيارات الاحترافية</p></div><button onClick={() => setShowModal(false)} className="text-white text-2xl">✕</button></div></div>

            <div className="p-6 space-y-5">
              <div className="border rounded-xl p-4"><h3 className="font-bold mb-3 flex items-center gap-2"><User className="w-5 h-5" /> معلومات العميل</h3>
                <div className="grid grid-cols-2 gap-3"><input className="border rounded-lg p-2" placeholder="اسم العميل *" value={form.client} onChange={(e) => setForm({...form, client: e.target.value})} /><input className="border rounded-lg p-2" placeholder="البريد الإلكتروني" value={form.clientEmail} onChange={(e) => setForm({...form, clientEmail: e.target.value})} /><input className="border rounded-lg p-2" placeholder="رقم الهاتف" value={form.clientPhone} onChange={(e) => setForm({...form, clientPhone: e.target.value})} /><input className="border rounded-lg p-2" placeholder="العنوان" value={form.clientAddress} onChange={(e) => setForm({...form, clientAddress: e.target.value})} /><input className="border rounded-lg p-2 col-span-2" placeholder="الرقم الجبائي / NIF" value={form.clientVat} onChange={(e) => setForm({...form, clientVat: e.target.value})} /></div>
              </div>

              <div className="border rounded-xl p-4"><h3 className="font-bold mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5" /> المبالغ والضرائب</h3>
                <div className="grid grid-cols-3 gap-3"><input type="number" className="border rounded-lg p-2" placeholder="المبلغ بدون ضريبة" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /><div className="flex gap-2"><input type="number" className="border rounded-lg p-2 w-20" placeholder="نسبة الضريبة %" value={form.taxRate} onChange={(e) => setForm({...form, taxRate: e.target.value})} /><span className="p-2">%</span></div><div className="flex gap-2"><input type="number" className="border rounded-lg p-2 w-20" placeholder="الخصم" value={form.discount} onChange={(e) => setForm({...form, discount: e.target.value})} /><select className="border rounded-lg p-2" value={form.discountType} onChange={(e) => setForm({...form, discountType: e.target.value})}><option value="percentage">%</option><option value="fixed">د.ج</option></select></div></div>
                <div className="mt-3 p-3 bg-gray-100 rounded-lg"><div className="flex justify-between"><span>المبلغ الإجمالي:</span><span>{formatAmount(totals.subtotal)} د.ج</span></div><div className="flex justify-between"><span>قيمة الضريبة:</span><span>{formatAmount(totals.tax)} د.ج</span></div><div className="flex justify-between font-bold pt-2 border-t"><span>المبلغ النهائي شامل الضريبة:</span><span className="text-primary">{formatAmount(totals.total)} د.ج</span></div></div>
              </div>

              <div className="border rounded-xl p-4"><h3 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5" /> وسيلة الدفع</h3>
                <div className="flex gap-3 flex-wrap">{paymentMethods.map(m => <button key={m.id} type="button" onClick={() => setForm({...form, paymentMethod: m.id})} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${form.paymentMethod === m.id ? "border-primary bg-primary/10 text-primary" : "border-gray-200"}`}><m.icon className="w-4 h-4" />{m.name}</button>)}</div>
              </div>

              <div className="border rounded-xl p-4"><h3 className="font-bold mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" /> التواريخ والتذكير</h3>
                <div className="grid grid-cols-2 gap-3"><input type="date" className="border rounded-lg p-2" value={form.issueDate} onChange={(e) => setForm({...form, issueDate: e.target.value})} /><input type="date" className="border rounded-lg p-2" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} /></div>
                <button onClick={() => setShowReminder(!showReminder)} className="mt-3 text-primary flex items-center gap-2"><Bell className="w-4 h-4" /> {showReminder ? "إخفاء خيارات التذكير" : "🔔 إضافة تذكير"}</button>
                {showReminder && <div className="mt-3 p-3 bg-orange-50 rounded-lg"><select className="border rounded-lg p-2 w-full" value={form.reminderDays} onChange={(e) => setForm({...form, reminderDays: e.target.value})}>{reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{reminderDate && <p className="mt-2 text-green-600">📅 سيتم التذكير يوم {reminderDate.toLocaleDateString("ar")}</p>}</div>}
              </div>

              <div className="border rounded-xl p-4"><h3 className="font-bold mb-3 flex items-center gap-2"><Zap className="w-5 h-5" /> خيارات متقدمة</h3>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-indigo-600 flex items-center gap-2">{showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} {showAdvanced ? "إخفاء الخيارات" : "عرض الخيارات المتقدمة"}</button>
                {showAdvanced && <div className="mt-3 grid grid-cols-2 gap-3"><select className="border rounded-lg p-2" value={form.paymentTerms} onChange={(e) => setForm({...form, paymentTerms: e.target.value})}><option value="0">عند الاستلام</option><option value="15">15 يوماً</option><option value="30">30 يوماً</option><option value="45">45 يوماً</option><option value="60">60 يوماً</option></select><input className="border rounded-lg p-2" placeholder="IBAN" value={form.iban} onChange={(e) => setForm({...form, iban: e.target.value})} /><input className="border rounded-lg p-2" placeholder="SWIFT/BIC" value={form.swift} onChange={(e) => setForm({...form, swift: e.target.value})} /><div className="flex gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={form.signature} onChange={(e) => setForm({...form, signature: e.target.checked})} /> توقيع إلكتروني</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.stamp} onChange={(e) => setForm({...form, stamp: e.target.checked})} /> ختم رسمي</label></div></div>}
              </div>

              <textarea className="w-full border rounded-lg p-3" rows={3} placeholder="الوصف / ملاحظات" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button><button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg" disabled={saving}>{saving ? "جاري الحفظ..." : (editingInvoice ? "حفظ التعديلات" : "إنشاء الفاتورة")}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}