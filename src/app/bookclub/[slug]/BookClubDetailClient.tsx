"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Users, Star, ArrowLeft,
  Clock, CheckCircle,
} from "lucide-react";
import AISummaryBlock from "@/components/seo/AISummaryBlock";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { useAppStore } from "@/lib/store";
import { isAdminEmail } from "@/lib/admin";
import {
  CLUB_COLOR_MAP,
  classifyClub,
  getEventStart,
  isFull,
  isNearFull,
  remainingSeats,
} from "@/lib/bookclub";
import { formatSeoulDate, formatSeoulTime } from "@/lib/time";
import EncoreRequestButton from "@/components/bookclub/EncoreRequestButton";
import BookClubReservation from "@/components/bookclub/BookClubReservation";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function BookClubDetailClient({ club: initialClub }: { club: any; isAdmin?: boolean }) {
  // 클라이언트 측에서 admin 여부 확인 (로그인 상태 즉시 반영)
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = isAdminEmail(currentUser?.email);
  const [club, setClub] = useState<any>(initialClub);

  // ── 어드민 편집 상태 ──────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title:       initialClub.title ?? "",
    schedule:    initialClub.schedule ?? "",
    description: initialClub.description ?? "",
    location:    initialClub.location ?? "",
    host_name:   initialClub.host_name ?? "",
  });
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const bgColor = CLUB_COLOR_MAP[club.color as string] ?? "#1B2536";
  // 지금 함께 읽어요 / 다시 함께 읽어요 — 리스트·홈과 동일한 분류 규칙을 재사용한다.
  const view = classifyClub(club);
  const eventStart = getEventStart(club);
  const remainingRaw = remainingSeats(club); // null이면 자리 수를 표시하지 않는다
  const remaining = remainingRaw ?? 0;
  const nearFull = isNearFull(club);
  const full = isFull(club);
  const registrationClose = club.registration_closes_at
    ? new Date(club.registration_closes_at)
    : eventStart;
  const isClosed = !eventStart
    || eventStart.getTime() <= Date.now()
    || (registrationClose ? registrationClose.getTime() < Date.now() : true)
    || club.status === "closed"
    || !!club.archived_at;
  // 정원이 찬 미래 모임은 앵콜 대상이 아니라 대기 예약 대상이다.
  const isAgain = view === "again" && isClosed;
  const reservationStatus = isClosed ? "closed" : full ? "full" : nearFull ? "closing" : "open";
  const fillPct = club.max_participants ? Math.round(((club.current_participants ?? 0) / club.max_participants) * 100) : 0;
  const reviews: any[] = club.reviews ?? [];
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 5), 0) / reviews.length
    : 0;
  const authorHosts = !!club.author_hosts;
  const description = typeof club.description === "string" ? club.description.trim() : "";
  const whyThisBook = typeof club.why_this_book === "string" ? club.why_this_book.trim() : "";
  const showWhyThisBook = Boolean(whyThisBook && whyThisBook !== description);

  // ── 어드민 저장 ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`/api/book-clubs/${club.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       editForm.title,
          schedule:    editForm.schedule,
          description: editForm.description,
          location:    editForm.location,
          host_name:   editForm.host_name,
          color:       club.color,
        }),
      });
      const json = await res.json() as { club?: any; error?: string };
      if (res.ok && json.club) {
        setClub((prev: any) => ({ ...prev, ...json.club }));
        setSaveMsg("✓ 저장됐어요!");
        setTimeout(() => { setSaveMsg(""); setEditOpen(false); }, 1500);
      } else {
        setSaveMsg(`⚠ ${json.error ?? "저장 실패"}`);
      }
    } catch { setSaveMsg("⚠ 네트워크 오류"); }
    setSaving(false);
  };

  return (
    <>
      <div style={{ paddingTop: 64 }}>

        {/* ── Hero ── */}
        <section style={{
          background: bgColor,
          padding: "80px 0 64px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(255,255,255,0.08), transparent 60%)",
          }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", position: "relative" }}>
            <Link href="/bookclub" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "rgba(255,255,255,0.55)",
              textDecoration: "none", marginBottom: 40,
              transition: "color 0.2s",
            }}>
              <ArrowLeft size={14} /> 북클럽 목록
            </Link>

            <div>
              <div>
                <div style={{
                  fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)", fontFamily: '"EB Garamond", Georgia, serif',
                  fontStyle: "normal", marginBottom: 16,
                }}>
                  {club.genre ?? "북클럽"} · {club.tag}
                </div>

                {/* 어드민 편집 버튼 */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      // 편집 열 때마다 현재 club 상태로 폼 초기화
                      setEditForm({
                        title:       club.title ?? "",
                        schedule:    club.schedule ?? "",
                        description: club.description ?? "",
                        location:    club.location ?? "",
                        host_name:   club.host_name ?? "",
                      });
                      setSaveMsg("");
                      setEditOpen(true);
                    }}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:16, padding:"6px 14px", borderRadius:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.8)", fontSize:12.5, cursor:"pointer", transition:"background .2s" }}
                    onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)"}
                    onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.12)"}
                  >
                    ✏️ 북토크 정보 편집
                  </button>
                )}

                <h1 style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontSize: "clamp(28px, 5vw, 56px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "rgba(255,255,255,0.95)",
                  marginBottom: 12,
                }}>
                  {club.title}
                </h1>

                {club.author && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)" }}>
                      함께 읽는 작가 · {club.author}
                      {authorHosts && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#FFD98A", fontWeight: 500 }}>
                          {club.author === club.host_name ? "저자 직접 진행" : "저자와의 만남"}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, maxWidth: 620, marginBottom: 0, whiteSpace: "pre-line" }}>
                  {description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Grid ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px clamp(20px, 4vw, 48px) 120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }} className="grid-responsive">

            {/* ── Left Column ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>

              {/* 진행 소개 — 실제 소개가 있을 때만 노출한다. */}
              {(club.host_philosophy || club.host_intro) && <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                  Host — 모임 진행
                </div>
                <div style={{
                  display: "flex", gap: 24, alignItems: "flex-start",
                  padding: 32, borderRadius: 16,
                  border: "1px solid var(--line-soft)",
                  background: "rgba(255,255,255,0.5)",
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                    background: bgColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, color: "white", fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  }}>
                    ?!
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                      <h2 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>
                        질문하는 사람들
                      </h2>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75, marginBottom: 16 }}>
                      {club.host_philosophy ?? club.host_intro}
                    </p>
                    {(club.host_sessions_count != null || club.host_books_read != null || club.host_rating != null) && <div style={{ display: "flex", gap: 20 }}>
                      {[
                        club.host_sessions_count != null ? { value: club.host_sessions_count, label: "진행한 북토크" } : null,
                        club.host_books_read != null ? { value: club.host_books_read, label: "읽은 책" } : null,
                        club.host_rating != null ? { value: `${Number(club.host_rating).toFixed(1)}점`, label: "평균 후기" } : null,
                      ].filter(Boolean).map((s: any) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 22, fontWeight: 400, color: "var(--ink)" }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>}
                  </div>
                </div>
              </section>}

              {/* 왜 이 책인가 */}
              {showWhyThisBook && <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                  Why — 왜 이 책인가
                </div>
                <p style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontSize: 18, color: "var(--ink-soft)", lineHeight: 1.85,
                  borderLeft: `3px solid ${bgColor}`, paddingLeft: 24,
                }}>
                  {whyThisBook}
                </p>
              </section>}

              {/* 핵심 질문들 */}
              {(club.key_questions ?? []).length > 0 && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    Questions — 이번 북토크의 질문들
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(club.key_questions as string[]).map((q, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 16, alignItems: "flex-start",
                        padding: "20px 24px", borderRadius: 12,
                        background: i % 2 === 0 ? "rgba(255,255,255,0.5)" : "transparent",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <span style={{
                          fontFamily: '"EB Garamond", Georgia, serif',
                          fontSize: 36, fontStyle: "normal",
                          color: bgColor, opacity: 0.4,
                          lineHeight: 1, flexShrink: 0, marginTop: -4,
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 16, color: "var(--ink)", lineHeight: 1.65 }}>
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 이런 분께 */}
              {(club.recommended_for ?? []).length > 0 && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    이런 분께 드려요
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(club.recommended_for as string[]).map((rec, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "var(--ink-soft)" }}>
                        <CheckCircle size={16} style={{ color: bgColor, flexShrink: 0 }} />
                        {rec}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 진행 방식 */}
              {club.session_format && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    Format — 진행 방식
                  </div>
                  <div style={{
                    padding: "24px", borderRadius: 12,
                    background: "rgba(255,255,255,0.4)", border: "1px solid var(--line-soft)",
                    fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75,
                  }}>
                    {club.session_format}
                  </div>
                </section>
              )}

              {/* 후기 */}
              {reviews.length > 0 && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                      Reviews — 참여자 후기
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={14} style={{ color: "#FFD700", fill: "#FFD700" }} />
                      <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500 }}>{avgRating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>({reviews.length}개)</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {reviews.map((r: any) => (
                      <div key={r.id} style={{
                        padding: "24px", borderRadius: 12,
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: bgColor,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, color: "white", fontWeight: 600,
                          }}>
                            {r.author_name?.[0] ?? "?"}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{r.author_name}</div>
                            <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                              {Array.from({ length: r.rating ?? 5 }).map((_, i) => (
                                <Star key={i} size={10} style={{ color: "#FFD700", fill: "#FFD700" }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75 }}>
                          &ldquo;{r.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="sidebar-hide">
              {/* Sticky Info Card */}
              <div style={{
                position: "sticky", top: 88,
                padding: 28, borderRadius: 16,
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                display: "flex", flexDirection: "column", gap: 20,
              }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                    {isAgain ? "지난 일정 & 장소" : "일정 & 장소"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <Calendar size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>
                        {eventStart ? `${formatSeoulDate(eventStart)} ${formatSeoulTime(eventStart)}` : (club.schedule || "일정 협의 중")}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>약 2시간 30분</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <MapPin size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div>{[club.area, club.location].filter(Boolean).join(" · ") || "장소 미정"}</div>
                        {club.location_detail && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{club.location_detail}</div>
                        )}
                      </div>
                    </div>
                    {!isAgain && (
                      <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "center" }}>
                        <Users size={15} style={{ flexShrink: 0 }} />
                        <span>{club.current_participants ?? 0}명 / {club.max_participants ?? 8}명</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participation bar — 과거/앵콜 카드에는 자리 수를 표시하지 않는다 */}
                {!isAgain && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                      <span>참여 현황</span>
                      <span>{fillPct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 9999, background: "var(--line-soft)" }}>
                      <div style={{
                        height: "100%", borderRadius: 9999,
                        width: `${fillPct}%`,
                        background: nearFull ? "#EF4444" : bgColor,
                        transition: "width 0.3s",
                      }} />
                    </div>
                    {nearFull && (
                      <div style={{ fontSize: 12, color: "#EF4444", marginTop: 6, fontWeight: 500 }}>
                        잔여 {remaining}석 — 마감 임박
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                {isAgain ? (
                  <EncoreRequestButton clubSlug={club.slug} />
                ) : (
                  <>
                    <BookClubReservation
                      event={{
                        slug: club.slug,
                        bookTitle: club.title,
                        startsAt: eventStart?.toISOString() ?? "",
                        place: club.location ?? "장소 미정",
                        status: reservationStatus,
                        nameExample: club.name_example,
                      }}
                      disabled={isClosed}
                      label={full ? "대기 예약하기" : "참여 예약하기"}
                      style={{
                        width: "100%", padding: "15px 0",
                        borderRadius: 12,
                        background: isClosed ? "var(--line-soft)" : bgColor,
                        color: isClosed ? "var(--muted)" : "white",
                        fontSize: 15, fontWeight: 600,
                        border: "none", cursor: isClosed ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "opacity 0.2s",
                      }}
                    />

                    {!isClosed && (
                      <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
                        예약 결과와 취소 기능은 접수 화면에서 바로 확인할 수 있어요.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Emotion tags */}
              {(club.emotion_tags ?? []).length > 0 && (
                <div style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    태그
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(club.emotion_tags as string[]).map((tag) => (
                      <span key={tag} style={{
                        fontSize: 12, padding: "4px 10px",
                        borderRadius: 9999, background: "var(--bg-warm)",
                        color: "var(--ink-soft)",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stage 5: Internal Related Links ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <RelatedLinks
          title="관련 콘텐츠"
          items={[
            { label: "질문 아카이브", href: "/questions", type: "question" },
            { label: "모든 북클럽 보기", href: "/bookclub", type: "booktalk" },
            { label: "후기 아카이브", href: "/archive", type: "review" },
          ]}
        />
      </div>

      {/* ── Stage 3: AI Summary Block ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <AISummaryBlock
          what={`${club.title ?? "이 북토크"}는 ${club.author ? `${club.author}의 ` : ""}${club.genre ?? "책"}을 중심으로 질문하는 사람들이 진행하는 오프라인 북토크이다.`}
          why={showWhyThisBook ? whyThisBook : undefined}
          who={(club.recommended_for ?? ["독서를 좋아하는 분", "새로운 사람을 만나고 싶은 분"]).join(", ")}
          bullets={[
            `장소: ${club.location ?? "서울"}`,
            `인원: 최대 ${club.max_participants ?? 8}명 소규모`,
            `방식: ${club.session_format ?? "원형 대화 방식"}`,
          ]}
        />
      </div>

      {/* ── Floating CTA (Mobile) ── */}
      {!isClosed && eventStart && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px clamp(20px, 4vw, 48px)",
          background: "rgba(244,239,229,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--line)",
          zIndex: 50,
          display: "flex", alignItems: "center", gap: 12,
        }} className="md:hidden">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{club.title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {full ? "대기 예약 가능" : remainingRaw !== null ? `잔여 ${remaining}석` : "예약 가능"}
            </div>
          </div>
          <BookClubReservation
            event={{
              slug: club.slug,
              bookTitle: club.title,
              startsAt: eventStart.toISOString(),
              place: club.location ?? "장소 미정",
              status: reservationStatus,
              nameExample: club.name_example,
            }}
            label={full ? "대기 예약" : "참여 예약"}
            style={{
              padding: "12px 24px", borderRadius: 9999,
              background: bgColor, color: "white",
              fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer",
              flexShrink: 0,
            }}
          />
        </div>
      )}

      {/* ── 어드민 편집 패널 ── */}
      {isAdmin && editOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(20,24,31,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-start", justifyContent:"flex-end" }}
          onClick={() => setEditOpen(false)}>
          <div style={{ width:"min(460px,100vw)", height:"100vh", background:"var(--bg)", overflowY:"auto", padding:"24px 28px", boxShadow:"-16px 0 40px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <h2 style={{ fontFamily:"var(--font-noto-serif-kr), Georgia, serif", fontSize:18, fontWeight:500, color:"var(--ink)", margin:0 }}>
                북토크 정보 편집
              </h2>
              <button onClick={() => setEditOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--muted)" }}>✕</button>
            </div>

            {[
              { label:"제목", key:"title", placeholder:"예: 다정함의 발명 북토크", type:"text" },
              { label:"일시", key:"schedule", placeholder:"예: 2026년 7월 5일 (토) 오후 3시 – 5시 30분", type:"text" },
              { label:"장소", key:"location", placeholder:"예: 서울 서초구 교대역 인근", type:"text" },
              { label:"진행자", key:"host_name", placeholder:"예: 정해린", type:"text" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>{label}</label>
                <input
                  type={type}
                  value={(editForm as any)[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:"1px solid var(--line-soft)", background:"rgba(255,255,255,0.7)", color:"var(--ink)", outline:"none", boxSizing:"border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>세부내용</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="이 북클럽에 대해 소개해주세요."
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:"1px solid var(--line-soft)", background:"rgba(255,255,255,0.7)", color:"var(--ink)", outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"var(--font-noto-serif-kr), Georgia, serif" }}
              />
            </div>

            {saveMsg && (
              <div style={{ marginBottom:12, padding:"9px 14px", borderRadius:8, background: saveMsg.startsWith("✓") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border:`1px solid ${saveMsg.startsWith("✓") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, fontSize:13, color: saveMsg.startsWith("✓") ? "#10B981" : "#EF4444" }}>
                {saveMsg}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setEditOpen(false)} style={{ flex:1, padding:"11px 0", borderRadius:10, fontSize:14, background:"none", border:"1px solid var(--line)", color:"var(--muted)", cursor:"pointer" }}>
                취소
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:"11px 0", borderRadius:10, fontSize:14, fontWeight:600, background:"var(--ink)", color:"var(--cream-on-dark)", border:"none", cursor:"pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "저장 중…" : "저장 · 업데이트"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .sidebar-hide { display: none !important; }
        }
      `}</style>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
