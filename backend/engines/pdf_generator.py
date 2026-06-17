"""
PDF 생성 엔진 (ReportLab 기반)
- 표지 → 판권 → 목차 → 본문 (장별 시작 페이지 포함)
- 페이지 번호, 머리말/꼬리말
- 이미지 자동 배치
- 500페이지 이상 안정적 처리
"""
from __future__ import annotations

import io
import os
import re
from pathlib import Path
from typing import Optional

from reportlab.lib.units import mm
from reportlab.lib.pagesizes import A5
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, Image as RLImage,
    PageBreak, Table, TableStyle, KeepTogether, NextPageTemplate,
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus.doctemplate import _doNothing

from .typesetting import build_page_spec, build_styles, PAGE_SIZES
from .colophon_generator import generate_colophon_reportlab_elements
from .toc_generator import build_toc, generate_toc_pdf_elements

FONT_DIR = Path(__file__).parent.parent / "fonts"


def _register_korean_fonts():
    fonts = {
        "NotoSerifKR": "NotoSerifKR-Regular.ttf",
        "NotoSerifKR-Bold": "NotoSerifKR-Bold.ttf",
        "NotoSansKR": "NotoSansKR-Regular.ttf",
        "NotoSansKR-Bold": "NotoSansKR-Bold.ttf",
    }
    registered = pdfmetrics.getRegisteredFontNames()
    for name, filename in fonts.items():
        if name not in registered:
            fpath = FONT_DIR / filename
            if fpath.exists():
                pdfmetrics.registerFont(TTFont(name, str(fpath)))


class PublishingDocTemplate(BaseDocTemplate):
    def __init__(self, filename, book: dict, layout: dict, **kwargs):
        self.book = book
        self.layout = layout
        self._current_chapter = ""
        self._page_number_offset = 0  # front matter pages excluded from numbering
        super().__init__(filename, **kwargs)

    def handle_pageBegin(self):
        self._current_chapter = getattr(self, "_next_chapter", self._current_chapter)
        super().handle_pageBegin()

    def afterPage(self):
        pass


def _header_footer(canvas, doc):
    """머리말/꼬리말 렌더링 콜백"""
    book = doc.book
    layout = doc.layout
    page_spec = build_page_spec({**layout, "page_size": book.get("page_size", "A5")})

    canvas.saveState()
    font_name = "NotoSansKR"
    font_size = 8
    canvas.setFont(font_name, font_size)
    canvas.setFillColor(HexColor("#888888"))

    page_num = canvas.getPageNumber()
    w = page_spec.width
    h = page_spec.height
    mi = page_spec.margin_inner
    mo = page_spec.margin_outer
    mt = page_spec.margin_top
    mb = page_spec.margin_bottom

    # Determine if left or right page
    is_left = (page_num % 2 == 0)
    left_margin = mo if is_left else mi
    right_margin = mi if is_left else mo

    if layout.get("header_enabled", True) and page_num > 3:
        header_y = h - mt + 8 * mm
        chapter_title = getattr(doc, "_current_chapter", "")
        header_text = layout.get("header_text", "{chapter_title}").replace(
            "{chapter_title}", chapter_title
        )
        if is_left:
            canvas.drawString(left_margin, header_y, book.get("title", ""))
        else:
            canvas.drawRightString(w - right_margin, header_y, header_text)
        canvas.setLineWidth(0.3)
        canvas.setStrokeColor(HexColor("#cccccc"))
        canvas.line(left_margin, header_y - 2 * mm, w - right_margin, header_y - 2 * mm)

    if layout.get("footer_enabled", True) and page_num > 3:
        footer_y = mb - 8 * mm
        pos = layout.get("page_number_pos", "bottom-center")
        page_str = str(page_num - 3)  # skip cover/colophon/toc
        if pos == "bottom-center":
            canvas.drawCentredString(w / 2, footer_y, page_str)
        elif pos == "bottom-outer":
            if is_left:
                canvas.drawString(left_margin, footer_y, page_str)
            else:
                canvas.drawRightString(w - right_margin, footer_y, page_str)
        else:  # bottom-inner
            if is_left:
                canvas.drawRightString(w - right_margin, footer_y, page_str)
            else:
                canvas.drawString(left_margin, footer_y, page_str)

    canvas.restoreState()


