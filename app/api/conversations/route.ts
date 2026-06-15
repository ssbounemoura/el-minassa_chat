import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wilaya: { select: { name: true } } },
    });

    if (!currentUser) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });

    const locationLabel = currentUser.wilaya?.name?.trim() || currentUser.customWilaya?.trim() || currentUser.officeName?.trim() || "المنصة";
    const roleTitles: Record<string, string> = {
      AVOCAT: "غرفة المحامين",
      NOTAIRE: "غرفة الموثقين",
      HUISSIER: "غرفة المحضرين",
    };
    const defaultRoomTitle = `${roleTitles[currentUser.role] || currentUser.role} · ${locationLabel}`;

    const matchingLocationConditions: Array<object> = [];
    if (currentUser.wilayaId) {
      matchingLocationConditions.push({ wilayaId: currentUser.wilayaId });
    }
    if (currentUser.customWilaya) {
      matchingLocationConditions.push({ customWilaya: currentUser.customWilaya });
    }
    if (currentUser.officeName) {
      matchingLocationConditions.push({ officeName: currentUser.officeName });
    }

    const defaultConversation = await prisma.conversation.findFirst({
      where: {
        type: "profession",
        title: defaultRoomTitle,
      },
    });

    if (!defaultConversation) {
      const matchingUsers = await prisma.user.findMany({
        where: {
          role: currentUser.role,
          AND: matchingLocationConditions.length > 0 ? [{ OR: matchingLocationConditions }] : [],
        },
        select: { id: true },
      });

      const uniqueParticipantIds = Array.from(new Set([userId, ...matchingUsers.map((u) => u.id)]));

      await prisma.conversation.create({
        data: {
          type: "profession",
          title: defaultRoomTitle,
          participants: {
            create: uniqueParticipantIds.map((id) => ({ userId: id })),
          },
        },
      });
    } else {
      const matchingUsers = await prisma.user.findMany({
        where: {
          role: currentUser.role,
          AND: matchingLocationConditions.length > 0 ? [{ OR: matchingLocationConditions }] : [],
        },
        select: { id: true },
      });

      await prisma.conversationParticipant.createMany({
        data: matchingUsers.map((u) => ({ conversationId: defaultConversation.id, userId: u.id })),
        skipDuplicates: true,
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, role: true, isActive: true } } } },
        messages: { 
          orderBy: { createdAt: "desc" },
          take: 1 
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                readAt: null
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = conversations.map((c) => {
      const lastMsg = c.messages[0];
      const otherMembers = c.participants.filter(p => p.userId !== userId);
      
      // Auto-generate title for private chats if empty
      let title = c.title;
      if (c.type === "private" && !title && otherMembers.length > 0) {
        title = otherMembers[0].user.name;
      }

      return {
        id: c.id,
        type: c.type,
        title: title || "محادثة",
        room: c.id,
        unread: c._count.messages,
        lastMessage: lastMsg ? lastMsg.content : "",
        lastTime: lastMsg ? lastMsg.createdAt : c.updatedAt,
        members: c.participants.map((p) => ({ id: p.user.id, name: p.user.name, role: p.user.role, online: p.user.isActive })),
        messages: c.messages.map((m) => ({ id: m.id, senderId: m.senderId, content: m.content, time: m.createdAt, isMe: m.senderId === userId })),
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "خطأ في تحميل المحادثات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const { participantIds, type, title } = await req.json();
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "المشاركون مطلوبون" }, { status: 400 });
    }

    const uniqueParticipants = Array.from(new Set([...participantIds, userId]));

    // For private chats, check if conversation already exists between these 2 users
    if (type === "private" && uniqueParticipants.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "private",
          AND: [
            { participants: { some: { userId: uniqueParticipants[0] } } },
            { participants: { some: { userId: uniqueParticipants[1] } } },
          ]
        }
      });
      if (existing) {
        return NextResponse.json({ id: existing.id });
      }
    }

    const conv = await prisma.conversation.create({ data: { type: type || "private", title: title || null } });

    const parts = uniqueParticipants.map((id: string) => ({ conversationId: conv.id, userId: id }));
    await prisma.conversationParticipant.createMany({ data: parts });

    return NextResponse.json({ id: conv.id });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "خطأ في انشاء المحادثة" }, { status: 500 });
  }
}
