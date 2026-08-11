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
  // Qsapiens 2.0 — 009_profiles_v2.sql
  nickname: string;
  phone: string | null;
  home_region: string | null;             // geography(point,4326), PostGIS WKB/GeoJSON as returned by PostgREST
  is_operator: boolean;
  privacy_consented_at: string | null;
  phone_consented_at: string | null;
  deactivated_at: string | null;
  onboarding_completed_at: string | null;
}

export interface EventRow {
  id: number;
  user_id: string | null;
  name: string;
  props: Json | null;
  created_at: string;
}

// ─── Qsapiens 2.0 M1 — 010_clubs_meetings.sql ─────────────
export interface ClubVibe {
  faq?: { q: string; a: string }[];
  review_excerpts?: string[];
  format_note?: string;
}

export interface ClubRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;                // geography(point,4326)
  location_name: string | null;
  schedule_note: string | null;
  capacity: number | null;
  join_policy: "open" | "approval";
  vibe: ClubVibe | null;
  owner_id: string | null;
  created_at: string;
}

export interface MembershipRow {
  club_id: string;
  user_id: string;
  role: "owner" | "host" | "member";
  status: "active" | "pending" | "waitlist" | "left";
  joined_at: string;
}

export interface MeetingRow {
  id: string;
  club_id: string;
  book_title: string | null;
  book_isbn: string | null;
  starts_at: string;
  place_name: string | null;
  capacity: number | null;
  status: "scheduled" | "done" | "canceled";
  created_at: string;
}

export interface MeetingAttendanceRow {
  meeting_id: string;
  user_id: string;
  status: "applied" | "pending" | "waitlist" | "attended" | "no_show" | "canceled";
  created_at: string;
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
        Insert: Omit<ProfileRow, "joined_at" | "session_count" | "is_operator"> & { joined_at?: string; session_count?: number; is_operator?: boolean; };
        Update: Partial<ProfileRow>;
      };
      events: {
        Row: EventRow;
        Insert: { id?: number; user_id?: string | null; name: string; props?: Json | null; created_at?: string; };
        Update: Partial<EventRow>;
      };
      clubs: {
        Row: ClubRow;
        Insert: Omit<ClubRow, "id" | "created_at" | "join_policy"> & { id?: string; created_at?: string; join_policy?: "open" | "approval"; };
        Update: Partial<ClubRow>;
      };
      memberships: {
        Row: MembershipRow;
        Insert: Omit<MembershipRow, "role" | "status" | "joined_at"> & { role?: "owner" | "host" | "member"; status?: "active" | "pending" | "waitlist" | "left"; joined_at?: string; };
        Update: Partial<MembershipRow>;
      };
      meetings: {
        Row: MeetingRow;
        Insert: Omit<MeetingRow, "id" | "created_at" | "status"> & { id?: string; created_at?: string; status?: "scheduled" | "done" | "canceled"; };
        Update: Partial<MeetingRow>;
      };
      meeting_attendances: {
        Row: MeetingAttendanceRow;
        Insert: Omit<MeetingAttendanceRow, "status" | "created_at"> & { status?: MeetingAttendanceRow["status"]; created_at?: string; };
        Update: Partial<MeetingAttendanceRow>;
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
