"""
Pydantic models for AI Memory Dashboard API
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date as Date


class ConversationResponse(BaseModel):
    """对话响应模型"""
    id: int
    date: Optional[Date] = None
    title: str
    summary: str
    details: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    importance: int = Field(ge=1, le=10)
    word_count: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """创建对话请求模型"""
    title: str = Field(..., min_length=1, max_length=200)
    summary: str = Field(..., min_length=1)
    details: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    importance: int = Field(default=5, ge=1, le=10)
    word_count: Optional[int] = None
    date_conversation: Optional[Date] = None


class ConversationUpdate(BaseModel):
    """更新对话请求模型"""
    importance: Optional[int] = Field(None, ge=1, le=10)
    tags: Optional[List[str]] = None


class ConversationListResponse(BaseModel):
    """对话列表响应模型（带分页）"""
    items: List[ConversationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatisticsResponse(BaseModel):
    """统计信息响应模型"""
    total_conversations: int
    with_vectors: int
    high_importance: int
    avg_words: float
    max_importance: int
    min_importance: int


class TagInfo(BaseModel):
    """标签信息模型"""
    tag: str
    count: int


class TopicInfo(BaseModel):
    """话题信息模型"""
    topic: str
    count: int


class SearchRequest(BaseModel):
    """搜索请求基类"""
    limit: int = Field(default=20, ge=1, le=100)


class KeywordSearchRequest(SearchRequest):
    """关键词搜索请求"""
    keyword: str = Field(..., min_length=1)
    search_in_details: bool = False


class TagSearchRequest(SearchRequest):
    """标签搜索请求"""
    tags: List[str] = Field(..., min_length=1)
    match_all: bool = True


class DateRangeSearchRequest(SearchRequest):
    """日期范围搜索请求"""
    start_date: Date
    end_date: Date


class ImportanceSearchRequest(SearchRequest):
    """重要性搜索请求"""
    min_importance: int = Field(default=1, ge=1, le=10)


class SimilaritySearchRequest(SearchRequest):
    """相似度搜索请求"""
    query_text: str = Field(..., min_length=1)
    min_importance: Optional[int] = Field(None, ge=1, le=10)


class ErrorResponse(BaseModel):
    """错误响应模型"""
    error: str
    detail: Optional[str] = None
