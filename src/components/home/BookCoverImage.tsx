"use client";

import { useEffect, useState } from "react";

type BookCoverProps = {
  title: string;
  author: string;
  coverUrl?: string;
  fallbackClassName?: string;
  priority?: boolean;
};

// All book surfaces share the same explicit-cover/API/fallback policy.
// Remount on book changes so an old cover cannot flash for a different book.
export default function BookCoverImage(props: BookCoverProps) {
  return <ResolvedBookCover key={JSON.stringify([props.title, props.author, props.coverUrl])} {...props} />;
}

function ResolvedBookCover({
  title,
  author,
  coverUrl,
  fallbackClassName = "flex h-full flex-col justify-center gap-2 p-2 text-center text-xs",
  priority = false,
}: BookCoverProps) {
  const [url, setUrl] = useState<string | null>(coverUrl || null);
  const [lookup, setLookup] = useState(!coverUrl);

  useEffect(() => {
    if (!lookup) return;
    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({ title, author, v: "2" });
    fetch("/api/book-cover?" + params.toString(), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.coverUrl) setUrl(data.coverUrl);
      })
      .catch(() => {});
    return () => { active = false; controller.abort(); };
  }, [title, author, lookup]);

  if (!url) {
    return (
      <span className={fallbackClassName} aria-label={title + " 표지 이미지 준비 중"}>
        <span>{title}</span>
        <small>{author}</small>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={title + " 실제 도서 표지"}
      loading={priority ? "eager" : "lazy"}
      onError={() => { setUrl(null); setLookup(true); }}
    />
  );
}
