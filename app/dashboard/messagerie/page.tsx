"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useSearchParams } from "next/navigation";
import { Send, Paperclip, Check, CheckCheck, ArrowRight, User, Search, Loader2 } from "lucide-react";
import { showToast } from "@/components/notifications/ToastContainer";

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  content: string;
  time: string;
  isMe: boolean;
  read: boolean;
}

interface Member {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

interface Conversation {
  id: string;
  type: string;
  title: string;
  lastMessage: string;
  lastTime: string | Date;
  unread: number;
  members: Member[];
}

export default function MessageriePage() {
  const { user } = useCurrentUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<"conversations" | "contacts">("conversations");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const previousMessagesRef = useRef<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playNotificationSound = async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const context = new AudioContext();
      if (context.state === "suspended") {
        await context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.12;
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
      oscillator.onended = () => {
        context.close().catch(() => undefined);
      };
    } catch (error) {
      console.error("Notification sound failed", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations`);
      if (res.ok) {
        const data = await res.json();
        const conversations = data.conversations || [];
        setConversations(conversations);
        return conversations;
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
    return [] as Conversation[];
  }, []);

  // Load contacts (mocking office colleagues)
  const fetchContacts = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/admin/subscribers?role=${encodeURIComponent(user.role)}`);
      if (res.ok) {
        const data = await res.json();
        const office = user.officeName?.trim().toLowerCase();
        const wilayaId = user.wilayaId;
        const wilayaName = user.wilayaName?.trim().toLowerCase();
        const customWilaya = user.customWilaya?.trim().toLowerCase();
        const usersList = (data.users || []).filter((u: any) => {
          if (u.id === user.id || u.role !== user.role) return false;

          const otherOffice = (u.officeName || "").trim().toLowerCase();
          const otherWilayaName = u.wilaya?.name?.trim().toLowerCase();
          const otherCustomWilaya = (u.customWilaya || "").trim().toLowerCase();

          const sameWilayaId = wilayaId ? u.wilayaId === wilayaId : false;
          const sameWilayaName = wilayaName ? (otherWilayaName === wilayaName || otherCustomWilaya === wilayaName) : false;
          const sameCustomWilaya = customWilaya ? (otherCustomWilaya === customWilaya || otherWilayaName === customWilaya) : false;
          const sameOffice = office && otherOffice ? office === otherOffice : false;

          return sameWilayaId || sameWilayaName || sameCustomWilaya || sameOffice;
        });
        setContacts(usersList.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          online: !!u.isActive,
        })));
      }
    } catch (err) {
      console.error("Failed to load contacts", err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      Promise.all([fetchConversations(), fetchContacts()]).finally(() => setLoading(false));
    }
  }, [user, fetchConversations, fetchContacts]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        const newMessages: Message[] = data.messages || [];
        const previousMessages = previousMessagesRef.current;
        const previousLastMessageId = previousMessages.length ? previousMessages[previousMessages.length - 1].id : null;
        const newLastMessage = newMessages.length ? newMessages[newMessages.length - 1] : null;

        if (previousLastMessageId && newLastMessage && newLastMessage.id !== previousLastMessageId && newLastMessage.senderId !== user?.id) {
          setHighlightedMemberId(newLastMessage.senderId);
          void playNotificationSound();
          showToast("رسالة جديدة", `وصلتك رسالة من ${newLastMessage.senderName || "عضو"}.`, "info");
        }

        previousMessagesRef.current = newMessages;
        setMessages(newMessages);
        
        // If we fetched successfully, also update the unread count in conversations locally
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: 0 } : c));
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, [user]);

  // Polling for real-time updates
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConv) {
        fetchMessages(selectedConv.id);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, selectedConv, fetchConversations, fetchMessages]);

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    previousMessagesRef.current = [];
    fetchMessages(conv.id);
  };

  useEffect(() => {
    if (!selectedConv && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations, selectedConv, fetchMessages]);

  useEffect(() => {
    if (!highlightedMemberId) return;
    const timeout = window.setTimeout(() => setHighlightedMemberId(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [highlightedMemberId]);

  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return conv.title.toLowerCase().includes(query) || conv.lastMessage.toLowerCase().includes(query);
  });

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return contact.name.toLowerCase().includes(query) || contact.role.toLowerCase().includes(query);
  });

  const searchParams = useSearchParams();
  const otherParticipant = selectedConv?.members.find((member) => member.id !== user?.id);

  useEffect(() => {
    const convId = searchParams.get("conversationId");
    if (!convId || !conversations.length) return;
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      selectConversation(conv);
      setActiveTab("conversations");
    }
  }, [searchParams, conversations]);

  const startPrivateChat = async (contact: Member) => {
    setLoading(true);
    try {
      const existing = conversations.find(
        (c) => c.type === "private" && c.members.some((m) => m.id === contact.id)
      );
      if (existing) {
        selectConversation(existing);
        setActiveTab("conversations");
        showToast("نجاح", `تم فتح المحادثة مع ${contact.name}.`, "success");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: [contact.id], type: "private" }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Failed to create conversation");
      }

      const updatedConversations = await fetchConversations();
      // ✅ CORRECTION ICI : Ajout du type pour le paramètre 'c'
      const newConv = updatedConversations.find((c: { id: string }) => c.id === data.id) || {
        id: data.id,
        type: "private",
        title: contact.name,
        lastMessage: "",
        lastTime: new Date().toISOString(),
        unread: 0,
        members: [contact],
      };
      selectConversation(newConv);
      setActiveTab("conversations");
      showToast("نجاح", `تم إنشاء المحادثة مع ${contact.name}.`, "success");
    } catch (err) {
      console.error("Failed to start private chat", err);
      showToast("خطأ", "فشل في بدء المحادثة. حاول مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConv || !user || sending) return;
    
    const content = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user!.id,
      content,
      time: new Date().toISOString(),
      isMe: true,
      read: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConv.id, content }),
      });

      if (!res.ok) throw new Error("Failed to send");
      
      const data = await res.json();
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m));
      fetchConversations();
    } catch (err) {
      showToast("خطأ", "فشل في إرسال الرسالة", "error");
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && !conversations.length && !contacts.length) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">المراسلات</h1>
        <p className="text-text-light text-sm">تواصل مع زملاء العمل والعملاء بشكل فوري</p>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-l border-border flex flex-col bg-surface ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {/* Tabs */}
          <div className="flex border-b border-border p-2 gap-2">
            <button 
              onClick={() => setActiveTab("conversations")}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === "conversations" ? "bg-primary text-white" : "text-text-light hover:bg-gray-100"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>المحادثات</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === "conversations" ? "bg-white text-primary" : "bg-gray-200 text-gray-600"}`}>{filteredConversations.length}</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === "contacts" ? "bg-primary text-white" : "text-text-light hover:bg-gray-100"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>جهات الاتصال</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === "contacts" ? "bg-white text-primary" : "bg-gray-200 text-gray-600"}`}>{filteredContacts.length}</span>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === "conversations" ? "بحث في المحادثات..." : "بحث في جهات الاتصال..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-sm focus:outline-none focus:border-primary"
                aria-label="بحث"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "conversations" ? (
              filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">لا توجد محادثات مطابقة</div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 transition-colors ${selectedConv?.id === conv.id ? "bg-primary/10" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {getInitials(conv.title)}
                      </div>
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5 gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className={`font-semibold truncate text-sm ${conv.unread > 0 ? "text-gray-900" : "text-gray-700"}`}>{conv.title}</h3>
                            {conv.type === "profession" && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                صالون المحامين
                              </span>
                            )}
                            {conv.type === "private" && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                خاص
                              </span>
                            )}
                          </div>
                          {conv.type === "profession" && (
                            <span className="text-[10px] text-blue-600 font-semibold">صالون المحامين</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(conv.lastTime)}</span>
                      </div>
                      <p className={`text-xs truncate ${conv.unread > 0 ? "font-semibold text-primary" : "text-gray-500"}`}>
                        {conv.lastMessage || "بدء محادثة جديدة..."}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">لا توجد جهات اتصال مطابقة</div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => startPrivateChat(contact)}
                  className="w-full text-left flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {getInitials(contact.name)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.online ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{contact.name}</h3>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{contact.role}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{contact.online ? "متصل الآن" : "غير متصل"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv ? (
          <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="border-b border-border bg-white/50 backdrop-blur-sm z-10">
              <div className="h-16 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-sm">
                    {getInitials(selectedConv.title)}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">{selectedConv.title}</h2>
                    <p className="text-xs text-gray-500">
                      {selectedConv.type === "profession"
                        ? "صالون مهنة مشتركة لزملائك"
                        : otherParticipant
                        ? `${otherParticipant.role} · ${otherParticipant.online ? "متصل الآن" : "غير متصل"}`
                        : "المحادثة"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors" onClick={() => showToast("معلومات", "تفاصيل الحساب", "info")}><User className="w-5 h-5" /></button>
                </div>
              </div>
              {selectedConv.type === "profession" && (
                <div className="px-4 py-3 bg-[#f7f9fc] border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-semibold text-gray-700">الأعضاء المتصلون:</span>
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5">{selectedConv.members.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedConv.members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => member.id !== user?.id && startPrivateChat(member)}
                        className={`flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm transition-colors ${member.id !== user?.id ? "hover:border-primary hover:bg-primary/5 cursor-pointer" : "cursor-default opacity-80"} ${member.id === highlightedMemberId ? "ring-2 ring-red-400 animate-pulse" : "border-gray-200"}`}
                        disabled={member.id === user?.id}
                        aria-label={member.id !== user?.id ? `بدء محادثة خاصة مع ${member.name}` : `${member.name} (أنت)`}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold">{getInitials(member.name)}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[8rem]">{member.name}</span>
                            <span className={`h-2.5 w-2.5 rounded-full ${member.online ? "bg-green-500" : "bg-gray-300"}`} />
                          </div>
                          <div className="text-[10px] text-gray-400">{member.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] custom-scrollbar">
              <div className="text-center text-xs text-gray-400 my-4 bg-gray-100 inline-block px-3 py-1 rounded-full mx-auto table">بداية المحادثة</div>
              
              {messages.map((msg, idx) => {
                const showAvatar = !msg.isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);
                const wrapperClass = msg.isMe ? "justify-start" : "justify-end";
                const bubbleAlignment = msg.isMe ? "items-end text-right" : "items-start text-left";
                return (
                  <div key={msg.id} className={`flex gap-2 ${wrapperClass}`}>
                    {!msg.isMe && (
                      <div className="w-8 flex-shrink-0 flex items-end">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold">
                            {getInitials(msg.senderName || "?")}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${bubbleAlignment}`}>
                      {msg.senderName && !msg.isMe && (
                        <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>
                      )}
                      <div className={`px-4 py-2.5 shadow-sm text-sm ${
                        msg.isMe 
                          ? "bg-primary text-white rounded-2xl rounded-br-sm" 
                          : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                        {msg.isMe && (
                          msg.read 
                            ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            : <Check className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-white">
              <div className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <button onClick={() => showToast("معلومة", "إرسال المرفقات قريباً", "info")} className="p-2.5 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  rows={1}
                  className="w-full bg-transparent border-none focus:outline-none resize-none py-2.5 px-2 text-sm max-h-32 custom-scrollbar"
                  placeholder="اكتب رسالة..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!inputText.trim() || sending}
                  className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${!inputText.trim() ? "bg-gray-200 text-gray-400" : "bg-primary text-white shadow-md hover:scale-105"}`}
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 flex-col gap-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <Send className="w-10 h-10 text-gray-300 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">تطبيق المراسلة</h3>
            <p className="text-gray-500 text-sm max-w-sm text-center">اختر محادثة من القائمة أو ابدأ محادثة جديدة مع زملائك من قائمة جهات الاتصال.</p>
          </div>
        )}
      </div>
    </div>
  );
}