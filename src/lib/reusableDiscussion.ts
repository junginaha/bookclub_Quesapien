import { unstable_cache } from "next/cache";
import { buildDiscussion, type BookInput, type DiscussionResult } from "@/lib/discussionEngine";
import { publicDiscussionInput, singleFlight } from "@/lib/discussionReuse";

export class DiscussionPausedError extends Error {}

function ensureGenerationEnabled() {
  if (process.env.DISCUSSION_GENERATION_ENABLED === "false") {
    throw new DiscussionPausedError("New discussion generation is paused");
  }
}

// Only successful, public book requests are shared. No cookies, database writes,
// free-form text or user descriptions belong inside this persistent cache.
// Bump DISCUSSION_CACHE_VERSION after prompt/evidence policy corrections.
const cachedDiscussion = unstable_cache(
  async (input: BookInput, version: string) => {
    void version;
    ensureGenerationEnabled();
    return buildDiscussion(input);
  },
  ["qsapiens-public-discussion-v1"],
  { revalidate: false, tags: ["qsapiens-discussions"] },
);

const shareWork = singleFlight<DiscussionResult>();

export async function reusableDiscussion(input: BookInput): Promise<DiscussionResult> {
  const publicInput = publicDiscussionInput(input);
  if (!publicInput) {
    ensureGenerationEnabled();
    return buildDiscussion(input);
  }
  const version = process.env.DISCUSSION_CACHE_VERSION || "1";
  const key = JSON.stringify([version, publicInput]);
  return shareWork(key, () => cachedDiscussion(publicInput as BookInput, version));
}
