import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalDossiers,
      totalClients,
      totalNotifications,
      plans,
      recentUsers,
      roleDistribution,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" }, isActive: true } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { isActive: true } }),
      prisma.dossier.count(),
      prisma.client.count(),
      prisma.notification.count(),
      prisma.plan.findMany({ orderBy: { price: "asc" } }),
      prisma.user.findMany({
        where: { role: { not: "SUPER_ADMIN" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { wilaya: true, subscription: { include: { plan: true } } },
      }),
      prisma.user.groupBy({ by: ["role"], _count: true, where: { role: { not: "SUPER_ADMIN" } } }),
    ]);

    // Plan distribution
    const planDistribution = await Promise.all(
      plans.map(async (plan) => {
        const count = await prisma.subscription.count({ where: { planId: plan.id } });
        return { id: plan.id, name: plan.name, price: plan.price, count };
      })
    );

    // Monthly revenue estimate
    const monthlyRevenue = plans.reduce((sum, plan) => {
      const planCount = planDistribution.find((p) => p.id === plan.id)?.count || 0;
      return sum + plan.price * planCount;
    }, 0);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalDossiers,
      totalClients,
      totalNotifications,
      monthlyRevenue,
      plans: planDistribution,
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        officeName: u.officeName,
        isActive: u.isActive,
        wilaya: u.customWilaya || u.wilaya?.name || null,
        plan: u.subscription?.plan?.name || null,
        createdAt: u.createdAt,
      })),
      roleDistribution: roleDistribution.map((r) => ({ role: r.role, count: r._count })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الإحصائيات" }, { status: 500 });
  }
}
