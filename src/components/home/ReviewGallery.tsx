import Link from "next/link";
import ArchiveVideo from "@/components/archive/ArchiveVideo";
import styles from "./editorial.module.css";
export interface PublicReview { id: string; type: string; content: string; author_name: string; photo_url: string | null; video_url: string | null; created_at: string; }
export default function ReviewGallery({ reviews }: { reviews: PublicReview[] }) {
  return <section className={styles.archive} id="records" aria-labelledby="record-heading">
    <div className={styles.sectionHead}><div><span className={styles.eyebrow}>02 / OUR JOURNAL</span><h2 id="record-heading">모임은 끝나도,<br />이야기는 남습니다.</h2></div><Link className={styles.textLink} href="/archive">모든 기록 보기 ↗</Link></div>
    <p className={styles.sectionLead}>함께 읽고 나눈 생각을 글과 사진, 영상으로 만나보세요.</p>
    {reviews.length ? <div className={styles.reviewGrid}>{reviews.slice(0, 3).map(review => <article key={review.id} className={styles.reviewCard}>
      {review.video_url ? <ArchiveVideo key={review.video_url} url={review.video_url} title={`${review.author_name || "참여자"}의 모임 기록`} /> : review.photo_url ? <img src={review.photo_url} alt="참여자가 공개한 모임 기록" loading="lazy" className={styles.reviewPhoto} /> : <div className={styles.quoteMark} aria-hidden="true">“</div>}
      <div className={styles.reviewBody}><span className={styles.eyebrow}>{review.video_url ? "영상 기록" : review.photo_url ? "사진 기록" : "참여자의 생각"}</span><p>{review.content}</p><span className={styles.byline}>{review.author_name || "익명"}</span></div>
    </article>)}</div> : <div className={styles.emptyRecord}><span aria-hidden="true">“</span><p>한 문장의 생각도,<br />우리 모임의 소중한 기록이 됩니다.</p><a className={styles.textLink} href="#testify">첫 기록 남기기 ↗</a></div>}
  </section>;
}
