"use client";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { getStatus, formatCompactSchedule, feeLabel } from "@/lib/bookclub/selectors";
import DiscussionGenerator from "@/components/discussion/DiscussionGenerator";
import HomeCalendarLocationHub from "./HomeCalendarLocationHub";
import BookCoverImage from "./BookCoverImage";
import HomeArchive from "./HomeArchive";
import ReviewGallery, { type PublicReview } from "./ReviewGallery";
import "./landing.css";
import styles from "./editorial.module.css";
export interface LandingQuestion { id: string; content: string; author_name: string; likes: number; saves: number; answers_count: number; }

export default function LandingPage({ bookclubSessions = [], reviews = [] }: { bookclubSessions?: BookClubSession[]; reviews?: PublicReview[] }) {
  const upcoming = [...bookclubSessions].filter(session => getStatus(session) === "open").sort((a,b) => Date.parse(a.startsAt)-Date.parse(b.startsAt));
  const featured = upcoming[0];
  return <div className={`lp ${styles.page}`}>
    <a className={styles.skip} href="#main-content">본문으로 건너뛰기</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="큐사피엔스 홈"><span className={styles.brandMark}>?!</span><span>질문하는 사람들<small>Qsapiens · READ. ASK. CONNECT.</small></span></Link>
      <nav className={styles.nav} aria-label="주 메뉴"><a href="#meetings">북클럽</a><a href="#records">모임의 기록</a><Link href="/giants">발제 도구</Link></nav>
      <Link href="/login" className={styles.login}>로그인 ↗</Link>
    </header>
    <main id="main-content">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}><span className={styles.eyebrow}>서초구 선정 미래혁신형 북클럽</span><h1 id="hero-title">좋은 질문은<br />좋은 <em>사람</em>을<br />데려옵니다<span>.</span></h1><p>책 한 권에서 시작해, 서로의 세계로.<br />질문으로 연결되는 우리의 북클럽.</p><div className={styles.heroActions}><a className={styles.primary} href="#meetings">함께 읽을 모임 찾기 <span>↗</span></a><a className={styles.textLink} href="#first-visit">처음 오셨나요?</a></div></div>
        <aside className={styles.heroFeature} aria-label="다음 모집 중인 모임"><div className={styles.featureTop}><span>NEXT CHAPTER</span><span>함께 읽는 다음 책</span></div>{featured ? <>
          <Link href={`/bookclub/${featured.slug}`} className={styles.featureCover}><BookCoverImage title={featured.bookTitle} author={featured.author} coverUrl={featured.coverUrl} priority /></Link>
          <div className={styles.featureInfo}><span className={styles.eyebrow}>모집 중 · {featured.feeLabelOverride || feeLabel(featured.fee)}</span><h2><Link href={`/bookclub/${featured.slug}`}>{featured.bookTitle}</Link></h2><p>{formatCompactSchedule(featured.startsAt, featured.endsAt)}</p><p>{featured.venue.name}</p><Link className={styles.textLink} href={`/bookclub/${featured.slug}#apply`}>이 모임에 참여하기 ↗</Link></div>
        </> : <div className={styles.featureInfo}><h2>다음 만남을<br />준비하고 있습니다.</h2><Link href="/bookclub" className={styles.textLink}>북클럽 살펴보기 ↗</Link></div>}</aside>
      </section>
      <div className={styles.manifesto}><span>READ TOGETHER</span><p>같은 책을 읽어도, 우리는 다른 이야기를 나눕니다.</p><span>THINK FURTHER ↗</span></div>
      <section className={styles.meetings} id="meetings" aria-labelledby="meeting-heading"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>01 / THE NEXT MEETING</span><h2 id="meeting-heading">다음 만남을 골라보세요.</h2></div><Link href="/bookclub" className={styles.textLink}>전체 모임 보기 ↗</Link></div><p className={styles.sectionLead}>일정과 장소를 확인하고, 마음이 가는 책으로 시작하세요.</p>
        {upcoming.length > 0 && <div className={styles.meetingGrid}>{upcoming.slice(0,3).map((session,index) => <Link key={session.slug} className={styles.meetingCard} href={`/bookclub/${session.slug}`}><span className={styles.cardNumber}>0{index+1} <span>모집 중 ↗</span></span><h3>{session.bookTitle}</h3><p className={styles.author}>{session.author}</p><p className={styles.meetingQuestion}>{session.leadQuestion || session.summary}</p><div className={styles.cardMeta}><span>{formatCompactSchedule(session.startsAt,session.endsAt)}</span><span>{session.venue.name}</span><strong>{session.feeLabelOverride || feeLabel(session.fee)}</strong></div></Link>)}</div>}
        <details className={styles.calendar}><summary>달력으로 일정 살펴보기 <span>＋</span></summary><HomeCalendarLocationHub sessions={bookclubSessions} /></details>
      </section>
      <section className={styles.firstVisit} id="first-visit" aria-labelledby="first-heading"><div><span className={styles.eyebrow}>A PLACE FOR YOUR QUESTIONS</span><h2 id="first-heading">혼자 오셔도,<br />처음이셔도 괜찮습니다.</h2></div><ol><li><span>01</span><div><h3>책과 모임을 고르고</h3><p>일정, 장소, 참여비와 준비 사항을 확인하세요.</p></div></li><li><span>02</span><div><h3>서로의 생각을 만나고</h3><p>하나의 책을 서로 다른 질문으로 읽습니다.</p></div></li><li><span>03</span><div><h3>나의 이야기를 남겨요</h3><p>마음에 남은 생각을 기록하고 다음 만남으로 이어가세요.</p></div></li></ol></section>
      <ReviewGallery reviews={reviews} />
      <div className={styles.writeRecord}><HomeArchive /></div>
      <section className={styles.tools} aria-labelledby="discussion-title"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>03 / A QUESTION TO BEGIN</span><h2 id="discussion-title">대화의 시작은 좋은 질문.</h2></div><Link href="/giants" className={styles.textLink}>발제 도구 열기 ↗</Link></div><details><summary>함께 나눌 질문 준비하기 ＋</summary><DiscussionGenerator variant="landing" /></details></section>
    </main>
    <footer className={styles.footer}><div><span className={styles.brandMark}>?!</span><h2>다음 질문에서<br />다시 만나요.</h2></div><div><Link href="/bookclub">북클럽</Link><Link href="/archive">모임의 기록</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/terms">이용약관</Link><small>© {new Date().getFullYear()} Qsapiens. 질문하는 사람들.</small></div></footer>
  </div>;
}
