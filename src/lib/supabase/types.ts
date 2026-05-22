export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Row types ────────────────────────────────────────────────
export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  joined_at: string;
  session_count: number;
}

export interface QuestionRow {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author_id: string;
  created_at: string;
  session_count: number;
  participant_total: number;
  is_featured: boolean;
}

export interface SessionRow {
  id: string;
  question_id: string;
  host_id: string;
  location: string;
  address: string | null;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: "upcoming" | "live" | "closed";
  created_at: string;
}

export interface SessionParticipantRow {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
}

export interface ReviewRow {
  id: string;
  session_id: string;
  author_id: string;
  type: "text" | "photo" | "video";
  content: string;
  photo_url: string | null;
  video_url: string | null;
  quote: string | null;
  transformation: string | null;
  created_at: string;
  likes: number;
}

export interface ReviewLikeRow {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

// ─── Database type for Supabase client ───────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "joined_at" | "session_count"> & {
          joined_at?: string;
          session_count?: number;
        };
        Update: Partial<ProfileRow>;
      };
      questions: {
        Row: QuestionRow;
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category: string;
          tags?: string[];
          author_id: string;
          created_at?: string;
          session_count?: number;
          participant_total?: number;
          is_featured?: boolean;
        };
        Update: Partial<QuestionRow>;
      };
      sessions: {
        Row: SessionRow;
        Insert: {
          id?: string;
          question_id: string;
          host_id: string;
          location: string;
          address?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          max_participants?: number;
          current_participants?: number;
          status?: "upcoming" | "live" | "closed";
          created_at?: string;
        };
        Update: Partial<SessionRow>;
      };
      session_participants: {
        Row: SessionParticipantRow;
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: Partial<SessionParticipantRow>;
      };
      reviews: {
        Row: ReviewRow;
        Insert: {
          id?: string;
          session_id: string;
          author_id: string;
          type?: "text" | "photo" | "video";
          content: string;
          photo_url?: string | null;
          video_url?: string | null;
          quote?: string | null;
          transformation?: string | null;
          created_at?: string;
          likes?: number;
        };
        Update: Partial<ReviewRow>;
      };
      review_likes: {
        Row: ReviewLikeRow;
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<ReviewLikeRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
