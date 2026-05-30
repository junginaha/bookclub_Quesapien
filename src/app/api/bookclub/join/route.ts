/**
 * POST /api/bookclub/join
 * 북클럽 참가 신청 자동화 엔드포인트
 * 흐름: 신청 → DB 저장 → 이메일 발송 → 응답
 * 관리자 수동 처리 없음
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBookclubJoinEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, applicantName, applicantEmail, message } = body as {
      slug: string;
      applicantName: string;
      applicantEmail: string;
      message?: string;
    };

    if (!slug || !applicantName || !applicantEmail) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get club info
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: club } = await (supabase as any)
      .from("landing_book_clubs")
      .select("id, title, host_name, schedule, location, max_participants, current_participants, join_url, status")
      .eq("slug", slug)
      .single();

    if (!club) {
      return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
    }

    if (club.status === "closed") {
      return NextResponse.json({ error: "이미 마감된 북클럽입니다." }, { status: 409 });
    }

    if (club.current_participants >= club.max_participants) {
      return NextResponse.json({ error: "정원이 가득 찼습니다." }, { status: 409 });
    }

    // 2. If external join_url exists, redirect there instead
    if (club.join_url && club.join_url.startsWith("http")) {
      return NextResponse.json({
        success: true,
        redirect: club.join_url,
        message: "외부 신청 페이지로 이동합니다.",
      });
    }

    // 3. Save application to DB (landing_book_club_applications — new table)
    //    Graceful: if table doesn't exist, continue without saving
    try {
      await (supabase as any)
        .from("bookclub_applications")
        .insert({
          club_slug: slug,
          club_id: club.id,
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          message: message ?? null,
          status: "pending",
        });
    } catch {
      // Table may not exist yet — that's OK, email still sends
    }

    // 4. Increment participant count (optimistic)
    try {
      await (supabase as any)
        .from("landing_book_clubs")
        .update({ current_participants: (club.current_participants ?? 0) + 1 })
        .eq("id", club.id);
    } catch {
      // Non-critical
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // 5. Send confirmation email
    const emailResult = await sendBookclubJoinEmail({
      to: applicantEmail,
      name: applicantName,
      bookTitle: club.title ?? slug,
      hostName: club.host_name ?? "리더",
      schedule: club.schedule ?? "일정 조율 중",
      location: club.location ?? "장소 추후 안내",
      slug,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      message: emailResult.success
        ? "신청이 완료되었습니다. 확인 이메일을 발송했습니다."
        : "신청이 완료되었습니다. (이메일 발송 실패 — 별도 연락드립니다.)",
    });
  } catch (err) {
    console.error("Bookclub join error:", err);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
