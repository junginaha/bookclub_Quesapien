"use client";

import { createClient } from "@/lib/supabase/client";

export type GrowthEventName =
  | "bookclub_detail_view"
  | "apply_start"
  | "attend_apply"
  | "checkout_start"
  | "archive_view"
  | "archive_to_apply";

export function trackGrowthEvent(
  name: GrowthEventName,
  props: Record<string, unknown> = {}
) {
  try {
    const supabase = createClient();
    void supabase
      .from("events")
      .insert({ name, props })
      .then(({ error }) => {
        if (error && process.env.NODE_ENV === "development") {
          console.warn("[growth-event]", name, error.message);
        }
      });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[growth-event]", name, error);
    }
  }
}
