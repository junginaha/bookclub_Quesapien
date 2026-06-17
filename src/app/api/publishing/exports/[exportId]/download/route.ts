import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.PUBLISHING_BACKEND_URL || "http://localhost:8001";

type Params = { params: Promise<{ exportId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { exportId } = await params;
  const res = await fetch(`${BACKEND}/api/exports/${exportId}/download`);
  if (!res.ok) return NextResponse.json({ error: "파일을 찾을 수 없습니다" }, { status: 404 });

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = res.headers.get("content-disposition") || "";
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
