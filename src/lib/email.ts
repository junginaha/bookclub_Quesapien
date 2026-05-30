/**
 * Email utilities via Resend
 * RESEND_API_KEY 환경변수 필요
 */
import { Resend } from "resend";

// Lazy-initialize to avoid build-time error when RESEND_API_KEY is not set
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

const FROM = "질문하는 사람들 <hello@quesapience.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com";

// ─── Bookclub join confirmation ───────────────────────────────
export interface BookclubJoinEmailData {
  to: string;
  name: string;
  bookTitle: string;
  hostName: string;
  schedule: string;
  location: string;
  slug: string;
}

export async function sendBookclubJoinEmail(data: BookclubJoinEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set, skipping email send");
    return { success: false, reason: "no_api_key" };
  }

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>북클럽 참가 신청 완료</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE5;font-family:'Noto Sans KR',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #D9CFBC;">
        <!-- Header -->
        <tr>
          <td style="background:#1C1F26;padding:32px 40px;">
            <p style="margin:0;color:#B08A4A;font-size:22px;font-style:italic;font-family:Georgia,serif;">?!</p>
            <p style="margin:8px 0 0;color:rgba(236,227,207,0.6);font-size:12px;letter-spacing:2px;">질문하는 사람들</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:22px;color:#1C1F26;font-family:Georgia,'Noto Serif KR',serif;font-weight:400;">
              북클럽 참가 신청이 완료되었습니다.
            </h1>
            <p style="margin:0 0 32px;font-size:14px;color:#7B7268;">${data.name}님, 함께해주셔서 감사합니다.</p>

            <div style="background:#F4EFE5;border-radius:12px;padding:24px;margin-bottom:32px;">
              <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#A39A8C;">참가 정보</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #D9CFBC;">
                  <span style="font-size:12px;color:#7B7268;width:80px;display:inline-block;">북클럽</span>
                  <strong style="font-size:14px;color:#1C1F26;">${data.bookTitle}</strong>
                </td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #D9CFBC;">
                  <span style="font-size:12px;color:#7B7268;width:80px;display:inline-block;">리더</span>
                  <span style="font-size:14px;color:#1C1F26;">${data.hostName}</span>
                </td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #D9CFBC;">
                  <span style="font-size:12px;color:#7B7268;width:80px;display:inline-block;">일시</span>
                  <span style="font-size:14px;color:#1C1F26;">${data.schedule}</span>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <span style="font-size:12px;color:#7B7268;width:80px;display:inline-block;">장소</span>
                  <span style="font-size:14px;color:#1C1F26;">${data.location}</span>
                </td></tr>
              </table>
            </div>

            <p style="font-size:14px;color:#2A2E37;line-height:1.8;margin:0 0 24px;">
              참가 확정 후 상세 장소 안내가 별도로 발송됩니다.<br />
              궁금한 사항은 답장으로 문의해 주세요.
            </p>

            <a href="${SITE_URL}/bookclub/${data.slug}"
              style="display:inline-block;padding:13px 24px;background:#1C1F26;color:#ECE3CF;border-radius:9999px;font-size:14px;font-weight:500;text-decoration:none;letter-spacing:0.5px;">
              북클럽 상세 보기
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #E5DDCB;">
            <p style="margin:0;font-size:12px;color:#A39A8C;line-height:1.8;">
              질문 → 책 → 대화 → 사람 → 성장<br />
              © 2026 질문하는 사람들 · <a href="${SITE_URL}" style="color:#7B7268;">quesapience.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM,
      to: [data.to],
      subject: `[질문하는 사람들] "${data.bookTitle}" 북클럽 참가 신청이 완료되었습니다`,
      html,
    });
    if (error) throw error;
    return { success: true, id: result?.id };
  } catch (err) {
    console.error("[email] Send failed:", err);
    return { success: false, error: err };
  }
}

// ─── Question of the Day notification ────────────────────────
export async function sendTodayQuestionEmail(to: string, name: string, question: string) {
  if (!process.env.RESEND_API_KEY) return { success: false, reason: "no_api_key" };

  try {
    await getResend().emails.send({
      from: FROM,
      to: [to],
      subject: `오늘의 질문: "${question.slice(0, 40)}…"`,
      html: `<p>${name}님, 오늘의 질문입니다:</p><blockquote style="font-size:18px;font-style:italic;">${question}</blockquote><a href="${SITE_URL}/questions">질문 탐색하기</a>`,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
