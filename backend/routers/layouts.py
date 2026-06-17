from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from backend.database import get_db
from backend.models.orm import PublishingBook, PublishingLayout
from backend.models.schemas import LayoutUpdate, LayoutOut

router = APIRouter(tags=["layouts"])


@router.get("/books/{book_id}/layout", response_model=LayoutOut)
async def get_layout(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    await _verify_book(db, book_id, user_id)
    result = await db.execute(
        select(PublishingLayout).where(PublishingLayout.book_id == book_id)
    )
    layout = result.scalar_one_or_none()
    if not layout:
        # Create default
        layout = PublishingLayout(id=str(uuid.uuid4()), book_id=book_id)
        db.add(layout)
        await db.commit()
        await db.refresh(layout)
    return layout


@router.put("/books/{book_id}/layout", response_model=LayoutOut)
async def save_layout(
    book_id: str,
    data: LayoutUpdate,
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    await _verify_book(db, book_id, user_id)
    result = await db.execute(
        select(PublishingLayout).where(PublishingLayout.book_id == book_id)
    )
    layout = result.scalar_one_or_none()
    if not layout:
        layout = PublishingLayout(id=str(uuid.uuid4()), book_id=book_id)
        db.add(layout)

    for field, value in data.model_dump().items():
        setattr(layout, field, value)

    await db.commit()
    await db.refresh(layout)
    return layout


@router.get("/books/{book_id}/colophon")
async def preview_colophon(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    from backend.engines.colophon_generator import generate_colophon_html

    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")

    html = generate_colophon_html(
        title=book.title,
        subtitle=book.subtitle,
        author=book.author,
        publisher=book.publisher,
        publish_date=book.publish_date,
        isbn=book.isbn,
        price=book.price,
        copyright_text=book.copyright_text,
        publisher_bio=book.publisher_bio,
    )
    return {"html": html}


async def _verify_book(db: AsyncSession, book_id: str, user_id: str):
    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")
