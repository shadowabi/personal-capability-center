# AI Memory - 智能对话记忆系统

一个基于PostgreSQL和pgvector的AI记忆系统，支持向量相似度搜索、多维筛选、自动评分和LangChain集成。

## 核心理念：对话即能力

### 🎯 不是记录"知识点"，而是提炼"能力"

| 维度 | 笔记工具 | 能力中心 |
|------|---------|---------|
| **存储对象** | 知识点（如"Python是编程语言"） | 能力（包含思考过程、认知跃迁） |
| **核心问题** | "这是什么？" | "是什么能力"、"深刻洞察"、"如何转变" |
| **复用性** | 需要重新学习 | 直接复用方法 |
| **举例** | "执行意图是什么" | "掌握了执行意图，可应用于减肥、学习、工作习惯" |

### 🎯 重要性评分机制

AI Memory使用**科学的多维度评分体系**（1-10分）来评估对话价值，避免"高分泛滥"问题。

**评分维度**（加权计算）：
- 认知深度（30%）：内容的深度和抽象层级（1-3具体操作 → 7-8框架思维 → 9-10元认知跃迁）
- 能力迁移性（25%）：可迁移到其他场景的能力（1-3特定场景 → 7-8多领域 → 9-10普适框架）
- 影响范围（20%）：影响的广度和时间跨度（1-3当前任务 → 7-8多个领域 → 9-10改变思维方式）
- 创新性（15%）：是否提供新的视角或框架（1-3常规方法 → 7-8新视角 → 9-10突破性洞察）
- 结构化程度（10%）：是否有清晰的框架和可操作性（1-3零散信息 → 7-8清晰框架 → 9-10完整方法论）

**为什么要区分度优先？**
- 避免所有内容都是高评分（如之前数据库100%都是8分以上）
- 让评分真正反映价值差异
- 帮助用户快速识别真正重要的内容

**详细评分标准**：见[评分指南](references/IMPORTANCE_GUIDE.md)

### ⚠️ 重要提示

**ai-memory的核心不是"存储对话"，而是"提炼能力"**

每个能力必须包含三要素：
1. **能力定义**（抽象层）：本质是什么
2. **体现在深刻洞察**（表象）：用具体场景说明
3. **认知转变过程**（从错误→正确的完整路径）

**📖 详细说明请必读**：
- [能力提炼指南](references/CAPABILITY_EXTRACTION.md) - 理解什么是"能力" vs "知识点"
- [内容存储指南](references/CONTENT_GUIDELINES.md) - 如何正确存储对话
- [评分指南](references/IMPORTANCE_GUIDE.md) - 如何评估对话重要性

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

<!-- 详细安装说明：待补充 -->

### 2. 基础使用

#### 2.1 手动添加对话（带评分）

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
    importance=8,  # 手动指定重要性评分（1-10）
    word_count=30
)

# 向量搜索
similar = memory.search_similar(embedding, limit=5)

# 关闭连接
memory.close()
```

#### 2.2 智能评分（AI根据文档评分）

AI Memory支持基于[评分指南](references/IMPORTANCE_GUIDE.md)的智能评分，确保评分的一致性和准确性。

**评分维度**（加权计算）：
- 认知深度（30%）：内容的深度和抽象层级
- 能力迁移性（25%）：可迁移到其他场景的能力
- 影响范围（20%）：影响的广度和时间跨度
- 创新性（15%）：是否提供新的视角或框架
- 结构化程度（10%）：是否有清晰的框架和可操作性

```python
from scripts.ai_memory import AIMemory

# 连接数据库
memory = AIMemory()

# 准备对话内容
title = '从"偏好规划清晰"到"场景化认知框架"的元认知跃迁'
summary = '通过批判性思维审视，用户意识到自己混淆了过程质量和结果质量...'
details = '详细的认知转变过程...'
tags = ['元认知', '批判性思维', '场景化分析', '实用主义']
word_count = 2325

# AI根据IMPORTANCE_GUIDE.md进行评分
# 评分流程：
# 1. 阅读对话内容（标题、summary、details、tags）
# 2. 识别关键特征，对照1-10分评分标准
# 3. 评估五个维度（认知深度、能力迁移性、影响范围、创新性、结构化程度）
# 4. 根据各维度评分和权重，给出最终评分（1-10分）
# 5. 验证评分，对照评分原则和检查清单

# 本例评分分析：
# - 认知深度：10/10（元认知跃迁，改变思维方式）
# - 能力迁移性：9/10（普适性框架，适用于所有领域）
# - 影响范围：8/10（影响长期决策）
# - 创新性：9/10（提供全新视角）
# - 结构化程度：8/10（形成系统化框架）
# 综合评分：9分（深度框架级别）

importance = 9  # AI根据IMPORTANCE_GUIDE.md判断

# 添加对话
embedding = generate_embedding(f"{title} {summary}")
conv_id = memory.add_conversation(
    title=title,
    summary=summary,
    details=details,
    tags=tags,
    importance=importance,  # 重要性评分（1-10）
    word_count=word_count,
    embedding=embedding
)

# 关闭连接
memory.close()
```

**为什么推荐智能评分？**
- **一致性**：所有对话使用相同的评分标准（IMPORTANCE_GUIDE.md）
- **避免偏见**：减少字数偏见、新颖性偏见等认知偏差
- **区分度**：确保评分有合理的分布，不会出现"100%高分"的问题
- **可解释性**：评分基于明确的维度和标准，用户可以了解评分依据

**⚠️ 注意**：以上是简化示例。生产环境中，请按照 [能力提炼指南](references/CAPABILITY_EXTRACTION.md) 提炼能力，详细的存储格式请参考 [内容存储指南](references/CONTENT_GUIDELINES.md)，并参考 [评分指南](references/IMPORTANCE_GUIDE.md) 理解评分标准。

### 3. 测试与验证

**快速验证**：
```bash
python scripts/quick_test.py
```

**系统测试**：
```bash
python scripts/test_ai_memory.py
```

<!-- 详细测试说明：待补充 -->

## 核心功能

- ✅ **向量搜索** - 基于pgvector的语义相似度搜索
- ✅ **多维筛选** - 按标签、重要性、日期范围筛选
- ✅ **智能评分** - AI基于[IMPORTANCE_GUIDE.md](references/IMPORTANCE_GUIDE.md)进行多维度评分（5个维度：认知深度、能力迁移性、影响范围、创新性、结构化程度）
- ✅ **LangChain集成** - 完整的PGVector支持
- ✅ **Python封装** - 开箱即用的AIMemory类
- ✅ **高性能** - HNSW索引加速向量搜索
- ✅ **能力提炼** - 从对话中提取可复用的能力

## 文档

### 🎯 核心理念（必读）

- **[能力提炼指南](references/CAPABILITY_EXTRACTION.md)** - 理解什么是"能力" vs "知识点"，以及如何从对话中提炼能力
- **[内容存储指南](references/CONTENT_GUIDELINES.md)** - 如何正确存储对话，包括能力记录的结构和格式

### 📚 技术文档

<!-- 以下文档待补充 -->
- 完整安装指南 - 数据库安装和配置
- API参考 - AIMemory类和方法的详细文档
- 数据库架构 - 数据库表结构和索引设计
- 使用示例 - 实际使用案例和代码示例
- LangChain集成 - 如何与LangChain框架集成
- 故障排查 - 常见问题和解决方案

## 许可证

MIT License
