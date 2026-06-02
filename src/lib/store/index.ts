import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  mockQuestions,
  mockSessions,
  mockReviews,
  mockUsers,
} from "@/data/mockData";

// ─── 타입 ──────────────────────────────────────────────────────
export interface StoreUser {
  id: string;
  email: string;
  password: string; // 로컬 전용 (해시 없이 저장 — 데모용)
  name: string;
  avatar_url?: string;
  bio?: string;
  joined_at: string;
  session_count: number;
}

export interface StoreQuestion {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  session_count: number;
  participant_total: number;
  is_featured: boolean;
}

export interface StoreSession {
  id: string;
  question_id: string;
  host_id: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: "upcoming" | "live" | "closed";
  discussion_questions?: string[];
}

export interface StoreReview {
  id: string;
  session_id: string;
  question_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  type: "text" | "photo" | "video";
  content: string;
  photo_url?: string;
  quote?: string;
  transformation?: string;
  created_at: string;
  likes: number;
}

interface AppStore {
  // ── 상태 ──────────────────────────────────────────
  currentUser: Omit<StoreUser, "password"> | null;
  users: StoreUser[];
  questions: StoreQuestion[];
  sessions: StoreSession[];
  reviews: StoreReview[];
  participants: Array<{ sessionId: string; userId: string }>;
  likes: Array<{ reviewId: string; userId: string }>;
  hydrated: boolean;

  // ── Auth ──────────────────────────────────────────
  login:  (email: string, password: string) => { error?: string };
  signup: (name: string, email: string, password: string) => { error?: string };
  logout: () => void;
  setSupabaseUser: (user: { id: string; email: string; name: string; avatar_url?: string } | null) => void;
  updateProfile: (data: { name?: string; bio?: string }) => void;

  // ── Questions ─────────────────────────────────────
  createQuestion: (data: {
    title: string; description: string; category: string; tags: string[];
    location: string; date: string; start_time: string; end_time: string;
    max_participants: number;
  }) => { error?: string; questionId?: string };

  // ── Sessions ──────────────────────────────────────
  joinSession:  (sessionId: string) => { error?: string; success?: string };
  leaveSession: (sessionId: string) => { error?: string; success?: string };
  isJoined:     (sessionId: string) => boolean;

  // ── Reviews ───────────────────────────────────────
  createReview: (data: {
    session_id: string; content: string; quote?: string;
    transformation?: string; type?: string; photo_url?: string;
  }) => { error?: string; success?: string };
  toggleLike: (reviewId: string) => { liked: boolean };
  isLiked:    (reviewId: string) => boolean;

  // ── Selectors ─────────────────────────────────────
  getQuestion:         (id: string) => StoreQuestion | undefined;
  getSessionsByQuestion: (questionId: string) => StoreSession[];
  getReviewsByQuestion:  (questionId: string) => StoreReview[];
  getMyReviews:        () => StoreReview[];
  getMySessions:       () => StoreSession[];
}

// ─── 시드 데이터 변환 ──────────────────────────────────────────
const seedUsers: StoreUser[] = mockUsers.map((u) => ({
  id: u.id,
  email: u.email,
  password: "password123",
  name: u.name,
  avatar_url: u.avatar_url,
  bio: u.bio ?? undefined,
  joined_at: u.joined_at,
  session_count: u.session_count,
}));

const seedQuestions: StoreQuestion[] = mockQuestions.map((q) => ({
  id: q.id,
  title: q.title,
  description: q.description,
  category: q.category,
  tags: q.tags,
  author_id: q.author.id,
  author_name: q.author.name,
  author_avatar: q.author.avatar_url ?? undefined,
  created_at: q.created_at,
  session_count: q.session_count,
  participant_total: q.participant_total,
  is_featured: !!q.is_featured,
}));

const seedSessions: StoreSession[] = mockSessions.map((s) => ({
  id: s.id,
  question_id: s.question.id,
  host_id: s.host.id,
  location: s.location,
  date: s.date,
  start_time: s.start_time,
  end_time: s.end_time,
  max_participants: s.max_participants,
  current_participants: s.current_participants,
  status: s.status,
  discussion_questions: s.discussion_questions,
}));

const seedReviews: StoreReview[] = mockReviews.map((r) => ({
  id: r.id,
  session_id: r.session.id,
  question_id: r.session.question.id,
  author_id: r.author.id,
  author_name: r.author.name,
  author_avatar: r.author.avatar_url ?? undefined,
  type: r.type,
  content: r.content,
  photo_url: r.photo_url ?? undefined,
  quote: r.quote ?? undefined,
  transformation: r.transformation ?? undefined,
  created_at: r.created_at,
  likes: r.likes,
}));

