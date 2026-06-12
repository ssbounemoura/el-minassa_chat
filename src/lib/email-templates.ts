import { getVerificationEmailTemplate } from "@/lib/email-templates";

// Dans sendVerificationEmail, remplacez htmlContent par :
async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!transporter) {
    console.warn("⚠️ Email non envoyé: SMTP non configuré");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const htmlContent = getVerificationEmailTemplate({
    name,
    email,
    token,
    baseUrl,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "تفعيل حسابك - المنصة القانونية الجزائرية",
      html: htmlContent,
    });
    console.log(`✅ Email de vérification envoyé à ${email}`);
    return true;
  } catch (emailError) {
    console.error("❌ Erreur d'envoi d'email:", emailError);
    return false;
  }
}