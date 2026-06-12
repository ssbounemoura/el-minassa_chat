import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { type, value } = await req.json();

    if (!type || !value) {
      return NextResponse.json(
        { error: "Type and value are required" },
        { status: 400 }
      );
    }

    if (type === "email") {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return NextResponse.json(
          { available: false, message: "صيغة البريد الإلكتروني غير صحيحة" },
          { status: 200 }
        );
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: value.toLowerCase() },
      });

      if (existingEmail) {
        return NextResponse.json(
          { available: false, message: "البريد الإلكتروني مسجل بالفعل" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { available: true, message: "البريد الإلكتروني متاح" },
        { status: 200 }
      );
    }

    if (type === "phone") {
      // Phone validation - Algerian format
      const phoneRegex = /^(0|\+213)[567]\d{8}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        return NextResponse.json(
          { available: false, message: "رقم الهاتف غير صحيح (الصيغة الجزائرية: 0555XXXXXX أو +213555XXXXXX)" },
          { status: 200 }
        );
      }

      const existingPhone = await prisma.user.findFirst({
        where: { phone: value },
      });

      if (existingPhone) {
        return NextResponse.json(
          { available: false, message: "رقم الهاتف مسجل بالفعل" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { available: true, message: "رقم الهاتف متاح" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "نوع التحقق غير معروف" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Check availability error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
