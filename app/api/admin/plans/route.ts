import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - List all plans
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });

    // Get subscriber count per plan
    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const count = await prisma.subscription.count({ where: { planId: plan.id } });
        const activeCount = await prisma.subscription.count({ where: { planId: plan.id, isActive: true } });
        return { ...plan, subscriberCount: count, activeCount };
      })
    );

    return NextResponse.json({ plans: plansWithCounts });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الخطط" }, { status: 500 });
  }
}

// POST - Create or update a plan
export async function POST(req: NextRequest) {
  try {
    const { id, name, price, durationDays, features, maxDossiers, maxClients, isActive } = await req.json();

    if (!name || price === undefined) {
      return NextResponse.json({ error: "الاسم والسعر مطلوبان" }, { status: 400 });
    }

    const data = {
      name,
      price: parseFloat(price),
      durationDays: parseInt(durationDays) || 30,
      features: features || "",
      maxDossiers: parseInt(maxDossiers) || 50,
      maxClients: parseInt(maxClients) || 100,
      isActive: isActive !== undefined ? isActive : true,
    };

    if (id) {
      await prisma.plan.update({ where: { id }, data });
    } else {
      await prisma.plan.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save plan error:", error);
    return NextResponse.json({ error: "خطأ في حفظ الخطة" }, { status: 500 });
  }
}

// DELETE - Delete a plan (only if no subscribers)
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف الخطة مطلوب" }, { status: 400 });

    const count = await prisma.subscription.count({ where: { planId: id } });
    if (count > 0) {
      return NextResponse.json({ error: `لا يمكن حذف الخطة. يوجد ${count} مشترك نشط.` }, { status: 400 });
    }

    await prisma.plan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json({ error: "خطأ في حذف الخطة" }, { status: 500 });
  }
}
