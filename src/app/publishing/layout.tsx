import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "19호실 출판OS | 1인 출판 자동화 플랫폼",
  description: "원고 업로드부터 PDF·ePub 생성까지 — AI 기반 출판 자동화 플랫폼",
};

export default function PublishingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
