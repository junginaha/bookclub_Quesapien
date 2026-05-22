"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createReviewAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const session_id     = formData.get("session_id") as string;
  const content        = (formData.get("content") as string)?.trim();
  const quote          = (formData.get("quote") as string)?.trim() || null;
  const transformation = (formData.get("transformation") as string)?.trim() || null;
  const type           = (formData.get("type") as string) || "text";
  const photo_url      = (formData.get("photo_url") as string)?.trim() || null;

  if (!session_id || !content) return { error: "내용을 입력해주세요." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("reviews").insert({
    session_id, author_id: user.id, type, content, quote, transformation, photo_url,
  });

  if (error) return { error: "후기 등록에 실패했습니다." };

  revalidatePath("/archive");
  revalidatePath(`/questions/[id]`, "page");
  return { success: "후기가 등록되었습니다." };
}

export async function toggleLikeAction(reviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: existing } = await db
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await db.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", user.id);
    revalidatePath("/archive");
    return { liked: false };
  }

  await db.from("review_likes").insert({ review_id: reviewId, user_id: user.id });
  revalidatePath("/archive");
  return { liked: true };
}

export async function uploadReviewMediaAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const file = formData.get("file") as File;
  if (!file) return { error: "파일을 선택해주세요." };

  const ext  = file.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("review-media")
    .upload(path, file, { upsert: false });

  if (error) return { error: "업로드에 실패했습니다." };

  const { data: { publicUrl } } = supabase.storage
    .from("review-media")
    .getPublicUrl(path);

  return { url: publicUrl };
}
