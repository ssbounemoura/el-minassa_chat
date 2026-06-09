import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Helper function to send email
async function sendVerificationEmail(email: string, token: string, userName: string) {
  try {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const secure = process.env.EMAIL_SECURE === "true" || process.env.SMTP_SECURE === "true";
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
    const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `no-reply@${host ?? "elminassa.dz"}`;

    if (!host || !user || !pass) {
      console.error("Missing email configuration for Nodemailer.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from,
      to: email,
      subject: "تأكيد حساب المنصة القانونية الجزائرية",
      text: `مرحبا ${userName},\n\nشكراً لتسجيلك. الرجاء تفعيل حسابك عبر الضغط على الرابط التالي:\n${verificationLink}\n\nإذا لم تكن أنت من طلب هذا التسجيل، فتجاهل هذه الرسالة.`,
      html: `
        <div style="font-family: Cairo, sans-serif; direction: rtl; text-align: right; color: #1a202c;">
          <h2 style="color: #1e3a5f;">مرحبا ${userName}</h2>
          <p>شكرًا لتسجيلك في المنصة القانونية الجزائرية.</p>
          <p>يرجى الضغط على الزر التالي لتفعيل حسابك:</p>
          <a href="${verificationLink}" style="display: inline-block; margin: 16px 0; padding: 12px 20px; background: #1e3a5f; color: #ffffff; border-radius: 12px; text-decoration: none;">تفعيل الحساب</a>
          <p style="margin-top: 16px; color: #4a5568;">إذا لم تكن أنت من طلب هذا التسجيل، فتجاهل هذه الرسالة.</p>
          <p style="margin-top: 16px; color: #4a5568; font-size: 12px;">إذا كان الرابط لا يعمل، انسخ الرابط التالي والصقه في المتصفح:</p>
          <p style="word-break: break-all; color: #2d3748;">${verificationLink}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

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

