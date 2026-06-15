"use client";

import { useState, useEffect } from "react";
import {
  Settings, Save, Database, ShieldAlert, KeyRound, Loader2, Sparkles, CheckCircle, AlertTriangle
} from "lucide-react";
import { showToast } from "@/components/notifications/ToastContainer";

interface SystemSettings {
  systemName: string;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
}

const AI_MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Google Gemma 4 31B IT (Free)" },
  { id: "google/gemini-2.0-flash-exp:free", label: "Google Gemini 2.0 Flash (Free)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Meta LLaMA 3.3 70B (Free)" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat (paid/fast)" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        } else {
          console.error("Failed to fetch settings:", res.status);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    // Build explicit payload — ensure maintenanceMode is a real boolean
    const payload = {
      systemName: settings.systemName,
      maintenanceMode: settings.maintenanceMode === true,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
      aiModel: settings.aiModel,
      aiTemperature: settings.aiTemperature,
      aiMaxTokens: settings.aiMaxTokens,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("نجاح", "تم حفظ الإعدادات بنجاح!", "success");
        // Update local state with server response to confirm persistence
        setSettings(data.settings);
      } else {
        showToast("خطأ", data.error || "حدث خطأ أثناء حفظ الإعدادات", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("خطأ", "فشل الاتصال بالخادم لحفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = () => {
    window.open("/api/admin/settings/backup", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center text-red-500 py-20 flex flex-col items-center gap-3">
        <AlertTriangle className="w-12 h-12" />
        <p>خطأ في تحميل الإعدادات من الخادم</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Settings className="w-7 h-7 text-secondary" /> إعدادات النظام
        </h1>
        <p className="text-text-light text-sm">إدارة معلومات المنصة وخيارات المساعد الذكي وحالة النظام</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform basic details */}
        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-border pb-3">
            <KeyRound className="w-5 h-5 text-secondary" /> معلومات المنصة الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-light mb-1 block">اسم المنصة</label>
              <input
                className="input-field"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-light mb-1 block">البريد الإلكتروني للدعم</label>
              <input
                className="input-field"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-light mb-1 block">رقم الهاتف للتواصل</label>
              <input
                className="input-field"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-light mb-1 block">عنوان المقر الرئيسي</label>
              <input
                className="input-field"
                value={settings.contactAddress}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* AI & OpenRouter settings */}
        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="w-5 h-5 text-secondary" /> إعدادات المساعد الذكي (OpenRouter)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-light mb-1 block">نموذج الذكاء الاصطناعي (Model)</label>
              <select
                className="input-field"
                value={settings.aiModel}
                onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              >
                {AI_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-text-light">درجة الابتكار (Temperature)</label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {settings.aiTemperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={settings.aiTemperature}
                  onChange={(e) => setSettings({ ...settings, aiTemperature: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[10px] text-text-light mt-1">
                  <span>دقيق جداً (0)</span>
                  <span>متوازن (0.4 - 0.7)</span>
                  <span>إبداعي (1.0+)</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-text-light mb-1 block">أقصى عدد من الرموز (Max Tokens)</label>
                <input
                  type="number"
                  min="256"
                  max="8192"
                  className="input-field"
                  value={settings.aiMaxTokens}
                  onChange={(e) => setSettings({ ...settings, aiMaxTokens: parseInt(e.target.value) || 2048 })}
                  required
                />
                <p className="text-[10px] text-text-light mt-1">يتحكم في طول إجابات المساعد الذكي وحجم سياق المستندات.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security / System status */}
        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-border pb-3">
            <ShieldAlert className="w-5 h-5 text-secondary" /> حالة النظام والأمن
          </h2>
          <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <div className="space-y-1">
              <span className="font-bold text-danger text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> وضع الصيانة للموقع (Maintenance Mode)
              </span>
              <p className="text-xs text-text-light max-w-md">
                عند التفعيل، سيتم حظر المستخدمين من دخول لوحات التحكم الخاصة بهم وعرض صفحة تفيد بأن النظام تحت الصيانة الجارية.
              </p>
              <p className="text-xs font-medium mt-1">
                الحالة الحالية:{" "}
                <span className={settings.maintenanceMode ? "text-danger font-bold" : "text-success font-bold"}>
                  {settings.maintenanceMode ? "🔴 وضع الصيانة مفعّل" : "🟢 الموقع يعمل بشكل طبيعي"}
                </span>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.maintenanceMode}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSettings((prev) => prev ? { ...prev, maintenanceMode: checked } : prev);
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </form>

      {/* Database Backup Tool */}
      <div className="card">
        <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-border pb-3">
          <Database className="w-5 h-5 text-secondary" /> إدارة قواعد البيانات
        </h2>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-primary text-sm">نسخة احتياطية كاملة (dev.db)</h3>
            <p className="text-xs text-text-light max-w-lg">
              قم بتحميل نسخة مادية كاملة من قاعدة بيانات SQLite الحالية الخاصة بك. تتضمن كافة المشتركين والملفات والمحاضر والرسائل. يوصى بعمل نسخة دورية لحماية البيانات من الضياع.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackup}
            className="btn-outline text-sm flex items-center gap-2 hover:bg-primary-light hover:text-white"
          >
            <Database className="w-4 h-4" /> تحميل نسخة احتياطية
          </button>
        </div>
      </div>
    </div>
  );
}
