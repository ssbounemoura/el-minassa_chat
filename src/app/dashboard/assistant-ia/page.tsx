"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Brain, FileText, BookOpen, Sparkles, Copy, Lightbulb } from "lucide-react";

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const quickPrompts = [
  { icon: BookOpen, text: "ما هي إجراءات الطلاق في القانون الجزائري؟" },
  { icon: FileText, text: "لخص لي هذا المحضر القضائي" },
  { icon: Lightbulb, text: "ما هي المواد القانونية المتعلقة بالعقارات؟" },
  { icon: Brain, text: "اكتب لي نموذج إنذار قضائي" },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<AiMessage[]>([
    { id: "0", role: "assistant", content: "مرحباً! أنا المساعد الذكي للمنصة القانونية. يمكنني مساعدتك في:\n\n- الإجابة على الأسئلة القانونية\n- تلخيص الوثائق والتقارير\n- صياغة المستندات القانونية\n- شرح المواد القانونية\n\nكيف يمكنني مساعدتك اليوم؟", timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isTyping) return;
    setError("");

    const userMsg: AiMessage = { id: Date.now().toString(), role: "user", content, timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = newMessages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ في الاتصال");
        setIsTyping(false);
        return;
      }

      const aiMsg: AiMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.content, timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("تعذر الاتصال بالمساعد الذكي. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Brain className="w-7 h-7 text-secondary" /> المساعد الذكي القانوني
        </h1>
        <p className="text-text-light text-sm">مدعوم بالذكاء الاصطناعي - متخصص في القانون الجزائري</p>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickPrompts.map((prompt, i) => (
          <button key={i} onClick={() => sendMessage(prompt.text)} disabled={isTyping} className="card p-3 text-right hover:border-primary/30 hover:shadow-sm transition-all group disabled:opacity-50">
            <prompt.icon className="w-5 h-5 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm text-text-light">{prompt.text}</p>
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span className="text-red-500 font-bold">!</span> {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="card p-0 flex flex-col h-[calc(100vh-28rem)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] ${msg.role === "assistant" ? "bg-gray-50 border border-border" : "bg-primary text-white"} rounded-2xl px-5 py-3`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-semibold text-primary">المساعد الذكي</span>
                  </div>
                )}
                <div className={`text-sm whitespace-pre-line leading-relaxed ${msg.role === "user" ? "" : "text-text"}`}>
                  {msg.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-bold text-primary mt-3 mb-2">{line.replace("## ", "")}</h3>;
                    if (line.startsWith("### ")) return <h4 key={i} className="text-base font-semibold text-primary mt-2 mb-1">{line.replace("### ", "")}</h4>;
                    if (line.startsWith("- ")) return <p key={i} className="flex items-start gap-2 mr-2"><span className="text-secondary mt-1">•</span>{line.replace("- ", "")}</p>;
                    if (line.match(/^\d+\./)) return <p key={i} className="mr-4">{line}</p>;
                    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
                <div className={`flex items-center justify-between mt-2 ${msg.role === "user" ? "text-white/70" : "text-text-light"}`}>
                  <span className="text-xs">{msg.timestamp}</span>
                  {msg.role === "assistant" && (
                    <button onClick={() => copyToClipboard(msg.content)} className="p-1 rounded hover:bg-gray-200 transition-colors" title="نسخ"><Copy className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-gray-50 border border-border rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                  <span className="text-sm text-text-light">جاري الكتابة...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              className="input-field flex-1"
              placeholder="اكتب سؤالك القانوني هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isTyping}
            />
            <button onClick={() => sendMessage()} className="btn-primary p-2.5" disabled={!input.trim() || isTyping}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
