import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "المنصة القانونية الجزائرية - إدارة المكاتب القانونية في الجزائر",
  description: "منصة قانونية متكاملة لإدارة مكاتب المحامين والموثقين والمحضرين القضائيين في الجزائر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-[family-name:var(--font-cairo)] antialiased" suppressHydrationWarning>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}