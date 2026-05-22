export type QuestionCategory =
  | "관계"
  | "자아"
  | "사회"
  | "감정"
  | "철학"
  | "일과삶"
  | "사랑"
  | "성장";

export type SessionStatus = "upcoming" | "live" | "closed";

export type ReviewType = "text" | "photo" | "video";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  joined_at: string;
  session_count: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  category: QuestionCategory;
  tags: string[];
  author: User;
  created_at: string;
  session_count: number;
  participant_total: number;
  is_featured?: boolean;
}

export interface BookClubSession {
  id: string;
  question: Question;
  host: User;
  location: string;
  address?: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: SessionStatus;
  related_books?: Book[];
  discussion_questions?: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
  isbn?: string;
}

export interface Review {
  id: string;
  session: BookClubSession;
  author: User;
  type: ReviewType;
  content: string;
  photo_url?: string;
  video_url?: string;
  quote?: string;
  transformation?: string;
  created_at: string;
  likes: number;
}

export interface AIGenerateRequest {
  keyword: string;
  context?: string;
}

export interface AIGenerateResponse {
  statement: string;
  discussion_questions: string[];
  recommended_books: Book[];
  icebreaker_questions: string[];
}
