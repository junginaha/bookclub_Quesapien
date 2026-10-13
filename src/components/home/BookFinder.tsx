"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import NotifyForm from "@/components/bookclub/NotifyForm";
import { getDemandCount } from "@/lib/actions/bookclub";
import { requestKey } from "@/lib/bookclub/demand";
import { ENCORE_THRESHOLD, getStatus } from "@/lib/bookclub/selectors";
import type { BookClubSession } from "@/lib/bookclub/types";
import { WAITING_CLUBS } from "@/lib/bookclub/waiting";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";

type Found = { title: string; author: string; coverUrl: string | null; isbn: string | null };
type Local = { title: string; author: string; coverUrl?: string; href: string; action: string };

const norm = (v: string) => v.normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");

// 읽고 싶은 책 찾기 — 우리 북클럽에 있으면 바로 연결, 없으면 "이 책으로 열어주세요" 요청.
// 같은 책 요청이 5명 모이면 개설을 검토한다(bookclub_waitlist, request: 키).
export default function BookFinder({ sessions }: { sessions: BookClubSession[] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [local, setLocal] = useState<Local[]>([]);
  const [found, setFound] = useState<Found[]>([]);
  const [loading, setLoading] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  function localMatches(q: string): Local[] {
    const n = norm(q);
    const hit = (title: string, author: string) => norm(title).includes(n) || norm(author).includes(n);
    const upcoming = sessions
      .filter((s) => getStatus(s) !== "past" && hit(s.bookTitle, s.author))
      .map((s) => ({ title: s.bookTitle, author: s.author, coverUrl: s.coverUrl, href: `/bookclub/${s.slug}#apply`, action: "참여 신청 →" }));
    const waiting = WAITING_CLUBS
      .filter((c) => hit(c.bookTitle, c.author))
      .map((c) => ({
        title: c.bookTitle,
        author: c.author,
        coverUrl: sessions.find((s) => s.slug === c.sessionSlug)?.coverUrl,
        href: `#wait-${c.id}`,
        action: "함께 기다리기 →",
      }));
    return [...upcoming, ...waiting];
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2 || loading) return;
    setLoading(true);
    setSearched(q);
    setOpenKey(null);
    const mine = localMatches(q);
    setLocal(mine);
    try {
      const res = await fetch(`/api/book-search?q=${encodeURIComponent(q)}`);
      const data = res.ok ? await res.json() as { books?: Found[] } : { books: [] };
      const ours = new Set(mine.map((m) => norm(m.title)));
      setFound((data.books ?? []).filter((b) => !ours.has(norm(b.title))));
    } catch {
      setFound([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRequest(key: string) {
    if (openKey === key) { setOpenKey(null); return; }
    setOpenKey(key);
    if (counts[key] === undefined) {
      const count = await getDemandCount(key).catch(() => 0);
      setCounts((prev) => ({ ...prev, [key]: count }));
    }
  }

  function requestPanel(key: string) {
    if (openKey !== key) return null;
    const count = counts[key];
    return (
      <div className={styles.requestPanel}>
        {count !== undefined && (
          <p className={styles.waitCount}>
            {count > 0 ? <><strong>{count}명</strong>이 이 책을 기다려요 · {ENCORE_THRESHOLD}명이 모이면 북클럽을 엽니다</> : `처음 요청하는 책이에요 · ${ENCORE_THRESHOLD}명이 모이면 북클럽을 엽니다`}
          </p>
        )}
        <NotifyForm clubSlug={key} mode="request" onJoined={() => setCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))} />
      </div>
    );
  }

  const manualKey = searched ? requestKey(searched, "") : "";
  const nothing = searched && !loading && local.length === 0 && found.length === 0;

  return (
    <section className={styles.section} id="find" aria-labelledby="find-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>FIND A BOOK</span>
          <h2 id="find-title">읽고 싶은 책 찾기</h2>
          <p className={styles.sectionLead}>함께 읽고 싶은 책을 찾아보세요. 아직 없는 책이라면 요청해 주세요. 같은 책을 원하는 분이 {ENCORE_THRESHOLD}명 모이면 북클럽을 엽니다.</p>
        </div>
      </div>

      <form className={styles.search} role="search" onSubmit={search}>
        <label htmlFor="book-find" className={styles.srOnly}>책 제목 또는 저자</label>
        <input
          id="book-find"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="책 제목 또는 저자"
          minLength={2}
          maxLength={80}
          autoComplete="off"
        />
        <button type="submit" className={styles.primary} disabled={loading || query.trim().length < 2}>{loading ? "찾는 중…" : "찾기"}</button>
      </form>

      <div aria-live="polite">
        {local.length > 0 && (
          <div className={styles.searchGroup}>
            <h3>질문하는 사람들에 있어요</h3>
            <ul className={styles.searchList}>
              {local.map((book) => (
                <li key={book.href} className={styles.searchItem}>
                  <span className={styles.nowCover} aria-hidden="true">
                    <BookCoverImage title={book.title} author={book.author} coverUrl={book.coverUrl} fallbackClassName={styles.coverFallback} />
                  </span>
                  <span><strong>{book.title}</strong><small>{book.author}</small></span>
                  {book.href.startsWith("#") ? <a href={book.href}>{book.action}</a> : <Link href={book.href}>{book.action}</Link>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {found.length > 0 && (
          <div className={styles.searchGroup}>
            <h3>아직 열리지 않은 책 · 요청할 수 있어요</h3>
            <ul className={styles.searchList}>
              {found.map((book) => {
                const key = requestKey(book.title, book.author, book.isbn);
                return (
                  <li key={key} className={styles.searchItem}>
                    <span className={styles.nowCover} aria-hidden="true">
                      {book.coverUrl ? <img src={book.coverUrl} alt="" loading="lazy" /> : <span className={styles.coverFallback}><span>{book.title}</span></span>}
                    </span>
                    <span><strong>{book.title}</strong><small>{book.author}</small></span>
                    <button type="button" className={styles.linkButton} aria-expanded={openKey === key} onClick={() => toggleRequest(key)}>
                      {openKey === key ? "닫기" : "이 책 요청하기"}
                    </button>
                    {requestPanel(key)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {nothing && (
          <div className={styles.searchGroup}>
            <h3>검색 결과가 없어요</h3>
            <ul className={styles.searchList}>
              <li className={styles.searchItem}>
                <span className={styles.nowCover} aria-hidden="true"><span className={styles.coverFallback}><span>{searched}</span></span></span>
                <span><strong>‘{searched}’</strong><small>입력한 그대로 요청할 수 있어요</small></span>
                <button type="button" className={styles.linkButton} aria-expanded={openKey === manualKey} onClick={() => toggleRequest(manualKey)}>
                  {openKey === manualKey ? "닫기" : "이대로 요청하기"}
                </button>
                {requestPanel(manualKey)}
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
