"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublishingNav } from "@/components/publishing/PublishingNav";
import { booksApi } from "@/lib/publishing/api";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const bookId = params.bookId as string;
  const [title, setTitle] = useState<string>();

  useEffect(() => {
    booksApi.get(bookId)
      .then((b) => setTitle(b.title))
      .catch(() => {});
  }, [bookId]);

  return (
    <div className="flex min-h-screen">
      <PublishingNav bookId={bookId} bookTitle={title} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
