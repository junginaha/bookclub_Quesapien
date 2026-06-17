from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from backend.database import get_db
from backend.models.orm import PublishingBook, PublishingLayout
from backend.models.schemas import BookCreate, BookUpdate, BookOut, LayoutOut

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=List[BookOut])
async def list_books(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PublishingBook).where(PublishingBook.user_id == user_id)
        .order_by(PublishingBook.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
async def create_book(data: BookCreate, user_id: str, db: AsyncSession = Depends(get_db)):
    book = PublishingBook(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **data.model_dump(exclude_none=True),
    )
    db.add(book)
    # Create default layout
    layout = PublishingLayout(id=str(uuid.uuid4()), book_id=book.id)
    db.add(layout)
    await db.commit()
    await db.refresh(book)
    return book


@router.get("/{book_id}", response_model=BookOut)
async def get_book(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    book = await _get_or_404(db, book_id, user_id)
    return book


@router.patch("/{book_id}", response_model=BookOut)
async def update_book(
    book_id: str, data: BookUpdate, user_id: str, db: AsyncSession = Depends(get_db)
):
    book = await _get_or_404(db, book_id, user_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(book, field, value)
    await db.commit()
    await db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: str, user_id: str, db: AsyncSession = Depends(get_db)):
    book = await _get_or_404(db, book_id, user_id)
    await db.delete(book)
    await db.commit()


async def _get_or_404(db: AsyncSession, book_id: str, user_id: str) -> PublishingBook:
    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")
    return book
