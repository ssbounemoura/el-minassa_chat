import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from 'nodemailer';

// Configuration SMTP avec Octenium
let transporter: nodemailer.Transporter | null = null;

try {
  // Vérifier que les variables SMTP sont définies
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ SMTP variables manquantes. L'envoi d'emails sera désactivé.");
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // false pour port 587, true pour 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    // Vérifier la connexion SMTP
    await transporter.verify();
    console.log("✅ SMTP configuré avec succès");
  }
} catch (smtpError) {
  console.error("❌ Erreur de configuration SMTP:", smtpError);
}

// Fonction pour envoyer l'email de vérification
async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!transporter) {
    console.warn("⚠️ Email non envoyé: SMTP non configuré");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
      <h2>مرحباً ${name}،</h2>
      <p>شكراً لتسجيلك في المنصة. يرجى تفعيل بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
      <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تفعيل الحساب</a></p>
      <p>أو انسخ هذا الرابط في متصفحك:</p>
      <p>${verificationUrl}</p>
      <p>هذا الرابط صالح لمدة 24 ساعة.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Ceci est un message automatique, merci de ne pas y répondre.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "تفعيل حسابك - El Minassa Chat",
      html: htmlContent,
    });
    console.log(`✅ Email de vérification envoyé à ${email}`);
    return true;
  } catch (emailError) {
    console.error("❌ Erreur d'envoi d'email:", emailError);
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

    // Send verification email (non bloquant)
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi d'email:", emailError);
    }

    // L'inscription réussit même si l'email échoue
    return NextResponse.json({
      message: emailSent 
        ? "تم إنشاء الحساب بنجاح. يرجى تفعيل بريدك الإلكتروني"
        : "تم إنشاء الحساب بنجاح. لم نتمكن من إرسال بريد التفعيل، يرجى الاتصال بالدعم",
      email: user.email,
      emailSent: emailSent,
    }, { status: 201 });
    
  } catch (error) {
    console.error("Register error:", error);
    // Retourner plus de détails sur l'erreur (en développement seulement)
    const errorMessage = process.env.NODE_ENV === "development" 
      ? (error as Error).message 
      : "خطأ في الخادم";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}