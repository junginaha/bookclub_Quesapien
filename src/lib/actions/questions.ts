"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createQuestionAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const title      = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category   = formData.get("category") as string;
  const tagsRaw    = formData.get("tags") as string;
  const location   = (formData.get("location") as string)?.trim();
  const date       = formData.get("date") as string;
  const start_time = formData.get("start_time") as string;
  const end_time   = formData.get("end_time") as string;
  const maxP       = parseInt(formData.get("max_participants") as string, 10);

  if (!title || !category || !location || !date || !start_time) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: question, error: qErr } = await db
    .from("questions")
    .insert({ title, description, category, tags, author_id: user.id })
    .select("id")
    .single();

  if (qErr || !question) return { error: "질문 등록에 실패했습니다." };

  const { error: sErr } = await db.from("sessions").insert({
    question_id:      question.id,
    host_id:          user.id,
    location,
    date,
    start_time,
    end_time:         end_time || start_time,
    max_participants: isNaN(maxP) ? 8 : maxP,
    status:           "upcoming",
  });

  if (sErr) return { error: "모임 등록에 실패했습니다." };

  revalidatePath("/");
  revalidatePath("/questions");
  redirect(`/questions/${question.id}`);
}
