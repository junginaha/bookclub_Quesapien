"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./home-tools.module.css";

type MediaKind = "text" | "photo" | "video";
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MEDIA_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };

export default function HomeArchive() {
  const [kind, setKind] = useState<MediaKind>("text");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const sending = useRef(false);
  const uploaded = useRef<{ file: File; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function changeKind(value: MediaKind) {
    setKind(value); setFile(null); setVideoLink(""); setMessage("");
    uploaded.current = null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || sending.current) return;
    sending.current = true; setBusy(true); setMessage(""); setSaved(false);
    try {
      const client = createClient();
      if (!isPublic) {
        const { data, error } = await client.auth.getUser();
        if (error || !data.user) throw new Error("나만 보기 기록은 로그인 후 저장할 수 있습니다.");
        if (kind !== "text") throw new Error("사진·영상은 공개 기록에서만 첨부할 수 있습니다.");
      }
      if (kind !== "text" && !file && !(kind === "video" && videoLink.trim())) throw new Error("첨부할 파일이나 영상 링크를 선택해 주세요.");
      let mediaUrl: string | null = kind === "video" ? videoLink.trim() || null : null;
      if (file) {
        const allowed = kind === "photo" ? PHOTO_TYPES : VIDEO_TYPES;
        const maxMb = kind === "photo" ? 10 : 50;
        if (!allowed.includes(file.type) || file.size > maxMb * 1024 * 1024) throw new Error(`지원되는 ${kind === "photo" ? "사진" : "영상"} 파일을 ${maxMb}MB 이하로 선택해 주세요.`);
        if (uploaded.current?.file === file) mediaUrl = uploaded.current.url;
        else {
          // Upload directly to the existing reviews bucket, avoiding the server request-size limit.
          const extension = MEDIA_EXT[file.type];
          const path = `reviews/${crypto.randomUUID()}.${extension ?? "bin"}`;
          const { data, error } = await client.storage.from("reviews").upload(path, file, { contentType: file.type, upsert: false });
          if (error) throw new Error("파일 업로드에 실패했습니다. 다시 시도해 주세요.");
          mediaUrl = client.storage.from("reviews").getPublicUrl(data.path).data.publicUrl;
          uploaded.current = { file, url: mediaUrl };
        }
      }
      const response = await fetch("/api/archive/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: kind, content: content.trim(), author_name: name.trim() || "익명", photo_url: kind === "photo" ? mediaUrl : null, video_url: kind === "video" ? mediaUrl : null, is_public: isPublic }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "저장하지 못했습니다. 다시 시도해 주세요.");
      setSaved(true); setMessage("기록을 저장했습니다."); setContent(""); setFile(null); setVideoLink("");
      uploaded.current = null;
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."); }
    finally { sending.current = false; setBusy(false); }
  }

  return <section className={styles.section} id="testify" aria-labelledby="archive-title">
    <div className={styles.sectionHead}><h2 id="archive-title">아카이빙</h2><Link className={styles.secondary} href="/archive">기록 보기</Link></div>
    <details className={styles.disclosure}>
      <summary>기록 남기기</summary>
      <form className={styles.form} onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className={styles.formRow}>
            <label>형식<select value={kind} onChange={event => changeKind(event.target.value as MediaKind)}><option value="text">글</option><option value="photo" disabled={!isPublic}>사진</option><option value="video" disabled={!isPublic}>영상</option></select></label>
            <label>공개 범위<select value={String(isPublic)} onChange={event => setIsPublic(event.target.value === "true")}><option value="true">공개</option><option value="false" disabled={kind !== "text"}>나만 보기 · 로그인 필요</option></select></label>
          </div>
          <label>이름<input value={name} onChange={event => setName(event.target.value)} maxLength={50} placeholder="미입력 시 익명" autoComplete="nickname" /></label>
          <label>내용<textarea value={content} onChange={event => setContent(event.target.value)} required maxLength={4000} rows={4} /></label>
          {kind !== "text" && <label>파일 · {kind === "photo" ? "사진 10MB" : "영상 50MB"} 이하<input key={kind} ref={inputRef} type="file" accept={(kind === "photo" ? PHOTO_TYPES : VIDEO_TYPES).join(",")} onChange={event => { setFile(event.target.files?.[0] ?? null); uploaded.current = null; }} /></label>}
          {kind === "video" && !file && <label>또는 YouTube·Vimeo 링크<input type="url" value={videoLink} onChange={event => setVideoLink(event.target.value)} placeholder="https://" /></label>}
          {kind !== "text" && <p className={styles.hint}>첨부 파일은 공개 링크로 저장됩니다.</p>}
          <div className={styles.actions}><button className={styles.primary} type="submit" disabled={busy || !content.trim()}>{busy ? "저장 중…" : "기록 저장"}</button></div>
        </fieldset>
        {message && <p role={saved ? "status" : "alert"} className={styles.notice}>{message} {saved && <Link href={isPublic ? "/archive" : "/archive?mine=true"}>저장된 기록 보기</Link>}</p>}
      </form>
    </details>
  </section>;
}
