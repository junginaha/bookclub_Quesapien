"use client";

import { motion } from "framer-motion";

const profiles = [
  { name: "지현", bg: "bg-rose-200",    text: "text-rose-600",    status: "online"  },
  { name: "민준", bg: "bg-sky-200",     text: "text-sky-600",     status: "online"  },
  { name: "서연", bg: "bg-amber-200",   text: "text-amber-600",   status: "online"  },
  { name: "도윤", bg: "bg-emerald-200", text: "text-emerald-600", status: "reading" },
  { name: "예린", bg: "bg-violet-200",  text: "text-violet-600",  status: "online"  },
  { name: "현우", bg: "bg-pink-200",    text: "text-pink-600",    status: "online"  },
  { name: "수아", bg: "bg-teal-200",    text: "text-teal-600",    status: "reading" },
  { name: "태양", bg: "bg-orange-200",  text: "text-orange-600",  status: "online"  },
  { name: "다은", bg: "bg-lime-200",    text: "text-lime-700",    status: "online"  },
];

const safetyNotes = [
  { icon: "✦", text: "급하게 친해지지 않아도 됩니다" },
  { icon: "✦", text: "어색하면 책 얘기부터 시작해요" },
  { icon: "✦", text: "질문만 하고 가도 괜찮습니다" },
  { icon: "✦", text: "읽다 말아도 괜찮아요" },
  { icon: "✦", text: "말보다 분위기가 먼저 편해집니다" },
  { icon: "✦", text: "조용히 있어도 환영받는 테이블" },
];

const stickers = [
  { text: "생각 많은 사람 환영",      bg: "bg-amber-50",  border: "border-amber-200",  tilt: "-rotate-2" },
  { text: "조용한 관종 구함",          bg: "bg-rose-50",   border: "border-rose-200",   tilt: "rotate-1"  },
  { text: "눈치 덜 보는 공간 연습중", bg: "bg-sky-50",    border: "border-sky-200",    tilt: "-rotate-1" },
  { text: "사람 냄새 나는 커뮤니티",  bg: "bg-emerald-50",border: "border-emerald-200",tilt: "rotate-2"  },
];

const tickerItems = [
  "3명 방금 참여했어요",
  "오늘 첫 참여자 많아요",
  "혼자 오신 분 67%",
  "조용한 분들도 많아요",
  "처음 참여한 사람들끼리 모인 테이블 있음",
  "낯가림 환영",
  "지금 질문 폭주중",
  "생각 많은 사람 기다리는 중",
];

const stats = [
  {
    value: "67%",
    label: "혼자 오신 분",
    sub: "가장 많은 유형이에요",
    from: "from-rose-50",
    to: "to-orange-50",
    border: "border-rose-100",
  },
  {
    value: "3명",
    label: "방금 새로 참여",
    sub: "5분 이내 기준",
    from: "from-sky-50",
    to: "to-indigo-50",
    border: "border-sky-100",
  },
  {
    value: "4개",
    label: "지금 진행 중인 모임",
    sub: "오늘 추가 2개 예정",
    from: "from-emerald-50",
    to: "to-teal-50",
    border: "border-emerald-100",
  },
];

const tickerFull = [...tickerItems, ...tickerItems];

export default function LiveParticipation() {
  return (
    <section className="bg-white border-y border-warm-100 overflow-hidden">
      <div className="container-base py-16 sm:py-20">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.span
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-5"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            지금 이 순간에도
          </motion.span>

          <motion.h2
            className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            지금도 누군가는 연결되고 있습니다
          </motion.h2>

          <motion.p
            className="text-warm-500 text-base leading-relaxed max-w-sm mx-auto"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
          >
            생각보다 많은 사람들이
            <br />
            비슷한 마음으로 들어옵니다.
          </motion.p>
        </div>

        {/* ── Animated avatar cluster ───────────────────── */}
        <div className="flex justify-center mb-12">
          <div className="relative flex items-center">
            {profiles.map((p, i) => (
              <motion.div
                key={p.name}
                className="relative"
                style={{ marginLeft: i === 0 ? 0 : -14 }}
                initial={{ opacity: 0, y: 10, scale: 0.75 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 420, damping: 26 }}
              >
                <div
                  className={`w-11 h-11 rounded-full ${p.bg} border-[2.5px] border-white flex items-center justify-center shadow-sm`}
                >
                  <span className={`text-sm font-bold ${p.text}`}>{p.name[0]}</span>
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    p.status === "online" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </motion.div>
            ))}

            <motion.div
              className="ml-4 flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.75 }}
            >
              <span className="text-sm font-semibold text-warm-900">+238명</span>
              <span className="text-xs text-warm-400">지금 함께 있어요</span>
            </motion.div>
          </div>
        </div>

        {/* ── Live ticker ───────────────────────────────── */}
        <motion.div
          className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-3 flex items-center gap-3 mb-10 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="overflow-hidden flex-1">
            <motion.div
              className="flex gap-10 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              {tickerFull.map((item, i) => (
                <span key={i} className="text-xs text-emerald-700 font-medium shrink-0">
                  {item}
                  {i < tickerFull.length - 1 && (
                    <span className="text-emerald-400 mx-4">·</span>
                  )}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className={`rounded-2xl bg-gradient-to-br ${s.from} ${s.to} border ${s.border} p-6 flex flex-col gap-2`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="font-serif text-3xl font-bold text-warm-900">{s.value}</span>
              <span className="text-sm font-medium text-warm-700">{s.label}</span>
              <span className="text-[11px] text-warm-400">{s.sub}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Social safety area ────────────────────────── */}
        <div className="rounded-3xl bg-warm-50 border border-warm-100 p-8 sm:p-10">
          <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-6">
            이런 분들이 오세요
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {safetyNotes.map((note, i) => (
              <motion.div
                key={note.text}
                className="flex items-start gap-2.5 p-4 rounded-2xl bg-white border border-warm-100 hover:border-warm-200 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <span className="text-warm-300 mt-0.5 shrink-0 text-[10px]">{note.icon}</span>
                <p className="text-sm text-warm-600 leading-snug">{note.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Memo stickers */}
          <div className="flex flex-wrap gap-2.5">
            {stickers.map((sticker, i) => (
              <motion.span
                key={sticker.text}
                className={`inline-flex items-center px-4 py-2 rounded-xl border ${sticker.bg} ${sticker.border} text-xs text-warm-700 font-medium ${sticker.tilt} cursor-default`}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.09, type: "spring", stiffness: 380 }}
                whileHover={{ scale: 1.06, rotate: 0 }}
              >
                {sticker.text}
              </motion.span>
            ))}
          </div>

          <p className="text-[11px] text-warm-300 italic mt-6 text-center">
            당신 같은 사람 찾고 있었어요
          </p>
        </div>
      </div>
    </section>
  );
}
