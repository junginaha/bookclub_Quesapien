"""
목차 생성기: 챕터 트리 → PDF 목차 / ePub NCX+Nav
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class TocEntry:
    title: str
    level: int
    page: Optional[int]
    anchor: str
    children: list["TocEntry"]


def build_toc(chapters: list[dict]) -> list[TocEntry]:
    """DB 챕터 레코드 리스트 → TocEntry 트리"""
    entries: dict[str, TocEntry] = {}
    roots: list[TocEntry] = []

    sorted_chapters = sorted(chapters, key=lambda c: (c.get("level", 1), c.get("order_index", 0)))

    for ch in chapters:
        anchor = f"ch-{ch['id']}"
        entry = TocEntry(
            title=ch["title"],
            level=ch.get("level", 1),
            page=ch.get("page_number"),
            anchor=anchor,
            children=[],
        )
        entries[ch["id"]] = entry
        parent_id = ch.get("parent_id")
        if parent_id and parent_id in entries:
            entries[parent_id].children.append(entry)
        else:
            roots.append(entry)

    return roots


def generate_toc_pdf_elements(toc: list[TocEntry], styles: dict, page_spec) -> list:
    """ReportLab Flowable 목차 생성"""
    from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor

    elements: list = []
    elements.append(PageBreak())

    heading_style = styles.get("heading2")
    body_style = styles.get("body")

    elements.append(Paragraph("목  차", styles.get("heading1")))
    elements.append(Spacer(1, 8 * mm))

    body_w = page_spec.body_width

    def add_entry(entry: TocEntry, indent: int = 0):
        if entry.level == 1:
            style = heading_style
            num_style = heading_style
        else:
            style = body_style
            num_style = body_style

        page_str = str(entry.page) if entry.page else "—"
        title_cell = Paragraph("　" * indent + entry.title, style)
        page_cell = Paragraph(page_str, num_style)

        row = [[title_cell, page_cell]]
        col_widths = [body_w - 25 * mm, 20 * mm]
        tbl = Table(row, colWidths=col_widths)
        tbl.setStyle(TableStyle([
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, HexColor("#dddddd")),
        ]))
        elements.append(tbl)

        for child in entry.children:
            add_entry(child, indent + 1)

    for entry in toc:
        add_entry(entry)
        elements.append(Spacer(1, 2 * mm))

    return elements


def generate_epub_nav(toc: list[TocEntry]) -> str:
    """ePub3 nav.xhtml 생성"""
    def render_entries(entries: list[TocEntry], depth: int = 0) -> str:
        if not entries:
            return ""
        indent = "  " * depth
        items = []
        for e in entries:
            href = f"{e.anchor}.xhtml"
            children_html = render_entries(e.children, depth + 1)
            child_block = f"\n{indent}  <ol>\n{children_html}{indent}  </ol>" if children_html else ""
            items.append(f'{indent}  <li><a href="{href}">{e.title}</a>{child_block}</li>')
        return "\n".join(items) + "\n"

    nav_items = render_entries(toc)
    return f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>목차</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>목차</h1>
    <ol>
{nav_items}    </ol>
  </nav>
</body>
</html>"""


def generate_epub_ncx(toc: list[TocEntry], book_id: str, book_title: str) -> str:
    """ePub2 NCX 생성 (하위 호환)"""
    nav_points: list[str] = []
    counter = [0]

    def add_navpoint(entry: TocEntry, indent: str = "  ") -> str:
        counter[0] += 1
        pid = f"navPoint-{counter[0]}"
        href = f"{entry.anchor}.xhtml"
        children = ""
        for child in entry.children:
            children += "\n" + add_navpoint(child, indent + "  ")
        return (
            f'{indent}<navPoint id="{pid}" playOrder="{counter[0]}">\n'
            f'{indent}  <navLabel><text>{entry.title}</text></navLabel>\n'
            f'{indent}  <content src="{href}"/>{children}\n'
            f'{indent}</navPoint>'
        )

    for entry in toc:
        nav_points.append(add_navpoint(entry))

    return f"""<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="{book_id}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{book_title}</text></docTitle>
  <navMap>
{''.join(nav_points)}
  </navMap>
</ncx>"""
