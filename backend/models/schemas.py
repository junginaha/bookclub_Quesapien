from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class BookStatus(str, Enum):
    drafting = "집필중"
    editing = "편집중"
    reviewing = "검수중"
    published = "출판완료"


class PageSize(str, Enum):
    a5 = "A5"
    sinkukpan = "신국판"
    kukpan = "국판"


class ImageWidthType(str, Enum):
    body = "body"
    full = "full"
    thumb = "thumb"
    large = "large"


class ExportType(str, Enum):
    pdf = "pdf"
    epub = "epub"


class ExportStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# ── Book schemas ────────────────────────────────────────────
class BookCreate(BaseModel):
    title: str = "제목 없음"
    subtitle: Optional[str] = None
    author: str = ""
    publisher: str = "19호실"
    isbn: Optional[str] = None
    publish_date: Optional[date] = None
    price: Optional[int] = None
    copyright_text: Optional[str] = None
    publisher_bio: Optional[str] = None
    page_size: PageSize = PageSize.a5


class BookUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    isbn: Optional[str] = None
    publish_date: Optional[date] = None
    price: Optional[int] = None
    copyright_text: Optional[str] = None
    publisher_bio: Optional[str] = None
    status: Optional[BookStatus] = None
    cover_url: Optional[str] = None
    back_cover_url: Optional[str] = None
    page_size: Optional[PageSize] = None


class BookOut(BaseModel):
    id: str
    user_id: str
    title: str
    subtitle: Optional[str]
    author: str
    publisher: str
    isbn: Optional[str]
    publish_date: Optional[date]
    price: Optional[int]
    copyright_text: Optional[str]
    publisher_bio: Optional[str]
    status: BookStatus
    cover_url: Optional[str]
    back_cover_url: Optional[str]
    page_size: PageSize
    created_at: datetime
    updated_at: datetime


# ── Chapter schemas ─────────────────────────────────────────
class ChapterOut(BaseModel):
    id: str
    book_id: str
    parent_id: Optional[str]
    level: int
    order_index: int
    title: str
    content: Optional[str]
    page_number: Optional[int]
    children: List["ChapterOut"] = []


ChapterOut.model_rebuild()


# ── Layout schemas ──────────────────────────────────────────
class LayoutUpdate(BaseModel):
    margin_top: float = 25
    margin_bottom: float = 25
    margin_inner: float = 25
    margin_outer: float = 20
    body_font: str = "Noto Serif KR"
    heading_font: str = "Noto Sans KR"
    body_font_size: float = 10.5
    line_height: float = 1.8
    image_default_width: ImageWidthType = ImageWidthType.body
    header_enabled: bool = True
    header_text: str = "{chapter_title}"
    footer_enabled: bool = True
    page_number_pos: str = "bottom-center"


class LayoutOut(LayoutUpdate):
    id: str
    book_id: str


# ── Export schemas ──────────────────────────────────────────
class ExportOut(BaseModel):
    id: str
    book_id: str
    export_type: ExportType
    status: ExportStatus
    file_url: Optional[str]
    page_count: Optional[int]
    file_size_kb: Optional[int]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


# ── AI schemas ──────────────────────────────────────────────
class AIAction(str, Enum):
    spell_check = "spell_check"
    summary = "summary"
    description = "description"
    style_unify = "style_unify"


class AIRequest(BaseModel):
    action: AIAction


class SpellSuggestion(BaseModel):
    text: str
    issue: str
    suggestion: str


class AISpellCheckOut(BaseModel):
    suggestions: List[SpellSuggestion]


class AISummaryOut(BaseModel):
    summary: str


class AIDescriptionOut(BaseModel):
    description: str
    promo: str
    keywords: List[str]


class AIStyleOut(BaseModel):
    suggestions: List[str]
