"""
Conversations router - 对话管理 API
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import date
import logging

from models import (
    ConversationResponse,
    ConversationCreate,
    ConversationUpdate,
    ConversationListResponse
)
from database import get_db

router = APIRouter(prefix="/conversations", tags=["conversations"])
logger = logging.getLogger(__name__)


@router.get("", response_model=ConversationListResponse)
async def get_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("date", regex="^(date|importance|word_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    memory=Depends(get_db)
):
    """获取对话列表（支持分页和排序）"""
    # 获取所有对话ID（AI Memory 的 get_recent 返回有限数量）
    # 注意：AI Memory 的 API 不直接支持分页，我们需要获取后手动处理
    all_conversations = memory.get_recent(days=3650, limit=1000)  # 获取大量数据

    # get_recent 返回: (id, title, summary, importance, date)
    # 我们需要获取完整数据
    all_ids = [conv[0] for conv in all_conversations]

    # 获取每条对话的完整数据
    full_conversations = []
    for conv_id in all_ids:
        try:
            conv = memory.get_conversation(conv_id)
            if conv:
                full_conversations.append(conv)
        except Exception as e:
            logger.error(f"Error getting conversation {conv_id}: {e}", exc_info=True)

    # 排序
    reverse = sort_order == "desc"
    if sort_by == "date":
        full_conversations.sort(key=lambda x: x[1], reverse=reverse)
    elif sort_by == "importance":
        full_conversations.sort(key=lambda x: x[6], reverse=reverse)
    elif sort_by == "word_count":
        full_conversations.sort(key=lambda x: x[7] or 0, reverse=reverse)

    # 分页
    total = len(full_conversations)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = full_conversations[start:end]

    # 转换为响应模型
    items = [
        ConversationResponse(
            id=conv[0],
            date=str(conv[1]),
            title=conv[2],
            summary=conv[3],
            details=conv[4],
            tags=conv[5] if conv[5] else [],
            importance=conv[6],
            word_count=conv[7],
            created_at=str(conv[8]) if conv[8] else None,
            updated_at=str(conv[9]) if conv[9] else None
        )
        for conv in page_items
    ]

    total_pages = (total + page_size - 1) // page_size

    return ConversationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    memory=Depends(get_db)
):
    """获取对话详情"""
    conv = memory.get_conversation(conversation_id)

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return ConversationResponse(
        id=conv[0],
        date=conv[1],
        title=conv[2],
        summary=conv[3],
        details=conv[4],
        tags=conv[5] if conv[5] else [],
        importance=conv[6],
        word_count=conv[7],
        created_at=str(conv[8]) if conv[8] else None,
        updated_at=str(conv[9]) if conv[9] else None
    )


@router.post("", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    conversation: ConversationCreate,
    memory=Depends(get_db)
):
    """添加新对话"""
    # AI Memory 需要 embedding，但这里我们使用零向量
    embedding = [0.0] * 1536  # OpenAI embedding 维度

    conv_date = conversation.date if conversation.date else date.today()

    conv_id = memory.add_conversation(
        title=conversation.title,
        summary=conversation.summary,
        details=conversation.details,
        embedding=embedding,
        tags=conversation.tags,
        importance=conversation.importance,
        word_count=conversation.word_count or len(conversation.summary),
        date=conv_date
    )

    # 获取创建的对话
    conv = memory.get_conversation(conv_id)

    return ConversationResponse(
        id=conv[0],
        date=conv[1],
        title=conv[2],
        summary=conv[3],
        details=conv[4],
        tags=conv[5] if conv[5] else [],
        importance=conv[6],
        word_count=conv[7],
        created_at=str(conv[8]) if conv[8] else None,
        updated_at=str(conv[9]) if conv[9] else None
    )


@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    update: ConversationUpdate,
    memory=Depends(get_db)
):
    """更新对话（重要性和标签）"""
    # 检查对话是否存在
    conv = memory.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 更新重要性
    if update.importance is not None:
        success = memory.update_importance(conversation_id, update.importance)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update importance")

    # AI Memory 不支持直接更新标签，这里返回提示
    if update.tags is not None:
        raise HTTPException(
            status_code=400,
            detail="Tag update not supported directly. Please delete and recreate."
        )

    # 获取更新后的对话
    conv = memory.get_conversation(conversation_id)

    return ConversationResponse(
        id=conv[0],
        date=conv[1],
        title=conv[2],
        summary=conv[3],
        details=conv[4],
        tags=conv[5] if conv[5] else [],
        importance=conv[6],
        word_count=conv[7],
        created_at=str(conv[8]) if conv[8] else None,
        updated_at=str(conv[9]) if conv[9] else None
    )


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: int,
    memory=Depends(get_db)
):
    """删除对话"""
    success = memory.delete_conversation(conversation_id)

    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return None
