"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
}

const botResponses: Record<string, string> = {
  "الخدمات": "نقدم الخدمات التالية:\n\n• إدارة الملفات والقضايا\n• إدارة العملاء\n• جدولة المواعيد والجلسات\n• المراسلات المهنية بين الزملاء\n• المساعد الذكي للأسئلة القانونية\n• إدارة الفواتير والمدفوعات",
  "الاشتراك": "يمكنك الاشتراك بسهولة:\n\n1. اضغط على 'اشتراك مجاني' في الأعلى\n2. اختر مهنتك (محامي/موثق/محضر)\n3. أدخل بياناتك\n4. استمتع بتجربة مجانية 14 يوم!",
  "الأسعار": "لدينا 3 خطط اشتراك:\n\n• الأساسية: 4,900 د.ج/شهر\n• الاحترافية: 9,900 د.ج/شهر (الأكثر طلباً)\n• المؤسسة: 19,900 د.ج/شهر\n\nجميع الخطط تتضمن تجربة مجانية 14 يوم.",
  "التواصل": "يمكنك التواصل معنا عبر:\n\n📞 الهاتف: 0676 212 922\n📧 البريد: contact@el-minassa.com\n📍 العنوان: Rue Berdoudi Bachir, El Arrouch, Skikda\n\nأو يمكنك إرسال رسالة مباشرة وسنرد عليك خلال 24 ساعة.",
  "المهن": "المنصة مصممة لثلاث مهن قانونية:\n\n⚖️ المحامي: إدارة القضايا والمرافعات\n📝 الموثق: تحرير العقود والوثائق الرسمية\n📋 المحضر القضائي: التبليغات والتنفيذات",
  "default": "شكراً لسؤالك! يمكنني مساعدتك في:\n\n• معرفة خدماتنا\n• معلومات عن الأسعار والاشتراك\n• طرق التواصل\n• شرح المهن القانونية\n\nاكتب أحد هذه المواضيع وسأساعدك.",
};

export default function ChatbotWidget() {
  const pathname = usePathname?.() || "/";
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "bot", content: "مرحباً بك في المنصة القانونية الجزائرية! 👋\nكيف يمكنني مساعدتك؟" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = (text: string): string => {
    if (text.includes("خدم") || text.includes("مميز")) return botResponses["الخدمات"];
    if (text.includes("اشتراك") || text.includes("سجل") || text.includes("حساب")) return botResponses["الاشتراك"];
    if (text.includes("سعر") || text.includes("ثمن") || text.includes("تكلف") || text.includes("خطة")) return botResponses["الأسعار"];
    if (text.includes("تواصل") || text.includes("هاتف") || text.includes("بريد") || text.includes("اتصل")) return botResponses["التواصل"];
    if (text.includes("محامي") || text.includes("موثق") || text.includes("محضر") || text.includes("مهنة") || text.includes("مهن")) return botResponses["المهن"];
    return botResponses["default"];
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(input);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "bot", content: response };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${isHome ? "right-6" : "left-6"} z-50 bg-secondary text-primary-dark p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 ${isHome ? "right-6" : "left-6"} z-50 w-96 max-w-[calc(100vw-3rem)] bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col`} style={{ maxHeight: "550px" }}>
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-dark" />
          </div>
          <div>
            <p className="font-semibold">المساعد الآلي</p>
            <p className="text-xs text-gray-300">متصل الآن</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: "280px" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "bot" ? "bg-secondary" : "bg-primary"} text-white`}>
                {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl px-3 py-2 text-sm ${msg.role === "bot" ? "bg-surface border border-border" : "bg-primary text-white rounded-bl-sm"}`}>
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-surface border border-border rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
        {["الخدمات", "الأسعار", "الاشتراك", "التواصل"].map((label) => (
          <button key={label} onClick={() => { setInput(label); setTimeout(() => { const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: label }; setMessages((p) => [...p, userMsg]); setIsTyping(true); setTimeout(() => { setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", content: getResponse(label) }]); setIsTyping(false); }, 1000); setInput(""); }, 0); }} className="whitespace-nowrap text-xs px-3 py-1.5 bg-primary/5 text-primary rounded-full hover:bg-primary/10 transition-colors">
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            className="input-field text-sm py-2"
            placeholder="اكتب رسالتك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="btn-primary p-2">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
