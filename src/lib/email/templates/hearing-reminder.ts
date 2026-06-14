interface HearingReminderProps {
  name: string;
  caseTitle: string;
  hearingDate: string;
  hearingTime: string;
  courtName: string;
  caseNumber: string;
}

export function getHearingReminderTemplate({ name, caseTitle, hearingDate, hearingTime, courtName, caseNumber }: HearingReminderProps) {
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8"><title>تذكير بجلسة قضائية</title></head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5;">
  <div style="max-width:500px;margin:0 auto;background:white;padding:30px;border-radius:10px;">
    <h2 style="color:#1a472a;">مرحباً ${name}،</h2>
    <p>نذكركم بجلسة قضائية مقررة:</p>
    <p><strong>القضية:</strong> ${caseTitle}</p>
    <p><strong>رقم القضية:</strong> ${caseNumber}</p>
    <p><strong>المحكمة:</strong> ${courtName}</p>
    <p><strong>التاريخ:</strong> ${hearingDate}</p>
    <p><strong>الوقت:</strong> ${hearingTime}</p>
  </div>
</body>
</html>`;
}