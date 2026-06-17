"""
원고 파서: DOCX / TXT / Markdown → 구조화된 챕터 트리
"""
from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class ParsedChapter:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: Optional[str] = None
    level: int = 1
    order_index: int = 0
    title: str = ""
    content: str = ""
    children: list["ParsedChapter"] = field(default_factory=list)


def parse_manuscript(file_path: str | Path) -> list[ParsedChapter]:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".docx":
        return _parse_docx(path)
    elif suffix in (".md", ".markdown"):
        return _parse_markdown(path.read_text(encoding="utf-8"))
    else:  # .txt
        return _parse_txt(path.read_text(encoding="utf-8"))


def _parse_docx(path: Path) -> list[ParsedChapter]:
    try:
        from docx import Document  # type: ignore
        doc = Document(str(path))
        lines: list[tuple[str, str]] = []  # (style_name, text)
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            lines.append((para.style.name, text))
        return _build_chapter_tree(lines)
    except Exception as e:
        raise ValueError(f"DOCX 파싱 실패: {e}") from e


def _parse_markdown(content: str) -> list[ParsedChapter]:
    lines: list[tuple[str, str]] = []
    for line in content.splitlines():
        line = line.rstrip()
        if not line:
            continue
        m = re.match(r'^(#{1,6})\s+(.*)', line)
        if m:
            level = len(m.group(1))
            style = f"Heading {level}"
            lines.append((style, m.group(2).strip()))
        else:
            lines.append(("Normal", line))
    return _build_chapter_tree(lines)


def _parse_txt(content: str) -> list[ParsedChapter]:
    lines: list[tuple[str, str]] = []
    for line in content.splitlines():
        line = line.rstrip()
        if not line:
            continue
        # Detect chapter/section headings by common Korean patterns
        if re.match(r'^(제\s*\d+\s*장|Chapter\s+\d+|CHAPTER\s+\d+)', line, re.I):
            lines.append(("Heading 1", line))
        elif re.match(r'^(제\s*\d+\s*절|\d+\.\s+\S)', line):
            lines.append(("Heading 2", line))
        elif re.match(r'^\d+\.\d+\s+\S', line):
            lines.append(("Heading 3", line))
        else:
            lines.append(("Normal", line))
    return _build_chapter_tree(lines)


def _style_to_level(style: str) -> int:
    m = re.match(r'Heading\s+(\d+)', style, re.I)
    if m:
        return int(m.group(1))
    return 0  # normal paragraph


def _build_chapter_tree(lines: list[tuple[str, str]]) -> list[ParsedChapter]:
    roots: list[ParsedChapter] = []
    stack: list[ParsedChapter] = []  # ancestors
    order_counters: dict[int, int] = {}

    current_content_lines: list[str] = []

    def flush_content(chapter: Optional[ParsedChapter]):
        if chapter and current_content_lines:
            chapter.content = "\n".join(current_content_lines)
        current_content_lines.clear()

    current_chapter: Optional[ParsedChapter] = None

    for style, text in lines:
        level = _style_to_level(style)
        if level == 0:
            current_content_lines.append(text)
            continue

        flush_content(current_chapter)
        current_content_lines.clear()

        # Pop stack to find parent
        while stack and stack[-1].level >= level:
            stack.pop()

        order_counters[level] = order_counters.get(level, 0) + 1
        chapter = ParsedChapter(
            level=level,
            order_index=order_counters[level],
            title=text,
        )

        if stack:
            parent = stack[-1]
            chapter.parent_id = parent.id
            parent.children.append(chapter)
        else:
            roots.append(chapter)

        stack.append(chapter)
        current_chapter = chapter

    flush_content(current_chapter)
    return roots


def extract_all_chapters_flat(chapters: list[ParsedChapter]) -> list[ParsedChapter]:
    result = []

    def walk(ch_list: list[ParsedChapter]):
        for ch in ch_list:
            result.append(ch)
            walk(ch.children)

    walk(chapters)
    return result
