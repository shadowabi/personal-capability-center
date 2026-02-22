"""
Search router - 搜索功能 API
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from datetime import date

from models import (
    ConversationResponse,
    KeywordSearchRequest,
    TagSearchRequest,
    DateRangeSearchRequest,
    ImportanceSearchRequest,
    SimilaritySearchRequest
)
from database import get_db

router = APIRouter(prefix="/search", tags=["search"])


def _convert_to_response(conversation):
    """转换对话数据为响应模型"""
    if len(conversation) == 10:
        return ConversationResponse(
            id=conversation[0],
            date=conversation[1] if isinstance(conversation[1], date) else None,
            title=conversation[2],
            summary=conversation[3],
            details=conversation[4],
            tags=conversation[5] if conversation[5] else [],
            importance=conversation[6],
            word_count=conversation[7],
            created_at=str(conversation[8]) if conversation[8] else None,
            updated_at=str(conversation[9]) if conversation[9] else None
        )
    elif len(conversation) == 6:
        return ConversationResponse(
            id=conversation[0],
            title=conversation[1],
            summary=conversation[2],
            date=conversation[5] if isinstance(conversation[5], date) else None,
            importance=conversation[4],
            details='',
            tags=conversation[3] if conversation[3] else [],
            word_count=0,
            created_at=None,
            updated_at=None
        )
    elif len(conversation) == 5:
        return ConversationResponse(
            id=conversation[0],
            title=conversation[1],
            summary=conversation[2],
            importance=conversation[3],
            date=conversation[4] if isinstance(conversation[4], date) else None,
            details='',
            tags=[],
            word_count=0,
            created_at=None,
            updated_at=None
        )
    elif len(conversation) == 4:
        return ConversationResponse(
            id=conversation[0],
            title=conversation[1],
            summary=conversation[2],
            date=conversation[3] if isinstance(conversation[3], date) else None,
            importance=0,
            details='',
            tags=[],
            word_count=0,
            created_at=None,
            updated_at=None
        )
    else:
        return ConversationResponse(
            id=conversation[0] if len(conversation) > 0 else 0,
            title='Unknown',
            summary='',
            date=conversation[4] if len(conversation) > 4 and isinstance(conversation[4], date) else None,
            importance=conversation[3] if len(conversation) > 3 else 0,
            details='',
            tags=[],
            word_count=0,
            created_at=None,
            updated_at=None
        )


@router.get("/keyword", response_model=List[ConversationResponse])
async def search_by_keyword(
    keyword: Optional[str] = Query(None),
    search_in_details: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    memory=Depends(get_db)
):
    """关键词搜索（支持分页）"""
    # 处理空字符串或None的情况
    if keyword is None:
        keyword = ""
    
    conversations = memory.search_by_keyword(
        keyword=keyword,
        search_in_details=search_in_details,
        limit=limit
    )
    
    # 手动分页
    start = (page - 1) * page_size
    end = start + page_size
    paginated_conversations = conversations[start:end]
    
    return [_convert_to_response(conv) for conv in paginated_conversations]


@router.get("/tags", response_model=List[ConversationResponse])
async def search_by_tags(
    tags: List[str] = Query([]),
    match_all: bool = Query(True),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    memory=Depends(get_db)
):
    """按标签搜索（支持分页）"""
    conversations = memory.get_by_tags(
        tags=tags,
        match_all=match_all,
        limit=limit
    )
    
    # 手动分页
    start = (page - 1) * page_size
    end = start + page_size
    paginated_conversations = conversations[start:end]
    
    return [_convert_to_response(conv) for conv in paginated_conversations]


@router.get("/date-range", response_model=List[ConversationResponse])
async def search_by_date_range(
    start_date: date = Query(...),
    end_date: date = Query(...),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    memory=Depends(get_db)
):
    """按日期范围搜索（支持分页）"""
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date"
        )
    
    conversations = memory.get_by_date_range(
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )
    
    # get_by_date_range 返回 (id, title, summary, date, importance)
    # 需要重新排列为 (id, title, summary, importance, date)
    reordered = [
        (conv[0], conv[1], conv[2], conv[4], conv[3])
        for conv in conversations
    ]
    
    # 手动分页
    start = (page - 1) * page_size
    end = start + page_size
    paginated_conversations = reordered[start:end]
    
    return [_convert_to_response(conv) for conv in paginated_conversations]


@router.get("/importance", response_model=List[ConversationResponse])
async def search_by_importance(
    min_importance: int = Query(..., ge=1, le=10),
    limit: int = Query(20, ge=1, le=100),
    memory=Depends(get_db)
):
    """按重要性搜索"""
    conversations = memory.get_by_importance(
        min_importance=min_importance,
        limit=limit
    )

    return [_convert_to_response(conv) for conv in conversations]


@router.get("/similar", response_model=List[ConversationResponse])
async def search_similar(
    query_text: str = Query(..., min_length=1),
    min_importance: Optional[int] = Query(None, ge=1, le=10),
    limit: int = Query(20, ge=1, le=100),
    memory=Depends(get_db)
):
    """向量相似度搜索"""
    # AI Memory 需要 embedding 向量，这里使用零向量
    # 在实际应用中，应该调用 embedding API 获取向量
    query_vector = [0.0] * 1536  # OpenAI embedding 维度

    conversations = memory.search_similar(
        query_vector=query_vector,
        limit=limit,
        min_importance=min_importance
    )

    return [_convert_to_response(conv) for conv in conversations]
