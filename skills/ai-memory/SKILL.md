# AI Memory - 智能对话记忆系统

一个基于PostgreSQL和pgvector的AI记忆系统，支持向量相似度搜索、多维筛选和LangChain集成。

## 核心理念：对话即能力

### 🎯 不是记录"知识点"，而是提炼"能力"

| 维度 | 笔记工具 | 能力中心 |
|------|---------|---------|
| **存储对象** | 知识点（如"Python是编程语言"） | 能力（包含思考过程、认知跃迁） |
| **核心问题** | "这是什么？" | "为什么"、"怎么用"、"可复用" |
| **复用性** | 需要重新学习 | 直接复用方法 |
| **举例** | "执行意图是什么" | "掌握了执行意图，可应用于减肥、学习、工作习惯" |

### ⚠️ 重要提示

**ai-memory的核心不是"存储对话"，而是"提炼能力"**

每个能力必须包含三要素：
1. **能力定义**（抽象层）：本质是什么
2. **体现在深刻洞察**（表象）：用具体场景说明
3. **认知转变过程**：从错误→正确的完整路径

**📖 详细说明请必读**：
- [能力提炼指南](references/CAPABILITY_EXTRACTION.md) - 理解什么是"能力" vs "知识点"
- [内容存储指南](references/CONTENT_GUIDELINES.md) - 如何正确存储对话

---

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

# 添加对话（⚠️ 生产环境请按照能力提炼指南正确组织内容）
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

**⚠️ 注意**：以上是一个简化示例，仅用于快速测试。生产环境中，请按照 [能力提炼指南](references/CAPABILITY_EXTRACTION.md) 提炼能力，详细的存储格式请参考 [内容存储指南](references/CONTENT_GUIDELINES.md)。

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
- ✅ **能力提炼** - 从对话中提取可复用的能力

## 文档

### 🎯 核心理念（必读）

- **[能力提炼指南](references/CAPABILITY_EXTRACTION.md)** - 理解什么是"能力" vs "知识点"，以及如何从对话中提炼能力
- **[内容存储指南](references/CONTENT_GUIDELINES.md)** - 如何正确存储对话，包括能力记录的结构和格式

### 📚 技术文档

- **[完整安装指南](references/INSTALL.md)** - 数据库安装和配置
- **[API参考](references/API_REFERENCE.md)** - AIMemory类和方法的详细文档
- **[数据库架构](references/SCHEMA.md)** - 数据库表结构和索引设计
- **[使用示例](references/EXAMPLES.md)** - 实际使用案例和代码示例
- **[LangChain集成](references/LANGCHAIN.md)** - 如何与LangChain框架集成
- **[故障排查](references/WSL2_TROUBLESHOOTING.md)** - 常见问题和解决方案

## 许可证

MIT License
