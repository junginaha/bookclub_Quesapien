import { NextRequest, NextResponse } from "next/server";
import { generateBookClubContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { keyword?: string };
    const { keyword } = body;

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (keyword.trim().length > 100) {
      return NextResponse.json(
        { error: "키워드는 100자 이하로 입력해주세요." },
        { status: 400 }
      );
    }

    const result = await generateBookClubContent(keyword.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "AI 발제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
