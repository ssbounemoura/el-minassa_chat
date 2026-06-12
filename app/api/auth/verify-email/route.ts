import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "رمز التحقق مفقود" }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 404 });
    }

    // Check if token has expired
    if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry < new Date()) {
      return NextResponse.json({ message: "رمز التحقق منتهي الصلاحية" }, { status: 410 });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json({ message: "تم التحقق من البريد الإلكتروني بالفعل" }, { status: 200 });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });

    // Activate subscription if exists
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { isActive: true },
      });
    }

    return NextResponse.json({
      message: "تم التحقق من البريد الإلكتروني بنجاح",
      email: user.email,
    }, { status: 200 });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
