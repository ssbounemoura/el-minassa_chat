import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;

    if (!file || !title || !type) {
      return NextResponse.json(
        { message: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { message: "حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)" },
        { status: 400 }
      );
    }

    // قائمة الملحقات المسموحة
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xlsx", ".txt"];
    const fileExt = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { message: "نوع الملف غير مدعوم" },
        { status: 400 }
      );
    }

    // حفظ الملف في مجلد عام (في الإنتاج، استخدم خدمة التخزين السحابي)
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "huissier");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    return NextResponse.json({
      message: "تم رفع الملف بنجاح",
      fileName,
      fileUrl: `/uploads/huissier/${fileName}`,
      title,
      type,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("خطأ في الرفع:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء رفع الملف" },
      { status: 500 }
    );
  }
}
