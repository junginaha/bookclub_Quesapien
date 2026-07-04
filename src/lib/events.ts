// §B4 퍼널 4대 이벤트 + 수익 이벤트. 계측 없는 기능 출시는 미완성으로 간주한다.
export type EventName =
  | "signup"
  | "attend_apply"
  | "attend_cancel"
  | "archive_view"
  | "archive_to_apply"
  | "order_paid";

/**
 * KPI 이벤트 기록. 브라우저(client.ts)와 서버(server.ts) 양쪽의
 * createClient() 인스턴스를 그대로 받아 쓴다 — 계측 실패가 사용자 플로우를
 * 막아서는 안 되므로 에러는 삼킨다.
 * (제네릭은 느슨하게: @supabase/ssr과 @supabase/supabase-js의 SupabaseClient
 * 스키마 제네릭 형태가 이 저장소의 의존성 버전 조합에서는 서로 어긋남)
 */
export async function logEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  name: EventName | (string & {}),
  props?: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  try {
    await supabase.from("events").insert({
      name,
      props: props ?? null,
      user_id: userId ?? null,
    });
  } catch {
    // 계측은 부가 기능이다 — 실패해도 본 기능 흐름을 막지 않는다.
  }
}
