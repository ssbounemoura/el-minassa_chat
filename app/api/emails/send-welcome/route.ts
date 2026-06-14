import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, name, verificationToken } = await req.json();

    if (!email || !name || !verificationToken) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const html = getWelcomeEmailTemplate({ name, verificationToken, baseUrl });
    const result = await sendEmail({ to: email, subject: "تفعيل حسابك - المنصة القانونية الجزائرية", html });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Email envoyé" });
    } else {
      return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
