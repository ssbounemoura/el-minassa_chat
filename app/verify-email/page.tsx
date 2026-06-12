import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary">جاري التحميل...</div></div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
