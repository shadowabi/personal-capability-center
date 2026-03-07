"""
AI Memory System - PostgreSQL + pgvector

一个智能对话记忆系统，支持向量相似度搜索、多维筛选和LangChain集成。
"""

import psycopg2
from datetime import date
from typing import List, Tuple, Optional, Dict, Any
import numpy as np
import os
from pathlib import Path



# 加载 .env 文件
def _load_env_file():
    """从项目根目录加载 .env 文件"""
    # 从 scripts/ 目录向上两级到达项目根目录
    project_root = Path(__file__).parent.parent
    env_file = project_root / '.env'
    
    if env_file.exists():
        # 手动解析 .env 文件（避免依赖 python-dotenv）
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

# 加载环境变量
_load_env_file()


class AIMemory:
    """AI记忆系统封装类
    
    提供便捷的API来管理对话记录，支持向量搜索、标签查询等功能。
    
    使用示例:
        >>> memory = AIMemory()
        >>> conv_id = memory.add_conversation(
        ...     title='学习Python',
        ...     summary='学习了基础语法',
        ...     details='变量、数据类型、控制流',
        ...     tags=['Python', '编程'],
        ...     importance=8,
        ...     word_count=30
        ... )
        >>> similar = memory.search_similar(embedding, limit=5)
        >>> memory.close()
    """
    
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None
    ):
        """初始化AI记忆系统
        
        Args:
            host: 数据库主机地址（默认从环境变量 AI_MEMORY_HOST 读取，否则使用 'localhost'）
            port: 数据库端口（默认从环境变量 AI_MEMORY_PORT 读取，否则使用 5432）
            database: 数据库名称（默认从环境变量 AI_MEMORY_DB 读取，否则使用 'ai_memory'）
            user: 数据库用户名（默认从环境变量 AI_MEMORY_USER 读取，否则使用 'ai_user'）
            password: 数据库密码（默认从环境变量 AI_MEMORY_PASSWORD 读取，否则使用 'ai_password_123'）
        """
        # 优先使用传入参数，其次使用环境变量，最后使用默认值
        host = host or os.environ.get('AI_MEMORY_HOST', 'localhost')
        port = port or int(os.environ.get('AI_MEMORY_PORT', '5432'))
        database = database or os.environ.get('AI_MEMORY_DB', 'ai_memory')
        user = user or os.environ.get('AI_MEMORY_USER', 'ai_user')
        password = password or os.environ.get('AI_MEMORY_PASSWORD', 'ai_password_123')
        
        self.conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            client_encoding='utf8'  # 确保使用UTF-8编码
        )
        self.cur = self.conn.cursor()
    
    def add_conversation(
        self,
        title: str,
        summary: str,
        details: str,
        embedding: List[float],
        tags: List[str],
        importance: int,
        word_count: int,
        date_param: Optional[date] = None
    ) -> int:
        """添加新对话

        Args:
            title: 对话标题（一句话描述主题）
            summary: 对话摘要（简要描述）
            details: 详细内容（结构化的结论性总结）
            embedding: 向量嵌入（1536维）
            tags: 标签列表
            importance: 重要性评分（1-10）
            word_count: 字数统计
            date_param: 对话日期（默认为今天）

        Returns:
            新创建的对话记录ID
        """
        if date_param is None:
            date_param = date.today()
        
        self.cur.execute('''
            INSERT INTO conversations
            (date, title, summary, details, embedding, tags, importance, word_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        ''', (date_param, title, summary, details, embedding, tags, importance, word_count))
        
        self.conn.commit()
        return self.cur.fetchone()[0]
    
    def search_similar(
        self,
        query_vector: List[float],
        limit: int = 5,
        min_importance: int = 0
    ) -> List[Tuple]:
        """向量相似度搜索
        
        Args:
            query_vector: 查询向量（1536维）
            limit: 返回结果数量
            min_importance: 最小重要性筛选
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, details, tags, importance, similarity)
        """
        self.cur.execute('''
            SELECT 
                id, title, summary, details, tags, importance,
                1 - (embedding <=> %s::vector) as similarity
            FROM conversations
            WHERE importance >= %s AND embedding IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        ''', (query_vector, min_importance, query_vector, limit))
        
        return self.cur.fetchall()
    
    def get_by_tags(
        self,
        tags: List[str],
        limit: int = 10,
        match_all: bool = False
    ) -> List[Tuple]:
        """按标签搜索
        
        Args:
            tags: 标签列表
            limit: 返回结果数量
            match_all: True表示匹配所有标签，False表示匹配任一标签
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, tags, importance, date)
        """
        if match_all:
            # 匹配所有标签（AND）
            self.cur.execute('''
                SELECT id, title, summary, tags, importance, date
                FROM conversations
                WHERE tags @> %s
                ORDER BY importance DESC
                LIMIT %s;
            ''', (tags, limit))
        else:
            # 匹配任一标签（OR）
            self.cur.execute('''
                SELECT id, title, summary, tags, importance, date
                FROM conversations
                WHERE tags && %s
                ORDER BY importance DESC
                LIMIT %s;
            ''', (tags, limit))
        
        return self.cur.fetchall()
    
    def get_by_importance(
        self,
        min_importance: int = 8,
        limit: int = 10
    ) -> List[Tuple]:
        """按重要性筛选
        
        Args:
            min_importance: 最小重要性评分
            limit: 返回结果数量
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, importance, date)
        """
        self.cur.execute('''
            SELECT id, title, summary, importance, date
            FROM conversations
            WHERE importance >= %s
            ORDER BY importance DESC, date DESC
            LIMIT %s;
        ''', (min_importance, limit))
        
        return self.cur.fetchall()
    
    def get_conversation(
        self,
        conversation_id: int
    ) -> Optional[Tuple]:
        """获取对话详情
        
        Args:
            conversation_id: 对话ID
        
        Returns:
            对话详情，包含所有字段；如果不存在返回None
        """
        self.cur.execute('''
            SELECT id, date, title, summary, details, tags, importance, 
                   word_count, created_at, updated_at
            FROM conversations
            WHERE id = %s;
        ''', (conversation_id,))
        
        return self.cur.fetchone()
    
    def search_by_keyword(
        self,
        keyword: str,
        search_in_details: bool = True,
        limit: int = 10
    ) -> List[Tuple]:
        """关键词搜索
        
        Args:
            keyword: 搜索关键词
            search_in_details: 是否搜索details字段
            limit: 返回结果数量
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, importance, date)
        """
        if search_in_details:
            self.cur.execute('''
                SELECT id, title, summary, importance, date
                FROM conversations
                WHERE title ILIKE %s OR summary ILIKE %s OR details ILIKE %s
                ORDER BY importance DESC
                LIMIT %s;
            ''', (f'%{keyword}%', f'%{keyword}%', f'%{keyword}%', limit))
        else:
            self.cur.execute('''
                SELECT id, title, summary, importance, date
                FROM conversations
                WHERE title ILIKE %s OR summary ILIKE %s
                ORDER BY importance DESC
                LIMIT %s;
            ''', (f'%{keyword}%', f'%{keyword}%', limit))
        
        return self.cur.fetchall()
    
    def get_by_date_range(
        self,
        start_date: date,
        end_date: date,
        limit: int = 100
    ) -> List[Tuple]:
        """按日期范围查询
        
        Args:
            start_date: 开始日期
            end_date: 结束日期
            limit: 返回结果数量
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, date, importance)
        """
        self.cur.execute('''
            SELECT id, title, summary, date, importance
            FROM conversations
            WHERE date >= %s AND date <= %s
            ORDER BY date DESC
            LIMIT %s;
        ''', (start_date, end_date, limit))
        
        return self.cur.fetchall()
    
    def get_all_tags(self) -> List[str]:
        """获取所有标签
        
        Returns:
            所有标签的去重列表
        """
        self.cur.execute('''
            SELECT DISTINCT unnest(tags) as tag
            FROM conversations
            ORDER BY tag;
        ''')
        
        return [row[0] for row in self.cur.fetchall()]
    
    def update_importance(
        self,
        conversation_id: int,
        new_importance: int
    ) -> bool:
        """更新对话重要性
        
        Args:
            conversation_id: 对话ID
            new_importance: 新的重要性评分（1-10）
        
        Returns:
            是否更新成功
        """
        self.cur.execute('''
            UPDATE conversations 
            SET importance = %s, updated_at = NOW()
            WHERE id = %s;
        ''', (new_importance, conversation_id))
        
        self.conn.commit()
        return self.cur.rowcount > 0
    
    def get_by_title(self, title: str) -> Optional[Tuple]:
        """按标题查询对话"""
        self.cur.execute('''
            SELECT id, date, title, summary, details, tags, importance, 
                   word_count, created_at, updated_at
            FROM conversations
            WHERE title = %s;
        ''', (title,))
        return self.cur.fetchone()
    
    def update_summary(self, conversation_id: int, summary: str, details: str) -> bool:
        """更新对话摘要和详情"""
        self.cur.execute('''
            UPDATE conversations 
            SET summary = %s, details = %s, updated_at = NOW()
            WHERE id = %s;
        ''', (summary, details, conversation_id))
        
        self.conn.commit()
        return self.cur.rowcount > 0
    
    def delete_conversation(
        self,
        conversation_id: int
    ) -> bool:
        """删除对话
        
        Args:
            conversation_id: 对话ID
        
        Returns:
            是否删除成功
        """
        self.cur.execute('''
            DELETE FROM conversations WHERE id = %s;
        ''', (conversation_id,))
        
        self.conn.commit()
        return self.cur.rowcount > 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取数据库统计信息
        
        Returns:
            包含统计信息的字典
        """
        self.cur.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_vectors,
                COUNT(CASE WHEN importance >= 8 THEN 1 END) as high_importance,
                ROUND(AVG(word_count)::numeric, 1) as avg_words,
                MAX(importance) as max_importance,
                MIN(importance) as min_importance
            FROM conversations;
        ''')
        
        stats = self.cur.fetchone()
        return {
            'total_conversations': stats[0],
            'with_vectors': stats[1],
            'high_importance': stats[2],
            'avg_words': stats[3],
            'max_importance': stats[4],
            'min_importance': stats[5]
        }
    
    def get_top_tags(
        self,
        limit: int = 10
    ) -> List[Tuple[str, int]]:
        """获取热门标签
        
        Args:
            limit: 返回的标签数量
        
        Returns:
            (tag_name, count) 元组列表，按出现次数降序排列
        """
        self.cur.execute('''
            SELECT 
                unnest(tags) as tag,
                COUNT(*) as count
            FROM conversations
            GROUP BY tag
            ORDER BY count DESC
            LIMIT %s;
        ''', (limit,))
        
        return self.cur.fetchall()
    
    def get_recent(
        self,
        days: int = 7,
        limit: int = 10
    ) -> List[Tuple]:
        """获取最近的对话
        
        Args:
            days: 最近多少天
            limit: 返回结果数量
        
        Returns:
            匹配的对话列表，每项包含 (id, title, summary, date, importance)
        """
        self.cur.execute('''
            SELECT id, title, summary, date, importance
            FROM conversations
            WHERE date >= CURRENT_DATE - INTERVAL '%s days'
            ORDER BY date DESC
            LIMIT %s;
        ''', (days, limit))
        
        return self.cur.fetchall()
    
    def close(self):
        """关闭数据库连接
        
        建议使用with语句自动管理连接：
            >>> with AIMemory() as memory:
            ...     memory.add_conversation(...)
        """
        if hasattr(self, 'cur'):
            self.cur.close()
        if hasattr(self, 'conn'):
            self.conn.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
        return False


def generate_mock_embedding(dimension: int = 1536) -> List[float]:
    """生成用于测试的mock向量嵌入
    
    在实际应用中，应该使用OpenAI API或其他embedding服务生成真实的向量。
    
    Args:
        dimension: 向量维度（默认1536，对应OpenAI text-embedding-ada-002）
    
    Returns:
        随机生成的向量列表
    
    使用示例:
        >>> from scripts.ai_memory import AIMemory, generate_mock_embedding
        >>> 
        >>> embedding = generate_mock_embedding()
        >>> 
        >>> with AIMemory() as memory:
        ...     conv_id = memory.add_conversation(
        ...         title='测试对话',
        ...         summary='这是一个测试',
        ...         details='详细内容',
        ...         embedding=embedding,
        ...         tags=['测试'],
        ...         importance=5,
        ...         word_count=10
        ...     )
    """
    np.random.seed(42)  # 使用固定种子确保可重现性
    return list(map(float, np.random.rand(dimension)))


class OpenAIEmbeddings:
    """OpenAI Embeddings接口实现
    
    用于LangChain PGVector集成的embedding函数。
    
    使用示例:
        >>> from scripts.ai_memory import OpenAIEmbeddings
        >>> from langchain_community.vectorstores import PGVector
        >>> 
        >>> embeddings = OpenAIEmbeddings(api_key='your-api-key')
        >>> 
        >>> vectorstore = PGVector(
        ...     collection_name='ai_conversations',
        ...     connection_string='postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory',
        ...     embedding_function=embeddings
        ... )
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """初始化OpenAI Embeddings
        
        Args:
            api_key: OpenAI API密钥（如果为None，从环境变量OPENAI_API_KEY读取）
        """
        try:
            import openai
            self.openai = openai
            if api_key:
                openai.api_key = api_key
        except ImportError:
            raise ImportError(
                "请安装openai包: pip install openai"
            )
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """为文档列表生成embeddings
        
        Args:
            texts: 文本列表
        
        Returns:
            每个文本的embedding向量列表
        """
        response = self.openai.Embedding.create(
            input=texts,
            model='text-embedding-ada-002'
        )
        return [item['embedding'] for item in response['data']]
    
    def embed_query(self, text: str) -> List[float]:
        """为查询文本生成embedding
        
        Args:
            text: 查询文本
        
        Returns:
            embedding向量
        """
        return self.embed_documents([text])[0]


