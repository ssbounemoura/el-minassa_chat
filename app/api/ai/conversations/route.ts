import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst({ where: { role: "AVOCAT" } });
  return user?.id || null;
}

// GET - List conversations or get one
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const conv = await prisma.aiConversation.findFirst({ where: { id, userId } });
      if (!conv) return NextResponse.json({ error: "محادثة غير موجودة" }, { status: 404 });
      return NextResponse.json({
        id: conv.id,
        title: conv.title,
        messages: JSON.parse(conv.messages),
        createdAt: conv.createdAt,
      });
    }

    // List all conversations
    const conversations = await prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "خطأ في تحميل المحادثات" }, { status: 500 });
  }
}

// POST - Create or update a conversation
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const { id, title, messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "رسائل غير صالحة" }, { status: 400 });
    }

    const messagesStr = JSON.stringify(messages);
    const autoTitle = title || messages.find((m: { role: string }) => m.role === "user")?.content?.substring(0, 50) || "محادثة جديدة";

    if (id) {
      // Update existing
      const updated = await prisma.aiConversation.update({
        where: { id },
        data: { title: autoTitle, messages: messagesStr, updatedAt: new Date() },
      });
      return NextResponse.json({ id: updated.id });
    }

    // Create new
    const created = await prisma.aiConversation.create({
      data: { userId, title: autoTitle, messages: messagesStr },
    });
    return NextResponse.json({ id: created.id });
  } catch (error) {
    console.error("Save conversation error:", error);
    return NextResponse.json({ error: "خطأ في حفظ المحادثة" }, { status: 500 });
  }
}

// DELETE - Delete a conversation
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف المحادثة مطلوب" }, { status: 400 });

    await prisma.aiConversation.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "خطأ في حذف المحادثة" }, { status: 500 });
  }
}
