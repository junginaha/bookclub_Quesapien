import { createClient } from "./supabase/server";
import type { ClubRow, MeetingRow } from "./supabase/types";

// M1 — clubs/meetings 서버 조회 헬퍼. src/lib/supabase/queries.ts와 동일한 패턴.

export async function getClubs(limit = 50): Promise<ClubRow[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("clubs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getClubBySlug(slug: string): Promise<ClubRow | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getUpcomingMeetings(clubId: string, limit = 10): Promise<MeetingRow[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("meetings")
    .select("*")
    .eq("club_id", clubId)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getNextMeeting(clubId: string): Promise<MeetingRow | null> {
  const meetings = await getUpcomingMeetings(clubId, 1);
  return meetings[0] ?? null;
}

export async function getClubMemberCount(clubId: string): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_club_member_count", { p_club_id: clubId });
  if (error) return 0;
  return data ?? 0;
}

export interface MeetingSeats {
  capacity: number | null;
  taken: number;
  remaining: number | null;
}

export async function getMeetingSeats(meetingId: string): Promise<MeetingSeats> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_meeting_seats", { p_meeting_id: meetingId });
  if (error || !data) return { capacity: null, taken: 0, remaining: null };
  return data as MeetingSeats;
}

/** 신청자 전용: 이 유저가 이 모임에 어떤 상태로 신청되어 있는지 조회 */
export async function getMyAttendanceStatus(meetingId: string, userId: string): Promise<string | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("meeting_attendances")
    .select("status")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.status ?? null;
}

/** 근처 모임 피드(홈)용: 앞으로 예정된 모든 클럽의 다음 모임을 시간순으로 */
export async function getUpcomingMeetingsFeed(limit = 6): Promise<(MeetingRow & { club: ClubRow })[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("meetings")
    .select("*, club:clubs(*)")
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}
