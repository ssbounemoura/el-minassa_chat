"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Users, MessageSquare, Shield, ArrowRight, Circle } from "lucide-react";

type ConversationType = "support" | "profession";

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  time: string;
  isMe: boolean;
}

interface Member {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

interface Conversation {
  id: string;
  type: ConversationType;
  room: string;
  title: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  members: Member[];
  messages: Message[];
}

const mockConversations: Conversation[] = [];

export default function MessageriePage() {
  const [conversations] = useState(mockConversations);
  const [message, setMessage] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLawyerRoom = "SKIKDA";
  const activeConv = conversations.find((conv) => conv.room === currentLawyerRoom);

  const renderConnectedMembers = (members: Member[]) => (
    <div className="space-y-3 mt-3">
      {members.map((member) => (
        <div key={member.id} onClick={() => { setSelectedMember(member); setMessage(""); }} className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl border-2 border-border/70 bg-white px-4 py-4 shadow-sm hover:border-primary/50 transition-all" style={{ borderColor: selectedMember?.id === member.id ? "var(--color-primary)" : undefined }}>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${member.online ? "bg-green-500" : "bg-gray-300"}`} />
            <p className="text-sm font-semibold text-primary">{member.name}</p>
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (selectedMember) {
      if (!privateMessages[selectedMember.id]) {
        setPrivateMessages((prev) => ({
          ...prev,
          [selectedMember.id]: [
            { id: "1", sender: selectedMember.name, senderRole: "avocat", content: "السلام عليكم، كيفك أنت؟", time: "14:30", isMe: false },
            { id: "2", sender: "أنا", senderRole: "me", content: "وعليكم السلام، بخير الحمد لله", time: "14:32", isMe: true },
          ],
        }));
      }
      setMsgs(privateMessages[selectedMember.id] || []);
    } else if (activeConv) {
      setMsgs(activeConv.messages);
    }
  }, [selectedMember, activeConv, privateMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), sender: "أنا", senderRole: "me", content: message, time: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }), isMe: true };
    if (selectedMember) {
      setPrivateMessages((prev) => ({
        ...prev,
        [selectedMember.id]: [...(prev[selectedMember.id] || []), newMsg],
      }));
      setMsgs((prev) => [...prev, newMsg]);
    } else {
      setMsgs((prev) => [...prev, newMsg]);
    }
    setMessage("");
  };


  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-primary">المراسلات</h1><p className="text-text-light text-sm">تواصل مع الدعم وزملائك</p></div>
      <div className="card p-0 overflow-hidden flex h-[calc(100vh-14rem)]">
        <aside className="w-72 border-l border-border bg-surface p-4 hidden md:flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">أعضاء الغرفة</p>
            <p className="text-xs text-text-light mt-1">{activeConv ? activeConv.members.filter((m) => m.online).length : 0} متصلون</p>
          </div>
          <div className="bg-surface border border-border rounded-3xl p-3">
            {activeConv ? renderConnectedMembers(activeConv.members) : (
              <div className="text-xs text-text-light">لا توجد غرفة نشطة</div>
            )}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">{selectedMember ? selectedMember.name : "صالون محامي سكيكدة"}</h2>
              <p className="text-xs text-text-light mt-1">{selectedMember ? "محادثة خاصة" : "غرفة المحامين الخاصة بسكيكدة"}</p>
            </div>
            {selectedMember && (
              <button onClick={() => setSelectedMember(null)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light">
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {activeConv ? (
              msgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] ${msg.isMe ? "text-left" : "text-right"}`}>
                    <p className={`text-xs font-semibold mb-1 ${msg.isMe ? "text-gray-600" : "text-primary"}`}>
                      {msg.isMe ? "أنت" : msg.sender}
                    </p>
                    <div className={`rounded-2xl px-4 py-2.5 ${msg.isMe ? "bg-primary text-white rounded-br-sm" : "bg-surface border border-border rounded-bl-sm"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? "text-white/70" : "text-text-light"}`}>{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-text-light">جارٍ التحميل...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-lg hover:bg-gray-100 text-text-light"><Paperclip className="w-5 h-5" /></button>
              <input className="input-field flex-1" placeholder="اكتب رسالتك..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <button onClick={sendMessage} className="btn-primary p-2.5"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
