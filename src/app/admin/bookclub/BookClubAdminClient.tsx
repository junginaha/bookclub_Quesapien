"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

export interface ApplicationRow {
  id: string;
  club_slug: string;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  status: string;
  created_at: string;
}

export interface WaitlistRow {
  id: string;
  club_slug: string | null;
  name: string;
  phone: string;
  created_at: string;
  notified_at: string | null;
}

interface ClubInfo {
  slug: string;
  title: string;
  capacity: number;
}

function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const escape = (v: string | number | null) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const cellStyle: CSSProperties = { padding: "8px 10px", fontSize: 13, borderBottom: "1px solid var(--line)", color: "var(--ink)" };
const headStyle: CSSProperties = { ...cellStyle, fontWeight: 700, color: "var(--muted)", fontSize: 11.5, textTransform: "uppercase" };

export default function BookClubAdminClient({
  clubs,
  applications,
  waitlist,
  loadError,
}: {
  clubs: ClubInfo[];
  applications: ApplicationRow[];
  waitlist: WaitlistRow[];
  loadError: string | null;
}) {
  const router = useRouter();

  if (loadError) {
    return (
      <div style={{ maxWidth: 640, margin: "80px auto", textAlign: "center" }}>
        <p style={{ color: "var(--muted)", marginBottom: 12 }}>{loadError}</p>
        <button type="button" className="qc-retry-btn" onClick={() => router.refresh()}>
          다시 시도
        </button>
      </div>
    );
  }

  const generalWaitlist = waitlist.filter((w) => !w.club_slug);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px var(--gutter) 96px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 24 }}>북클럽 신청·대기자 관리</h1>

      {clubs.map((club) => {
        const apps = applications.filter((a) => a.club_slug === club.slug && a.status === "confirmed");
        const waits = waitlist.filter((w) => w.club_slug === club.slug);
        return (
          <section key={club.slug} style={{ marginBottom: 40, border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                {club.title} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>· {apps.length}/{club.capacity}명 · 대기 {waits.length}명</span>
              </h2>
              <a href={`/bookclub/${club.slug}`} className="qc-inline-btn">모임 페이지 보기</a>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>신청자</h3>
            {apps.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>아직 신청자가 없어요.</p>
            ) : (
              <div style={{ overflowX: "auto", marginBottom: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={headStyle}>이름</th>
                      <th style={headStyle}>전화</th>
                      <th style={headStyle}>이메일</th>
                      <th style={headStyle}>메모</th>
                      <th style={headStyle}>신청일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((a) => (
                      <tr key={a.id}>
                        <td style={cellStyle}>{a.name}</td>
                        <td style={cellStyle}>{a.phone}</td>
                        <td style={cellStyle}>{a.email ?? ""}</td>
                        <td style={cellStyle}>{a.note ?? ""}</td>
                        <td style={cellStyle}>{new Date(a.created_at).toLocaleString("ko-KR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {apps.length > 0 && (
              <button
                type="button"
                className="qc-inline-btn"
                style={{ marginBottom: 20 }}
                onClick={() =>
                  downloadCsv(
                    `${club.slug}-신청자.csv`,
                    toCsv(
                      ["이름", "전화", "이메일", "메모", "신청일"],
                      apps.map((a) => [a.name, a.phone, a.email, a.note, new Date(a.created_at).toLocaleString("ko-KR")])
                    )
                  )
                }
              >
                신청자 CSV 다운로드
              </button>
            )}

            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", margin: "16px 0 6px" }}>대기자</h3>
            {waits.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>대기자가 없어요.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto", marginBottom: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={headStyle}>이름</th>
                        <th style={headStyle}>전화</th>
                        <th style={headStyle}>등록일</th>
                        <th style={headStyle}>안내함</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waits.map((w) => (
                        <tr key={w.id}>
                          <td style={cellStyle}>{w.name}</td>
                          <td style={cellStyle}>{w.phone}</td>
                          <td style={cellStyle}>{new Date(w.created_at).toLocaleString("ko-KR")}</td>
                          <td style={cellStyle}>{w.notified_at ? new Date(w.notified_at).toLocaleString("ko-KR") : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="qc-inline-btn"
                  onClick={() =>
                    downloadCsv(
                      `${club.slug}-대기자.csv`,
                      toCsv(
                        ["이름", "전화", "등록일"],
                        waits.map((w) => [w.name, w.phone, new Date(w.created_at).toLocaleString("ko-KR")])
                      )
                    )
                  }
                >
                  대기자 CSV 다운로드
                </button>
              </>
            )}
          </section>
        );
      })}

      <section style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "#fff" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
          전체 알림 신청 <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>· {generalWaitlist.length}명</span>
        </h2>
        {generalWaitlist.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>아직 없어요.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", marginBottom: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={headStyle}>이름</th>
                    <th style={headStyle}>전화</th>
                    <th style={headStyle}>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {generalWaitlist.map((w) => (
                    <tr key={w.id}>
                      <td style={cellStyle}>{w.name}</td>
                      <td style={cellStyle}>{w.phone}</td>
                      <td style={cellStyle}>{new Date(w.created_at).toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="qc-inline-btn"
              onClick={() =>
                downloadCsv(
                  "전체알림신청.csv",
                  toCsv(
                    ["이름", "전화", "등록일"],
                    generalWaitlist.map((w) => [w.name, w.phone, new Date(w.created_at).toLocaleString("ko-KR")])
                  )
                )
              }
            >
              전체 알림 CSV 다운로드
            </button>
          </>
        )}
      </section>
    </div>
  );
}
