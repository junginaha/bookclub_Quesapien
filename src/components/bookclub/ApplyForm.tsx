"use client";

import Script from "next/script";
import { useId, useState } from "react";
import { applyToBookClub } from "@/lib/actions/bookclub";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PayApp?: {
      setDefault: (key: string, value: string) => void;
      setParam: (key: string, value: string) => void;
      payrequest: () => void;
    };
  }
}

export default function ApplyForm({
  clubSlug,
  fee = 0,
  productName = "질문하는 사람들 북클럽",
}: {
  clubSlug: string;
  fee?: number;
  productName?: string;
}) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const noteId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState("");
  const [result, setResult] = useState<
    { kind: "confirmed" | "just_filled_waitlisted" | "duplicate" } | { error: string } | null
  >(null);

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await applyToBookClub({ clubSlug, name, phone, email, note, website });
      if (!res.ok) {
        setResult({ error: res.error });
        return;
      }
      setResult({ kind: res.kind });
      if (res.kind === "confirmed") setConfirmedPhone(phone.trim());
      if (res.kind !== "duplicate") {
        setName(""); setPhone(""); setEmail(""); setNote("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function pay() {
    if (!window.PayApp || fee <= 0 || !confirmedPhone) return;
    window.PayApp.setDefault("userid", "onedaybooks");
    window.PayApp.setDefault("shopname", "질문하는 사람들");
    window.PayApp.setParam("goodname", productName);
    window.PayApp.setParam("price", String(fee));
    window.PayApp.setParam("recvphone", confirmedPhone);
    window.PayApp.setParam("memo", "북클럽 참여비");
    window.PayApp.setParam("var1", clubSlug);
    window.PayApp.setParam("smsuse", "n");
    window.PayApp.setParam("redirectpay", "1");
    window.PayApp.setParam("skip_cstpage", "y");
    window.PayApp.setParam("openpaytype", "card,kakaopay,naverpay,tosspay,applepay,rbank");
    window.PayApp.payrequest();
  }

  if (result && "kind" in result) {
    if (result.kind === "confirmed") {
      return (
        <div className="qd-form-success">
          <p className="qd-form-msg">자리를 확인했습니다. 참여 신청이 완료됐습니다.</p>
          {fee > 0 ? (
            <>
              <Script src="https://lite.payapp.kr/public/api/v2/payapp-lite.js" strategy="afterInteractive" />
              <Button type="button" variant="primary" className="w-full min-h-[48px] text-[15px]" onClick={pay}>
                {fee.toLocaleString("ko-KR")}원 결제하기
              </Button>
              <small className="qd-payment-note">카드 · 카카오페이 · 네이버페이 · 토스페이 · 애플페이 · 계좌이체</small>
            </>
          ) : null}
        </div>
      );
    }
    if (result.kind === "just_filled_waitlisted") return <p className="qd-form-msg">방금 마감되어 대기자로 등록했습니다.</p>;
    if (result.kind === "duplicate") return <p className="qd-form-msg">이미 신청하셨습니다.</p>;
  }

  return (
    <form className="qd-form" onSubmit={handleSubmit} data-club-slug={clubSlug} aria-label="참가 신청">
      <div className="qd-field"><label htmlFor={nameId}>이름</label><input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></div>
      <div className="qd-field"><label htmlFor={phoneId}>휴대전화</label><input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required /></div>
      <div className="qd-field"><label htmlFor={emailId}>이메일 (선택)</label><input id={emailId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      <div className="qd-field"><label htmlFor={noteId}>전하고 싶은 말 (선택)</label><textarea id={noteId} rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position:"absolute", left:"-9999px", width:1, height:1, opacity:0 }} />
      <Button type="submit" variant="primary" className="self-start max-[480px]:self-stretch max-[480px]:w-full" disabled={!valid || submitting}>
        {submitting ? "확인 중…" : fee > 0 ? "참여 신청 후 결제" : "참여 신청"}
      </Button>
      {result && "error" in result && <p className="qd-form-msg is-error">{result.error}</p>}
    </form>
  );
}
