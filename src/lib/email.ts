import nodemailer from 'nodemailer';

// Configuration du transporteur avec vos identifiants Octenium
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // mail.votre-domaine.com
  port: Number(process.env.SMTP_PORT), // 465 ou 587
  secure: process.env.SMTP_PORT === '465', // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,    // inscription@el-minassa.com
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `"El-Minassa" <${process.env.EMAIL_FROM}>`, // inscription@el-minassa.com
    to: email,
    subject: 'Activez votre compte El-Minassa',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <div style="max-width: 500px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">El-Minassa</h1>
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit. Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Activer mon compte</a>
          <p style="color: #666; font-size: 12px;">Ce lien expire dans 24 heures.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">El-Minassa - Votre assistant juridique</p>
        </div>
      </body>
      </html>
    `,
  });
}