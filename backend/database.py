"""
Database connection management for AI Memory Dashboard
"""
import sys
from pathlib import Path

# Add ai-memory scripts to path
ai_memory_path = Path(__file__).resolve().parent.parent / 'ai-memory' / 'scripts'
if str(ai_memory_path) not in sys.path:
    sys.path.insert(0, str(ai_memory_path))

from ai_memory import AIMemory


class DatabaseManager:
    """数据库管理器"""

    def __init__(self):
        """初始化数据库连接"""
        self.memory = None

    def get_memory(self) -> AIMemory:
        """获取 AI Memory 实例（单例模式）"""
        if self.memory is None:
            self.memory = AIMemory()
        return self.memory

    def close(self):
        """关闭数据库连接"""
        if self.memory is not None:
            self.memory.close()
            self.memory = None


# 全局数据库管理器实例
db_manager = DatabaseManager()


async def get_db():
    """FastAPI 依赖注入：获取数据库连接"""
    memory = db_manager.get_memory()
    try:
        yield memory
    finally:
        # 不在这里关闭连接，保持连接复用
        pass
