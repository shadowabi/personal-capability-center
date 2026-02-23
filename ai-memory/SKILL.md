# AI Memory - 智能对话记忆系统

一个基于PostgreSQL和pgvector的AI记忆系统，支持向量相似度搜索、多维筛选和LangChain集成。

## 快速开始

### 1. 数据库设置

**推荐：使用Docker Compose**

```bash
# 进入AI Memory目录
cd path/to/ai-memory

# 使用Docker Compose启动
docker compose up -d

# 查看日志
docker compose logs -f postgresql
```

连接信息：
- Host: 127.0.0.1
- Port: 5432
- Database: ai_memory
- User: ai_user
- Password: ai_password_123

详细安装说明：[INSTALL.md](references/INSTALL.md)

### 2. 基础使用

```python
from scripts.ai_memory import AIMemory

# 连接数据库
memory = AIMemory()

# 添加对话
embedding = generate_embedding(text)
conv_id = memory.add_conversation(
    title='学习Python',
    summary='学习了Python基础语法',
    details='学习了变量、数据类型、控制流等基础知识',
    tags=['Python', '编程'],
    importance=8,
    word_count=30
)

# 向量搜索
similar = memory.search_similar(embedding, limit=5)

# 关闭连接
memory.close()
```

更多示例：[EXAMPLES.md](references/EXAMPLES.md)

### 3. 测试与验证

**快速验证**：
```bash
python scripts/quick_test.py
```

**系统测试**：
```bash
python scripts/test_ai_memory.py
```

详细测试说明：[TESTING.md](references/TESTING.md)

## 核心功能

- ✅ **向量搜索** - 基于pgvector的语义相似度搜索
- ✅ **多维筛选** - 按标签、重要性、日期范围筛选
- ✅ **LangChain集成** - 完整的PGVector支持
- ✅ **Python封装** - 开箱即用的AIMemory类
- ✅ **高性能** - HNSW索引加速向量搜索

## 文档

- **完整安装指南**: [INSTALL.md](references/INSTALL.md)
- **API参考**: [API_REFERENCE.md](references/API_REFERENCE.md)
- **数据库架构**: [SCHEMA.md](references/SCHEMA.md)
- **使用示例**: [EXAMPLES.md](references/EXAMPLES.md)
- **LangChain集成**: [LANGCHAIN.md](references/LANGCHAIN.md)
- **内容存储指南**: [CONTENT_GUIDELINES.md](references/CONTENT_GUIDELINES.md)
- **能力提炼指南**: [CAPABILITY_EXTRACTION.md](references/CAPABILITY_EXTRACTION.md)
- **故障排查**: [WSL2_TROUBLESHOOTING.md](references/WSL2_TROUBLESHOOTING.md)

## 许可证

MIT License
