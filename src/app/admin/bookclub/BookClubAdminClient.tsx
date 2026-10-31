"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { markAttendance, type AttendanceMark } from "@/lib/actions/attendance";
import { INTEREST_THRESHOLD, interestKey, parseRecSlug } from "@/lib/bookclub/interest";
import { getUpcomingBook } from "@/lib/bookclub/upcoming";

export interface ApplicationRow {
  id: string;
  club_slug: string;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  status: string;
  created_at: string;
  /** 026 적용 전에는 undefined로 온다 — 그 경우 화면에서 결제 열을 숨긴다. */
  paid_at?: string | null;
  payment_state?: string | null;
  /** 027 적용 전에는 undefined. 둘 다 null이면 "아직 확인 안 함"(노쇼와 다르다). */
  attended_at?: string | null;
  no_show_at?: string | null;
}

export interface WaitlistRow {
  id: string;
  club_slug: string | null;
  name: string;
  phone: string;
  created_at: string;
  notified_at: string | null;
  contact_method?: string | null;
  memo?: string | null;
}

interface ClubInfo {
  slug: string;
  title: string;
  capacity: number;
  /** 지난 회차만 참석률에 넣기 위해 쓴다. */
  startsAt: string;
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

const METHOD_LABEL: Record<string, string> = { sms: "휴대폰 문자", kakao: "카카오톡", call: "전화" };

/**
 * 결제 확인 상태. PayApp 통보(026 + /api/payapp/feedback)로만 채워진다.
 * **추정하지 않는다** — 통보가 오기 전에는 "확인 전"이지 "미납"이 아니다.
 * 026이 아직 적용되지 않았으면 컬럼 자체가 없어 undefined로 온다.
 */
function payLabel(a: ApplicationRow): string {
  if (a.paid_at === undefined) return "";            // 026 미적용
  if (a.paid_at) return `완료 ${new Date(a.paid_at).toLocaleDateString("ko-KR")}`;
  if (a.payment_state === "10") return "입금 대기";   // 가상계좌
  if (a.payment_state && ["9", "64", "8", "32"].includes(a.payment_state)) return "취소";
  return "확인 전";
}
/**
 * 출석 상태. 027이 적용되지 않았으면 컬럼 자체가 없어 undefined로 온다 —
 * 그때는 "아직 확인 안 함"이 아니라 **기록할 칸이 없는 것**이라 버튼을 숨긴다.
 */
function attendanceOf(a: ApplicationRow): "unavailable" | "attended" | "no_show" | "none" {
  if (a.attended_at === undefined && a.no_show_at === undefined) return "unavailable";
  if (a.attended_at) return "attended";
  if (a.no_show_at) return "no_show";
  return "none";
}
const ATT_LABEL: Record<string, string> = { attended: "참석", no_show: "노쇼", none: "미확인", unavailable: "" };

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

  // 함께 읽고 싶은 책 — 오픈 예정 카드(next-*) + 회원 추천(rec:)을 책 단위로 묶는다
  const interestGroups = new Map<string, { label: string; rows: WaitlistRow[] }>();
  for (const w of waitlist) {
    const key = w.club_slug ? interestKey(w.club_slug) : null;
    if (!key || !w.club_slug) continue;
    const up = getUpcomingBook(w.club_slug);
    const rec = parseRecSlug(w.club_slug);
    const label = up
      ? `${up.bookTitle}${up.author ? ` — ${up.author}` : ""} (오픈 예정)`
      : rec
        ? `${rec.title}${rec.author ? ` — ${rec.author}` : ""} (회원 추천)`
        : w.club_slug;
    if (!interestGroups.has(key)) interestGroups.set(key, { label, rows: [] });
    interestGroups.get(key)!.rows.push(w);
  }
  const interestList = [...interestGroups.entries()]
    .map(([key, g]) => ({ key, label: g.label, rows: g.rows, people: new Set(g.rows.map((r) => r.phone)).size }))
    .sort((a, b) => b.people - a.people);

  // 지난 회차 집계. 027이 없으면(=기록할 칸이 없으면) 아예 보여주지 않는다.
  const pastSlugs = new Set(clubs.filter((c) => Date.parse(c.startsAt) < Date.now()).map((c) => c.slug));
  const summary = (() => {
    const rows = applications.filter((a) => a.status === "confirmed" && pastSlugs.has(a.club_slug));
    if (!rows.length || rows.every((a) => attendanceOf(a) === "unavailable")) return null;
    const attendedRows = rows.filter((a) => attendanceOf(a) === "attended");
    const byPhone = new Map<string, number>();
    for (const a of attendedRows) byPhone.set(a.phone, (byPhone.get(a.phone) ?? 0) + 1);
    return {
      attended: attendedRows.length,
      noShow: rows.filter((a) => attendanceOf(a) === "no_show").length,
      unchecked: rows.filter((a) => attendanceOf(a) === "none").length,
      people: byPhone.size,
      repeat: [...byPhone.values()].filter((n) => n >= 2).length,
    };
  })();

