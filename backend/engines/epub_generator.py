"""
ePub 생성 엔진 (EbookLib 기반)
- ePub3 + ePub2 하위 호환
- 표지, 목차(nav+ncx), 챕터별 XHTML, 이미지 내포
- 전자책 플랫폼 업로드 가능 수준
"""
from __future__ import annotations

import io
import re
import uuid
from datetime import date
from pathlib import Path
from typing import Optional

try:
    from ebooklib import epub  # type: ignore
    HAS_EBOOKLIB = True
except ImportError:
    HAS_EBOOKLIB = False

from .toc_generator import build_toc, generate_epub_nav, generate_epub_ncx

EPUB_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap');

body {
  font-family: 'Noto Serif KR', serif;
  font-size: 1em;
  line-height: 1.8;
  color: #1a1a1a;
  margin: 0;
  padding: 1em 1.5em;
}
h1, h2, h3, h4 {
  font-family: 'Noto Sans KR', sans-serif;
  color: #111;
}
h1 { font-size: 2em; margin-top: 2em; text-align: center; }
h2 { font-size: 1.4em; margin-top: 1.5em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
h3 { font-size: 1.1em; margin-top: 1.2em; }
p  { margin: 0.5em 0; text-indent: 1.5em; }
p.no-indent { text-indent: 0; }
blockquote {
  border-left: 3px solid #aaa;
  margin: 1em 1.5em;
  padding: 0.5em 1em;
  color: #555;
  font-style: italic;
}
pre, code {
  font-family: monospace;
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5em;
  border-radius: 3px;
  white-space: pre-wrap;
  font-size: 0.85em;
}
figure {
  text-align: center;
  margin: 1.5em 0;
}
figure img {
  max-width: 100%;
  height: auto;
}
figcaption {
  font-size: 0.85em;
  color: #666;
  margin-top: 0.5em;
  font-family: 'Noto Sans KR', sans-serif;
}
.chapter-number {
  font-size: 0.9em;
  color: #888;
  text-align: center;
  margin-top: 2em;
}
.colophon {
  font-size: 0.85em;
  color: #555;
  margin-top: 3em;
  border-top: 1px solid #ccc;
  padding-top: 1em;
}
.colophon table { width: 100%; border-collapse: collapse; }
.colophon td { padding: 0.3em 0.5em; border-bottom: 1px solid #eee; }
.colophon td:first-child { font-weight: bold; width: 5em; }
"""


def generate_epub(
    book: dict,
    chapters: list[dict],
    images: list[dict],
    output_path: str,
) -> dict:
    """
    ePub 파일 생성
    Returns: {"path": str, "file_size_kb": int}
    """
    if not HAS_EBOOKLIB:
        raise RuntimeError("ebooklib가 설치되어 있지 않습니다: pip install ebooklib")

    book_epub = epub.EpubBook()

    # Metadata
    book_uuid = book.get("id", str(uuid.uuid4()))
    book_epub.set_identifier(book_uuid)
    book_epub.set_title(book.get("title", "제목 없음"))
    book_epub.set_language("ko")
    book_epub.add_author(book.get("author", ""))

    if book.get("publisher"):
        book_epub.add_metadata("DC", "publisher", book["publisher"])
    if book.get("isbn"):
        book_epub.add_metadata("DC", "identifier", f"ISBN:{book['isbn']}", {"id": "isbn"})
    if book.get("publish_date"):
        book_epub.add_metadata("DC", "date", str(book["publish_date"]))

    # CSS
    css_item = epub.EpubItem(
        uid="style",
        file_name="style/main.css",
        media_type="text/css",
        content=EPUB_CSS,
    )
    book_epub.add_item(css_item)

    # Images
    image_items: dict[str, epub.EpubItem] = {}
    image_map: dict[str, dict] = {img["id"]: img for img in images}

    for img in images:
        img_path = Path(img.get("file_url", ""))
        if not img_path.exists():
            continue
        suffix = img_path.suffix.lower()
        mime = "image/jpeg" if suffix in (".jpg", ".jpeg") else f"image/{suffix.lstrip('.')}"
        epub_img = epub.EpubItem(
            uid=f"img-{img['id']}",
            file_name=f"images/{img['file_name']}",
            media_type=mime,
            content=img_path.read_bytes(),
        )
        book_epub.add_item(epub_img)
        image_items[img["id"]] = epub_img

    # Cover
    if book.get("cover_url") and Path(book["cover_url"]).exists():
        cover_path = Path(book["cover_url"])
        cover_bytes = cover_path.read_bytes()
        book_epub.set_cover(f"cover{cover_path.suffix}", cover_bytes)

    # Spine and TOC items
    epub_chapters: list[epub.EpubHtml] = []
    toc_items: list = []

    flat_chapters = _flat_chapters(chapters)
    chapter_items_by_id: dict[str, epub.EpubHtml] = {}

    for ch in flat_chapters:
        level = ch.get("level", 1)
        ch_id = ch["id"]
        anchor = f"ch-{ch_id}"
        filename = f"chapters/{anchor}.xhtml"

        content_html = _chapter_to_html(ch, images, image_items)
        epub_ch = epub.EpubHtml(
            title=ch["title"],
            file_name=filename,
            lang="ko",
            content=content_html,
        )
        epub_ch.add_item(css_item)
        book_epub.add_item(epub_ch)
        epub_chapters.append(epub_ch)
        chapter_items_by_id[ch_id] = epub_ch

    # Colophon
    colophon_html = _build_colophon_html(book)
    colophon_item = epub.EpubHtml(
        title="판권",
        file_name="chapters/colophon.xhtml",
        lang="ko",
        content=colophon_html,
    )
    colophon_item.add_item(css_item)
    book_epub.add_item(colophon_item)

    # Build TOC structure
    toc_db = build_toc(chapters)

    def build_epub_toc(entries, level=0):
        result = []
        for entry in entries:
            ch_id = entry.anchor.replace("ch-", "")
            epub_item = chapter_items_by_id.get(ch_id)
            if epub_item:
                if entry.children:
                    children_toc = build_epub_toc(entry.children, level + 1)
                    result.append((epub.Section(entry.title), children_toc))
                else:
                    result.append(epub_item)
        return result

    book_epub.toc = build_epub_toc(toc_db)

    # NCX and Nav
    book_epub.add_item(epub.EpubNcx())
    book_epub.add_item(epub.EpubNav())

    # Spine
    book_epub.spine = ["nav"] + epub_chapters + [colophon_item]

    epub.write_epub(output_path, book_epub, {})

    path = Path(output_path)
    file_size_kb = path.stat().st_size // 1024 if path.exists() else 0

    return {"path": output_path, "file_size_kb": file_size_kb}


def _chapter_to_html(ch: dict, images: list[dict], image_items: dict) -> str:
    level = ch.get("level", 1)
    title = ch.get("title", "")
    content = ch.get("content", "") or ""

    heading_level = min(level + 1, 4)  # level1→h2, level2→h3, level3→h4
    if level == 1:
        chapter_num_html = f'<p class="chapter-number">제 {ch.get("order_index", 1)} 장</p>'
        heading = f"<h1>{title}</h1>"
    else:
        chapter_num_html = ""
        heading = f"<h{heading_level}>{title}</h{heading_level}>"

    body_html = _content_to_html(content)

    # Inline images
    chapter_images = [img for img in images if img.get("chapter_id") == ch["id"]]
    img_html = ""
    for img in chapter_images:
        img_id = img["id"]
        if img_id in image_items:
            src = f"../images/{img['file_name']}"
            caption = f"<figcaption>{img['caption']}</figcaption>" if img.get("caption") else ""
            alt = img.get("alt_text") or img.get("caption") or ""
            img_html += f'<figure><img src="{src}" alt="{alt}"/>{caption}</figure>'

    return f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
<head>
  <meta charset="utf-8"/>
  <title>{title}</title>
  <link rel="stylesheet" type="text/css" href="../style/main.css"/>
</head>
<body>
{chapter_num_html}
{heading}
{body_html}
{img_html}
</body>
</html>"""


def _content_to_html(content: str) -> str:
    if not content:
        return ""

    paragraphs = re.split(r'\n{2,}', content)
    html_parts: list[str] = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if para.startswith("```"):
            code = para.strip("`").strip()
            html_parts.append(f"<pre><code>{_escape(code)}</code></pre>")
        elif para.startswith("> "):
            html_parts.append(f"<blockquote><p>{_escape(para[2:])}</p></blockquote>")
        else:
            lines = para.splitlines()
            combined = " ".join(lines)
            html_parts.append(f"<p>{_escape(combined)}</p>")

    return "\n".join(html_parts)


def _build_colophon_html(book: dict) -> str:
    today = date.today()
    pub_date = book.get("publish_date") or today.strftime("%Y년 %m월 %d일")
    price = book.get("price")
    price_str = f"{price:,}원" if price else "비매품"
    isbn = book.get("isbn") or "미정"
    author = book.get("author", "")
    cop = book.get("copyright_text") or f"© {today.year} {author}. All rights reserved."

    return f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
<head>
  <meta charset="utf-8"/>
  <title>판권</title>
  <link rel="stylesheet" type="text/css" href="../style/main.css"/>
</head>
<body>
<div class="colophon">
  <h2>{book.get('title', '')}</h2>
  <table>
    <tr><td>지은이</td><td>{author}</td></tr>
    <tr><td>펴낸곳</td><td>{book.get('publisher', '19호실')}</td></tr>
    <tr><td>발행일</td><td>{pub_date}</td></tr>
    <tr><td>ISBN</td><td>{isbn}</td></tr>
    <tr><td>정가</td><td>{price_str}</td></tr>
  </table>
  <p>{cop}</p>
  <p>이 책의 내용을 무단으로 복제·전재하는 것은 저작권법에 의해 금지되어 있습니다.</p>
</div>
</body>
</html>"""


def _flat_chapters(chapters: list[dict]) -> list[dict]:
    result = []

    def walk(chs: list[dict]):
        for ch in sorted(chs, key=lambda c: (c.get("level", 1), c.get("order_index", 0))):
            result.append(ch)
            if ch.get("children"):
                walk(ch["children"])

    walk(chapters)
    return result


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
    )
