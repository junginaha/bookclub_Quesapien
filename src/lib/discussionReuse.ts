/** Keep the key explicit: adding engine inputs requires updating this policy. */
export interface ReusableBookInput {
  title: string;
  author: string;
  description?: string;
  direction?: string;
  depth?: string;
}

export function publicDiscussionInput(input: ReusableBookInput): ReusableBookInput | null {
  if (!input.author.trim() || input.description?.trim()) return null;
  return {
    title: input.title.trim().normalize("NFC"),
    author: input.author.trim().normalize("NFC"),
    direction: input.direction ?? "free",
    depth: input.depth ?? "general",
  };
}

/** Share concurrent identical work in one instance; always allow retries after failure. */
export function singleFlight<T>(limit = 32) {
  const pending = new Map<string, Promise<T>>();
  return async (key: string, run: () => Promise<T>): Promise<T> => {
    const existing = pending.get(key);
    if (existing) return existing;
    if (pending.size >= limit) throw new Error("discussion_busy");
    const promise = Promise.resolve().then(run);
    pending.set(key, promise);
    try {
      return await promise;
    } finally {
      pending.delete(key);
    }
  };
}
