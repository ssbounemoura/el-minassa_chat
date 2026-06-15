import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { getVerificationEmailTemplate } from "@/lib/email-templates";
import { Resend } from "resend";

// Build transporter if SMTP env vars present
let transporter: nodemailer.Transporter | null = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    // verify but don't await to avoid startup delays
    transporter.verify().then(() => console.log("SMTP ready for resend verification")).catch(() => {});
  }
} catch (e) {
  console.error("Error initializing SMTP for resend:", e);
}

// Resend client (optional)
let resendClient: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  try {
    // Resend expects the API key as the first argument
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend client configured for resend-verification");
  } catch (e) {
    console.error("Error initializing Resend client:", e);
  }
}

async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!transporter) {
    // Try Resend if available
    if (resendClient) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const htmlContent = getVerificationEmailTemplate({ name, email, token, baseUrl });
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER || "noreply@localhost",
          to: email,
          subject: "تفعيل حسابك - المنصة القانونية الجزائرية",
          html: htmlContent,
        });
        return true;
      } catch (err) {
        console.error("Error sending verification email via Resend:", err);
        return false;
      }
    }

    console.warn("SMTP not configured and Resend API key missing; cannot send verification email");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const htmlContent = getVerificationEmailTemplate({ name, email, token, baseUrl });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "تفعيل حسابك - المنصة القانونية الجزائرية",
      html: htmlContent,
    });
    return true;
  } catch (err) {
    console.error("Error sending verification email (resend):", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      const raw = await request.text();
      console.log("resend-verification raw body:", raw);
      try {
        body = JSON.parse(raw || "{}");
      } catch (e) {
        console.error("Failed to JSON.parse raw body for resend-verification:", e);
        return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
      }
    } catch (e) {
      console.error("Failed to read text body for resend-verification:", e);
      return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
    }

    const email = body?.email;
    if (!email) return NextResponse.json({ message: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });

    if (user.isEmailVerified) {
      return NextResponse.json({ message: "البريد مُفعّل بالفعل" }, { status: 200 });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token, emailVerificationTokenExpiry: expiry },
    });

    const sent = await sendVerificationEmail(user.email, token, user.name || "Utilisateur");

    if (!sent) {
      return NextResponse.json({
        message: "Impossible d'envoyer l'email de vérification. Vérifiez la configuration SMTP ou utilisez l'option d'activation manuelle.",
        emailSent: false,
      }, { status: 500 });
    }

    return NextResponse.json({ message: "Email de vérification renvoyé", emailSent: true }, { status: 200 });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
