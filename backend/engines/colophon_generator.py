"""
판권 페이지 생성기
"""
from __future__ import annotations

from datetime import date
from typing import Optional


def generate_colophon_html(
    title: str,
    subtitle: Optional[str],
    author: str,
    publisher: str,
    publish_date: Optional[str | date],
    isbn: Optional[str],
    price: Optional[int],
    copyright_text: Optional[str],
    publisher_bio: Optional[str],
) -> str:
    if publish_date is None:
        pub_date_str = date.today().strftime("%Y년 %m월 %d일")
    elif isinstance(publish_date, date):
        pub_date_str = publish_date.strftime("%Y년 %m월 %d일")
    else:
        pub_date_str = str(publish_date)

    price_str = f"{price:,}원" if price else "비매품"
    isbn_str = isbn or "미정"

    default_copyright = f"© {date.today().year} {author}. All rights reserved."
    cop_text = copyright_text or default_copyright

    subtitle_block = f"<p class='subtitle'>{subtitle}</p>" if subtitle else ""
    pub_bio_block = f"<div class='publisher-bio'><p>{publisher_bio}</p></div>" if publisher_bio else ""

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  body {{
    font-family: 'Noto Serif KR', serif;
    font-size: 9pt;
    line-height: 1.8;
    color: #1a1a1a;
    margin: 0;
    padding: 40px 50px;
    box-sizing: border-box;
  }}
  .colophon {{
    max-width: 400px;
    margin: 0 auto;
    padding-top: 60px;
  }}
  .title {{
    font-size: 18pt;
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 700;
    margin-bottom: 4px;
    color: #111;
  }}
  .subtitle {{
    font-size: 11pt;
    color: #444;
    margin-bottom: 40px;
  }}
  .info-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }}
  .info-table tr {{
    border-bottom: 1px solid #e0e0e0;
  }}
  .info-table td {{
    padding: 8px 4px;
    font-size: 9pt;
  }}
  .info-table td:first-child {{
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 600;
    color: #333;
    width: 90px;
  }}
  .copyright {{
    margin-top: 24px;
    font-size: 8pt;
    color: #666;
    border-top: 1px solid #ccc;
    padding-top: 12px;
  }}
  .publisher-bio {{
    margin-top: 20px;
    font-size: 8pt;
    color: #555;
    border-top: 1px solid #eee;
    padding-top: 12px;
  }}
</style>
</head>
<body>
<div class="colophon">
  <p class="title">{title}</p>
  {subtitle_block}
  <table class="info-table">
    <tr><td>지은이</td><td>{author}</td></tr>
    <tr><td>펴낸이</td><td>{author}</td></tr>
    <tr><td>펴낸곳</td><td>{publisher}</td></tr>
    <tr><td>초판 발행</td><td>{pub_date_str}</td></tr>
    <tr><td>ISBN</td><td>{isbn_str}</td></tr>
    <tr><td>정가</td><td>{price_str}</td></tr>
  </table>
  <div class="copyright">
    <p>{cop_text}</p>
    <p>이 책의 내용을 무단으로 복제·전재하는 것은 저작권법에 의해 금지되어 있습니다.<br>
    잘못 만들어진 책은 구입하신 서점에서 교환해 드립니다.</p>
  </div>
  {pub_bio_block}
</div>
</body>
</html>"""


def generate_colophon_reportlab_elements(book: dict, styles: dict):
    """ReportLab Flowable 리스트로 판권 페이지 생성"""
    from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor

    elements = []
    elements.append(PageBreak())
    elements.append(Spacer(1, 60 * mm))

    title_style = styles.get("heading1")
    body_style = styles.get("body")
    caption_style = styles.get("caption")

    elements.append(Paragraph(book.get("title", ""), title_style))
    if book.get("subtitle"):
        elements.append(Paragraph(book["subtitle"], styles.get("heading3")))
    elements.append(Spacer(1, 20 * mm))

    today = date.today()
    pub_date = book.get("publish_date") or today.strftime("%Y년 %m월 %d일")
    price = book.get("price")
    price_str = f"{price:,}원" if price else "비매품"
    isbn = book.get("isbn") or "미정"

    info_data = [
        ["지은이", book.get("author", "")],
        ["펴낸곳", book.get("publisher", "19호실")],
        ["초판 발행", str(pub_date)],
        ["ISBN", isbn],
        ["정가", price_str],
    ]

    tbl = Table(info_data, colWidths=[30 * mm, None])
    tbl.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, HexColor("#dddddd")),
        ("FONTNAME", (0, 0), (0, -1), "NotoSansKR"),
        ("FONTNAME", (1, 0), (1, -1), "NotoSerifKR"),
    ]))
    elements.append(tbl)
    elements.append(Spacer(1, 8 * mm))

    year = today.year
    author = book.get("author", "")
    cop = book.get("copyright_text") or f"© {year} {author}. All rights reserved."
    elements.append(Paragraph(cop, caption_style))
    elements.append(Paragraph(
        "이 책의 내용을 무단으로 복제·전재하는 것은 저작권법에 의해 금지되어 있습니다.",
        caption_style,
    ))

    return elements
