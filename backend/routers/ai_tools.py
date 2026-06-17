"""
AI 편집 도구 라우터 (Claude API 활용)
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.orm import PublishingBook, PublishingChapter
from backend.models.schemas import AIRequest, AIAction

router = APIRouter(tags=["ai"])


def _get_claude_client():
    import anthropic
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY가 설정되지 않았습니다")
    return anthropic.Anthropic(api_key=api_key)


async def _get_book_content(book_id: str, user_id: str, db: AsyncSession) -> tuple[dict, str]:
    result = await db.execute(
        select(PublishingBook).where(
            PublishingBook.id == book_id,
            PublishingBook.user_id == user_id,
        )
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="책을 찾을 수 없습니다")

    ch_result = await db.execute(
        select(PublishingChapter)
        .where(PublishingChapter.book_id == book_id)
        .order_by(PublishingChapter.level, PublishingChapter.order_index)
        .limit(50)
    )
    chapters = ch_result.scalars().all()

    content_parts = []
    for ch in chapters:
        prefix = "#" * ch.level
        content_parts.append(f"{prefix} {ch.title}")
        if ch.content:
            content_parts.append(ch.content[:2000])  # limit per chapter

    full_content = "\n\n".join(content_parts)
    book_dict = {
        "title": book.title,
        "subtitle": book.subtitle,
        "author": book.author,
    }
    return book_dict, full_content


@router.post("/books/{book_id}/ai-tools")
async def run_ai_tool(
    book_id: str,
    user_id: str,
    req: AIRequest,
    db: AsyncSession = Depends(get_db),
):
    book_dict, content = await _get_book_content(book_id, user_id, db)
    client = _get_claude_client()

    if req.action == AIAction.spell_check:
        return await _spell_check(client, content)
    elif req.action == AIAction.summary:
        return await _generate_summary(client, book_dict, content)
    elif req.action == AIAction.description:
        return await _generate_description(client, book_dict, content)
    elif req.action == AIAction.style_unify:
        return await _style_unify(client, content)
    else:
        raise HTTPException(status_code=400, detail="알 수 없는 AI 작업")


async def _spell_check(client, content: str) -> dict:
    sample = content[:3000]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": f"""다음 한국어 텍스트에서 맞춤법 오류, 오탈자, 어색한 표현을 찾아주세요.
JSON 배열 형식으로 반환하세요: [{{"text": "원문", "issue": "문제점", "suggestion": "수정 제안"}}]
최대 10개만 반환하세요.

텍스트:
{sample}"""
        }]
    )
    import json
    try:
        text = message.content[0].text
        start = text.find("[")
        end = text.rfind("]") + 1
        suggestions = json.loads(text[start:end]) if start >= 0 else []
    except Exception:
        suggestions = []
    return {"suggestions": suggestions}


async def _generate_summary(client, book: dict, content: str) -> dict:
    sample = content[:4000]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": f"""다음은 '{book.get('title', '')}'라는 책의 내용입니다.
각 장별로 핵심 내용을 2~3문장으로 요약해 주세요. 전체 책 소개도 포함해주세요.

내용:
{sample}"""
        }]
    )
    return {"summary": message.content[0].text}


async def _generate_description(client, book: dict, content: str) -> dict:
    sample = content[:3000]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1200,
        messages=[{
            "role": "user",
            "content": f"""책 정보:
제목: {book.get('title', '')}
저자: {book.get('author', '')}

내용 발췌:
{sample}

위 책에 대해 다음을 작성해주세요:
1. 책 소개문 (200자 내외, 독자의 호기심을 자극하는 문장으로)
2. 홍보 문구 (50자 내외, SNS용 짧고 임팩트 있는 문장)
3. 추천 키워드 5개

JSON 형식으로 반환: {{"description": "...", "promo": "...", "keywords": ["..."]}}"""
        }]
    )
    import json
    text = message.content[0].text
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        result = json.loads(text[start:end])
    except Exception:
        result = {"description": text, "promo": "", "keywords": []}
    return result


async def _style_unify(client, content: str) -> dict:
    sample = content[:3000]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""다음 텍스트의 문체 일관성을 분석하고 개선 제안을 해주세요.
특히: 경어/반말 혼용, 시제 불일치, 반복 표현, 문장 길이 불균형 등을 찾아주세요.

JSON 배열로 반환: ["제안1", "제안2", ...]

텍스트:
{sample}"""
        }]
    )
    import json
    text = message.content[0].text
    try:
        start = text.find("[")
        end = text.rfind("]") + 1
        suggestions = json.loads(text[start:end])
    except Exception:
        suggestions = [text]
    return {"suggestions": suggestions}
