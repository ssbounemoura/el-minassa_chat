import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get("authUserId")?.value;
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "conversationId مطلوب" }, { status: 400 });

    // Verify the user is a participant
    const participant = await prisma.conversationParticipant.findFirst({ where: { conversationId, userId } });
    if (!participant) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const messages = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } });

    return NextResponse.json({ messages: messages.map((m) => ({ id: m.id, senderId: m.senderId, sender: m.sender.name, content: m.content, time: m.createdAt })) });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الرسائل" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get("authUserId")?.value;
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const { conversationId, content } = await req.json();
    if (!conversationId || !content) return NextResponse.json({ error: "conversationId و content مطلوبان" }, { status: 400 });

    // Verify the user is a participant
    const participant = await prisma.conversationParticipant.findFirst({ where: { conversationId, userId } });
    if (!participant) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const created = await prisma.message.create({ data: { conversationId, senderId: userId, content } });

    return NextResponse.json({ message: { id: created.id, senderId: created.senderId, content: created.content, time: created.createdAt } });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "خطأ في ارسال الرسالة" }, { status: 500 });
  }
}
