"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 말로 입력 — 브라우저 음성 인식(Web Speech API)으로 글상자를 채운다.
 *
 * 왜 조용히 실패했나: 카카오톡·네이버 같은 **인앱 브라우저**(iOS WKWebView)는
 * `webkitSpeechRecognition` 객체는 가지고 있지만 마이크 권한이 없다. 그래서
 * 버튼은 멀쩡히 보이는데 눌러도 아무 일이 없었다 — onerror를 아무도 받지 않았다.
 *
 * 이 컴포넌트는 세 가지를 바로잡는다.
 *  1. start()가 던지는 예외와 onerror를 모두 받아 **사유를 사람 말로 보여준다**.
 *  2. onstart도 onerror도 오지 않는 경우(인앱 브라우저에서 흔하다)를 위해 감시 타이머.
 *  3. 그리고 **실제로 되는 길**을 안내한다 — 휴대폰 키보드의 마이크(받아쓰기)는
 *     인앱 브라우저 안에서도 동작한다. 글상자를 누르고 키보드 마이크를 쓰면 된다.
 */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

type Win = {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

/** 키보드 마이크 안내 — 어느 기기든 이 길은 열려 있다. */
const KEYBOARD_TIP = "글상자를 누르고 키보드의 마이크를 눌러 말씀하시면 그대로 적힙니다.";

/**
 * 인앱 브라우저에서만 덧붙이는 한 줄.
 * 마이크를 막는 것은 **사이트가 아니라 지금 쓰는 브라우저**다 — 그 사실을 알려주지
 * 않으면 "이 사이트가 고장났다"로 읽힌다. 기본 브라우저로 옮기면 바로 된다.
 */
const INAPP_TIP = "지금은 앱 안에서 열린 화면이라 마이크가 막혀 있어요. 아래 ⤴(공유)를 눌러 Safari·크롬으로 열면 음성 입력이 됩니다.";

/** 카카오톡·네이버·인스타그램 등 앱 안에서 열린 브라우저. 마이크가 막혀 있다. */
function isInAppBrowser(ua: string): boolean {
  return /KAKAOTALK|NAVER\(inapp|DaumApps|Instagram|FBAN|FBAV|Line\/|KAKAOSTORY|everytimeApp|whale\/.*inapp/i.test(ua);
}

function reasonFor(code: string | undefined, inApp: boolean): string {
  if (inApp) return `${INAPP_TIP} 그대로 쓰시려면, ${KEYBOARD_TIP}`;
  if (code === "not-allowed" || code === "service-not-allowed") {
    return `마이크 사용이 허용되지 않았어요. 브라우저 설정에서 마이크를 허용하거나, ${KEYBOARD_TIP}`;
  }
  if (code === "no-speech") return "소리가 들리지 않았어요. 한 번 더 눌러주세요.";
  if (code === "audio-capture") return `마이크를 찾지 못했어요. ${KEYBOARD_TIP}`;
  if (code === "network") return "잠깐 연결이 어려워요. 조금 뒤에 다시 눌러주세요.";
  return `음성 입력이 열리지 않았어요. ${KEYBOARD_TIP}`;
}

export default function VoiceDictation({
  onText,
  className = "",
  label = "말로 입력",
}: {
  /** 알아들은 말을 넘긴다. 받는 쪽이 기존 글에 붙일지 정한다. */
  onText: (text: string) => void;
  className?: string;
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inApp = useRef(false);

  useEffect(() => {
    const w = window as unknown as Win;
    inApp.current = isInAppBrowser(navigator.userAgent);
    // 인앱 브라우저에서도 버튼은 보여준다 — 눌러보고 안 되면 되는 길을 알려준다.
    setReady(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition) || inApp.current);
    return () => {
      if (watchdog.current) clearTimeout(watchdog.current);
      try { recRef.current?.stop(); } catch { /* 이미 멈췄다 */ }
    };
  }, []);

  function stopWatchdog() {
    if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null; }
  }

  function fail(code?: string) {
    stopWatchdog();
    setListening(false);
    setHint(reasonFor(code, inApp.current));
  }

  function toggle() {
    if (listening) {
      try { recRef.current?.stop(); } catch { /* 무시 */ }
      setListening(false);
      return;
    }
    setHint(null);
    const w = window as unknown as Win;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { fail("not-supported"); return; }

    let rec: SpeechRecognitionLike;
    try { rec = new Ctor(); } catch { fail("not-supported"); return; }
    rec.lang = "ko-KR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = () => { stopWatchdog(); setListening(true); };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(" ").trim();
      if (text) onText(text);
    };
    rec.onend = () => { stopWatchdog(); setListening(false); };
    rec.onerror = (e) => fail(e?.error);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      fail("not-allowed");
      return;
    }
    // onstart도 onerror도 오지 않는 브라우저가 있다 — 그 침묵을 실패로 본다.
    stopWatchdog();
    watchdog.current = setTimeout(() => { if (!recRef.current) return; fail(undefined); }, 1800);
  }

  if (!ready) {
    // 음성 인식이 아예 없는 기기 — 되는 길만 조용히 알려준다.
    return <p className={`qv-dict-hint ${className}`.trim()}>{KEYBOARD_TIP}</p>;
  }

  return (
    <span className={`qv-dict ${className}`.trim()}>
      <button type="button" className="qv-dict-btn" onClick={toggle} aria-pressed={listening}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
        </svg>
        {listening ? "듣는 중… 누르면 멈춰요" : label}
      </button>
      {hint && <p className="qv-dict-hint" role="status">{hint}</p>}
    </span>
  );
}
