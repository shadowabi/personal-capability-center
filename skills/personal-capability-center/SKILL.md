---
name: personal-capability-center
description: >
  Use this skill to extract, refine, and store capabilities from conversations into the Personal Capability Center database.
  This skill handles capability extraction, semantic storage, and retrieval of user's evolving skills and insights.
  Use when user wants to: save learned capabilities, search past insights, analyze growth patterns, or manage personal knowledge base.
  Core features: vector similarity search, multi-dimensional importance scoring, LangChain integration.
---

# Personal Capability Center - 个人能力中心

操作个人能力中心（Personal Capability Center）数据库的 skill，用于从对话中总结和提炼能力，存入数据库。

## 核心理念：对话即能力

### 🎯 不是记录"知识点"，而是提炼"能力"

| 维度 | 笔记工具 | 能力中心 |
|------|---------|---------|
| **存储对象** | 知识点（如"Python是编程语言"） | 能力（包含思考过程、认知跃迁） |
| **核心问题** | "这是什么？" | "是什么能力"、"深刻洞察"、"如何转变" |
| **复用性** | 需要重新学习 | 直接复用方法 |
| **举例** | "执行意图是什么" | "掌握了执行意图，可应用于减肥、学习、工作习惯" |

### 🎯 重要性评分机制

个人能力中心（Personal Capability Center）使用**科学的多维度评分体系**（1-10分）来评估对话价值，避免"高分泛滥"问题。

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

**个人能力中心的核心不是"存储对话"，而是"提炼能力"**

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
# 进入personal-capability-center目录
cd path/to/personal-capability-center

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

### 1.1 备份数据库（重要！）

在执行任何数据库操作前，强烈建议先备份数据库：

```bash
# 备份数据库到SQL文件
docker exec ai-memory-db pg_dump -U ai_user -d ai_memory > ai_memory_backup_$(date +%Y%m%d).sql

# 备份Docker volume
docker run --rm -v ai-memory_postgres_data:/data -v $(pwd):/backup \
    ubuntu tar czf /backup/personal-capability-center-postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

### 2. 基础使用

#### 2.1 手动添加对话（带评分）

#### 使用Markdown格式（推荐）

个人能力中心的`details`字段支持Markdown格式，前端会自动渲染。建议使用Markdown来组织结构化的内容。

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding

# 连接数据库
memory = AIMemory()

# 生成embedding（实际使用时使用真实的embedding）
embedding = generate_mock_embedding()

# 添加对话（使用Markdown格式）
conv_id = memory.add_conversation_with_markdown(
    title='从"参数越大越好"到实用决策框架的认知跃迁',
    summary='通过批判性思维审视，用户意识到参数不是知识存储，而是认知维度...',
    details='''## 问题背景
- 最初理解：模型参数越大，会的东西越多
- 困惑点：大模型vs小模型、蒸馏现象
- 需求：给普通人提供实用的模型选择建议

---

## 掌握的能力

### 能力1：认知维度理解能力
**能力定义：**
理解参数的本质不是知识存储容量，而是模型的认知维度

**体现在深刻洞察：**
- 参数越多，模型的认知空间维度越高
- 不是"知道得多"，而是"理解得深"
- 认知维度就像乐高积木

**认知转变过程：**
1. 原本认知：参数越大，会的东西越多
2. 引导提问："如果参数=知识存储，那为什么小模型能从大模型蒸馏？"
3. 突破点：蒸馏不是"复制知识"，而是"压缩理解"
4. 新认知：参数=认知维度，不是知识存储

---

### 能力2：实用决策框架构建能力
**能力定义：**
将复杂技术问题转化为普通人可操作的决策框架

**体现在深刻洞察：**
- 按场景推荐模型：日常聊天用免费版、创作用中等版
- 简化原则：不知道选什么→先试免费

**认知转变过程：**
1. 原本认知：需要给普通人解释技术概念
2. 引导提问："如果有人问'什么汽车最好？'，你会怎么回答？"
3. 突破点：选车要看用途，选模型也看用途
4. 新认知：别纠结技术细节，关心够不够用就行''',
    tags=['元认知', '批判性思维', '模型选择'],
    importance=9,
    word_count=2325
)

# 关闭连接
memory.close()
```

**Markdown格式说明：**

- 使用`##`表示主标题（如"问题背景"、"掌握的能力"）
- 使用`###`表示子标题（如"能力1"）
- 使用`**文本**`表示加粗（如"**能力定义：**"）
- 使用`- 文本`表示无序列表
- 使用`1. 文本`表示有序列表
- 使用`---`表示分隔符

#### 使用普通文本格式

```python
from scripts.ai_memory import AIMemory

# 连接数据库
memory = AIMemory()

# 添加对话（普通文本格式）
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

个人能力中心支持基于[评分指南](references/IMPORTANCE_GUIDE.md)的智能评分，确保评分的一致性和准确性。

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
- ✅ **Markdown支持** - `details`字段支持Markdown格式，前端自动渲染，让内容更易读

### Markdown格式最佳实践

**何时使用Markdown：**
- 需要结构化展示能力定义、深刻洞察、认知转变过程时
- 需要清晰展示多个维度（如问题背景、能力列表）时
- 需要使用列表、加粗、标题等格式增强可读性时

**Markdown格式建议：**

```markdown
## 标题1
- 内容项1
- 内容项2

## 标题2

### 子标题
**强调文本**：描述内容

- 列表项1
- 列表项2

---

分隔符
```

**格式化工具：**
- `add_conversation_with_markdown()` - 明确使用Markdown格式的便捷方法
- `add_conversation(format_type='markdown')` - 通过format_type参数指定格式
- 前端会自动渲染Markdown，无需额外处理

### 格式转换工具

如果数据库中有使用旧格式（"问题背景："、"掌握的能力："等）的记录，可以使用以下方法转换为Markdown格式：

```python
# format_converter.py
import re

def convert_to_markdown(details: str) -> str:
    """将旧格式转换为Markdown格式"""
    lines = details.split('\n')
    result = []

    for line in lines:
        # 转换标题
        if line.startswith('问题背景：'):
            line = '## 问题背景'
        elif line.startswith('掌握的能力：'):
            line = '## 掌握的能力'
        elif line.startswith('体现在深刻洞察：'):
            line = '**体现在深刻洞察：**'
        elif line.startswith('认知转变过程：'):
            line = '**认知转变过程：**'
        elif line.startswith('能力定义：'):
            line = '**能力定义：**'

        # 转换能力标题
        if re.match(r'^能力\d+：', line):
            line = re.sub(r'^能力(\d+)：', r'### 能力\1', line)

        result.append(line)

    return '\n'.join(result)

# 使用示例
from scripts.ai_memory import AIMemory

memory = AIMemory()

# 获取旧格式记录
conv = memory.get_conversation(96)
if conv:
    # conv[4]是details字段
    new_details = convert_to_markdown(conv[4])
    memory.update_summary(96, conv[3], new_details)  # 更新details
    print(f"已转换记录96为Markdown格式")

memory.close()
```

## 文档

### 🎯 核心理念（必读）

- **[能力提炼指南](references/CAPABILITY_EXTRACTION.md)** - 理解什么是"能力" vs "知识点"，以及如何从对话中提炼能力
- **[内容存储指南](references/CONTENT_GUIDELINES.md)** - 如何正确存储对话，包括能力记录的结构和格式

## 许可证

MIT License
