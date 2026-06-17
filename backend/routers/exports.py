import os
import uuid
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.orm import (
    PublishingBook, PublishingChapter, PublishingLayout,
    PublishingImage, PublishingExport,
)
from backend.models.schemas import ExportOut

router = APIRouter(tags=["exports"])
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "./outputs"))


async def _get_book_data(book_id: str, user_id: str, db: AsyncSession):
    """공통: 책+챕터+레이아웃+이미지 로드"""
    book_result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    book = book_result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")

    ch_result = await db.execute(
        select(PublishingChapter)
        .where(PublishingChapter.book_id == book_id)
        .order_by(PublishingChapter.level, PublishingChapter.order_index)
    )
    chapters = ch_result.scalars().all()

    layout_result = await db.execute(
        select(PublishingLayout).where(PublishingLayout.book_id == book_id)
    )
    layout = layout_result.scalar_one_or_none()

    img_result = await db.execute(
        select(PublishingImage)
        .where(PublishingImage.book_id == book_id)
        .order_by(PublishingImage.order_index)
    )
    images = img_result.scalars().all()

    def ch_to_dict(ch):
        return {
            "id": ch.id,
            "parent_id": ch.parent_id,
            "level": ch.level,
            "order_index": ch.order_index,
            "title": ch.title,
            "content": ch.content,
            "page_number": ch.page_number,
            "children": [],
        }

    chapter_dicts = [ch_to_dict(ch) for ch in chapters]

    layout_dict = {}
    if layout:
        layout_dict = {
            "margin_top": layout.margin_top,
            "margin_bottom": layout.margin_bottom,
            "margin_inner": layout.margin_inner,
            "margin_outer": layout.margin_outer,
            "body_font": layout.body_font.replace(" ", ""),
            "heading_font": layout.heading_font.replace(" ", ""),
            "body_font_size": layout.body_font_size,
            "line_height": layout.line_height,
            "image_default_width": layout.image_default_width,
            "header_enabled": layout.header_enabled,
            "header_text": layout.header_text,
            "footer_enabled": layout.footer_enabled,
            "page_number_pos": layout.page_number_pos,
        }

    image_dicts = [
        {
            "id": img.id,
            "chapter_id": img.chapter_id,
            "file_name": img.file_name,
            "file_url": img.file_url,
            "caption": img.caption,
            "alt_text": img.alt_text,
            "width_type": img.width_type,
        }
        for img in images
    ]

    book_dict = {
        "id": book.id,
        "title": book.title,
        "subtitle": book.subtitle,
        "author": book.author,
        "publisher": book.publisher,
        "isbn": book.isbn,
        "publish_date": str(book.publish_date) if book.publish_date else None,
        "price": book.price,
        "copyright_text": book.copyright_text,
        "publisher_bio": book.publisher_bio,
        "page_size": book.page_size,
        "cover_url": book.cover_url,
    }

    return book_dict, chapter_dicts, layout_dict, image_dicts


async def _run_pdf_export(export_id: str, book_dict: dict, chapters: list, layout: dict, images: list, db: AsyncSession):
    from backend.engines.pdf_generator import generate_pdf

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = str(OUTPUT_DIR / f"{export_id}.pdf")

    export_result = await db.execute(
        select(PublishingExport).where(PublishingExport.id == export_id)
    )
    export_obj = export_result.scalar_one_or_none()
    if not export_obj:
        return

    try:
        result = generate_pdf(book_dict, chapters, layout, images, output_path)
        export_obj.status = "completed"
        export_obj.file_url = result["path"]
        export_obj.page_count = result.get("page_count")
        export_obj.file_size_kb = result.get("file_size_kb")
        export_obj.completed_at = datetime.utcnow()
    except Exception as e:
        export_obj.status = "failed"
        export_obj.error_message = str(e)

    await db.commit()


async def _run_epub_export(export_id: str, book_dict: dict, chapters: list, images: list, db: AsyncSession):
    from backend.engines.epub_generator import generate_epub

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = str(OUTPUT_DIR / f"{export_id}.epub")

    export_result = await db.execute(
        select(PublishingExport).where(PublishingExport.id == export_id)
    )
    export_obj = export_result.scalar_one_or_none()
    if not export_obj:
        return

    try:
        result = generate_epub(book_dict, chapters, images, output_path)
        export_obj.status = "completed"
        export_obj.file_url = result["path"]
        export_obj.file_size_kb = result.get("file_size_kb")
        export_obj.completed_at = datetime.utcnow()
    except Exception as e:
        export_obj.status = "failed"
        export_obj.error_message = str(e)

    await db.commit()


@router.post("/books/{book_id}/generate-pdf", response_model=ExportOut)
async def generate_pdf_endpoint(
    book_id: str,
    user_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    book_dict, chapters, layout, images = await _get_book_data(book_id, user_id, db)

    export_id = str(uuid.uuid4())
    export_obj = PublishingExport(
        id=export_id,
        book_id=book_id,
        export_type="pdf",
        status="processing",
    )
    db.add(export_obj)
    await db.commit()
    await db.refresh(export_obj)

    background_tasks.add_task(_run_pdf_export, export_id, book_dict, chapters, layout, images, db)

    return export_obj


@router.post("/books/{book_id}/generate-epub", response_model=ExportOut)
async def generate_epub_endpoint(
    book_id: str,
    user_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    book_dict, chapters, _, images = await _get_book_data(book_id, user_id, db)

    export_id = str(uuid.uuid4())
    export_obj = PublishingExport(
        id=export_id,
        book_id=book_id,
        export_type="epub",
        status="processing",
    )
    db.add(export_obj)
    await db.commit()
    await db.refresh(export_obj)

    background_tasks.add_task(_run_epub_export, export_id, book_dict, chapters, images, db)

    return export_obj


@router.get("/books/{book_id}/exports")
async def list_exports(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    await _get_book_data(book_id, user_id, db)  # verify ownership
    result = await db.execute(
        select(PublishingExport)
        .where(PublishingExport.book_id == book_id)
        .order_by(PublishingExport.created_at.desc())
    )
    return result.scalars().all()


@router.get("/exports/{export_id}/download")
async def download_export(export_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PublishingExport).where(PublishingExport.id == export_id)
    )
    export_obj = result.scalar_one_or_none()
    if not export_obj or export_obj.status != "completed" or not export_obj.file_url:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")

    path = Path(export_obj.file_url)
    if not path.exists():
        raise HTTPException(status_code=404, detail="파일이 삭제되었습니다")

    media_type = "application/pdf" if export_obj.export_type == "pdf" else "application/epub+zip"
    return FileResponse(str(path), media_type=media_type, filename=path.name)
