"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, Volume2, VolumeX } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  sound?: boolean;
}

// Sons premium (Mixkit - libres de droits)
const SOUNDS = {
  success: "https://assets.mixkit.co/sfx/preview/mixkit-winning-chime-2019.mp3",
  error: "https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3",
  warning: "https://assets.mixkit.co/sfx/preview/mixkit-alert-dialogue-2400.mp3",
  info: "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3",
};

// Préférence utilisateur pour le son (stockée dans localStorage)
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    localStorage.setItem("toast-sound-enabled", JSON.stringify(enabled));
  } catch (e) {}
}

export function isSoundEnabled(): boolean {
  try {
    const saved = localStorage.getItem("toast-sound-enabled");
    if (saved !== null) {
      soundEnabled = JSON.parse(saved);
    }
  } catch (e) {}
  return soundEnabled;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Charger la préférence sonore
    setMuted(!isSoundEnabled());

    const handleNewToast = (event: CustomEvent<Toast>) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);
      
      // Jouer le son si activé
      if (newToast.sound !== false && isSoundEnabled()) {
        playSound(newToast.type);
      }
      
      // Auto-suppression
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);
    };

    window.addEventListener("new-toast" as any, handleNewToast);
    return () => window.removeEventListener("new-toast" as any, handleNewToast);
  }, []);

  const playSound = (type: string) => {
    try {
      const audio = new Audio(SOUNDS[type as keyof typeof SOUNDS] || SOUNDS.info);
      audio.volume = 0.4; // Volume à 40% (discret mais audible)
      audio.play().catch(e => console.log("🔇 Son non joué:", e));
    } catch (error) {
      console.log("Erreur lecture son:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "error":
        return "bg-rose-50 border-rose-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-sky-50 border-sky-200";
    }
  };

  const getTitleColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-emerald-800";
      case "error":
        return "text-rose-800";
      case "warning":
        return "text-amber-800";
      default:
        return "text-sky-800";
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setSoundEnabled(!newMuted);
    const toastType = newMuted ? "info" : "success";
    showToast(
      newMuted ? "🔇 Son désactivé" : "🔊 Son activé",
      newMuted ? "Les notifications seront silencieuses" : "Les notifications auront un son",
      toastType,
      2000,
      false
    );
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bouton de contrôle du son */}
      <button
        onClick={toggleMute}
        className="fixed bottom-5 right-5 z-50 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105"
        title={muted ? "Activer le son" : "Désactiver le son"}
      >
        {muted ? (
          <VolumeX className="w-5 h-5 text-gray-500" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Conteneur des toasts */}
      <div className="fixed bottom-5 left-5 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-left duration-300 min-w-[300px] max-w-[400px] ${getBgColor(toast.type)}`}
          >
            <div className="flex-shrink-0">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${getTitleColor(toast.type)}`}>{toast.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// Fonction utilitaire pour afficher un toast
export function showToast(
  title: string, 
  message: string, 
  type: Toast["type"] = "info", 
  duration?: number,
  sound: boolean = true
) {
  const event = new CustomEvent("new-toast", {
    detail: {
      id: Date.now().toString(),
      title,
      message,
      type,
      duration,
      sound,
    },
  });
  window.dispatchEvent(event);
}