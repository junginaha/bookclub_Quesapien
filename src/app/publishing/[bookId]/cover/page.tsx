"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

type CoverType = "front" | "back";

export default function CoverPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<CoverType | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  async function handleUpload(type: CoverType, file: File) {
    const url = URL.createObjectURL(file);
    setUploading(type);
    await new Promise((r) => setTimeout(r, 800)); // simulate
    if (type === "front") setFrontUrl(url);
    else setBackUrl(url);
    setUploading(null);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">표지 관리</h1>
        <p className="text-sm text-gray-500 mt-1">앞표지와 뒷표지를 등록하면 PDF와 ePub에 자동 적용됩니다</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <CoverUploader
          type="front"
          label="앞표지"
          previewUrl={frontUrl}
          uploading={uploading === "front"}
          inputRef={frontRef}
          onSelect={(f) => handleUpload("front", f)}
          onRemove={() => setFrontUrl(null)}
          onClick={() => frontRef.current?.click()}
        />
        <CoverUploader
          type="back"
          label="뒷표지"
          previewUrl={backUrl}
          uploading={uploading === "back"}
          inputRef={backRef}
          onSelect={(f) => handleUpload("back", f)}
          onRemove={() => setBackUrl(null)}
          onClick={() => backRef.current?.click()}
        />
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
        <p className="text-xs font-semibold text-amber-800 mb-2">표지 이미지 가이드</p>
        <ul className="space-y-1">
          {[
            "권장 해상도: 300 DPI 이상 (인쇄용)",
            "권장 크기: 판형 기준 (A5 = 148×210mm, 신국판 = 153×225mm)",
            "지원 형식: JPG, PNG, WEBP",
            "ePub 표지는 최대 1200px 폭으로 자동 최적화됩니다",
          ].map((tip) => (
            <li key={tip} className="text-xs text-amber-700 flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CoverUploader({
  label, previewUrl, uploading, inputRef, onSelect, onRemove, onClick,
}: {
  type: CoverType;
  label: string;
  previewUrl: string | null;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (f: File) => void;
  onRemove: () => void;
  onClick: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
      <div
        className={`relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
          previewUrl
            ? "border-indigo-200"
            : "border-dashed border-gray-200 hover:border-indigo-300"
        }`}
        style={{ aspectRatio: "148/210" }}
        onClick={!previewUrl ? onClick : undefined}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-700">등록됨</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
            {uploading ? (
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-gray-200" />
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500">클릭하여 업로드</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</p>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg">
                  <Upload className="w-3.5 h-3.5" />
                  이미지 선택
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
