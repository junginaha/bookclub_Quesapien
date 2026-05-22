"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Static so values don't change between server/client renders
const particles: { id: number; x: number; y: number; size: number; hue: number; delay: number; dur: number }[] = [
  { id:  0, x: -90,  y: -42, size: 3, hue: 350, delay: 0.0, dur: 5.2 },
  { id:  1, x:  95,  y: -54, size: 2, hue:  30, delay: 0.7, dur: 4.6 },
  { id:  2, x: -128, y:  18, size: 4, hue: 268, delay: 1.3, dur: 6.1 },
  { id:  3, x:  115, y:  32, size: 2, hue: 200, delay: 1.9, dur: 5.5 },
  { id:  4, x: -62,  y:  52, size: 3, hue: 322, delay: 0.9, dur: 4.9 },
  { id:  5, x:  78,  y:  55, size: 2, hue: 148, delay: 2.4, dur: 5.3 },
  { id:  6, x:  48,  y: -65, size: 3, hue:  42, delay: 1.5, dur: 4.3 },
  { id:  7, x: -48,  y: -60, size: 2, hue:   5, delay: 2.9, dur: 5.9 },
  { id:  8, x:  148, y: -16, size: 2, hue: 252, delay: 0.4, dur: 4.8 },
  { id:  9, x: -152, y:  -4, size: 3, hue: 178, delay: 2.1, dur: 6.3 },
  { id: 10, x:  22,  y:  68, size: 2, hue:  58, delay: 3.1, dur: 5.6 },
  { id: 11, x: -22,  y:  64, size: 2, hue:  12, delay: 1.1, dur: 4.7 },
];

const stars: { id: number; x: number; y: number; delay: number; size: number }[] = [
  { id: 0, x: -108, y: -38, delay: 0.6, size: 10 },
  { id: 1, x:  112, y: -44, delay: 1.9, size:  9 },
  { id: 2, x:  -58, y:  58, delay: 3.3, size:  8 },
  { id: 3, x:   84, y:  50, delay: 2.1, size: 10 },
  { id: 4, x:  -30, y: -72, delay: 0.2, size:  7 },
  { id: 5, x:   34, y: -70, delay: 2.8, size:  8 },
];

interface FloatItem {
  text: string;
  delay: number;
  style: React.CSSProperties;
}

const floatingCopy: FloatItem[] = [
  { text: "망설이는 중?",           delay: 0.0, style: { top: "8%",  left: "4%" } },
  { text: "혼자 와도 괜찮아요",     delay: 2.2, style: { top: "6%",  right: "4%" } },
  { text: "오늘은 사람 만나볼래요?", delay: 1.0, style: { bottom: "8%", left: "1%" } },
  { text: "지금 입장 가능",         delay: 2.6, style: { bottom: "9%", right: "3%" } },
  { text: "생각보다 편안합니다",    delay: 4.0, style: { top: "50%", left: "0%", transform: "translateY(-50%)" } },
  { text: "우리도 처음엔 어색했어요", delay: 3.2, style: { top: "50%", right: "0%", transform: "translateY(-50%)" } },
];

export default function MagicalCTAButton() {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 280, damping: 28 });
  const sy = useSpring(my, { stiffness: 280, damping: 28 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left - rect.width  / 2) * 0.14);
    my.set((e.clientY - rect.top  - rect.height / 2) * 0.14);
  };
  const onMouseLeave = () => { mx.set(0); my.set(0); setHovered(false); };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full"
      style={{ minHeight: 180, maxWidth: 640, margin: "0 auto" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Floating microcopy (desktop only) ─────────────── */}
      {floatingCopy.map((c) => (
        <motion.span
          key={c.text}
          className="absolute text-[11px] text-warm-500 italic whitespace-nowrap pointer-events-none hidden lg:block"
          style={c.style}
          animate={{ opacity: [0, 0.65, 0.65, 0], y: [6, 0, -5, -10] }}
          transition={{
            duration: 8,
            delay: c.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.82, 1],
          }}
        >
          {c.text}
        </motion.span>
      ))}

      {/* ── Ambient outer glow ────────────────────────────── */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 340, height: 110,
          top: "50%", left: "50%",
          marginTop: -55, marginLeft: -170,
          background:
            "radial-gradient(ellipse at center, rgba(253,164,175,.3) 0%, rgba(196,181,253,.22) 55%, transparent 70%)",
          filter: "blur(28px)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Floating dot particles ────────────────────────── */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            top:  `calc(50% + ${p.y}px)`,
            left: `calc(50% + ${p.x}px)`,
            background: `hsl(${p.hue} 68% 74%)`,
          }}
          animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0], y: [0, -14, -28] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Star glyphs ───────────────────────────────────── */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute pointer-events-none text-warm-300 select-none"
          style={{
            top:  `calc(50% + ${s.y}px)`,
            left: `calc(50% + ${s.x}px)`,
            fontSize: s.size,
            lineHeight: 1,
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 0] }}
          transition={{ duration: 4.2, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      ))}

      {/* ── Magnetic button ───────────────────────────────── */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="relative z-10"
        onMouseEnter={() => setHovered(true)}
      >
        {/* Rainbow shimmer + breathing glow wrapper */}
        <div className="cta-magical-wrapper rounded-full p-[2px]">
          <motion.div
            whileHover={{ scale: 1.055 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <Link href="/signup" tabIndex={-1}>
              <button
                className="relative overflow-hidden bg-warm-900 text-white px-10 py-[14px] rounded-full font-medium text-base flex items-center gap-2.5 group cursor-pointer"
                onMouseEnter={() => setHovered(true)}
              >
                {/* Inner shimmer on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-white/5 via-white/[0.09] to-white/5" />
                지금 바로 참여하기
                <motion.span
                  animate={{ x: hovered ? 3 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Breathing sub-text ────────────────────────────── */}
      <motion.p
        className="text-[11px] text-warm-400 italic mt-5 z-10"
        animate={{ opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        생각보다 따뜻합니다
      </motion.p>
    </div>
  );
}
