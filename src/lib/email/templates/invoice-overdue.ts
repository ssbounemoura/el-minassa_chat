interface InvoiceOverdueProps {
  name: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export function getInvoiceOverdueTemplate({ name, invoiceNumber, amount, dueDate, daysOverdue }: InvoiceOverdueProps) {
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8"><title>فاتورة متأخرة</title></head>
<body style="font-family:Arial;padding:20px;background:#f5f5f5;">
  <div style="max-width:500px;margin:0 auto;background:white;padding:30px;border-radius:10px;">
    <h2 style="color:#1a472a;">مرحباً ${name}،</h2>
    <div style="background:#fee2e2;padding:15px;border-radius:8px;margin:15px 0;">
      <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
      <p><strong>المبلغ:</strong> ${amount.toLocaleString()} د.ج</p>
      <p><strong>تاريخ الاستحقاق:</strong> ${dueDate}</p>
      <p><strong>متأخرة بـ:</strong> ${daysOverdue} يوماً</p>
    </div>
    <p>يرجى تسوية المبلغ المستحق في أقرب وقت.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/factures" style="background:#1a472a;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">عرض الفاتورة</a>
  </div>
</body>
</html>`;
}