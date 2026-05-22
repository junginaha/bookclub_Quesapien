-- ============================================================
-- 시드 데이터 (개발/스테이징용) — 2026년 기준
-- Supabase Dashboard > SQL Editor 에서 실행
-- ⚠️  auth.users 레코드 없이는 profiles INSERT 불가
--     → 먼저 대시보드에서 테스트 계정을 만들거나
--       아래 주석을 해제하여 service_role 키로 실행하세요.
-- ============================================================

-- 샘플 질문 (author_id 는 실제 profiles.id 로 교체하세요)
-- insert into public.questions (title, description, category, tags, author_id, created_at, session_count, participant_total, is_featured)
-- values
--   ('우리는 왜 인정받고 싶어하는가?',
--    '타인의 시선과 인정이 우리의 행동을 얼마나 좌우하는지 탐구합니다.',
--    '자아', array['자존감','인정욕구','심리학'], '<your-user-id>', '2026-05-10 09:00:00+09', 14, 168, true),
--   ('혼자는 왜 외로운가?',
--    '현대 도시에서 느끼는 깊은 외로움의 본질을 탐구합니다.',
--    '감정', array['외로움','연결','고독'], '<your-user-id>', '2026-05-08 14:00:00+09', 11, 132, true),
--   ('사랑은 전략인가 진심인가?',
--    '관계에서의 계산과 진정성 사이의 긴장을 이야기합니다.',
--    '사랑', array['사랑','관계','철학'], '<your-user-id>', '2026-05-05 11:00:00+09', 18, 216, false);

select 'seed.sql 준비 완료 — author_id를 실제 사용자 ID로 교체 후 실행하세요.' as message;
