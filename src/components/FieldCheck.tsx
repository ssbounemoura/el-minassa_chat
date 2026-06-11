"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, Check, AlertCircle, Loader } from "lucide-react";

interface FieldCheckProps {
  type: "email" | "phone";
  value: string;
  onCheck?: (available: boolean) => void;
}

export function FieldCheck({ type, value, onCheck }: FieldCheckProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState("");

  const checkAvailability = useCallback(async (val: string) => {
    if (!val) {
      setStatus("idle");
      setMessage("");
      onCheck?.(false);
      return;
    }

    setStatus("checking");
    
    try {
      const response = await fetch("/api/auth/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: val }),
      });

      const data = await response.json();

      if (data.available) {
        setStatus("valid");
        setMessage(data.message || `${type === "email" ? "البريد" : "الرقم"} متاح`);
        onCheck?.(true);
      } else {
        setStatus("invalid");
        setMessage(data.message || "غير متاح");
        onCheck?.(false);
      }
    } catch (error) {
      setStatus("invalid");
      setMessage("خطأ في التحقق");
      onCheck?.(false);
    }
  }, [type, onCheck]);

  // Debounced check - waits 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) checkAvailability(value);
      else setStatus("idle");
    }, 500);

    return () => clearTimeout(timer);
  }, [value, checkAvailability]);

  if (!value) return null;

  return (
    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-gray-50 animate-in fade-in duration-300">
      {status === "checking" && (
        <>
          <Loader className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-xs text-gray-600">جاري التحقق...</span>
        </>
      )}
      {status === "valid" && (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">{message}</span>
        </>
      )}
      {status === "invalid" && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">{message}</span>
        </>
      )}
    </div>
  );
}
