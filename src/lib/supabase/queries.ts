import { createClient } from "./server";

// ─── Questions ────────────────────────────────────────────────
export async function getQuestions(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, avatar_url, bio)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedQuestion() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, avatar_url, bio)
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getQuestionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, avatar_url, bio)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getPopularQuestions(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, avatar_url, bio)
    `)
    .order("participant_total", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ─── Sessions ──────────────────────────────────────────────────
export async function getSessions(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      question:questions(
        *,
        author:profiles(id, name, avatar_url)
      ),
      host:profiles(id, name, avatar_url)
    `)
    .in("status", ["live", "upcoming"])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getSessionsByQuestion(questionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      question:questions(
        *,
        author:profiles(id, name, avatar_url)
      ),
      host:profiles(id, name, avatar_url)
    `)
    .eq("question_id", questionId)
    .in("status", ["live", "upcoming"])
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSessionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      question:questions(*, author:profiles(id, name, avatar_url)),
      host:profiles(id, name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function isUserInSession(sessionId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("session_participants")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function getMySessions(userId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("session_participants")
    .select(`
      session:sessions(
        *,
        question:questions(id, title, category)
      )
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((d) => d.session).filter(Boolean);
}

// ─── Archive Reviews (public submissions) ─────────────────────
export async function getArchiveReviews(limit = 60) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("archive_reviews")
    .select("id, type, content, author_name, photo_url, video_url, likes, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as {
    id: string; type: string; content: string; author_name: string;
    photo_url: string | null; video_url: string | null; likes: number; created_at: string;
  }[];
}

// ─── Reviews ───────────────────────────────────────────────────
export async function getReviews(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      author:profiles(id, name, avatar_url),
      session:sessions(
        id,
        date,
        location,
        question:questions(id, title, category)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getReviewsBySession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      author:profiles(id, name, avatar_url)
    `)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getReviewsByQuestion(questionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      author:profiles(id, name, avatar_url),
      session:sessions!inner(
        id, question_id
      )
    `)
    .eq("session.question_id", questionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMyReviews(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      session:sessions(
        id, date, location,
        question:questions(id, title)
      )
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function hasUserLikedReview(reviewId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// ─── Profile ───────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  return profile ? { ...user, profile } : null;
}
