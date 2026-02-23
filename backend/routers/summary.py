from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
import httpx
import asyncio
import re
from datetime import datetime, date
import logging
import os

from database import get_db


def zero_vector(dim: int = 1536) -> str:
    """生成零向量用于embedding（PostgreSQL vector格式）"""
    return "[" + ",".join(["0.0"] * dim) + "]"

router = APIRouter()
logger = logging.getLogger(__name__)

# 从环境变量读取配置
OPENCODE_API_URL = os.getenv("OPENCODE_API_URL", "http://127.0.0.1:4096")
AGENT_NAME = os.getenv("AGENT_NAME")
MODEL_ID = os.getenv("MODEL_ID")
PROVIDER_ID = os.getenv("PROVIDER_ID")
DEFAULT_TIMEOUT = int(os.getenv("SUMMARY_TIMEOUT", "30"))
MAX_CONVERSATIONS = int(os.getenv("MAX_CONVERSATIONS", "50"))
MAX_DETAIL_LENGTH = int(os.getenv("MAX_DETAIL_LENGTH", "800"))


def extract_text_from_message(msg):
    """从消息对象中提取文本"""
    text_parts = []
    for part in msg.get("parts", []):
        part_type = part.get("type")
        if part_type == "text":
            text = part.get("text", "")
            if text:
                text = text.replace('\r\n', '\n').replace('\r', '\n')
                text = re.sub(r'\n{2,}', '\n', text)
                text = text.strip()
                if text:
                    text_parts.append(text)
    return '\n'.join(text_parts)


def get_conversations_by_period(memory, period_type: str):
    """获取指定期间的对话数据"""
    today = date.today()
    
    if period_type == "monthly":
        start_date = today.replace(day=1)
    else:
        start_date = today.replace(month=1, day=1)
    
    try:
        all_conversations = memory.get_recent(days=3650, limit=200)
    except Exception as e:
        logger.error(f"Failed to get recent conversations: {e}")
        return []
    
    if not all_conversations:
        return []
    
    filtered = []
    max_count = MAX_CONVERSATIONS
    
    for conv in all_conversations:
        if len(filtered) >= max_count:
            break
            
        try:
            if len(conv) < 5:
                continue
                
            conv_id, title, summary, conv_date, importance = conv[0], conv[1], conv[2], conv[3], conv[4]
            
            if conv_date is None:
                continue
            
            if isinstance(conv_date, str):
                try:
                    conv_date = datetime.strptime(conv_date.split('T')[0], "%Y-%m-%d").date()
                except:
                    continue
            
            if conv_date >= start_date:
                full_conv = memory.get_conversation(conv_id)
                if full_conv:
                    filtered.append({
                        'id': conv_id,
                        'title': title,
                        'summary': summary,
                        'details': full_conv[4] if len(full_conv) > 4 else '',
                        'tags': full_conv[5] if len(full_conv) > 5 else [],
                        'importance': importance,
                        'date': str(conv_date)
                    })
        except Exception as e:
            logger.warning(f"Error processing conversation: {e}")
            continue
    
    return filtered


def format_conversations_for_prompt(conversations):
    """将对话数据格式化为 prompt 文本"""
    if not conversations:
        return "（暂无对话记录）"
    
    formatted = []
    for i, conv in enumerate(conversations[:50], 1):  # 限制最多50条
        tags_str = ", ".join(conv.get('tags', [])[:5]) if conv.get('tags') else "无"
        details = conv.get('details', '')[:500] if conv.get('details') else conv.get('summary', '')[:500]
        
        formatted.append(f"""### 对话 {i}: {conv.get('title', '无标题')}
- 日期: {conv.get('date', '未知')}
- 重要性: {conv.get('importance', 0)}/10
- 标签: {tags_str}
- 内容摘要: {conv.get('summary', '无摘要')[:300]}
- 详细内容: {details[:500]}
""")
    
    return "\n".join(formatted)


