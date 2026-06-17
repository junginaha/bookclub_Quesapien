import os
import uuid
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.database import get_db
from backend.models.orm import PublishingBook, PublishingManuscript, PublishingChapter
from backend.models.schemas import ChapterOut
from backend.engines.manuscript_parser import parse_manuscript, extract_all_chapters_flat

router = APIRouter(tags=["manuscripts"])
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))


@router.post("/books/{book_id}/manuscript")
async def upload_manuscript(
    book_id: str,
    user_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Verify ownership
    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")

    # Save file
    suffix = Path(file.filename or "manuscript.txt").suffix.lower()
    allowed = {".docx", ".txt", ".md", ".markdown"}
    if suffix not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 형식입니다. 허용: {', '.join(allowed)}"
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())
    save_name = f"{file_id}{suffix}"
    save_path = UPLOAD_DIR / save_name

    content = await file.read()
    save_path.write_bytes(content)

    file_type = suffix.lstrip(".")
    if file_type == "markdown":
        file_type = "md"

    # Parse
    try:
        chapters = parse_manuscript(save_path)
    except Exception as e:
        save_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"원고 파싱 실패: {e}")

    # Save manuscript record
    manuscript = PublishingManuscript(
        id=file_id,
        book_id=book_id,
        file_name=file.filename or save_name,
        file_url=str(save_path),
        file_type=file_type,
        raw_content=save_path.read_text(encoding="utf-8", errors="replace") if suffix != ".docx" else None,
        parsed_at=datetime.utcnow(),
    )
    db.add(manuscript)

    # Clear existing chapters
    await db.execute(
        delete(PublishingChapter).where(PublishingChapter.book_id == book_id)
    )

    # Save parsed chapters
    flat = extract_all_chapters_flat(chapters)
    for ch in flat:
        db_ch = PublishingChapter(
            id=ch.id,
            book_id=book_id,
            parent_id=ch.parent_id,
            level=ch.level,
            order_index=ch.order_index,
            title=ch.title,
            content=ch.content,
        )
        db.add(db_ch)

    await db.commit()

    return {
        "manuscript_id": file_id,
        "file_name": file.filename,
        "chapter_count": len(flat),
        "message": f"원고 업로드 완료. {len(flat)}개 챕터 파싱됨.",
    }


@router.get("/books/{book_id}/chapters")
async def get_chapters(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")

    result = await db.execute(
        select(PublishingChapter)
        .where(PublishingChapter.book_id == book_id)
        .order_by(PublishingChapter.level, PublishingChapter.order_index)
    )
    chapters = result.scalars().all()

    # Build tree
    chapter_map = {ch.id: {
        "id": ch.id,
        "book_id": ch.book_id,
        "parent_id": ch.parent_id,
        "level": ch.level,
        "order_index": ch.order_index,
        "title": ch.title,
        "content": ch.content,
        "page_number": ch.page_number,
        "children": [],
    } for ch in chapters}

    roots = []
    for ch in chapter_map.values():
        pid = ch["parent_id"]
        if pid and pid in chapter_map:
            chapter_map[pid]["children"].append(ch)
        else:
            roots.append(ch)

    return roots