// ─── Store ─────────────────────────────────────────────────────
export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      currentUser: null,
      users: seedUsers,
      questions: seedQuestions,
      sessions: seedSessions,
      reviews: seedReviews,
      participants: [],
      likes: [],
      hydrated: false,

      // ── Auth ────────────────────────────────────────
      login: (email, password) => {
        // 관리자 특수 계정
        if (email === "kimjungin" && password === "kimjungin1") {
          set((s) => {
            s.currentUser = {
              id: "admin-kimjungin",
              email: "kimjungin@quesapience.com",
              name: "kimjungin",
              joined_at: new Date().toISOString(),
              session_count: 0,
            };
          });
          return {};
        }
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
        const { password: _pw, ...profile } = user;
        set((s) => { s.currentUser = profile; });
        return {};
      },

      signup: (name, email, password) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return { error: "이미 사용 중인 이메일입니다." };
        if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

        const newUser: StoreUser = {
          id: `u_${Date.now()}`,
          email,
          password,
          name,
          joined_at: new Date().toISOString(),
          session_count: 0,
        };
        const { password: _pw, ...profile } = newUser;
        set((s) => {
          s.users.push(newUser);
          s.currentUser = profile;
        });
        return {};
      },

      logout: () => set((s) => { s.currentUser = null; }),
      setSupabaseUser: (user) => set((s) => {
        if (!user) { s.currentUser = null; return; }
        s.currentUser = {
          id: user.id, email: user.email, name: user.name,
          avatar_url: user.avatar_url,
          bio: undefined, joined_at: new Date().toISOString(), session_count: 0,
        };
      }),

      updateProfile: (data) => {
        const user = get().currentUser;
        if (!user) return;
        set((s) => {
          s.currentUser = { ...s.currentUser!, ...data };
          const idx = s.users.findIndex((u) => u.id === user.id);
          if (idx !== -1) Object.assign(s.users[idx], data);
        });
      },

      // ── Questions ───────────────────────────────────
      createQuestion: (data) => {
        const user = get().currentUser;
        if (!user) return { error: "로그인이 필요합니다." };
        if (!data.title || !data.category || !data.location || !data.date)
          return { error: "필수 항목을 모두 입력해주세요." };

        const qId = `q_${Date.now()}`;
        const sId = `s_${Date.now()}`;
        const now = new Date().toISOString();

        const question: StoreQuestion = {
          id: qId,
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          author_id: user.id,
          author_name: user.name,
          author_avatar: user.avatar_url,
          created_at: now,
          session_count: 1,
          participant_total: 0,
          is_featured: false,
        };

        const session: StoreSession = {
          id: sId,
          question_id: qId,
          host_id: user.id,
          location: data.location,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time || data.start_time,
          max_participants: data.max_participants,
          current_participants: 0,
          status: "upcoming",
        };

        set((s) => {
          s.questions.unshift(question);
          s.sessions.unshift(session);
        });
        return { questionId: qId };
      },

      // ── Sessions ────────────────────────────────────
      joinSession: (sessionId) => {
        const user = get().currentUser;
        if (!user) return { error: "로그인이 필요합니다." };

        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session) return { error: "모임을 찾을 수 없습니다." };
        if (session.status === "closed") return { error: "마감된 모임입니다." };
        if (session.current_participants >= session.max_participants)
          return { error: "정원이 가득 찼습니다." };

        const already = get().participants.some(
          (p) => p.sessionId === sessionId && p.userId === user.id
        );
        if (already) return { error: "이미 참여 중인 모임입니다." };

        set((s) => {
          s.participants.push({ sessionId, userId: user.id });
          const idx = s.sessions.findIndex((ss) => ss.id === sessionId);
          if (idx !== -1) {
            s.sessions[idx].current_participants += 1;
          }
          const qIdx = s.questions.findIndex(
            (q) => q.id === s.sessions[idx]?.question_id
          );
          if (qIdx !== -1) s.questions[qIdx].participant_total += 1;
          const uIdx = s.users.findIndex((u) => u.id === user.id);
          if (uIdx !== -1) s.users[uIdx].session_count += 1;
          if (s.currentUser?.id === user.id) s.currentUser!.session_count += 1;
        });
        return { success: "모임 참여가 완료되었습니다!" };
      },

      leaveSession: (sessionId) => {
        const user = get().currentUser;
        if (!user) return { error: "로그인이 필요합니다." };

        set((s) => {
          s.participants = s.participants.filter(
            (p) => !(p.sessionId === sessionId && p.userId === user.id)
          );
          const idx = s.sessions.findIndex((ss) => ss.id === sessionId);
          if (idx !== -1) {
            s.sessions[idx].current_participants = Math.max(
              0,
              s.sessions[idx].current_participants - 1
            );
          }
          const qIdx = s.questions.findIndex(
            (q) => q.id === s.sessions[idx]?.question_id
          );
          if (qIdx !== -1)
            s.questions[qIdx].participant_total = Math.max(
              0,
              s.questions[qIdx].participant_total - 1
            );
          const uIdx = s.users.findIndex((u) => u.id === user.id);
          if (uIdx !== -1)
            s.users[uIdx].session_count = Math.max(0, s.users[uIdx].session_count - 1);
          if (s.currentUser?.id === user.id)
            s.currentUser!.session_count = Math.max(0, s.currentUser!.session_count - 1);
        });
        return { success: "참여가 취소되었습니다." };
      },

      isJoined: (sessionId) => {
        const user = get().currentUser;
        if (!user) return false;
        return get().participants.some(
          (p) => p.sessionId === sessionId && p.userId === user.id
        );
      },

      // ── Reviews ─────────────────────────────────────
      createReview: (data) => {
        const user = get().currentUser;
        if (!user) return { error: "로그인이 필요합니다." };
        if (!data.content.trim()) return { error: "내용을 입력해주세요." };

        const session = get().sessions.find((s) => s.id === data.session_id);
        if (!session) return { error: "모임을 찾을 수 없습니다." };

        const review: StoreReview = {
          id: `r_${Date.now()}`,
          session_id: data.session_id,
          question_id: session.question_id,
          author_id: user.id,
          author_name: user.name,
          author_avatar: user.avatar_url,
          type: (data.type as StoreReview["type"]) ?? "text",
          content: data.content,
          photo_url: data.photo_url,
          quote: data.quote,
          transformation: data.transformation,
          created_at: new Date().toISOString(),
          likes: 0,
        };

        set((s) => { s.reviews.unshift(review); });
        return { success: "후기가 등록되었습니다." };
      },

      toggleLike: (reviewId) => {
        const user = get().currentUser;
        if (!user) return { liked: false };

        const already = get().likes.some(
          (l) => l.reviewId === reviewId && l.userId === user.id
        );
        set((s) => {
          if (already) {
            s.likes = s.likes.filter(
              (l) => !(l.reviewId === reviewId && l.userId === user.id)
            );
            const idx = s.reviews.findIndex((r) => r.id === reviewId);
            if (idx !== -1) s.reviews[idx].likes = Math.max(0, s.reviews[idx].likes - 1);
          } else {
            s.likes.push({ reviewId, userId: user.id });
            const idx = s.reviews.findIndex((r) => r.id === reviewId);
            if (idx !== -1) s.reviews[idx].likes += 1;
          }
        });
        return { liked: !already };
      },

      isLiked: (reviewId) => {
        const user = get().currentUser;
        if (!user) return false;
        return get().likes.some(
          (l) => l.reviewId === reviewId && l.userId === user.id
        );
      },

      // ── Selectors ───────────────────────────────────
      getQuestion: (id) => get().questions.find((q) => q.id === id),

      getSessionsByQuestion: (questionId) =>
        get().sessions.filter(
          (s) => s.question_id === questionId && s.status !== "closed"
        ),

      getReviewsByQuestion: (questionId) =>
        get()
          .reviews.filter((r) => r.question_id === questionId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),

      getMyReviews: () => {
        const user = get().currentUser;
        if (!user) return [];
        return get()
          .reviews.filter((r) => r.author_id === user.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      },

      getMySessions: () => {
        const user = get().currentUser;
        if (!user) return [];
        const mySessionIds = new Set(
          get()
            .participants.filter((p) => p.userId === user.id)
            .map((p) => p.sessionId)
        );
        return get().sessions.filter((s) => mySessionIds.has(s.id));
      },
    })),
    {
      name: "jilmunhaneun-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        questions: state.questions,
        sessions: state.sessions,
        reviews: state.reviews,
        participants: state.participants,
        likes: state.likes,
      }),
    }
  )
);
