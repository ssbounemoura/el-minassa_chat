import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Helper pour récupérer l'utilisateur via le token
async function getCurrentUser(req: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    // Décoder le token JWT (simplifié - à adapter avec next-auth)
    // Pour l'instant, on utilise le cookie de session
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;
    
    // Extraire l'email du cookie session (approche simplifiée)
    // Dans votre implémentation, utilisez la session NextAuth correctement
    
    return null;
  } catch {
    return null;
  }
}

// ============================================
// GET - Récupérer les messages d'une conversation
// ============================================
export async function GET(req: NextRequest) {
  try {
    // Alternative : utiliser le cookie authUserId
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;
    
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId مطلوب" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
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
        isMe: m.senderId === userId,
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
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;
    
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { conversationId, content } = await req.json();
    if (!conversationId || !content) {
      return NextResponse.json({ error: "conversationId و content مطلوبان" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Créer le message
    const created = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
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
        senderName: created.sender.name,
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