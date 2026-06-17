"""
조판 엔진: 문서 구조 + 레이아웃 설정 → 조판 데이터 구조
ReportLab 기반으로 스타일을 결정하고 PDF 엔진에 전달한다.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from reportlab.lib.units import mm
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


# ── Page size presets (mm) ──────────────────────────────────
PAGE_SIZES: dict[str, tuple[float, float]] = {
    "A5": (148 * mm, 210 * mm),
    "신국판": (153 * mm, 225 * mm),
    "국판": (148 * mm, 210 * mm),
}


@dataclass
class TypographySpec:
    """단일 텍스트 요소의 조판 스펙"""
    element_type: str   # heading1 | heading2 | heading3 | body | quote | code | caption | table_header
    text: str
    style: ParagraphStyle
    space_before: float = 0
    space_after: float = 0
    keep_with_next: bool = False
    new_page_before: bool = False


@dataclass
class PageSpec:
    width: float
    height: float
    margin_top: float
    margin_bottom: float
    margin_inner: float
    margin_outer: float

    @property
    def body_width(self) -> float:
        return self.width - self.margin_inner - self.margin_outer

    @property
    def body_height(self) -> float:
        return self.height - self.margin_top - self.margin_bottom


def build_page_spec(layout: dict) -> PageSpec:
    size_name = layout.get("page_size", "A5")
    w, h = PAGE_SIZES.get(size_name, PAGE_SIZES["A5"])
    return PageSpec(
        width=w,
        height=h,
        margin_top=layout.get("margin_top", 25) * mm,
        margin_bottom=layout.get("margin_bottom", 25) * mm,
        margin_inner=layout.get("margin_inner", 25) * mm,
        margin_outer=layout.get("margin_outer", 20) * mm,
    )


def build_styles(layout: dict) -> dict[str, ParagraphStyle]:
    """조판 레이아웃 설정에서 ReportLab ParagraphStyle 생성"""
    body_size = layout.get("body_font_size", 10.5)
    leading = body_size * layout.get("line_height", 1.8)

    # Korean font names mapped to registered fonts (PDF engine registers them)
    body_font = layout.get("body_font", "NotoSerifKR")
    heading_font = layout.get("heading_font", "NotoSansKR")

    styles: dict[str, ParagraphStyle] = {}

    styles["body"] = ParagraphStyle(
        "body",
        fontName=body_font,
        fontSize=body_size,
        leading=leading,
        alignment=TA_JUSTIFY,
        spaceAfter=4,
        spaceBefore=0,
        firstLineIndent=body_size * 2,
    )

    styles["heading1"] = ParagraphStyle(
        "heading1",
        fontName=heading_font,
        fontSize=body_size * 2.2,
        leading=body_size * 2.2 * 1.3,
        alignment=TA_CENTER,
        spaceBefore=body_size * 4,
        spaceAfter=body_size * 2,
        textColor=HexColor("#1a1a2e"),
        keepWithNext=True,
    )

    styles["heading2"] = ParagraphStyle(
        "heading2",
        fontName=heading_font,
        fontSize=body_size * 1.5,
        leading=body_size * 1.5 * 1.4,
        alignment=TA_LEFT,
        spaceBefore=body_size * 2,
        spaceAfter=body_size * 0.8,
        textColor=HexColor("#16213e"),
        keepWithNext=True,
        borderPadding=(0, 0, 4, 0),
    )

    styles["heading3"] = ParagraphStyle(
        "heading3",
        fontName=heading_font,
        fontSize=body_size * 1.2,
        leading=body_size * 1.2 * 1.4,
        alignment=TA_LEFT,
        spaceBefore=body_size * 1.5,
        spaceAfter=body_size * 0.5,
        textColor=HexColor("#0f3460"),
        keepWithNext=True,
    )

    styles["quote"] = ParagraphStyle(
        "quote",
        fontName=body_font,
        fontSize=body_size * 0.95,
        leading=body_size * 0.95 * 1.7,
        alignment=TA_LEFT,
        leftIndent=body_size * 2,
        rightIndent=body_size * 2,
        spaceBefore=body_size,
        spaceAfter=body_size,
        textColor=HexColor("#555555"),
        borderColor=HexColor("#aaaaaa"),
        borderWidth=2,
        borderPadding=(0, 0, 0, 12),
    )

    styles["code"] = ParagraphStyle(
        "code",
        fontName="Courier",
        fontSize=body_size * 0.85,
        leading=body_size * 0.85 * 1.6,
        alignment=TA_LEFT,
        leftIndent=body_size,
        rightIndent=body_size,
        spaceBefore=body_size * 0.5,
        spaceAfter=body_size * 0.5,
        backColor=HexColor("#f5f5f5"),
        borderColor=HexColor("#dddddd"),
        borderWidth=1,
        borderPadding=8,
    )

    styles["caption"] = ParagraphStyle(
        "caption",
        fontName=heading_font,
        fontSize=body_size * 0.85,
        leading=body_size * 0.85 * 1.5,
        alignment=TA_CENTER,
        spaceAfter=body_size * 0.5,
        textColor=HexColor("#666666"),
    )

    styles["chapter_title_page"] = ParagraphStyle(
        "chapter_title_page",
        fontName=heading_font,
        fontSize=body_size * 3,
        leading=body_size * 3 * 1.2,
        alignment=TA_CENTER,
        textColor=HexColor("#1a1a2e"),
    )

    return styles
