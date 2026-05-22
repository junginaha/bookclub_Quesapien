import Link from "next/link";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookClubSession } from "@/types";
import {
  formatSessionDate,
  getCategoryColor,
  getParticipantRatio,
} from "@/lib/utils";

interface LiveSessionsProps {
  sessions: BookClubSession[];
}

export default function LiveSessions({ sessions }: LiveSessionsProps) {
  return (
    <section className="bg-white">
      <div className="container-base py-16 sm:py-20">
        <div className="flex items-start justify-between gap-3 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest">
                지금 참여 가능
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                실시간 사람 연결중
              </span>
            </div>
            <h2 className="section-title">오늘의 모임</h2>
            <p className="section-subtitle">지금 바로 참여할 수 있는 북클럽 모임이에요.</p>
            <p className="text-[11px] text-warm-300 italic mt-1">
              급하게 안 친해져도 됩니다
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <Link
              href="/sessions"
              className="text-sm text-warm-500 hover:text-warm-900 transition-colors flex items-center gap-1 shrink-0"
            >
              전체 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[11px] text-warm-300 italic">지적 수다 가능 구역</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href="/sessions">
            <Button variant="outline" className="w-full gap-2">
              모든 모임 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="text-center text-[11px] text-warm-300 italic mt-8">
          현재 질문 폭주중 &nbsp;·&nbsp; 조용한 관종 환영
        </p>
      </div>
    </section>
  );
}

function SessionCard({ session }: { session: BookClubSession }) {
  const ratio = getParticipantRatio(
    session.current_participants,
    session.max_participants
  );
  const isFull = session.current_participants >= session.max_participants;
  const isLive = session.status === "live";

  return (
    <div className="card-base p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isLive && (
              <Badge variant="live" className="gap-1.5">
                <span className="live-dot" />
                진행 중
              </Badge>
            )}
            {!isLive && (
              <Badge variant="active">참여 가능</Badge>
            )}
            <span className={`tag-base ${getCategoryColor(session.question.category)}`}>
              {session.question.category}
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold text-warm-900 leading-snug line-clamp-2">
            &ldquo;{session.question.title}&rdquo;
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            {formatSessionDate(session.date)}{" "}
            {session.start_time} — {session.end_time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{session.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>
            {session.current_participants}/{session.max_participants}명 참여 중
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-400">
            {isFull ? "마감" : `${session.max_participants - session.current_participants}자리 남음`}
          </span>
          <span className="font-medium text-warm-700">{ratio}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              ratio >= 90
                ? "bg-red-400"
                : ratio >= 60
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
            style={{ width: `${Math.min(ratio, 100)}%` }}
          />
        </div>
      </div>

      <Link href={`/questions/${session.question.id}`}>
        <Button
          className="w-full"
          variant={isFull ? "outline" : "default"}
          disabled={isFull}
        >
          {isFull ? "마감된 모임" : "지금 참여하기"}
        </Button>
      </Link>
    </div>
  );
}
