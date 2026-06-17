"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Loader2, CheckCircle2, Settings } from "lucide-react";
import { layoutApi } from "@/lib/publishing/api";
import type { PublishingLayout } from "@/lib/publishing/types";

const DEFAULT_LAYOUT: Partial<PublishingLayout> = {
  margin_top: 25,
  margin_bottom: 25,
  margin_inner: 25,
  margin_outer: 20,
  body_font: "Noto Serif KR",
  heading_font: "Noto Sans KR",
  body_font_size: 10.5,
  line_height: 1.8,
  image_default_width: "body",
  header_enabled: true,
  header_text: "{chapter_title}",
  footer_enabled: true,
  page_number_pos: "bottom-center",
};

const FONTS = [
  "Noto Serif KR", "Noto Sans KR", "NanumMyeongjo", "NanumGothic",
  "Malgun Gothic", "Apple SD Gothic Neo",
];

const IMAGE_WIDTH_OPTIONS = [
  { value: "body", label: "본문폭 맞춤", desc: "텍스트 컬럼 너비" },
  { value: "full", label: "전체폭 맞춤", desc: "여백 포함 전체" },
  { value: "thumb", label: "썸네일형", desc: "본문폭의 35%" },
  { value: "large", label: "대형 이미지", desc: "본문폭의 85%" },
];

export default function LayoutSettingsPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [layout, setLayout] = useState<Partial<PublishingLayout>>(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    layoutApi.get(bookId)
      .then((l) => setLayout(l))
      .catch(() => {});
  }, [bookId]);

  const set = (key: keyof PublishingLayout) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value;
      setLayout((p) => ({ ...p, [key]: value }));
    };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await layoutApi.save(bookId, layout as PublishingLayout);
      setLayout(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">조판 설정</h1>
        <p className="text-sm text-gray-500 mt-1">PDF 출력 품질을 결정하는 레이아웃 설정</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 여백 설정 */}
        <Section title="여백 (mm)">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "margin_top", label: "상단 여백" },
              { key: "margin_bottom", label: "하단 여백" },
              { key: "margin_inner", label: "내부 여백 (제본쪽)" },
              { key: "margin_outer", label: "외부 여백" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={layout[key as keyof PublishingLayout] as number || 0}
                    onChange={set(key as keyof PublishingLayout)}
                    step={0.5}
                    min={10}
                    max={50}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual margin preview */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2 font-medium">여백 미리보기</p>
            <div className="relative w-28 h-36 border-2 border-gray-300 bg-white mx-auto rounded-sm">
              <div
                className="absolute bg-indigo-50 border border-indigo-100 rounded-sm"
                style={{
                  top: `${(layout.margin_top || 25) / 2}%`,
                  bottom: `${(layout.margin_bottom || 25) / 2}%`,
                  left: `${(layout.margin_inner || 25) / 2}%`,
                  right: `${(layout.margin_outer || 20) / 2}%`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="space-y-0.5 w-full px-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-0.5 bg-indigo-200 rounded" style={{ width: `${60 + i * 10}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 타이포그래피 */}
        <Section title="타이포그래피">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">본문 폰트</label>
              <select value={layout.body_font || ""} onChange={set("body_font")} className={selectCls}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">제목 폰트</label>
              <select value={layout.heading_font || ""} onChange={set("heading_font")} className={selectCls}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">본문 크기 (pt)</label>
              <div className="relative">
                <input
                  type="number"
                  value={layout.body_font_size || 10.5}
                  onChange={set("body_font_size")}
                  step={0.5}
                  min={8}
                  max={16}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">pt</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">행간 (배수)</label>
              <input
                type="number"
                value={layout.line_height || 1.8}
                onChange={set("line_height")}
                step={0.1}
                min={1.2}
                max={3.0}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Section>

        {/* 이미지 설정 */}
        <Section title="이미지 기본 설정">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3">기본 이미지 폭</label>
            <div className="grid grid-cols-2 gap-3">
              {IMAGE_WIDTH_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLayout((p) => ({ ...p, image_default_width: value as any }))}
                  className={`border rounded-xl p-3 text-left transition-all ${
                    layout.image_default_width === value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-xs font-semibold ${
                    layout.image_default_width === value ? "text-indigo-700" : "text-gray-800"
                  }`}>{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* 머리말/꼬리말 */}
        <Section title="머리말 · 꼬리말">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">머리말 표시</p>
                <p className="text-xs text-gray-500">{"{chapter_title}"} 사용 가능</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layout.header_enabled ?? true}
                  onChange={set("header_enabled")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
            {layout.header_enabled && (
              <input
                type="text"
                value={layout.header_text || ""}
                onChange={set("header_text")}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="{chapter_title}"
              />
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">꼬리말 / 페이지 번호</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layout.footer_enabled ?? true}
                  onChange={set("footer_enabled")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
            {layout.footer_enabled && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">페이지 번호 위치</label>
                <select value={layout.page_number_pos || "bottom-center"} onChange={set("page_number_pos")} className={selectCls}>
                  <option value="bottom-center">하단 중앙</option>
                  <option value="bottom-outer">하단 바깥쪽</option>
                  <option value="bottom-inner">하단 안쪽</option>
                </select>
              </div>
            )}
          </div>
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
              <><Save className="w-4 h-4" /> 설정 저장</>
            )}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> 저장되었습니다
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

const selectCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