@router.get("/monthly")
async def get_monthly_summary(memory=Depends(get_db)) -> Dict[str, Any]:
    """生成月度成长总结"""
    try:
        conversations = get_conversations_by_period(memory, "monthly")
        conversations_text = format_conversations_for_prompt(conversations)
        
        today = date.today()
        year_month = today.strftime("%Y年%m月")
        
        prompt = f"""请根据以下用户对话记录，生成{year_month}的月度成长总结：

## 本月对话记录（共{len(conversations)}条）
{conversations_text}

## 要求：
1. 分析本月对话中用户能力的成长轨迹
2. 识别本月最重要的3-5个对话
3. 总结本月获得的新技能或知识点
4. 分析用户在本月的关注重点（基于标签）
5. 提供下个月的学习建议

请用中文回答，使用清晰的Markdown格式，包含以下章节：
- 本月概览
- 能力成长
- 重要对话
- 技能提升
- 关注重点
- 下月建议
"""

        async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=10.0)) as client:
            response = await client.post(
                f"{OPENCODE_API_URL}/session",
                json={
                    "agent": AGENT_NAME,
                    "mode": "ws_third_party"
                }
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create session in OpenCode"
                )

            session_data = response.json()
            session_id = session_data.get("id")

            if not session_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to get session ID from OpenCode"
                )

            message_response = await client.post(
                f"{OPENCODE_API_URL}/session/{session_id}/message",
                json={
                    "parts": [{"type": "text", "text": prompt}],
                    "agent": AGENT_NAME,
                    "model": {
                        "modelID": MODEL_ID,
                        "providerID": PROVIDER_ID
                    }
                }
            )

            if message_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to send message to OpenCode"
                )

            await asyncio.sleep(3)

            for attempt in range(8):
                try:
                    response2 = await client.get(
                        f"{OPENCODE_API_URL}/session/{session_id}/message",
                        params={"limit": 5}
                    )

                    if response2.status_code == 200:
                        messages = response2.json()

                        for msg in reversed(messages):
                            info = msg.get("info", {})
                            if info.get("role") == "assistant":
                                text = extract_text_from_message(msg)
                                if text:
                                    # 保存总结到数据库
                                    year_month = today.strftime("%Y年%m月")
                                    title = f"{year_month}月度总结"
                                    existing = memory.get_by_title(title)
                                    if existing:
                                        memory.update_summary(existing[0], "", text)
                                    else:
                                        # 插入新记录
                                        memory.add_conversation(
                                            title=title,
                                            summary="",
                                            details=text,
                                            embedding=zero_vector(),
                                            tags=["总结", "月度"],
                                            importance=10,
                                            word_count=len(text),
                                            date=today
                                        )
                                    return {
                                        "summary": text,
                                        "type": "monthly",
                                        "session_id": session_id
                                    }
                except httpx.TimeoutException:
                    try:
                        await client.post(f"{OPENCODE_API_URL}/session/{session_id}/abort")
                    except:
                        pass
                    await asyncio.sleep(2)
                    continue

                await asyncio.sleep(2)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get response from OpenCode"
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot connect to OpenCode API: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Monthly summary error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate monthly summary: {str(e)}"
        )


