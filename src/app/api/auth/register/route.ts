import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone, officeName, wilaya, manualWilaya, unoaNumber, cnnNumber, cnhjNumber } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "هذا البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Find wilaya if provided
    let wilayaId: string | null = null;
    let customWilaya: string | null = null;
    const wilayaValue = manualWilaya?.trim() ? manualWilaya.trim() : wilaya?.trim();
    if (wilayaValue) {
      const w = await prisma.wilaya.findUnique({ where: { code: wilayaValue } });
      if (w) {
        wilayaId = w.id;
      } else {
        customWilaya = wilayaValue;
      }
    }

    // Get default plan (Essentiel)
    const defaultPlan = await prisma.plan.findFirst({ where: { isActive: true }, orderBy: { price: "asc" } });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "AVOCAT",
        phone,
        officeName,
        wilayaId,
        customWilaya,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry,
      },
    });

    // Create subscription if plan exists
    if (defaultPlan) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // 14-day free trial

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: defaultPlan.id,
          endDate,
          isActive: false, // Inactive until email is verified
        },
      });
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);

    return NextResponse.json({
      message: "تم إنشاء الحساب بنجاح. يرجى تفعيل بريدك الإلكتروني",
      email: user.email,
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}

