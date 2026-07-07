"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AttendanceStatus = "applied" | "pending" | "waitlist" | "attended" | "no_show" | "canceled" | null;

const STATUS_LABEL: Record<string, string> = {
  applied: "신청 완료",
  pending: "승인 대기중",
  waitlist: "대기열 등록됨",
  attended: "참석 완료",
};

// §C2 — 화면당 단 하나의 핵심 CTA만 키캡(.btn-keycap)으로. 이 컴포넌트가 그 자리다
// ("즉시참여"). 취소는 조용한 보조 버튼으로 유지한다(여정⑥ "떠나기 쉬워야 들어오기도 쉽다").
export default function MeetingApplyButton({
  meetingId,
  initialStatus,
  isLoggedIn,
}: {
  meetingId: string;
  initialStatus: AttendanceStatus;
  isLoggedIn: boolean;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="btn-keycap"
        style={{ width: 96, height: 88 }}
      >
        즉시<br />참여
      </Link>
    );
  }

  const handleApply = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/meetings/${meetingId}/apply`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "신청에 실패했어요."); return; }
      setStatus(data.status);
      router.refresh();
    } catch {
      setError("신청 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/meetings/${meetingId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "취소에 실패했어요."); return; }
      setStatus(null);
      router.refresh();
    } catch {
      setError("취소 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  if (status && status !== "canceled" && status !== "no_show") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}>
          {STATUS_LABEL[status] ?? status}
        </span>
        {status !== "attended" && (
          <button
            type="button" onClick={handleCancel} disabled={loading}
            style={{
              fontSize: 11.5, color: "var(--muted-2)", background: "none", border: "none",
              cursor: loading ? "not-allowed" : "pointer", textDecoration: "underline", padding: "2px 4px",
            }}
          >
            {loading ? "처리 중…" : "신청 취소"}
          </button>
        )}
        {error && <span style={{ fontSize: 11, color: "#EF4444" }}>{error}</span>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="btn-keycap"
        style={{ width: 96, height: 88, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "처리중" : (<>즉시<br />참여</>)}
      </button>
      {error && <span style={{ fontSize: 11, color: "#EF4444" }}>{error}</span>}
    </div>
  );
}
