"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Send, Paperclip, Users, MessageSquare, Shield, ArrowRight, Circle } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  senderId?: string;
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
  type: string;
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

export default function MessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [message, setMessage] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useCurrentUser();
  const currentLawyerRoom = user?.officeName || "SKIKDA";
  const activeConv = conversations.find((conv) => conv.room === currentLawyerRoom) || conversations[0] || null;

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/conversations`);
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
      } else {
        // Fallback: charger les membres du même bureau
        const res2 = await fetch(`/api/admin/subscribers?role=AVOCAT`);
        const data2 = await res2.json();
        const office = user.officeName || "";
        const usersList = (data2.users || []).filter((u: any) => u.officeName === office);
        const members: Member[] = usersList.map((u: any) => ({ id: u.id, name: u.name, role: u.role, online: !!u.isActive }));
        if (!members.find((m) => m.id === user.id)) {
          members.unshift({ id: user.id, name: user.name, role: user.role, online: true });
        }
        const conv: Conversation = {
          id: office || `room-${user.id}`,
          type: "profession",
          room: office || user.id,
          title: office || "صالون المحامين",
          subtitle: "",
          lastMessage: "",
          lastTime: "",
          unread: 0,
          online: members.some((m) => m.online),
          members,
          messages: [],
        };
        setConversations([conv]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const renderConnectedMembers = (members: Member[]) => (
    <div className="space-y-3 mt-3">
      {members.filter(m => m.id !== user?.id).map((member) => (
        <div key={member.id} onClick={() => { setSelectedMember(member); setMessage(""); }} className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl border-2 border-border/70 bg-white px-4 py-4 shadow-sm hover:border-primary/50 transition-all" style={{ borderColor: selectedMember?.id === member.id ? "var(--color-primary)" : undefined }}>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${member.online ? "bg-green-500" : "bg-gray-300"}`} />
            <p className="text-sm font-semibold text-primary">{member.name}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Charger les messages d'une conversation privée
  useEffect(() => {
    if (selectedMember) {
      fetch(`/api/messages?conversationId=${selectedMember.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            const formatted = data.messages.map((m: any) => ({
              id: m.id,
              sender: m.senderName,
              senderId: m.senderId,
              content: m.content,
              time: new Date(m.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
              isMe: m.senderId === user?.id,
            }));
            setMsgs(formatted);
          }
        });
    } else if (activeConv) {
      setMsgs(activeConv.messages);
    } else {
      setMsgs([]);
    }
  }, [selectedMember, activeConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    const content = message.trim();
    setMessage("");

    try {
      let conversationId = activeConv?.id;

      if (selectedMember) {
        // Trouver ou créer une conversation privée
        let conv = conversations.find((c) => 
          c.members.some((m) => m.id === selectedMember.id) && 
          c.members.some((m) => m.id === user.id)
        );
        
        if (!conv) {
          const res = await fetch("/api/conversations", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ participantIds: [user.id, selectedMember.id], type: "private" }) 
          });
          const data = await res.json();
          conv = {
            id: data.id,
            type: "profession",
            room: data.id,
            title: selectedMember.name,
            subtitle: "",
            lastMessage: "",
            lastTime: "",
            unread: 0,
            online: true,
            members: [{ id: user.id, name: user.name, role: user.role, online: true }, selectedMember],
            messages: [],
          };
          setConversations((prev) => [conv!, ...prev]);
        }
        conversationId = conv.id;
      }

      const res = await fetch("/api/messages", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ conversationId, content }) 
      });
      
      const data = await res.json();
      if (!res.ok || !data?.message) {
        console.error("Send message failed", { status: res.status, body: data });
        throw new Error(data?.error || "Impossible de sauvegarder le message");
      }
      
      const savedMessage = data.message;
      const newMsg: Message = {
        id: savedMessage.id,
        sender: "أنت",
        senderId: user.id,
        content,
        time: new Date(savedMessage.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      };
      
      if (selectedMember) {
        setMsgs((prev) => [...prev, newMsg]);
      } else {
        setMsgs((prev) => [...prev, newMsg]);
        setConversations((prev) => prev.map((c) => 
          c.id === conversationId ? { ...c, lastMessage: content, lastTime: newMsg.time } : c
        ));
      }
    } catch (err) {
      console.error("sendMessage error", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-primary">المراسلات</h1><p className="text-text-light text-sm">تواصل مع الدعم وزملائك</p></div>
      <div className="card p-0 overflow-hidden flex h-[calc(100vh-14rem)]">
        <aside className="w-72 border-l border-border bg-surface p-4 hidden md:flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">أعضاء الغرفة</p>
            <p className="text-xs text-text-light mt-1">{activeConv ? activeConv.members.filter((m) => m.online && m.id !== user?.id).length : 0} متصلون</p>
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
              <h2 className="text-lg font-semibold text-primary">{selectedMember ? selectedMember.name : "صالون المحامين"}</h2>
              <p className="text-xs text-text-light mt-1">{selectedMember ? "محادثة خاصة" : "غرفة المحامين"}</p>
            </div>
            {selectedMember && (
              <button onClick={() => setSelectedMember(null)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light">
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {msgs.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${msg.isMe ? "text-left" : "text-right"}`}>
                  {!msg.isMe && (
                    <p className={`text-xs font-semibold mb-1 text-primary`}>
                      {msg.sender}
                    </p>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 ${msg.isMe ? "bg-primary text-white rounded-br-sm" : "bg-surface border border-border rounded-bl-sm"}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isMe ? "text-white/70" : "text-text-light"}`}>{msg.time}</p>
                  </div>
                </div>
              </div>
            ))}
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