  // 출석 기록 — 누르면 서버에 적고 화면을 새로 고친다.
  const [attPending, startAtt] = useTransition();
  const [attMsg, setAttMsg] = useState<string | null>(null);
  function mark(id: string, next: AttendanceMark) {
    startAtt(async () => {
      const res = await markAttendance(id, next);
      setAttMsg(res.ok ? null : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px var(--gutter) 96px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 24 }}>북클럽 신청·대기자 관리</h1>
      {summary && (
        <section style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "16px 20px", background: "#fff", marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>지난 모임 집계</h2>
          <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.8 }}>
            참석 <b>{summary.attended}명</b> · 노쇼 <b>{summary.noShow}명</b> · 아직 확인 안 한 신청 <b>{summary.unchecked}건</b>
            <br />
            두 번 이상 오신 분 <b>{summary.repeat}명</b> / 한 번이라도 오신 분 <b>{summary.people}명</b>
            {summary.people > 0 ? ` · 재참여율 ${Math.round((summary.repeat / summary.people) * 100)}%` : ""}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            지난 회차만 셉니다. 출석을 확인하지 않은 신청은 어느 쪽에도 넣지 않습니다.
          </p>
        </section>
      )}
      {attMsg && <p role="status" style={{ fontSize: 13, color: "var(--ink)", background: "#fff6e6", border: "1px solid #e8d9b8", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>{attMsg}</p>}

      {clubs.map((club) => {
        const apps = applications.filter((a) => a.club_slug === club.slug && a.status === "confirmed");
        const waits = waitlist.filter((w) => w.club_slug === club.slug);
        return (
          <section key={club.slug} style={{ marginBottom: 40, border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                {club.title}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>
                  · {apps.length}/{club.capacity}명 · 대기 {waits.length}명
                  {(() => {
                    const att = apps.filter((a) => attendanceOf(a) === "attended").length;
                    const checked = apps.filter((a) => attendanceOf(a) !== "none" && attendanceOf(a) !== "unavailable").length;
                    // 확인한 사람이 하나도 없으면 비율을 적지 않는다 — 0%는 "안 왔다"가 아니다.
                    return checked > 0 ? ` · 참석 ${att}명 (확인 ${checked}명 중)` : "";
                  })()}
                </span>
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
                      <th style={headStyle}>결제</th>
                      <th style={headStyle}>출석</th>
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
                        <td style={cellStyle}>
                          {attendanceOf(a) === "unavailable" ? (
                            ""
                          ) : (
                            <span style={{ display: "inline-flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}>
                              {(["attended", "no_show"] as const).map((k) => {
                                const on = attendanceOf(a) === k;
                                return (
                                  <button
                                    key={k}
                                    type="button"
                                    disabled={attPending}
                                    onClick={() => mark(a.id, on ? "clear" : k)}
                                    aria-pressed={on}
                                    title={on ? "다시 누르면 미확인으로" : ATT_LABEL[k]}
                                    style={{
                                      padding: "3px 9px", fontSize: 12, borderRadius: 999, cursor: "pointer",
                                      border: `1px solid ${on ? (k === "attended" ? "#3f6b4a" : "#9a5a4a") : "var(--line)"}`,
                                      background: on ? (k === "attended" ? "#3f6b4a" : "#9a5a4a") : "#fff",
                                      color: on ? "#fff" : "var(--muted)",
                                    }}
                                  >
                                    {ATT_LABEL[k]}
                                  </button>
                                );
                              })}
                            </span>
                          )}
                        </td>
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
                      ["이름", "전화", "이메일", "결제", "출석", "메모", "신청일"],
                      apps.map((a) => [a.name, a.phone, a.email, payLabel(a), ATT_LABEL[attendanceOf(a)], a.note, new Date(a.created_at).toLocaleString("ko-KR")])
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

      <section style={{ marginBottom: 40, border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "#fff" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
          함께 읽고 싶은 책 <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>· {interestList.length}권</span>
        </h2>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
          같은 책 {INTEREST_THRESHOLD}명 이상이면 북토크 개설 후 연락하세요. 연락은 운영자가 직접 합니다(자동 발송 없음).
        </p>
        {interestList.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>아직 없어요.</p>
        ) : (
          interestList.map((g) => (
            <details key={g.key} style={{ borderTop: "1px solid var(--line)", padding: "10px 0" }}>
              <summary style={{ cursor: "pointer", fontSize: 14, color: "var(--ink)" }}>
                {g.label} · <strong>{g.people}명</strong>
                {g.people >= INTEREST_THRESHOLD && (
                  <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 700, color: "#fff", background: "#173b75", padding: "2px 8px", borderRadius: 999 }}>
                    {INTEREST_THRESHOLD}명 달성
                  </span>
                )}
              </summary>
              <div style={{ overflowX: "auto", margin: "8px 0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={headStyle}>이름</th>
                      <th style={headStyle}>전화</th>
                      <th style={headStyle}>답변 방법</th>
                      <th style={headStyle}>남기신 말</th>
                      <th style={headStyle}>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((w) => (
                      <tr key={w.id}>
                        <td style={cellStyle}>{w.name}</td>
                        <td style={cellStyle}>{w.phone}</td>
                        <td style={cellStyle}>{METHOD_LABEL[w.contact_method ?? ""] ?? ""}</td>
                        <td style={cellStyle}>{w.memo ?? ""}</td>
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
                    `함께읽기-${g.label.slice(0, 20)}.csv`,
                    toCsv(["이름", "전화", "답변 방법", "남기신 말", "등록일"], g.rows.map((w) => [w.name, w.phone, METHOD_LABEL[w.contact_method ?? ""] ?? "", w.memo ?? "", new Date(w.created_at).toLocaleString("ko-KR")]))
                  )
                }
              >
                CSV 다운로드
              </button>
            </details>
          ))
        )}
      </section>

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
