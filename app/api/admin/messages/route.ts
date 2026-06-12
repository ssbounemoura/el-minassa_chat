import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - List all notifications sent in the system
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الإشعارات المرسلة" }, { status: 500 });
  }
}

// POST - Send an announcement/notification to target users
export async function POST(req: NextRequest) {
  try {
    const { title, content, targetType, targetRole, targetUserId, type, priority, link } = await req.json();

    if (!title || !content || !targetType) {
      return NextResponse.json({ error: "العنوان والمحتوى والجهة المستهدفة مطلوبة" }, { status: 400 });
    }

    let usersToNotify: { id: string }[] = [];

    if (targetType === "all") {
      usersToNotify = await prisma.user.findMany({
        where: { role: { not: "SUPER_ADMIN" } },
        select: { id: true },
      });
    } else if (targetType === "role") {
      if (!targetRole) return NextResponse.json({ error: "المهنة المستهدفة مطلوبة" }, { status: 400 });
      usersToNotify = await prisma.user.findMany({
        where: { role: targetRole },
        select: { id: true },
      });
    } else if (targetType === "user") {
      if (!targetUserId) return NextResponse.json({ error: "المستخدم المستهدف مطلوب" }, { status: 400 });
      const userExists = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!userExists) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      usersToNotify = [{ id: targetUserId }];
    } else {
      return NextResponse.json({ error: "نوع الجهة المستهدفة غير صالح" }, { status: 400 });
    }

    if (usersToNotify.length === 0) {
      return NextResponse.json({ error: "لا يوجد مستخدمون مستهدفون لإرسال الإشعار" }, { status: 400 });
    }

    // Prepare notifications list
    const notificationsData = usersToNotify.map((u) => ({
      userId: u.id,
      title,
      content,
      type: type || "info",
      priority: priority || "normal",
      link: link || null,
      sentAt: new Date(),
    }));

    // Create notifications in database
    await prisma.notification.createMany({
      data: notificationsData,
    });

    return NextResponse.json({ success: true, count: usersToNotify.length });
  } catch (error) {
    console.error("Post notification error:", error);
    return NextResponse.json({ error: "خطأ في إرسال الإعلان" }, { status: 500 });
  }
}

// DELETE - Delete a specific notification
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف الإشعار مطلوب" }, { status: 400 });

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ error: "خطأ في حذف الإشعار" }, { status: 500 });
  }
}
