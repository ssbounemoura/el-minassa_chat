import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// ============================================
// GET - Récupérer les messages d'une conversation
// ============================================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

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
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
        sender: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      message: {
        id: created.id,
        senderId: created.senderId,
        senderName: user.name,
        content: created.content,
        time: created.createdAt,
        isMe: true,
      },
    });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "خطأ في ارسال الرسالة" }, { status: 500 });
  }
}