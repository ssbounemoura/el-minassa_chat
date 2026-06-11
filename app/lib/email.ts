import { Resend } from 'resend';

// Initialisation de Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string, name: string) {
  // URL de base - priorité à NEXTAUTH_URL, sinon l'URL de production
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://el-minassa-officiel.vercel.app';
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  
  console.log(`[EMAIL] Tentative d'envoi à: ${email}`);
  console.log(`[EMAIL] Lien de vérification: ${verificationLink}`);
  console.log(`[EMAIL] RESEND_API_KEY présente: ${!!process.env.RESEND_API_KEY}`);

  // Vérification que la clé API est présente
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY manquante - Email non envoyé");
    console.log(`[DEV] Lien à copier manuellement: ${verificationLink}`);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      // Expéditeur temporaire (fonctionne sans validation DNS)
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'تفعيل حسابك - المنصة القانونية الجزائرية',
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
          <div style="max-width: 500px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">المنصة القانونية الجزائرية</h1>
            <p>مرحباً ${name},</p>
            <p>شكراً لتسجيلك. لتفعيل حسابك، يرجى النقر على الرابط أدناه :</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #d4af37; color: #1e3a5f; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">
              تفعيل الحساب
            </a>
            <p style="color: #666; font-size: 12px;">هذا الرابط صالح لمدة 24 ساعة.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">المنصة القانونية الجزائرية - مساعدك القانوني</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Erreur Resend:", error);
      return false;
    }

    console.log(`✅ Email de vérification envoyé avec succès à ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Exception lors de l'envoi d'email:", error);
    return false;
  }
}

// Fonction pour tester l'envoi d'email (utilisable en développement)
export async function testEmail(to: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY manquante");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: 'Test - Email fonctionne !',
      html: '<p>Si vous recevez ce message, la configuration email est correcte.</p>',
    });

    if (error) {
      console.error("Erreur test:", error);
      return false;
    }

    console.log("Email de test envoyé avec succès");
    return true;
  } catch (error) {
    console.error("Exception test:", error);
    return false;
  }
}