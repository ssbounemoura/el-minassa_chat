import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// ============================================
// GET - Récupérer les messages d'une conversation
// ============================================
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId مطلوب" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id },
    });

    if (!participant) {
      return NextResponse.json({ error: "غير مصرح لك برؤية هذه المحادثة" }, { status: 403 });
    }

    // Marquer les messages non lus de l'autre utilisateur comme lus
    await prisma.message.updateMany({
      where: { 
        conversationId, 
        senderId: { not: user.id },
        readAt: null 
      },
      data: { readAt: new Date() }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderRole: m.sender.role,
        content: m.content,
        time: m.createdAt,
        isMe: m.senderId === user.id,
        read: !!m.readAt,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الرسائل" }, { status: 500 });
  }
}

// ============================================
// POST - Envoyer un nouveau message
// ============================================
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
    }

    const { conversationId, content } = await req.json();
    if (!conversationId || !content) {
      return NextResponse.json({ error: "conversationId و content مطلوبان" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id },
    });

    if (!participant) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Créer le message
    const created = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Create notifications for other participants who receive this message
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    const recipientIds = participants
      .map((p) => p.userId)
      .filter((id) => id !== user.id);

    if (recipientIds.length > 0) {
      const truncated = content.length > 80 ? `${content.slice(0, 77)}...` : content;
      await prisma.notification.createMany({
        data: recipientIds.map((recipientId) => ({
          userId: recipientId,
          title: `رسالة جديدة من ${user.name}`,
          content: truncated,
          type: "message",
          priority: "high",
          link: `/dashboard/messagerie?conversationId=${conversationId}`,
          sentAt: new Date(),
        })),
      });
    }

    // Mettre à jour la date de dernière activité de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: {
        id: created.id,
        senderId: created.senderId,
        senderName: created.sender.name,
        senderRole: created.sender.role,
        content: created.content,
        time: created.createdAt,
        isMe: true,
        read: false,
      },
    });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "خطأ في ارسال الرسالة" }, { status: 500 });
  }
}