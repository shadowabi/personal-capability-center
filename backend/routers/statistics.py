"""
Statistics router - 统计和标签 API
"""
from fastapi import APIRouter, Depends, Query
from typing import List

from models import StatisticsResponse, TagInfo, TopicInfo
from database import get_db

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("", response_model=StatisticsResponse)
async def get_statistics(memory=Depends(get_db)):
    """获取统计信息"""
    stats = memory.get_statistics()

    return StatisticsResponse(
        total_conversations=stats['total_conversations'],
        with_vectors=stats['with_vectors'],
        high_importance=stats['high_importance'],
        avg_words=stats['avg_words'] or 0.0,
        max_importance=stats['max_importance'] or 0,
        min_importance=stats['min_importance'] or 0
    )


@router.get("/tags", response_model=List[str])
async def get_all_tags(memory=Depends(get_db)):
    """获取所有标签"""
    tags = memory.get_all_tags()
    return tags


@router.get("/tags/top", response_model=List[TagInfo])
async def get_top_tags(
    limit: int = Query(10, ge=1, le=50),
    memory=Depends(get_db)
):
    """获取热门标签"""
    top_tags = memory.get_top_tags(limit=limit)

    return [
        TagInfo(tag=tag, count=count)
        for tag, count in top_tags
    ]


@router.get("/topics", response_model=List[TopicInfo])
async def get_topics(memory=Depends(get_db)):
    """获取话题统计（类似 view_topics.py）"""
    # AI Memory 没有直接的话题统计API，我们使用标签作为话题
    top_tags = memory.get_top_tags(limit=50)

    return [
        TopicInfo(topic=tag, count=count)
        for tag, count in top_tags
    ]
