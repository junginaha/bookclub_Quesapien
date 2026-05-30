import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && answers?.q5) {
      // Store concern as bio
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (supabase.from("profiles") as any)
        .update({ bio: String(answers.q5) })
        .eq("id", user.id);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Failed to save onboarding" }, { status: 500 });
  }
}
