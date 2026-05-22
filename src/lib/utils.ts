import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = dayNames[date.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}

export function getParticipantRatio(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    관계: "bg-rose-50 text-rose-700",
    자아: "bg-violet-50 text-violet-700",
    사회: "bg-blue-50 text-blue-700",
    감정: "bg-amber-50 text-amber-700",
    철학: "bg-slate-50 text-slate-700",
    일과삶: "bg-emerald-50 text-emerald-700",
    사랑: "bg-pink-50 text-pink-700",
    성장: "bg-green-50 text-green-700",
  };
  return colors[category] ?? "bg-gray-50 text-gray-700";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: "참여 가능",
    live: "진행 중",
    closed: "마감",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    upcoming: "bg-emerald-50 text-emerald-700 border-emerald-200",
    live: "bg-red-50 text-red-600 border-red-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return colors[status] ?? "bg-gray-50 text-gray-500 border-gray-200";
}
