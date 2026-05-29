export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Existing rows ───────────────────────────────────────────
export interface ProfileRow {
  id: string; email: string; name: string;
  avatar_url: string | null; bio: string | null;
  joined_at: string; session_count: number;
}
export interface QuestionRow {
  id: string; title: string; description: string;
  category: string; tags: string[]; author_id: string;
  created_at: string; session_count: number;
  participant_total: number; is_featured: boolean;
}
export interface SessionRow {
  id: string; question_id: string; host_id: string;
  location: string; address: string | null;
  date: string; start_time: string; end_time: string;
  max_participants: number; current_participants: number;
  status: "upcoming" | "live" | "closed"; created_at: string;
}
export interface SessionParticipantRow {
  id: string; session_id: string; user_id: string; joined_at: string;
}
export interface ReviewRow {
  id: string; session_id: string; author_id: string;
  type: "text" | "photo" | "video"; content: string;
  photo_url: string | null; video_url: string | null;
  quote: string | null; transformation: string | null;
  created_at: string; likes: number;
}
export interface ReviewLikeRow {
  id: string; review_id: string; user_id: string; created_at: string;
}

// ─── Landing Book Club ───────────────────────────────────────
export interface SessionDate { date: string; topic: string; closed?: boolean; }

export interface LandingBookClubRow {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  color: string;
  genre: string | null;
  tag: string | null;
  recommender: string | null;
  reason: string | null;
  emotion_tags: string[];
  is_mini: boolean;
  // editable
  schedule: string | null;
  location: string | null;
  location_url: string | null;
  join_url: string | null;
  description: string | null;
  host_name: string | null;
  host_intro: string | null;
  host_id: string | null;
  max_participants: number | null;
  current_participants: number;
  session_dates: SessionDate[];
  season_number: number | null;
  status: "active" | "closed" | "upcoming";
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Landing Questions ───────────────────────────────────────
export interface LandingQuestionRow {
  id: string;
  content: string;
  author_name: string;
  author_id: string | null;
  likes: number;
  saves: number;
  answers_count: number;
  is_featured: boolean;
  is_today: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface LandingQuestionAnswerRow {
  id: string;
  question_id: string;
  content: string;
  author_name: string;
  author_id: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface LandingQuestionReactionRow {
  id: string;
  question_id: string;
  user_id: string | null;
  session_key: string | null;
  type: "like" | "save";
  created_at: string;
}

// ─── Quiz ────────────────────────────────────────────────────
export type BookMBTI = "POET" | "SAGE" | "SEEKER" | "BRIDGE";

export interface QuizResultRow {
  id: string;
  user_id: string | null;
  session_key: string | null;
  mbti_type: BookMBTI;
  answers: Record<string, string>;
  recommended_slugs: string[];
  created_at: string;
}

// ─── Database type for Supabase client ───────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "joined_at" | "session_count"> & { joined_at?: string; session_count?: number; };
        Update: Partial<ProfileRow>;
      };
      questions: {
        Row: QuestionRow;
        Insert: { id?: string; title: string; description?: string; category: string; tags?: string[]; author_id: string; created_at?: string; session_count?: number; participant_total?: number; is_featured?: boolean; };
        Update: Partial<QuestionRow>;
      };
      sessions: {
        Row: SessionRow;
        Insert: { id?: string; question_id: string; host_id: string; location: string; address?: string | null; date: string; start_time: string; end_time: string; max_participants?: number; current_participants?: number; status?: "upcoming" | "live" | "closed"; created_at?: string; };
        Update: Partial<SessionRow>;
      };
      session_participants: {
        Row: SessionParticipantRow;
        Insert: { id?: string; session_id: string; user_id: string; joined_at?: string; };
        Update: Partial<SessionParticipantRow>;
      };
      reviews: {
        Row: ReviewRow;
        Insert: { id?: string; session_id: string; author_id: string; type?: "text" | "photo" | "video"; content: string; photo_url?: string | null; video_url?: string | null; quote?: string | null; transformation?: string | null; created_at?: string; likes?: number; };
        Update: Partial<ReviewRow>;
      };
      review_likes: {
        Row: ReviewLikeRow;
        Insert: { id?: string; review_id: string; user_id: string; created_at?: string; };
        Update: Partial<ReviewLikeRow>;
      };
      landing_book_clubs: {
        Row: LandingBookClubRow;
        Insert: Omit<LandingBookClubRow, "id" | "created_at" | "updated_at" | "current_participants"> & { id?: string; created_at?: string; updated_at?: string; current_participants?: number; };
        Update: Partial<LandingBookClubRow>;
      };
      landing_questions: {
        Row: LandingQuestionRow;
        Insert: { id?: string; content: string; author_name?: string; author_id?: string | null; is_featured?: boolean; is_today?: boolean; is_approved?: boolean; };
        Update: Partial<LandingQuestionRow>;
      };
      landing_question_answers: {
        Row: LandingQuestionAnswerRow;
        Insert: { id?: string; question_id: string; content: string; author_name?: string; author_id?: string | null; };
        Update: Partial<LandingQuestionAnswerRow>;
      };
      landing_question_reactions: {
        Row: LandingQuestionReactionRow;
        Insert: { id?: string; question_id: string; user_id?: string | null; session_key?: string | null; type: "like" | "save"; };
        Update: Partial<LandingQuestionReactionRow>;
      };
      quiz_results: {
        Row: QuizResultRow;
        Insert: { id?: string; user_id?: string | null; session_key?: string | null; mbti_type: BookMBTI; answers?: Record<string, string>; recommended_slugs?: string[]; };
        Update: Partial<QuizResultRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
