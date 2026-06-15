import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    // في الإنتاج، حذف من قاعدة البيانات
    // await prisma.acteHuissier.delete({ where: { id } });

    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error) {
    console.error("خطأ في الحذف:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
