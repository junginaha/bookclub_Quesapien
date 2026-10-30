/**
 * PayApp 결제 결과 통보(feedbackurl).
 *
 * 지금까지 결제 여부를 기록하는 곳이 **아무 데도 없었다** — 유료 모임도 결제 전에
 * `confirmed`로 저장되고, 운영자는 사이트만 봐서는 누가 냈는지 알 수 없었다.
 * 이 라우트가 PayApp의 통보를 받아 `bookclub_applications`에 결제 사실을 남긴다.
 *
 * 공식 매뉴얼(https://www.payapp.kr/dev_center/dev_center01.html) 기준:
 *  - POST로 userid·linkkey·linkval·responsedate·hash·mul_no·pay_state·price·var1·var2 등이 온다.
 *    **필드는 추가될 수 있으므로 모르는 필드는 무시한다.**
 *  - 검증: userid / linkkey / linkval 일치 + hash = sha256(userid + responsedate + 결제KEY) + 금액 일치
 *  - 응답은 **HTTP 200 + 본문 "SUCCESS"** 여야 한다. 그 외는 실패로 보고 최대 10회 재시도한다.
 *  - 리다이렉트(302·JS)를 하면 전달이 정상 처리되지 않는다.
 *  - 여러 번 호출될 수 있으므로 중복 처리를 막아야 한다.
 *
 * pay_state: 1 요청 / 4 결제완료 / 8·32 요청취소 / 9·64 승인취소 / 10 결제대기(가상계좌)
 *            70·71 부분취소 / 99 정기결제 실패
 */
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/bookclub/data";

export const dynamic = "force-dynamic";

/** PayApp은 본문이 "SUCCESS"일 때만 성공으로 본다. 리다이렉트 금지. */
const OK = () => new Response("SUCCESS", { status: 200, headers: { "Content-Type": "text/plain" } });
/** 실패로 돌려주면 PayApp이 재시도한다 — 일시적 오류일 때만 쓴다. */
const RETRY = () => new Response("FAIL", { status: 500, headers: { "Content-Type": "text/plain" } });

function digits(v: string): string {
  return v.replace(/\D/g, "");
}

export async function POST(req: Request) {
  let f: Record<string, string>;
  try {
    const form = await req.formData();
    f = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  } catch {
    // 본문을 못 읽으면 재시도해도 같다 — 조용히 받고 끝낸다.
    return OK();
  }

  const USERID = process.env.PAYAPP_USERID?.trim();
  const LINKKEY = process.env.PAYAPP_LINKKEY?.trim();
  const LINKVAL = process.env.PAYAPP_LINKVAL?.trim();
  const PAYKEY = process.env.PAYAPP_PAY_KEY?.trim();

  // 키가 없으면 **아무것도 결제 완료로 표시하지 않는다.** 검증 없이 기록하면
  // 누구나 이 주소로 POST를 보내 결제한 것처럼 만들 수 있다.
  if (!USERID || !LINKKEY || !LINKVAL || !PAYKEY) {
    console.error("[payapp] 연동 키 미설정 — 통보를 기록하지 않았습니다.", { mul_no: f.mul_no });
    return OK();
  }

  // ── 검증 (매뉴얼의 5가지를 모두 본다) ─────────────────────
  if (f.userid !== USERID || f.linkkey !== LINKKEY || f.linkval !== LINKVAL) {
    console.error("[payapp] 판매자/연동 값 불일치 — 무시", { mul_no: f.mul_no });
    return OK();
  }
  const expected = createHash("sha256").update(`${f.userid}${f.responsedate ?? ""}${PAYKEY}`).digest("hex");
  if (!f.hash || f.hash.toLowerCase() !== expected) {
    console.error("[payapp] 해시 불일치 — 무시", { mul_no: f.mul_no });
    return OK();
  }

  const slug = (f.var1 ?? "").trim();
  const phone = digits(f.var2 ?? f.recvphone ?? "");
  const session = slug ? getSession(slug) : undefined;
  if (!session || phone.length < 9) {
    console.error("[payapp] 신청을 특정할 수 없음", { slug, mul_no: f.mul_no });
    return OK();
  }
  // 금액 일치 — 결제창에 넣은 값은 세션의 참가비다.
  const price = Number(digits(f.price ?? ""));
  if (!Number.isFinite(price) || price !== session.fee) {
    console.error("[payapp] 금액 불일치", { slug, price, fee: session.fee, mul_no: f.mul_no });
    return OK();
  }

  // ── 기록 ────────────────────────────────────────────────
  const state = (f.pay_state ?? "").trim();
  const paid = state === "4"; // 결제완료만 '냈다'로 본다. 10(입금대기)은 아직 아니다.
  try {
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db as any)
      .from("bookclub_applications")
      .update({
        paid_at: paid ? new Date().toISOString() : null,
        payment_ref: f.mul_no ?? null,
        payment_state: state || null,
      })
      .eq("club_slug", session.slug)
      .eq("phone", phone);

    if (error) {
      // 컬럼이 아직 없는 경우(026 미적용)는 재시도해도 달라지지 않는다.
      const code = (error as { code?: string }).code;
      if (code === "PGRST204" || code === "42703") {
        console.error("[payapp] 026 마이그레이션 미적용 — 결제 기록 칸이 없습니다.", { mul_no: f.mul_no, state });
        return OK();
      }
      console.error("[payapp] 기록 실패 — 재시도 요청", { mul_no: f.mul_no, code });
      return RETRY();
    }
  } catch (e) {
    console.error("[payapp] 기록 중 오류 — 재시도 요청", { mul_no: f.mul_no, e });
    return RETRY();
  }

  return OK();
}

/** 브라우저로 직접 열었을 때 — PayApp은 POST만 보낸다. */
export function GET() {
  return new Response("payapp feedback endpoint", { status: 200, headers: { "Content-Type": "text/plain" } });
}
