import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get("authUserId")?.value;
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, role: true } } } },
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = conversations.map((c) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      room: c.id,
      members: c.participants.map((p) => ({ id: p.user.id, name: p.user.name, role: p.user.role, online: true })),
      messages: c.messages.map((m) => ({ id: m.id, senderId: m.senderId, content: m.content, time: m.createdAt, isMe: m.senderId === userId })),
    }));

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "خطأ في تحميل المحادثات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get("authUserId")?.value;
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const { participantIds, type, title } = await req.json();
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "المشاركون مطلوبون" }, { status: 400 });
    }

    // Ensure the current user is part of the conversation
    const uniqueParticipants = Array.from(new Set([...participantIds, userId]));

    const conv = await prisma.conversation.create({ data: { type: type || "private", title: title || null } });

    const parts = uniqueParticipants.map((id: string) => ({ conversationId: conv.id, userId: id }));
    await prisma.conversationParticipant.createMany({ data: parts });

    return NextResponse.json({ id: conv.id });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "خطأ في انشاء المحادثة" }, { status: 500 });
  }
}
