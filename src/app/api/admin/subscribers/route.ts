import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - List all subscribers
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    const role = req.nextUrl.searchParams.get("role") || "";

    const users = await prisma.user.findMany({
      where: {
        role: { not: "SUPER_ADMIN" },
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { officeName: { contains: search } },
          ],
        } : {}),
        ...(role ? { role } : {}),
      },
      include: {
        wilaya: true,
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        officeName: u.officeName,
        isActive: u.isActive,
        wilaya: u.customWilaya || u.wilaya?.name || null,
        plan: u.subscription?.plan?.name || null,
        planId: u.subscription?.planId || null,
        subscriptionActive: u.subscription?.isActive || false,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "خطأ في تحميل المشتركين" }, { status: 500 });
  }
}

// POST - Toggle user status or update user
export async function POST(req: NextRequest) {
  try {
    const { action, id, data } = await req.json();

    if (action === "toggle-active") {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });

      await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
      });
      return NextResponse.json({ success: true, isActive: !user.isActive });
    }

    if (action === "update") {
      await prisma.user.update({ where: { id }, data });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("Update subscriber error:", error);
    return NextResponse.json({ error: "خطأ في تحديث المشترك" }, { status: 500 });
  }
}

// DELETE - Remove a subscriber
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });

    // Delete related data first
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.aiConversation.deleteMany({ where: { userId: id } });
    await prisma.rendezVous.deleteMany({ where: { userId: id } });
    await prisma.document.deleteMany({ where: { userId: id } });
    await prisma.facture.deleteMany({ where: { userId: id } });
    await prisma.dossier.deleteMany({ where: { userId: id } });
    await prisma.client.deleteMany({ where: { userId: id } });
    await prisma.subscription.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: "خطأ في حذف المشترك" }, { status: 500 });
  }
}
