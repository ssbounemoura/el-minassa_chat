"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Send, Brain, Sparkles, Copy, ArrowRight, Scale, RotateCcw,
  MessageSquare, Trash2, ChevronLeft, ChevronRight, PenTool, Gavel, Shield, History, FolderOpen,
} from "lucide-react";

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationMeta {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const WELCOME_MSG: AiMessage = {
  id: "0",
  role: "assistant",
  content: "مرحباً! أنا المساعد الذكي للمنصة القانونية الجزائرية. يمكنني مساعدتك في:\n\n- طرح أسئلة مفتوحة حول القانون الجزائري\n- صياغة المذكرات والعقود والإنذارات القضائية\n- فهم المصطلحات القانونية وشرحها\n- الاستعداد للجلسات والمرافعات\n\nالمحادثة سرية وتبقى ضمن بيئة مكتبك فقط.\n\nكيف يمكنني مساعدتك اليوم؟",
  timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
};

const modePrompts = [
  { icon: MessageSquare, label: "سؤال قانوني", text: "ما هي إجراءات الطلاق في القانون الجزائري؟", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { icon: PenTool, label: "صياغة مذكرة", text: "اكتب لي مذكرة دفاع في قضية عقارية تتعلق بنزع ملكية بدون تعويض", color: "bg-green-50 text-green-700 border-green-200" },
  { icon: Gavel, label: "التحضير لجلسة", text: "ساعدني في التحضير لجلسة مرافعة في قضية نزاع تجاري حول عقد بيع", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { icon: Shield, label: "فهم مصطلحات", text: "اشرح لي الفرق بين المسؤولية التقصيرية والمسؤولية العقدية في القانون الجزائري", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

const dossierContext = [
  { title: "قضية عقارية - حي السلام", type: "عقاري", court: "محكمة الجزائر", number: "2026/001" },
  { title: "نزاع تجاري - شركة النور", type: "تجاري", court: "محكمة البليدة", number: "2026/002" },
  { title: "قضية أحوال شخصية", type: "أحوال شخصية", court: "محكمة وهران", number: "2026/003" },
];

function newTimestamp() {
  return new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([{ ...WELCOME_MSG }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Conversation state
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDossiers, setShowDossiers] = useState(false);
  const messagesRef = useRef<AiMessage[]>([{ ...WELCOME_MSG }]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await loadConversations();
    };
    void loadData();
  }, [loadConversations]);

  // Save conversation to DB
  const saveConversation = useCallback(async (msgs: AiMessage[], convId: string | null) => {
    const userMessages = msgs.filter((m) => m.id !== "0");
    if (userMessages.length === 0) return;

    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: convId,
          messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id && !convId) setCurrentConvId(data.id);
        loadConversations();
      }
    } catch { /* ignore */ }
  }, [loadConversations]);

  // Load a conversation
  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/conversations?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        const loadedMessages: AiMessage[] = [
          { ...WELCOME_MSG },
          ...data.messages.map((m: { role: string; content: string }, i: number) => ({
            id: `loaded-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: newTimestamp(),
          })),
        ];
        setMessages(loadedMessages);
        setCurrentConvId(id);
        setError("");
      }
    } catch {
      setError("خطأ في تحميل المحادثة.");
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/conversations?id=${id}`, { method: "DELETE" });
      loadConversations();
      if (currentConvId === id) resetChat();
    } catch { /* ignore */ }
  };

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isTyping) return;
    setError("");

    messageIdRef.current += 1;
    const userMsg: AiMessage = {
      id: `user-${messageIdRef.current}`,
      role: "user",
      content,
      timestamp: newTimestamp(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = newMessages.filter((m) => m.id !== "0").map((m) => ({ role: m.role, content: m.content }));
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

      messageIdRef.current += 1;
      const aiMsg: AiMessage = {
        id: `assistant-${messageIdRef.current}`,
        role: "assistant",
        content: data.content,
        timestamp: newTimestamp(),
      };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      // Auto-save after AI responds
      saveConversation(updatedMessages, currentConvId);
    } catch {
      setError("تعذر الاتصال بالمساعد الذكي. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetChat = () => {
    setMessages([{ ...WELCOME_MSG, id: "0", timestamp: newTimestamp() }]);
    setCurrentConvId(null);
    setError("");
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-bold text-primary mt-3 mb-2">{line.replace("## ", "")}</h3>;
      if (line.startsWith("### ")) return <h4 key={i} className="text-base font-semibold text-primary mt-2 mb-1">{line.replace("### ", "")}</h4>;
      if (line.startsWith("- ")) return <p key={i} className="flex items-start gap-2 mr-2"><span className="text-secondary mt-1">•</span>{line.replace("- ", "")}</p>;
      if (line.match(/^\d+\./)) return <p key={i} className="mr-4">{line}</p>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Conversation History */}
      <aside className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-primary text-white flex-shrink-0 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-secondary" /> سجل المحادثات
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-white/10 lg:hidden">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={resetChat}
          className="mx-3 mt-3 flex items-center justify-center gap-2 bg-secondary text-primary-dark py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary-light transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> محادثة جديدة
        </button>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
          {conversations.length === 0 && (
            <p className="text-white/40 text-xs text-center mt-8">لا توجد محادثات سابقة</p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                currentConvId === conv.id ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-secondary" />
              <span className="text-sm truncate flex-1">{conv.title || "محادثة جديدة"}</span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-300" />
              </button>
            </div>
          ))}
        </div>

        {/* Dossier context */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setShowDossiers(!showDossiers)}
            className="w-full flex items-center justify-between text-xs text-white/60 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5" /> ملفاتك النشطة ({dossierContext.length})</span>
            {showDossiers ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {showDossiers && (
            <div className="mt-2 space-y-1.5">
              {dossierContext.map((d, i) => (
                <div key={i} className="text-xs bg-white/5 rounded-lg p-2">
                  <p className="font-medium truncate">{d.title}</p>
                  <p className="text-white/50">{d.court} — {d.number}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-primary text-white px-6 py-3 shadow-lg flex-shrink-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                <ArrowRight className="w-4 h-4" />
                <span>العودة للوحة التحكم</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-lg font-bold">المحادثة الذكية</h1>
                <p className="text-xs text-white/60">محادثة سرية ضمن بيئة مكتبك</p>
              </div>
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
          {/* Mode Prompts */}
          {messages.length <= 1 && (
            <div className="px-6 pt-4 pb-2 flex-shrink-0 space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {modePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    disabled={isTyping}
                    className={`rounded-xl p-3 text-right border transition-all group disabled:opacity-50 ${prompt.color}`}
                  >
                    <prompt.icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold mb-0.5">{prompt.label}</p>
                    <p className="text-[11px] opacity-70 leading-relaxed">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 flex-shrink-0">
              <span className="text-red-500 font-bold">!</span> {error}
            </div>
          )}

          {/* Messages */}
          <div dir="ltr" className="flex-1 overflow-y-auto">
            <div dir="rtl" className="px-6 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === "assistant" ? "bg-white border border-gray-200 shadow-sm" : "bg-primary text-white"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        </div>
                        <span className="text-xs font-semibold text-primary">المساعد الذكي</span>
                      </div>
                    )}
                    <div className={`text-sm whitespace-pre-line leading-relaxed ${msg.role === "user" ? "" : "text-text"}`}>
                      {renderContent(msg.content)}
                    </div>
                    <div className={`flex items-center justify-between mt-2 pt-2 border-t ${msg.role === "user" ? "border-white/20 text-white/60" : "border-gray-100 text-text-light"}`}>
                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <button onClick={() => copyToClipboard(msg.content)} className="p-1 rounded hover:bg-gray-100 transition-colors" title="نسخ">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
                      </div>
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
          </div>

          {/* Input */}
          <div className="px-6 pb-5 pt-2 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex items-center gap-2">
              <input
                className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
                placeholder="اكتب سؤالك القانوني هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={isTyping}
              />
              <button
                onClick={() => sendMessage()}
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              <Scale className="w-3 h-3 inline ml-1" />
              إجابات المساعد الذكي استرشادية ولا تغني عن الاستشارة القانونية المتخصصة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
