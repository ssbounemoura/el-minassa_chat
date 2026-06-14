// app/api/cron/check-invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function getInvoiceReminderTemplate({ name, invoiceNumber, amount, dueDate, daysOverdue }: any) {
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

export async function GET() {
  try {
    const today = new Date();
    const overdueInvoices = await prisma.facture.findMany({
      where: {
        dueDate: { lt: today },
        status: { not: "PAYEE" },
      },
      include: { user: true },
    });

    console.log(`📅 ${overdueInvoices.length} facture(s) impayée(s)`);

    let sentCount = 0;

    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.ceil((today.getTime() - new Date(invoice.dueDate!).getTime()) / (1000 * 3600 * 24));
      
      const html = getInvoiceReminderTemplate({
        name: invoice.user.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        dueDate: new Date(invoice.dueDate!).toLocaleDateString("ar"),
        daysOverdue,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: invoice.user.email,
        subject: "⚠️ فاتورة متأخرة - المنصة القانونية الجزائرية",
        html,
      });
      sentCount++;
    }

    return NextResponse.json({ success: true, remindersSent: sentCount });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}