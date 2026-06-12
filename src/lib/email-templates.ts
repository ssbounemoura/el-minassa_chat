// src/lib/email-templates.ts

interface VerificationEmailProps {
  name: string;
  email: string;
  token: string;
  baseUrl: string;
}

export function getVerificationEmailTemplate({ name, email, token, baseUrl }: VerificationEmailProps): string {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تفعيل حسابك - المنصة القانونية الجزائرية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', 'Arial', sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
      margin: 0;
      padding: 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    
    .header {
      background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
      width: 70px;
      height: 70px;
      background: rgba(255,215,0,0.15);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 1px solid rgba(255,215,0,0.3);
    }
    
    .logo svg {
      width: 40px;
      height: 40px;
    }
    
    .header h1 {
      color: #ffd700;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .header p {
      color: rgba(255,255,255,0.85);
      font-size: 16px;
    }
    
    .content {
      padding: 40px 35px;
      background: #ffffff;
    }
    
    .greeting h2 {
      color: #1a472a;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .greeting p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #f8f9fc 0%, #f0f4f9 100%);
      border-radius: 16px;
      padding: 20px;
      margin: 25px 0;
      border-right: 4px solid #ffd700;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .info-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .info-icon svg {
      width: 20px;
      height: 20px;
      stroke: white;
      stroke-width: 2;
    }
    
    .info-text .label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .info-text .value {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
    }
    
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 8px 20px rgba(26, 71, 42, 0.3);
    }
    
    .link-fallback {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border: 1px solid #e2e8f0;
    }
    
    .link-fallback p {
      color: #4a5568;
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .link-fallback a {
      color: #1a472a;
      word-break: break-all;
      font-size: 13px;
      text-decoration: none;
      background: white;
      padding: 8px 12px;
      border-radius: 8px;
      display: inline-block;
      border: 1px solid #e2e8f0;
    }
    
    .security-note {
      background: #fffaf0;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 25px 0;
      display: flex;
      align-items: center;
      gap: 15px;
      border: 1px solid #fbd38d;
    }
    
    .security-icon {
      width: 40px;
      height: 40px;
      background: #ed8936;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .security-text strong {
      color: #dd6b20;
      font-size: 14px;
      display: block;
      margin-bottom: 4px;
    }
    
    .security-text span {
      color: #744210;
      font-size: 12px;
    }
    
    .footer {
      background: #1a202c;
      padding: 30px;
      text-align: center;
      color: #a0aec0;
      font-size: 12px;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .footer a {
      color: #ffd700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>المنصة القانونية الجزائرية</h1>
      <p>Algerian Legal Platform</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        <h2>مرحباً ${name}،</h2>
        <p>شكراً لاختيارك المنصة القانونية الجزائرية. يسعدنا انضمامك إلى مجتمعنا المهني المتميز.</p>
      </div>
      
      <div class="info-card">
        <div class="info-item">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div class="info-text">
            <div class="label">البريد الإلكتروني</div>
            <div class="value">${email}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="info-text">
            <div class="label">صلاحية الرابط</div>
            <div class="value">24 ساعة</div>
          </div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="btn">تفعيل حسابي الآن</a>
      </div>
      
      <div class="link-fallback">
        <p>📌 إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </div>
      
      <div class="security-note">
        <div class="security-icon">🔒</div>
        <div class="security-text">
          <strong>ملاحظة أمنية</strong>
          <span>إذا لم تطلب هذا التسجيل، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${year} المنصة القانونية الجزائرية. جميع الحقوق محفوظة</p>
      <p style="font-size: 11px; margin-top: 10px;">
        Ceci est un message automatique, merci de ne pas y répondre.
      </p>
    </div>
  </div>
</body>
</html>`;
}