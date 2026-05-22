"use client";

import { useAppStore } from "@/lib/store";
import FeaturedQuestion from "./FeaturedQuestion";
import LiveSessions from "./LiveSessions";
import ReviewHighlights from "./ReviewHighlights";
import PopularQuestions from "./PopularQuestions";
import type { Question, BookClubSession, Review } from "@/types";

export default function HomeClient() {
  const storeQuestions = useAppStore((s) => s.questions);
  const storeSessions  = useAppStore((s) => s.sessions);
  const storeReviews   = useAppStore((s) => s.reviews);

  // 스토어 데이터를 기존 타입으로 변환
  const toQuestion = (q: (typeof storeQuestions)[0]): Question => ({
    id: q.id,
    title: q.title,
    description: q.description,
    category: q.category as Question["category"],
    tags: q.tags,
    author: { id: q.author_id, name: q.author_name, avatar_url: q.author_avatar, email: "", bio: undefined, joined_at: "", session_count: 0 },
    created_at: q.created_at,
    session_count: q.session_count,
    participant_total: q.participant_total,
    is_featured: q.is_featured,
  });

  const toSession = (s: (typeof storeSessions)[0]): BookClubSession => {
    const q = storeQuestions.find((qq) => qq.id === s.question_id);
    return {
      id: s.id,
      question: q ? toQuestion(q) : { id: s.question_id, title: "", description: "", category: "자아" as const, tags: [], author: { id: "", name: "", avatar_url: undefined, email: "", bio: undefined, joined_at: "", session_count: 0 }, created_at: "", session_count: 0, participant_total: 0 },
      host: { id: s.host_id, name: "", avatar_url: undefined, email: "", bio: undefined, joined_at: "", session_count: 0 },
      location: s.location,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      max_participants: s.max_participants,
      current_participants: s.current_participants,
      status: s.status,
    };
  };

  const toReview = (r: (typeof storeReviews)[0]): Review => {
    const s = storeSessions.find((ss) => ss.id === r.session_id);
    const q = storeQuestions.find((qq) => qq.id === r.question_id);
    return {
      id: r.id,
      session: s ? toSession(s) : { id: r.session_id, question: { id: r.question_id, title: "", description: "", category: "자아" as const, tags: [], author: { id: "", name: "", avatar_url: undefined, email: "", bio: undefined, joined_at: "", session_count: 0 }, created_at: "", session_count: 0, participant_total: 0 }, host: { id: "", name: "", avatar_url: undefined, email: "", bio: undefined, joined_at: "", session_count: 0 }, location: "", date: "", start_time: "", end_time: "", max_participants: 0, current_participants: 0, status: "closed" as const },
      author: { id: r.author_id, name: r.author_name, avatar_url: r.author_avatar, email: "", bio: undefined, joined_at: "", session_count: 0 },
      type: r.type,
      content: r.content,
      photo_url: r.photo_url,
      quote: r.quote,
      transformation: r.transformation,
      created_at: r.created_at,
      likes: r.likes,
    };
  };

  const featuredQuestion = storeQuestions.find((q) => q.is_featured);
  const liveSessions = storeSessions
    .filter((s) => s.status === "live" || s.status === "upcoming")
    .slice(0, 4);
  const popularQuestions = [...storeQuestions]
    .sort((a, b) => b.participant_total - a.participant_total)
    .slice(0, 4);
  const recentReviews = [...storeReviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  if (!featuredQuestion) return null;

  return (
    <>
      <FeaturedQuestion question={toQuestion(featuredQuestion)} />
      <LiveSessions sessions={liveSessions.map(toSession)} />
      <ReviewHighlights reviews={recentReviews.map(toReview)} />
      <PopularQuestions questions={popularQuestions.map(toQuestion)} />
    </>
  );
}
