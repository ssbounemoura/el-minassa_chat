
interface WelcomeProps {
  name: string;
  verificationToken: string;
  baseUrl: string;
}

export function getWelcomeEmailTemplate({ name, verificationToken, baseUrl }: WelcomeProps) {
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8"><title>تفعيل حسابك</title></head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5;">
  <div style="max-width:500px;margin:0 auto;background:white;padding:30px;border-radius:10px;">
    <h2 style="color:#1a472a;">مرحباً ${name}،</h2>
    <p>شكراً لتسجيلك في المنصة القانونية الجزائرية.</p>
    <p>لتفعيل حسابك، اضغط على الرابط:</p>
    <p><a href="${verificationUrl}" style="background:#1a472a;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">تفعيل الحساب</a></p>
  </div>
</body>
</html>`;
}