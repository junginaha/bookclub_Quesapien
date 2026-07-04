export const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com"
).split(",").map((e) => e.trim());

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * Quesapience 2.0 신규 코드용 운영자 확인. profiles.is_operator를 서버에서
 * 직접 조회한다 — 기존 이메일 allowlist(ADMIN_EMAILS)는 구 admin 라우트 전용으로
 * 남겨두고, 신규 대시보드/API는 전부 이 함수를 사용한다.
 * RLS가 이미 anon/타인의 is_operator=true 조작을 막지만, 이 함수는 그와 별개로
 * "현재 요청자가 실제로 운영자인가"를 서버에서 재확인하는 용도다.
 */
// @supabase/ssr의 createServerClient<Database>와 @supabase/supabase-js의
// SupabaseClient<Database> 제네릭 시그니처가 이 저장소의 의존성 버전 조합에서는
// 서로 어긋난다(스키마 제네릭 형태 차이) — 기존 코드의 관례(admin API route 등)와
// 마찬가지로 여기서도 클라이언트 타입을 any로 느슨하게 받는다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isOperator(supabase: any): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_operator")
    .eq("id", user.id)
    .single();

  return data?.is_operator === true;
}
