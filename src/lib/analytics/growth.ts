"use client";

import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

export type GrowthEventName =
  | "bookclub_detail_view"
  | "apply_start"
  | "attend_apply"
  | "checkout_start"
  | "archive_view"
  | "archive_to_apply";

export function trackGrowthEvent(
  name: GrowthEventName,
  props: Record<string, Json | undefined> = {}
) {
  try {
    const supabase = createClient();
    const cleanProps = Object.fromEntries(
      Object.entries(props).filter((entry): entry is [string, Json] => entry[1] !== undefined)
    ) as { [key: string]: Json };

    void supabase
      .from("events")
      .insert({ name, props: cleanProps })
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
