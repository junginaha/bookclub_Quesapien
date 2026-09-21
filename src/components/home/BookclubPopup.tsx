"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, formatTimeOfDay, getStatus } from "@/lib/bookclub/selectors";
import BookCoverImage from "./BookCoverImage";
import styles from "./bookclub-popup.module.css";

export default function BookclubPopup({
  open,
  sessions,
  onClose,
}: {
  open: boolean;
  sessions: BookClubSession[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const upcoming = useMemo(
    () => sessions
      .filter((session) => getStatus(session) !== "past")
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice(0, 6),
    [sessions]
  );
  const [selected, setSelected] = useState<BookClubSession | null>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
    if (!open) setSelected(null);
  }, [open]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const handleClick = (event: MouseEvent) => {
      if (event.target === node) onClose();
    };
    node.addEventListener("click", handleClick);
    return () => node.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <dialog ref={dialog} className={styles.dialog} onClose={onClose} aria-labelledby="bookclub-popup-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span>QSAPIENS · BOOK CLUB</span>
            <h2 id="bookclub-popup-title">함께 읽는 날</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.close} aria-label="북클럽 팝업 닫기">
            <X size={22} />
          </button>
        </header>

        {!selected ? (
          <>
            <div className={styles.intro}>
              <p>책을 고르면, 그날의 대화가 열립니다.</p>
              <Link href="/bookclub" onClick={onClose}>전체 일정 →</Link>
            </div>
            <div className={styles.grid}>
              {upcoming.map((session) => (
                <button
                  type="button"
                  className={styles.tile}
                  key={session.slug}
                  onClick={() => setSelected(session)}
                >
                  <span className={styles.cover}>
                    <BookCoverImage
                      title={session.bookTitle}
                      author={session.author}
                      fallbackClassName={styles.coverFallback}
                    />
                  </span>
                  <span className={styles.tileText}>
                    <strong>{session.bookTitle}</strong>
                    <small>{session.author} · {formatMonthDay(session.startsAt)}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.quickView}>
            <button type="button" className={styles.back} onClick={() => setSelected(null)}>← 다른 모임 보기</button>
            <div className={styles.quickCover}>
              <BookCoverImage
                title={selected.bookTitle}
                author={selected.author}
                fallbackClassName={styles.coverFallback}
              />
            </div>
            <div className={styles.quickCopy}>
              <span>{formatMonthDay(selected.startsAt)} · {formatTimeOfDay(selected.startsAt)}</span>
              <h3>{selected.bookTitle}</h3>
              <p className={styles.author}>{selected.author}</p>
              {selected.leadQuestion && <p className={styles.question}>{selected.leadQuestion}</p>}
              <dl>
                <div><dt>장소</dt><dd>{selected.venue.name}</dd></div>
                <div><dt>상태</dt><dd>{getStatus(selected) === "open" ? "모집 중" : "상세 확인"}</dd></div>
              </dl>
              <Link href={"/bookclub/" + selected.slug} className={styles.cta} onClick={onClose}>
                모임 자세히 보기 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
