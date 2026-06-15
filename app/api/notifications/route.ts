import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("authUserId")?.value || null;
}

// GET - Fetch notifications for current user
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } },
        ],
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الإشعارات" }, { status: 500 });
  }
}

// POST - Mark notifications as read OR create a notification
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // Mark all as read
    if (action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    // Mark single as read
    if (action === "mark-read") {
      const { id } = body;
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    // Trigger daily 8AM summary
    if (action === "trigger-daily") {
      return await generateDailySummary(userId);
    }

    // Create a notification
    const { title, content, type, priority, link, scheduledAt } = body;
    const notif = await prisma.notification.create({
      data: {
        userId,
        title: title || "إشعار",
        content: content || "",
        type: type || "info",
        priority: priority || "normal",
        link: link || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ notification: notif });
  } catch (error) {
    console.error("Post notification error:", error);
    return NextResponse.json({ error: "خطأ في معالجة الطلب" }, { status: 500 });
  }
}

// DELETE - Delete a notification
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف الإشعار مطلوب" }, { status: 400 });

    await prisma.notification.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ error: "خطأ في حذف الإشعار" }, { status: 500 });
  }
}

// Generate daily summary based on today's hearings, deadlines, and appointments
async function generateDailySummary(userId: string): Promise<NextResponse> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if already sent today
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: "daily-summary",
      createdAt: { gte: today },
    },
  });

  if (existing) {
    return NextResponse.json({ notification: existing, duplicate: true });
  }

  // Gather today's hearings
  const hearings = await prisma.dossier.findMany({
    where: {
      userId,
      nextHearing: { gte: today, lt: tomorrow },
      status: "EN_COURS",
    },
    select: { id: true, title: true, courtName: true, caseNumber: true, nextHearing: true },
  });

  // Gather upcoming deadlines (next 7 days)
  const weekLater = new Date(today);
  weekLater.setDate(weekLater.getDate() + 7);

  const deadlines = await prisma.dossier.findMany({
    where: {
      userId,
      deadline: { gte: today, lt: weekLater },
      status: "EN_COURS",
    },
    select: { id: true, title: true, deadline: true },
  });

  // Gather today's appointments
  const appointments = await prisma.rendezVous.findMany({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
      isDone: false,
    },
    select: { id: true, title: true, date: true, location: true },
  });

  // Build summary content
  const parts: string[] = [];

  if (hearings.length > 0) {
    parts.push(`🏛️ جلسات اليوم (${hearings.length}):`);
    for (const h of hearings) {
      const time = h.nextHearing
        ? new Date(h.nextHearing).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })
        : "غير محدد";
      parts.push(`  • ${h.title} — ${h.courtName || "المحكمة"} (${h.caseNumber || "بدون رقم"}) الساعة ${time}`);
    }
  }

  if (deadlines.length > 0) {
    parts.push(`⏰ مواعيد نهائية هذا الأسبوع (${deadlines.length}):`);
    for (const d of deadlines) {
      const date = d.deadline
        ? new Date(d.deadline).toLocaleDateString("ar-DZ", { day: "2-digit", month: "2-digit" })
        : "غير محدد";
      parts.push(`  • ${d.title} — ${date}`);
    }
  }

  if (appointments.length > 0) {
    parts.push(`📅 مواعيد اليوم (${appointments.length}):`);
    for (const a of appointments) {
      const time = new Date(a.date).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
      parts.push(`  • ${a.title} — الساعة ${time}${a.location ? ` (${a.location})` : ""}`);
    }
  }

  if (parts.length === 0) {
    parts.push("✅ لا توجد جلسات أو مواعيد اليوم. يوم هادئ!");
  }

  const title = `📋 ملخص يوم ${today.toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })}`;
  const content = parts.join("\n");

  const notif = await prisma.notification.create({
    data: {
      userId,
      title,
      content,
      type: "daily-summary",
      priority: "high",
      link: "/dashboard",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ notification: notif, summary: { hearings: hearings.length, deadlines: deadlines.length, appointments: appointments.length } });
}
