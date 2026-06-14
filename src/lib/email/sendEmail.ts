import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Configuration SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Vérifier la connexion SMTP au démarrage
transporter.verify()
  .then(() => {
    console.log("✅ SMTP prêt à envoyer des emails");
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion SMTP:", err);
  });

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`✅ Email envoyé à ${to} - MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${to}:`, error);
    return { success: false, error };
  }
}