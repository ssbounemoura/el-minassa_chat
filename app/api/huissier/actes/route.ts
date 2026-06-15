import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || (user.role !== "HUISSIER" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
    }

    // استرجاع الأعمال - محاكاة البيانات في الوقت الحالي
    // في الإنتاج، يمكنك إضافة جدول جديد في Prisma
    const actes = [
      {
        id: "1",
        numero: "ح-2026-001",
        type: "عريضة",
        dateCreation: new Date().toISOString(),
        status: "موقعة",
        montant: 50000,
        clientName: "أحمد محمد",
      },
      {
        id: "2",
        numero: "ح-2026-002",
        type: "محضر",
        dateCreation: new Date(Date.now() - 86400000).toISOString(),
        status: "في_الانتظار",
        montant: 75000,
        clientName: "فاطمة علي",
      },
      {
        id: "3",
        numero: "ح-2026-003",
        type: "إعلان",
        dateCreation: new Date(Date.now() - 172800000).toISOString(),
        status: "مسجلة",
        montant: 100000,
        clientName: "محمود سالم",
      },
    ];

    return NextResponse.json({ actes });
  } catch (error) {
    console.error("خطأ في جلب الأعمال:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
