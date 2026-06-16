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

    // استرجاع الأعمال التنفيذية - محاكاة بيانات قضايا حاسبي العدل
    // في الإنتاج، يمكن ترحيل هذا إلى جدول التنفيذ أو ملف التنفيذ من Prisma
    const actes = [
      {
        id: "1",
        numero: "ح-2026-001",
        type: "إشعار تنفيذ",
        dateCreation: new Date().toISOString(),
        status: "قيد_التنفيذ",
        montant: 450000,
        creditorName: "شركة السعادة",
        debtorName: "عمر حرز",
        tribunal: "محكمة سوق أهراس",
        executionType: "حجز تنفيذي",
        referenceNumber: "REF-1101",
      },
      {
        id: "2",
        numero: "ح-2026-002",
        type: "أمر أداء",
        dateCreation: new Date(Date.now() - 86400000).toISOString(),
        status: "تم_التبليغ",
        montant: 280000,
        creditorName: "مؤسسة نور للإستيراد",
        debtorName: "سامي بلقاسم",
        tribunal: "محكمة سيدي بلعباس",
        executionType: "إخلاء عقاري",
        referenceNumber: "REF-1102",
      },
      {
        id: "3",
        numero: "ح-2026-003",
        type: "محضر حجز",
        dateCreation: new Date(Date.now() - 172800000).toISOString(),
        status: "تم_الإنجاز",
        montant: 125000,
        creditorName: "البنك الوطني الجزائري",
        debtorName: "لطيفة خليل",
        tribunal: "محكمة قسنطينة",
        executionType: "حجز على الأجر",
        referenceNumber: "REF-1103",
      },
    ];

    return NextResponse.json({ actes });
  } catch (error) {
    console.error("خطأ في جلب الأعمال:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
