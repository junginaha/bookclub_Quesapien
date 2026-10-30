/**
 * 참여비 결제 호출 — PayApp 결제창을 띄우는 단 하나의 경로.
 *
 * 지금까지 이 코드는 **예약 완료 화면 안에만** 있었다. 그래서 유료 모임을 예약하고
 * 그 화면을 닫으면 사이트에서 다시 결제할 방법이 없었다(운영자에게 연락하는 수밖에).
 * 내 북클럽에서도 같은 호출을 써야 하므로 공용으로 뺐다 — 파라미터가 한 곳에만 있으면
 * 두 화면의 결제 통보가 어긋날 일이 없다.
 *
 * feedbackurl·checkretry가 빠지면 결제 사실이 어디에도 기록되지 않는다(026 + /api/payapp/feedback).
 */
import type { BookClubSession } from "./types";

declare global {
  interface Window {
    PayApp?: {
      setDefault: (key: string, value: string) => void;
      setParam: (key: string, value: string) => void;
      payrequest: () => void;
    };
  }
}

/** PayApp 라이트 결제창 스크립트 — 결제 버튼이 있는 화면에서만 불러온다. */
export const PAYAPP_SCRIPT = "https://lite.payapp.kr/public/api/v2/payapp-lite.js";

/**
 * 결제창을 띄운다. 스크립트가 아직 안 올라왔거나 무료 모임이면 아무 일도 하지 않는다.
 * @returns 띄웠는지 여부 — 호출한 화면이 안내 문구를 바꿀 수 있도록.
 */
export function startPayment(session: BookClubSession, phone: string): boolean {
  const fee = session.fee ?? 0;
  const digits = phone.replace(/\D/g, "");
  if (typeof window === "undefined" || !window.PayApp || fee <= 0 || digits.length < 9) return false;

  window.PayApp.setDefault("userid", "onedaybooks");
  window.PayApp.setDefault("shopname", "질문하는 사람들");
  window.PayApp.setParam("goodname", session.title);
  window.PayApp.setParam("price", String(fee));
  window.PayApp.setParam("recvphone", digits);
  window.PayApp.setParam("memo", "북클럽 참여비");
  window.PayApp.setParam("var1", session.slug);
  // var2 = 신청을 특정하는 값. bookclub_applications는 (club_slug, phone)으로 한 줄이
  // 정해지므로 둘을 var1·var2로 보내면 통보가 어느 신청인지 알 수 있다.
  // recvphone으로 이미 같은 번호가 PayApp에 가므로 새로 나가는 정보는 없다.
  window.PayApp.setParam("var2", digits);
  // 결제 결과 통보를 받을 주소 — 이게 없으면 결제 사실이 어디에도 기록되지 않는다.
  window.PayApp.setParam("feedbackurl", `${window.location.origin}/api/payapp/feedback`);
  // 통보가 실패하면 다시 보내달라(최대 10회).
  window.PayApp.setParam("checkretry", "y");
  window.PayApp.setParam("smsuse", "n");
  window.PayApp.setParam("redirectpay", "1");
  window.PayApp.setParam("skip_cstpage", "y");
  window.PayApp.setParam("openpaytype", "card,kakaopay,naverpay,tosspay,applepay,rbank");
  window.PayApp.payrequest();
  return true;
}
