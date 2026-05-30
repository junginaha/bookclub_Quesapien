import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers } = body as { answers: Record<string, string | string[]> };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Save onboarding answers to user metadata (accessible server-side without extra table)
      await supabase.auth.updateUser({
        data: { onboarding_answers: answers, onboarding_completed: true },
      });

      // Also update bio from q5 (current concern) if provided
      if (answers?.q5 && typeof answers.q5 === "string") {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await (supabase.from("profiles") as any)
          .update({ bio: answers.q5.slice(0, 200) })
          .eq("id", user.id);
        /* eslint-enable @typescript-eslint/no-explicit-any */
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Failed to save onboarding" }, { status: 500 });
  }
}
