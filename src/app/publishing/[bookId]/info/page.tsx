"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Loader2, CheckCircle2, Eye, FileText } from "lucide-react";
import { booksApi, colophonApi } from "@/lib/publishing/api";
import type { PublishingBook, BookStatus, PageSize } from "@/lib/publishing/types";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "집필중", label: "집필중" },
  { value: "편집중", label: "편집중" },
  { value: "검수중", label: "검수중" },
  { value: "출판완료", label: "출판완료" },
];

export default function BookInfoPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<PublishingBook | null>(null);
  const [form, setForm] = useState<Partial<PublishingBook>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colophonHtml, setColophonHtml] = useState<string | null>(null);
  const [showColophon, setShowColophon] = useState(false);

  useEffect(() => {
    booksApi.get(bookId).then((b) => {
      setBook(b);
      setForm({
        title: b.title,
        subtitle: b.subtitle || "",
        author: b.author,
        publisher: b.publisher,
        isbn: b.isbn || "",
        publish_date: b.publish_date || "",
        price: b.price,
        copyright_text: b.copyright_text || "",
        publisher_bio: b.publisher_bio || "",
        status: b.status,
        page_size: b.page_size,
      });
    });
  }, [bookId]);

  const set = (key: keyof PublishingBook) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await booksApi.update(bookId, {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        subtitle: (form.subtitle as string) || undefined,
        isbn: (form.isbn as string) || undefined,
        publish_date: (form.publish_date as string) || undefined,
        copyright_text: (form.copyright_text as string) || undefined,
        publisher_bio: (form.publisher_bio as string) || undefined,
      });
      setBook(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handlePreviewColophon() {
    try {
      const res = await colophonApi.preview(bookId);
      setColophonHtml(res.html);
      setShowColophon(true);
    } catch {
      alert("판권 미리보기를 불러올 수 없습니다");
    }
  }

  if (!book) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> 로딩 중...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출판 정보</h1>
          <p className="text-sm text-gray-500 mt-1">판권 페이지와 메타데이터에 사용됩니다</p>
        </div>
        <button
          onClick={handlePreviewColophon}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          판권 미리보기
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Field label="책 제목" required>
            <input
              type="text"
              value={form.title || ""}
              onChange={set("title")}
              className={inputCls}
              required
            />
          </Field>
          <Field label="부제">
            <input
              type="text"
              value={form.subtitle as string || ""}
              onChange={set("subtitle")}
              className={inputCls}
              placeholder="부제목 (선택)"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="저자" required>
              <input
                type="text"
                value={form.author || ""}
                onChange={set("author")}
                className={inputCls}
                required
              />
            </Field>
            <Field label="출판사">
              <input
                type="text"
                value={form.publisher || ""}
                onChange={set("publisher")}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="판형">
              <select value={form.page_size || "A5"} onChange={set("page_size")} className={inputCls}>
                <option value="A5">A5 (148×210mm)</option>
                <option value="신국판">신국판 (153×225mm)</option>
                <option value="국판">국판 (148×210mm)</option>
              </select>
            </Field>
            <Field label="상태">
              <select value={form.status || "집필중"} onChange={set("status")} className={inputCls}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* 출판 정보 */}
        <Section title="출판 정보">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISBN">
              <input
                type="text"
                value={form.isbn as string || ""}
                onChange={set("isbn")}
                className={inputCls}
                placeholder="979-11-XXXXXX-XX-X"
              />
            </Field>
            <Field label="발행일">
              <input
                type="date"
                value={form.publish_date as string || ""}
                onChange={set("publish_date")}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="정가 (원)">
            <input
              type="number"
              value={form.price || ""}
              onChange={set("price")}
              className={inputCls}
              placeholder="15000"
              min={0}
            />
          </Field>
        </Section>

        {/* 저작권 */}
        <Section title="저작권 · 소개">
          <Field label="저작권 문구">
            <textarea
              value={form.copyright_text as string || ""}
              onChange={set("copyright_text")}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="© 2025 저자명. All rights reserved."
            />
          </Field>
          <Field label="출판사 소개">
            <textarea
              value={form.publisher_bio as string || ""}
              onChange={set("publisher_bio")}
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="출판사 소개 문구..."
            />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="w-4 h-4" /> 저장</>
            )}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> 저장되었습니다
            </span>
          )}
        </div>
      </form>

      {/* Colophon preview modal */}
      {showColophon && colophonHtml && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowColophon(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold">판권 페이지 미리보기</h3>
              </div>
              <button
                onClick={() => setShowColophon(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div
              className="p-6"
              dangerouslySetInnerHTML={{ __html: colophonHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