def generate_pdf(
    book: dict,
    chapters: list[dict],
    layout: dict,
    images: list[dict],
    output_path: str,
) -> dict:
    """
    완전한 PDF 생성
    Returns: {"path": str, "page_count": int, "file_size_kb": int}
    """
    _register_korean_fonts()

    page_spec = build_page_spec({**layout, "page_size": book.get("page_size", "A5")})
    styles = build_styles(layout)

    doc = PublishingDocTemplate(
        output_path,
        book=book,
        layout=layout,
        pagesize=(page_spec.width, page_spec.height),
        leftMargin=page_spec.margin_inner,
        rightMargin=page_spec.margin_outer,
        topMargin=page_spec.margin_top,
        bottomMargin=page_spec.margin_bottom,
        title=book.get("title", ""),
        author=book.get("author", ""),
    )

    # Body frame
    body_frame = Frame(
        page_spec.margin_inner,
        page_spec.margin_bottom,
        page_spec.body_width,
        page_spec.body_height,
        id="body",
    )

    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[body_frame]),
        PageTemplate(id="body", frames=[body_frame], onPage=_header_footer),
    ])

    story: list = []

    # ── 표지 ──────────────────────────────────────────────────
    story.extend(_build_cover_page(book, styles, page_spec))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    # ── 판권 ──────────────────────────────────────────────────
    story.extend(generate_colophon_reportlab_elements(book, styles))
    story.append(PageBreak())

    # ── 목차 ──────────────────────────────────────────────────
    toc = build_toc(chapters)
    story.extend(generate_toc_pdf_elements(toc, styles, page_spec))
    story.append(PageBreak())

    # ── 본문 ──────────────────────────────────────────────────
    image_map = {img["chapter_id"]: img for img in images if img.get("chapter_id")}

    for ch in _flat_chapters(chapters):
        level = ch.get("level", 1)
        title = ch.get("title", "")
        content = ch.get("content", "") or ""

        if level == 1:
            doc._current_chapter = title
            story.append(PageBreak())
            story.extend(_build_chapter_start(title, ch.get("order_index", 1), styles, page_spec))

        elif level == 2:
            story.append(Paragraph(title, styles["heading2"]))
        else:
            story.append(Paragraph(title, styles["heading3"]))

        # Body content
        for para_text in _split_paragraphs(content):
            if para_text.startswith("```"):
                code = para_text.strip("`").strip()
                story.append(Paragraph(code, styles["code"]))
            elif para_text.startswith("> "):
                story.append(Paragraph(para_text[2:], styles["quote"]))
            else:
                story.append(Paragraph(para_text, styles["body"]))

        # Inline image for this chapter
        if ch["id"] in image_map:
            img_data = image_map[ch["id"]]
            story.extend(_build_image_element(img_data, styles, page_spec))

    # Build
    doc.build(story)

    path = Path(output_path)
    file_size_kb = path.stat().st_size // 1024 if path.exists() else 0

    # Estimate page count (we can't easily get it without parsing the PDF)
    try:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(output_path)
        page_count = len(reader.pages)
    except Exception:
        page_count = len(chapters) * 2  # rough estimate

    return {
        "path": output_path,
        "page_count": page_count,
        "file_size_kb": file_size_kb,
    }


def _build_cover_page(book: dict, styles: dict, page_spec) -> list:
    elements = []
    elements.append(Spacer(1, page_spec.height * 0.25))
    elements.append(Paragraph(book.get("title", ""), styles["chapter_title_page"]))
    if book.get("subtitle"):
        elements.append(Spacer(1, 8 * mm))
        elements.append(Paragraph(book["subtitle"], styles["heading2"]))
    elements.append(Spacer(1, 16 * mm))
    elements.append(Paragraph(book.get("author", ""), styles["heading3"]))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(book.get("publisher", "19호실"), styles["body"]))
    return elements


def _build_chapter_start(title: str, chapter_num: int, styles: dict, page_spec) -> list:
    elements = []
    elements.append(Spacer(1, page_spec.height * 0.3))
    elements.append(Paragraph(f"제 {chapter_num} 장", styles["heading3"]))
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(title, styles["chapter_title_page"]))
    elements.append(Spacer(1, page_spec.height * 0.15))
    return elements


def _build_image_element(img: dict, styles: dict, page_spec) -> list:
    elements = []
    src = img.get("file_url") or img.get("src", "")
    if not src or not Path(src).exists():
        return elements

    width_type = img.get("width_type", "body")
    from .image_processor import WIDTH_RATIOS
    ratio = WIDTH_RATIOS.get(width_type, 1.0)
    max_w = page_spec.body_width * ratio
    max_h = page_spec.body_height * 0.7

    try:
        rl_img = RLImage(src, width=max_w, height=max_h, kind="proportional")
        elements.append(Spacer(1, 4 * mm))
        elements.append(rl_img)
        if img.get("caption"):
            elements.append(Paragraph(img["caption"], styles["caption"]))
        elements.append(Spacer(1, 4 * mm))
    except Exception:
        pass

    return elements


def _flat_chapters(chapters: list[dict]) -> list[dict]:
    result = []

    def walk(chs: list[dict]):
        for ch in sorted(chs, key=lambda c: (c.get("level", 1), c.get("order_index", 0))):
            result.append(ch)
            if ch.get("children"):
                walk(ch["children"])

    walk(chapters)
    return result


def _split_paragraphs(text: str) -> list[str]:
    if not text:
        return []
    return [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
