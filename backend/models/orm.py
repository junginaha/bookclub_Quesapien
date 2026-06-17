from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from backend.database import Base


def new_uuid():
    return str(uuid.uuid4())


class PublishingBook(Base):
    __tablename__ = "publishing_books"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False, default="제목 없음")
    subtitle = Column(String)
    author = Column(String, nullable=False, default="")
    publisher = Column(String, nullable=False, default="19호실")
    isbn = Column(String)
    publish_date = Column(Date)
    price = Column(Integer)
    copyright_text = Column(Text)
    publisher_bio = Column(Text)
    status = Column(String, nullable=False, default="집필중")
    cover_url = Column(String)
    back_cover_url = Column(String)
    page_size = Column(String, nullable=False, default="A5")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    manuscripts = relationship("PublishingManuscript", back_populates="book", cascade="all, delete-orphan")
    chapters = relationship("PublishingChapter", back_populates="book", cascade="all, delete-orphan")
    layout = relationship("PublishingLayout", back_populates="book", uselist=False, cascade="all, delete-orphan")
    images = relationship("PublishingImage", back_populates="book", cascade="all, delete-orphan")
    exports = relationship("PublishingExport", back_populates="book", cascade="all, delete-orphan")


class PublishingManuscript(Base):
    __tablename__ = "publishing_manuscripts"

    id = Column(String, primary_key=True, default=new_uuid)
    book_id = Column(String, ForeignKey("publishing_books.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    raw_content = Column(Text)
    parsed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("PublishingBook", back_populates="manuscripts")


class PublishingChapter(Base):
    __tablename__ = "publishing_chapters"

    id = Column(String, primary_key=True, default=new_uuid)
    book_id = Column(String, ForeignKey("publishing_books.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(String, ForeignKey("publishing_chapters.id", ondelete="CASCADE"))
    level = Column(Integer, nullable=False, default=1)
    order_index = Column(Integer, nullable=False, default=0)
    title = Column(String, nullable=False)
    content = Column(Text)
    page_number = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("PublishingBook", back_populates="chapters")
    children = relationship("PublishingChapter", back_populates="parent")
    parent = relationship("PublishingChapter", back_populates="children", remote_side="PublishingChapter.id")


class PublishingLayout(Base):
    __tablename__ = "publishing_layouts"

    id = Column(String, primary_key=True, default=new_uuid)
    book_id = Column(String, ForeignKey("publishing_books.id", ondelete="CASCADE"), nullable=False, unique=True)
    margin_top = Column(Float, nullable=False, default=25)
    margin_bottom = Column(Float, nullable=False, default=25)
    margin_inner = Column(Float, nullable=False, default=25)
    margin_outer = Column(Float, nullable=False, default=20)
    body_font = Column(String, nullable=False, default="Noto Serif KR")
    heading_font = Column(String, nullable=False, default="Noto Sans KR")
    body_font_size = Column(Float, nullable=False, default=10.5)
    line_height = Column(Float, nullable=False, default=1.8)
    image_default_width = Column(String, nullable=False, default="body")
    header_enabled = Column(Boolean, nullable=False, default=True)
    header_text = Column(String, nullable=False, default="{chapter_title}")
    footer_enabled = Column(Boolean, nullable=False, default=True)
    page_number_pos = Column(String, nullable=False, default="bottom-center")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    book = relationship("PublishingBook", back_populates="layout")


class PublishingImage(Base):
    __tablename__ = "publishing_images"

    id = Column(String, primary_key=True, default=new_uuid)
    book_id = Column(String, ForeignKey("publishing_books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(String, ForeignKey("publishing_chapters.id", ondelete="SET NULL"))
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    caption = Column(String)
    alt_text = Column(String)
    width_type = Column(String, nullable=False, default="body")
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("PublishingBook", back_populates="images")


class PublishingExport(Base):
    __tablename__ = "publishing_exports"

    id = Column(String, primary_key=True, default=new_uuid)
    book_id = Column(String, ForeignKey("publishing_books.id", ondelete="CASCADE"), nullable=False)
    export_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    file_url = Column(String)
    page_count = Column(Integer)
    file_size_kb = Column(Integer)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    book = relationship("PublishingBook", back_populates="exports")
