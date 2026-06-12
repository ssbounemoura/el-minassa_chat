"use client";

import { useState } from "react";
import { Plus, Calendar as CalIcon, Clock, MapPin, X, CheckCircle2 } from "lucide-react";

const mockAppointments: any[] = [];

export default function RendezVousPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", duration: "30", location: "" });

  const upcoming = appointments.filter((a) => !a.isDone).sort((a, b) => a.date.localeCompare(b.date));
  const past = appointments.filter((a) => a.isDone);

  const handleSave = () => {
    const newApt = { ...form, id: Date.now().toString(), duration: parseInt(form.duration), isDone: false, dossier: "" };
    setAppointments((p) => [newApt, ...p]);
    setShowModal(false);
  };

  const toggleDone = (id: string) => {
    setAppointments((p) => p.map((a) => a.id === id ? { ...a, isDone: !a.isDone } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-primary">إدارة المواعيد</h1><p className="text-text-light text-sm">{upcoming.length} موعد قادم</p></div>
        <button onClick={() => { setForm({ title: "", description: "", date: "", time: "", duration: "30", location: "" }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> موعد جديد</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4">المواعيد القادمة</h2>
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt.id} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:shadow-sm transition-shadow">
                <div className="p-2 bg-primary/10 rounded-lg"><CalIcon className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-medium">{apt.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-light">
                    <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" />{apt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.location}</span>
                  </div>
                  {apt.description && <p className="text-sm text-text-light mt-1">{apt.description}</p>}
                </div>
                <button onClick={() => toggleDone(apt.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="تم"><CheckCircle2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4">المواعيد المنجزة</h2>
          <div className="space-y-3">
            {past.map((apt) => (
              <div key={apt.id} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 opacity-75">
                <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                <div className="flex-1">
                  <p className="font-medium line-through">{apt.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-light">
                    <span>{apt.date} - {apt.time}</span>
                    <span>{apt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">موعد جديد</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">العنوان *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">التاريخ *</label><input type="date" className="input-field" dir="ltr" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">الوقت *</label><input type="time" className="input-field" dir="ltr" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">المدة (دقيقة)</label><input type="number" className="input-field" dir="ltr" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">المكان</label><input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">وصف</label><textarea className="input-field min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm">إلغاء</button>
              <button onClick={handleSave} className="btn-primary text-sm">حفظ الموعد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