@router.get("/yearly")
async def get_yearly_summary(memory=Depends(get_db)) -> Dict[str, Any]:
    """生成年度成长总结"""
    try:
        conversations = get_conversations_by_period(memory, "yearly")
        conversations_text = format_conversations_for_prompt(conversations)
        
        year = date.today().year
        
        prompt = f"""请根据以下用户对话记录，生成{year}年的年度成长总结：

## 今年对话记录（共{len(conversations)}条）
        {conversations_text}

## 要求：
        1. 分析全年对话中用户能力的成长轨迹和里程碑
        2. 识别年度最重要的5-10个对话，说明其重要性
        3. 总结全年获得的主要技能和知识点
        4. 分析用户全年的关注重点（基于标签分布）
        5. 识别用户的能力优势和待提升领域
        6. 提供明年的成长目标和学习建议

        请用中文回答，使用清晰的Markdown格式，包含以下章节：
        - 年度成长概览
        - 重要对话回顾
        - 技能与知识积累
        - 关注重点分析
        - 能力评估
        - 来年成长建议
        """

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=10.0)) as client:
                response = await client.post(
                    f"{OPENCODE_API_URL}/session",
                    json={
                        "agent": AGENT_NAME,
                        "mode": "ws_third_party"
                    }
                )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create session in OpenCode"
                    )

                session_data = response.json()
                session_id = session_data.get("id")

                if not session_id:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to get session ID from OpenCode"
                    )

                message_response = await client.post(
                    f"{OPENCODE_API_URL}/session/{session_id}/message",
                    json={
                        "parts": [{"type": "text", "text": prompt}],
                        "agent": AGENT_NAME
                    }
                )

                if message_response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to send message to OpenCode"
                    )

                await asyncio.sleep(3)

                for attempt in range(8):
                    try:
                        response2 = await client.get(
                            f"{OPENCODE_API_URL}/session/{session_id}/message",
                            params={"limit": 5}
                        )

                        if response2.status_code == 200:
                            messages = response2.json()

                            for msg in reversed(messages):
                                info = msg.get("info", {})
                                if info.get("role") == "assistant":
                                    text = extract_text_from_message(msg)
                                    if text:
                                        # 保存总结到数据库
                                        year = date.today().year
                                        title = f"{year}年年度总结"
                                        existing = memory.get_by_title(title)
                                        if existing:
                                            memory.update_summary(existing[0], text[:2000], text)
                                        else:
                                            # 插入新记录
                                              memory.add_conversation(
                                                  title=title,
                                                  summary="",
                                                  details=text,
                                                  embedding=zero_vector(),
                                                  tags=["总结", "年度"],
                                                  importance=10,
                                                  word_count=len(text),
                                                  date=date.today()
                                              )
                                    return {
                                        "summary": text,
                                        "type": "yearly",
                                        "session_id": session_id
                                    }
                    except httpx.TimeoutException:
                        try:
                            await client.post(f"{OPENCODE_API_URL}/session/{session_id}/abort")
                        except:
                            pass
                        await asyncio.sleep(2)
                        continue

                    await asyncio.sleep(2)

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to get response from OpenCode"
                )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Cannot connect to OpenCode API: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Yearly summary error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate yearly summary: {str(e)}"
            )
    except Exception as e:
        logger.error(f"Yearly summary outer error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate yearly summary: {str(e)}"
        )


@router.get("/debug-conversations")
async def debug_conversations(memory=Depends(get_db)):
    """调试端点"""
    try:
        today = date.today()
        monthly_start = today.replace(day=1)
        yearly_start = today.replace(month=1, day=1)
        
        convs = memory.get_recent(days=3650, limit=20)
        result = []
        for c in convs[:10]:
            conv_date_raw = c[3] if len(c) > 3 else None
            conv_date = None
            if conv_date_raw:
                if isinstance(conv_date_raw, date):
                    conv_date = conv_date_raw
                elif isinstance(conv_date_raw, str):
                    try:
                        conv_date = datetime.strptime(conv_date_raw.split('T')[0], "%Y-%m-%d").date()
                    except:
                        pass
            
            date_type = type(conv_date_raw).__name__ if conv_date_raw else None
            monthly_match = False
            yearly_match = False
            
            if conv_date:
                monthly_match = conv_date >= monthly_start
                yearly_match = conv_date >= yearly_start
            
            result.append({
                'id': c[0],
                'title': c[1][:30] if c[1] else None,
                'date_raw': str(conv_date_raw) if conv_date_raw else None,
                'date': str(conv_date) if conv_date else None,
                'date_type': date_type,
                'monthly_start': str(monthly_start),
                'yearly_start': str(yearly_start),
                'monthly_match': monthly_match,
                'yearly_match': yearly_match,
                'importance': c[4] if len(c) > 4 else None
            })
        
        # 测试两个函数的结果
        monthly_convs = get_conversations_by_period(memory, "monthly")
        yearly_convs = get_conversations_by_period(memory, "yearly")
        
        return {
            'today': str(today),
            'monthly_start': str(monthly_start),
            'yearly_start': str(yearly_start),
            'total_convs': len(convs),
            'conversations': result,
            'monthly_count': len(monthly_convs),
            'yearly_count': len(yearly_convs)
        }
    except Exception as e:
        import traceback
        return {'error': str(e), 'trace': traceback.format_exc()}
