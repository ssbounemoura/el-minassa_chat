import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import ToastContainer from "@/components/notifications/ToastContainer";
import MaintenanceBanner from "@/components/MaintenanceBanner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "المنصة القانونية الجزائرية - إدارة المكاتب القانونية في الجزائر",
  description: "منصة قانونية متكاملة لإدارة مكاتب المحامين والموثقين والمحضرين القضائيين في الجزائر",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("authRole")?.value === "SUPER_ADMIN";

  let isMaintenanceMode = false;
  try {
    const settingsPath = path.join(process.cwd(), "src/lib/settings.json");
    const file = await fs.readFile(settingsPath, "utf-8");
    isMaintenanceMode = JSON.parse(file).maintenanceMode === true;
  } catch {}

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // If maintenance is on, non-admins should be redirected
  if (isMaintenanceMode && !isAdmin) {
    const publicPrefixes = ["/maintenance", "/login", "/register", "/verify-email"];
    const isPublicRoute = publicPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
    
    // Only redirect if we know the pathname and it's not already a public route
    // (If pathname is empty, it might be a static asset or initial render without headers)
    if (pathname && !isPublicRoute) {
      redirect("/maintenance");
    }
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-[family-name:var(--font-cairo)] antialiased" suppressHydrationWarning>
        {isMaintenanceMode && isAdmin && <MaintenanceBanner />}
        {children}
        <ToastContainer />
        <CookieConsent />
      </body>
    </html>
  );
}