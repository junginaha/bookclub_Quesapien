import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com").split(",");

const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: "003_archive_reviews",
    sql: `
      CREATE TABLE IF NOT EXISTS archive_reviews (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type          TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'photo', 'video')),
        content       TEXT NOT NULL,
        author_name   TEXT NOT NULL DEFAULT '익명',
        author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        photo_url     TEXT,
        video_url     TEXT,
        likes         INTEGER NOT NULL DEFAULT 0,
        is_approved   BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE archive_reviews ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='archive_reviews' AND policyname='Public read approved archive_reviews') THEN
          CREATE POLICY "Public read approved archive_reviews" ON archive_reviews FOR SELECT USING (is_approved = true);
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='archive_reviews' AND policyname='Anyone can insert archive_reviews') THEN
          CREATE POLICY "Anyone can insert archive_reviews" ON archive_reviews FOR INSERT WITH CHECK (true);
        END IF;
      END $$;

      INSERT INTO archive_reviews (type, content, author_name, is_approved) VALUES
        ('text', '처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.', '채현 · UX 디자이너 · 30', true),
        ('text', '사람은 아직 믿을 만하다는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.', '진우 · 개발자 · 34', true),
        ('text', '질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.', '윤서 · 에디터 · 28', true),
        ('text', '대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.', '도연 · 대학원생 · 26', true),
        ('text', '우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.', '하린 · 교사 · 39', true)
      ON CONFLICT DO NOTHING;
    `,
  },
  {
    name: "003_landing_question_answers",
    sql: `
      CREATE TABLE IF NOT EXISTS landing_question_answers (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id     UUID REFERENCES landing_questions(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        author_name     TEXT NOT NULL DEFAULT '익명',
        author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        likes           INTEGER NOT NULL DEFAULT 0,
        is_approved     BOOLEAN NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE landing_question_answers ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='landing_question_answers' AND policyname='Public read approved answers') THEN
          CREATE POLICY "Public read approved answers" ON landing_question_answers FOR SELECT USING (is_approved = true);
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='landing_question_answers' AND policyname='Anyone can submit answer') THEN
          CREATE POLICY "Anyone can submit answer" ON landing_question_answers FOR INSERT WITH CHECK (true);
        END IF;
      END $$;
    `,
  },
  {
    name: "003_archive_review_likes",
    sql: `
      CREATE TABLE IF NOT EXISTS archive_review_likes (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_id   UUID REFERENCES archive_reviews(id) ON DELETE CASCADE,
        session_key TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (review_id, session_key)
      );
      ALTER TABLE archive_review_likes ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='archive_review_likes' AND policyname='Anyone can like') THEN
          CREATE POLICY "Anyone can like" ON archive_review_likes FOR INSERT WITH CHECK (true);
        END IF;
      END $$;
    `,
  },
  {
    name: "004_geo_columns",
    sql: `
      ALTER TABLE landing_book_clubs ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
      ALTER TABLE landing_book_clubs ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

      UPDATE landing_book_clubs SET lat = 37.4930, lng = 127.0151 WHERE slug = '최신간-북토크'    AND lat IS NULL;
      UPDATE landing_book_clubs SET lat = 37.4946, lng = 127.0209 WHERE slug = '다정함의-발명'    AND lat IS NULL;
      UPDATE landing_book_clubs SET lat = 37.5492, lng = 126.9148 WHERE slug = '혼자라는-감각'    AND lat IS NULL;
      UPDATE landing_book_clubs SET lat = 37.5344, lng = 127.0049 WHERE slug = '아무도-보지-않는-오후' AND lat IS NULL;
      UPDATE landing_book_clubs SET lat = 37.5921, lng = 126.9602 WHERE slug = '오늘-저녁-당신께' AND lat IS NULL;
      UPDATE landing_book_clubs SET lat = 37.5558, lng = 126.9073 WHERE slug = '인간이라는-풍경'  AND lat IS NULL;
    `,
  },
  {
    name: "004_reviews_storage_bucket",
    sql: `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('reviews', 'reviews', true, 10485760, ARRAY['image/jpeg','image/png','image/gif','image/webp','image/avif'])
      ON CONFLICT (id) DO NOTHING;
    `,
  },
];

export async function POST(req: NextRequest) {
  try {
    // Admin check via Authorization header
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Supabase 환경변수 없음" }, { status: 500 });
    }

    // Verify admin via Supabase user lookup
    let isAdmin = false;
    if (token) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { "Authorization": `Bearer ${token}`, "apikey": serviceKey },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        isAdmin = ADMIN_EMAILS.includes(userData.email ?? "");
      }
    }

    // Also allow service-role secret header for server-side calls
    const secretHeader = req.headers.get("x-migration-secret");
    if (secretHeader === serviceKey) isAdmin = true;

    if (!isAdmin) {
      return NextResponse.json({ error: "관리자 권한 필요" }, { status: 403 });
    }

    const results: { name: string; status: "ok" | "error"; message?: string }[] = [];

    for (const migration of MIGRATIONS) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
            "apikey": serviceKey,
          },
          body: JSON.stringify({ sql: migration.sql }),
        });

        if (!res.ok) {
          // Try direct SQL via pg endpoint
          const pgRes = await fetch(`${supabaseUrl}/pg/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
              "apikey": serviceKey,
            },
            body: JSON.stringify({ query: migration.sql }),
          });

          if (!pgRes.ok) {
            const errText = await pgRes.text();
            results.push({ name: migration.name, status: "error", message: errText.slice(0, 200) });
            continue;
          }
        }

        results.push({ name: migration.name, status: "ok" });
      } catch (e) {
        results.push({ name: migration.name, status: "error", message: e instanceof Error ? e.message : "unknown" });
      }
    }

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "server error" }, { status: 500 });
  }
}
