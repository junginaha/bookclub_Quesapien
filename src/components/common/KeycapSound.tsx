"use client";

import { useEffect } from "react";

export default function KeycapSound() {
  useEffect(() => {
    const playClick = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        // 키캡 딸깍 소리: 짧은 노이즈 버스트 + 빠른 감쇠
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        // 필터로 키캡 특유의 톡 소리 만들기
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3200;
        filter.Q.value = 0.8;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        src.stop(ctx.currentTime + 0.04);
        src.onended = () => ctx.close();
      } catch { /* 오디오 컨텍스트 미지원 무시 */ }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest(".btn-keycap")) playClick();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return null;
}
