"use client";

import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useCurrentUser } from "@/lib/useCurrentUser";
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
  const [conversations, setConversations] = useState(mockConversations);
  const [message, setMessage] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const { user } = useCurrentUser();
  const currentLawyerRoom = user?.officeName || "SKIKDA";
  const activeConv = conversations.find((conv) => conv.room === currentLawyerRoom) || conversations[0] || null;

  useEffect(() => {
    if (!user) return;
    // First try to load DB-backed conversations for the current user
    fetch(`/api/conversations`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations && data.conversations.length > 0) {
          const convs: Conversation[] = data.conversations.map((c: any) => ({
            id: c.id,
            type: c.type,
            room: c.room || c.id,
            title: c.title || "",
            subtitle: "",
            lastMessage: c.messages.length ? c.messages[c.messages.length - 1].content : "",
            lastTime: c.messages.length ? new Date(c.messages[c.messages.length - 1].time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) : "",
            unread: 0,
            online: c.members.some((m: any) => m.online),
            members: c.members,
            messages: (c.messages || []).map((m: any) => ({ id: m.id, sender: m.sender, senderRole: m.senderRole || "", content: m.content, time: new Date(m.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }), isMe: m.isMe })),
          }));
          setConversations(convs);
          return;
        }

        // Fallback: build a local office conversation from subscribers
        fetch(`/api/admin/subscribers?role=AVOCAT`)
          .then((res2) => res2.json())
          .then((data2) => {
            const office = user.officeName || "";
            const users = (data2.users || []).filter((u: any) => u.officeName === office);
            const members: Member[] = users.map((u: any) => ({ id: u.id, name: u.name, role: u.role, online: !!u.isActive }));
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
          })
          .catch(() => {});
      })
      .catch(() => {
        // ignore fetch errors
      });
  }, [user]);

  // initialize socket connection
  useEffect(() => {
    if (!user) return;
    try {
      const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
      const socket = io(url, { query: { userId: user.id } });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("socket connected", socket.id);
      });

      socket.on("message", (m: any) => {
        try {
          const isMe = m.senderId === user.id;
          const incoming: Message = { id: m.id, sender: isMe ? "أنت" : m.sender || m.senderName || "", senderRole: "", content: m.content, time: new Date(m.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }), isMe };

          // update conversations list if needed
          setConversations((prev) => prev.map((c) => (c.id === m.conversationId ? { ...c, messages: [...c.messages, incoming], lastMessage: m.content, lastTime: incoming.time } : c)));

          // if currently viewing the conversation, append to msgs
          const activeId = activeConv?.id;
          if (activeId && m.conversationId === activeId && !selectedMember) {
            setMsgs((prev) => [...prev, incoming]);
          }

          // if private conversation with selected member
          if (selectedMember) {
            const conv = conversations.find((c) => c.members.some((mm) => mm.id === selectedMember.id) && c.members.some((mm) => mm.id === user.id));
            if (conv && conv.id === m.conversationId) {
              setPrivateMessages((prev) => ({ ...prev, [selectedMember.id]: [...(prev[selectedMember.id] || []), incoming] }));
              setMsgs((prev) => [...prev, incoming]);
            }
          }
        } catch (err) {
          console.error("socket message handler error", err);
        }
      });

      socket.on("presence", (p: any) => {
        setConversations((prev) => prev.map((c) => ({ ...c, members: c.members.map((m) => (m.id === p.userId ? { ...m, online: !!p.online } : m)) })));
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch (err) {
      console.error("init socket error", err);
    }
  }, [user]);

  // join active conversation room on change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const room = activeConv?.id;
    if (room) {
      socket.emit("join", room);
    }
    return () => {
      if (room) socket.emit("leave", room);
    };
  }, [activeConv?.id]);

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
        const initial = [
          { id: "1", sender: selectedMember.name, senderRole: "avocat", content: "السلام عليكم، كيفك أنت؟", time: "14:30", isMe: false },
          { id: "2", sender: "أنا", senderRole: "me", content: "وعليكم السلام، بخير الحمد لله", time: "14:32", isMe: true },
        ];
        setPrivateMessages((prev) => ({ ...prev, [selectedMember.id]: initial }));
        setMsgs(initial);
      } else {
        setMsgs(privateMessages[selectedMember.id]);
      }
    } else if (activeConv) {
      setMsgs(activeConv.messages);
    } else {
      setMsgs([]);
    }
  }, [selectedMember, activeConv, privateMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    const content = message.trim();
    setMessage("");

    try {
      if (selectedMember) {
        // find existing private conversation between the two users
        let conv = conversations.find((c) => c.members.some((m) => m.id === selectedMember.id) && c.members.some((m) => m.id === user.id));
        if (!conv) {
          const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantIds: [user.id, selectedMember.id], type: "private" }) });
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

        const res2 = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: conv.id, content }) });
        const data2 = await res2.json();
        if (!res2.ok || !data2?.message) {
          console.error("Send message failed", { status: res2.status, body: data2 });
          throw new Error(data2?.error || "Impossible de sauvegarder le message");
        }
        const savedMessage = data2.message;
        socketRef.current?.emit("message", { conversationId: conv.id, message: { ...savedMessage, senderName: user.name } });
        const newMsg: Message = { id: savedMessage.id, sender: "أنت", senderRole: "me", content, time: new Date(savedMessage.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }), isMe: true };
        setPrivateMessages((prev) => ({ ...prev, [selectedMember.id]: [...(prev[selectedMember.id] || []), newMsg] }));
        setMsgs((prev) => [...prev, newMsg]);
      } else if (activeConv) {
        let conv = activeConv;
        // if conv was a fallback without DB id, create it first
        if (!conv.id || conv.id.startsWith("room-")) {
          const participantIds = conv.members.map((m) => m.id);
          const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participantIds, type: "profession", title: conv.title }) });
          const data = await res.json();
          conv = { ...conv, id: data.id, room: data.id };
          setConversations((prev) => prev.map((c) => (c.room === activeConv.room ? conv : c)));
        }

        const res2 = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: conv.id, content }) });
        const data2 = await res2.json();
        if (!res2.ok || !data2?.message) {
          console.error("Send message failed", { status: res2.status, body: data2 });
          throw new Error(data2?.error || "Impossible de sauvegarder le message");
        }
        const savedMessage = data2.message;
        socketRef.current?.emit("message", { conversationId: conv.id, message: { ...savedMessage, senderName: user.name } });
        const newMsg: Message = { id: savedMessage.id, sender: "أنت", senderRole: "me", content, time: new Date(savedMessage.time).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }), isMe: true };
        setMsgs((prev) => [...prev, newMsg]);
        // update conversation lastMessage
        setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, lastMessage: content, lastTime: newMsg.time } : c)));
      }
    } catch (err) {
      console.error("sendMessage error", err);
    }
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
