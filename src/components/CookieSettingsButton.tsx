// src/components/CookieSettingsButton.tsx
"use client";

import { Settings } from "lucide-react";

export default function CookieSettingsButton() {
  const openCookieSettings = () => {
    // Supprimer le consentement pour forcer la réaffichage de la bannière
    localStorage.removeItem("cookie-consent");
    localStorage.removeItem("cookie-preferences");
    window.location.reload();
  };

  return (
    <button
      onClick={openCookieSettings}
      className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
    >
      <Settings className="w-4 h-4" />
      إدارة ملفات تعريف الارتباط
    </button>
  );
}