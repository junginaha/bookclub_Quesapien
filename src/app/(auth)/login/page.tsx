import type { Metadata } from "next";
import { Suspense } from "react";
import LoginV3 from "@/components/auth/LoginV3";

export const metadata: Metadata = {
  title: "로그인",
  description: "카카오 또는 구글로 로그인하고 북클럽을 예약하세요. 이름만 가져와요.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAF7F2" }} />}>
      <LoginV3 />
    </Suspense>
  );
}
