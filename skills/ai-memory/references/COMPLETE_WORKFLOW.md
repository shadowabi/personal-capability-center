# AI Memory完整工作流程

本文档展示从对话到保存到数据库的完整工作流程，包括：对话→总结→提炼能力→评分→插入数据库。

---

## 工作流程概述

```
对话内容
    ↓
生成summary（结构化总结）
    ↓
提炼能力（按照能力提炼指南）
    ↓
自动评分（或手动评分）
    ↓
生成embedding向量
    ↓
插入数据库
```

---

## 示例场景

假设你刚刚完成了一次关于"批判性思维"的深度对话，现在需要将其保存到AI Memory中。

### 对话内容（示例）

```
用户：我觉得批判性思维很重要，但我不知道怎么训练
AI：批判性思维确实非常重要。让我问一个问题：你最近遇到过什么需要判断的情况吗？
用户：最近在买股票，不知道该选哪个
AI：那你是怎么判断的？
用户：看市盈率，低的就买
AI：为什么市盈率低就好？
用户：因为便宜啊，性价比高
AI：清仓大甩卖也很便宜，为什么没人买？这和被低估有什么关系？
用户：嗯...清仓大甩卖是因为质量不好
AI：对！那市盈率低也可能是因为本身价值低，不是被低估
用户：哦，我明白了
AI：这就是批判性思维的第一步：质疑表面现象
```

---

## 步骤1：生成summary（结构化总结）

**目标**：用100-500字符快速概括对话核心。

**示例**：
```python
summary = """问题背景：如何训练批判性思维，应用于投资决策

核心跃迁：从"看表面指标（市盈率低=好）"到"质疑表面现象"

掌握的能力：
1. 质疑表面现象能力：不轻信表面指标
2. 区分"便宜"vs"被低估"：理解价格和价值的关系
3. 类比思维：用生活场景验证理解"""
```

**要点**：
- 问题背景：对话的起点
- 核心跃迁：从"X"到"Y"的思维转变
- 掌握的能力：用编号列出（2-4个）
- 每个能力用一句话概括

---

## 步骤2：提炼能力（按照能力提炼指南）

**目标**：将对话内容提炼为可复用的能力，包含三要素：能力定义、深刻洞察、认知转变。

**示例**：
```python
details = """问题背景：
- 最初理解：市盈率越低越好，便宜=划算
- 已有认知：增长率比PE更重要（这个已经对了）
- 混淆概念：把"亏损"和"烧钱换增长"混淆

---

我掌握的能力：

能力1：质疑表面现象能力
能力定义：不轻信表面指标，深入理解其背后的含义
体现在深刻洞察：
- 市盈率低不等于被低估，可能本身就是价值低
- 市盈率反映未来预期，不是当前便宜

认知转变过程：
- 原本认知：市盈率越低越好，10倍比100倍更值得投资
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：街边大甩卖便宜但没人买，是因为本身质量不好，不是被低估
- 新认知：市盈率低不等于被低估，可能本身就是价值低

---

能力2：类比思维
能力定义：用熟悉的生活场景验证和理解抽象概念
体现在深刻洞察：
- 用"清仓大甩卖"类比"低市盈率"
- 理解了"便宜"和"价值"的区别

认知转变过程：
- 原本认知：没有明确的类比思维
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：通过类比理解了市盈率的本质
- 新认知：类比是验证理解的有效方法"""
```

**要点**：
- 每个能力独立成段，用`---`分隔
- 层级结构：能力定义 → 体现在深刻洞察 → 认知转变过程
- 认知转变过程包含：原本认知、引导提问、突破点、新认知
- 引导提问必须如实记录对话中的原话

---

## 步骤3：智能评分

**目标**：基于[IMPORTANCE_GUIDE.md](IMPORTANCE_GUIDE.md)评估重要性（1-10分）。

**AI评分流程**：
```python
# AI根据IMPORTANCE_GUIDE.md进行评分
# 评分流程：
# 1. 阅读对话内容（标题、summary、details、tags）
# 2. 识别关键特征，对照1-10分评分标准
# 3. 评估五个维度（认知深度、能力迁移性、影响范围、创新性、结构化程度）
# 4. 根据各维度评分和权重，给出最终评分（1-10分）
# 5. 验证评分，对照评分原则和检查清单

# 本例评分分析：
title = '从"看市盈率"到"质疑表面现象"的批判性思维训练'
tags = ['批判性思维', '投资', '类比思维']

# 评分分析：
# - 认知深度：7/10（理解了批判性思维的第一步：质疑表面现象）
# - 能力迁移性：8/10（类比思维可应用于多个领域）
# - 影响范围：6/10（主要应用于投资场景）
# - 创新性：6/10（已有认知的一部分）
# - 结构化程度：8/10（形成了清晰的能力定义和认知转变过程）
# 综合评分：7分（有用知识）

importance = 7
```

**要点**：
- AI根据IMPORTANCE_GUIDE.md的评分标准进行判断
- 关注认知深度、能力迁移性、影响范围、创新性、结构化程度
- 保持评分的区分度，避免高分泛滥
- 如果评分不合理，可以手动调整

---

## 步骤4：生成embedding向量

**目标**：为对话内容生成向量嵌入，用于语义搜索。

**使用OpenAI API**（推荐）：
```python
from scripts.ai_memory import OpenAIEmbeddings

# 初始化embedding生成器
embedder = OpenAIEmbeddings()

# 生成向量（建议使用title + summary）
embedding = embedder.embed_query(f"{title} {summary}")
```

**使用mock向量**（仅用于测试）：
```python
from scripts.ai_memory import generate_mock_embedding

embedding = generate_mock_embedding()  # 生成1536维随机向量
```

**要点**：
- 生产环境使用OpenAI API
- 测试环境可以使用mock向量
- embedding维度：1536维

---

## 步骤5：插入数据库

**目标**：将对话保存到数据库。

**完整代码**：
```python
import sys
sys.path.insert(0, r'C:\Users\shadow\.config\opencode\skills\ai-memory')

from scripts.ai_memory import AIMemory, OpenAIEmbeddings

# 1. 准备内容
title = '从"看市盈率"到"质疑表面现象"的批判性思维训练'

summary = """问题背景：如何训练批判性思维，应用于投资决策

核心跃迁：从"看表面指标（市盈率低=好）"到"质疑表面现象"

掌握的能力：
1. 质疑表面现象能力：不轻信表面指标
2. 区分"便宜"vs"被低估"：理解价格和价值的关系
3. 类比思维：用生活场景验证理解"""

details = """问题背景：
- 最初理解：市盈率越低越好，便宜=划算
- 已有认知：增长率比PE更重要
- 混淆概念：把"亏损"和"烧钱换增长"混淆

---

我掌握的能力：

能力1：质疑表面现象能力
能力定义：不轻信表面指标，深入理解其背后的含义
体现在深刻洞察：
- 市盈率低不等于被低估，可能本身就是价值低
- 市盈率反映未来预期，不是当前便宜

认知转变过程：
- 原本认知：市盈率越低越好，10倍比100倍更值得投资
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：街边大甩卖便宜但没人买，是因为本身质量不好，不是被低估
- 新认知：市盈率低不等于被低估，可能本身就是价值低

---

能力2：类比思维
能力定义：用熟悉的生活场景验证和理解抽象概念
体现在深刻洞察：
- 用"清仓大甩卖"类比"低市盈率"
- 理解了"便宜"和"价值"的区别

认知转变过程：
- 原本认知：没有明确的类比思维
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：通过类比理解了市盈率的本质
- 新认知：类比是验证理解的有效方法"""

tags = ['批判性思维', '投资', '类比思维', '认知跃迁']
word_count = len(details)

# 2. 智能评分（AI根据IMPORTANCE_GUIDE.md判断）
# 评分分析：
# - 认知深度：7/10
# - 能力迁移性：8/10
# - 影响范围：6/10
# - 创新性：6/10
# - 结构化程度：8/10
# 综合评分：7分

importance = 7

# 3. 生成embedding
embedder = OpenAIEmbeddings()
embedding = embedder.embed_query(f"{title} {summary}")

# 4. 保存到数据库
memory = AIMemory()
conv_id = memory.add_conversation(
    title=title,
    summary=summary,
    details=details,
    embedding=embedding,
    tags=tags,
    importance=importance,
    word_count=word_count
)

print(f"\n✅ 对话已保存，ID: {conv_id}")

# 5. 验证保存结果
conv = memory.get_conversation(conv_id)
print(f"标题: {conv[1]}")
print(f"重要性: {conv[3]}/10")
print(f"标签: {conv[5]}")
print(f"字数: {conv[6]}")

memory.close()
```

**输出示例**：
```
自动评分: 7.1/10
评价: [8分] 重要方法：实用框架，适用于相关领域

✅ 对话已保存，ID: 86
标题: 从"看市盈率"到"质疑表面现象"的批判性思维训练
重要性: 7/10
标签: ['批判性思维', '投资', '类比思维', '认知跃迁']
字数: 1189
```

---

## 完整工作流程脚本

将以上步骤整合为一个可执行的脚本：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
AI Memory完整工作流程示例
从对话到保存到数据库的完整流程
"""

import sys
sys.path.insert(0, r'C:\Users\shadow\.config\opencode\skills\ai-memory')

from scripts.ai_memory import AIMemory, OpenAIEmbeddings


def save_conversation(title, summary, details, tags, importance):
    """
    保存对话到数据库的完整流程

    Args:
        title: 对话标题
        summary: 对话摘要（结构化总结）
        details: 详细内容（提炼的能力）
        tags: 标签列表
        importance: 重要性评分（1-10，由AI根据IMPORTANCE_GUIDE.md评估）

    Returns:
        对话ID
    """
    print("=" * 60)
    print("步骤1：智能评分")
    print("=" * 60)

    print(f"重要性评分: {importance}/10")
    print("评分依据：IMPORTANCE_GUIDE.md")

    print("\n" + "=" * 60)
    print("步骤2：生成embedding向量")
    print("=" * 60)

    # 生成embedding
    embedder = OpenAIEmbeddings()
    embedding = embedder.embed_query(f"{title} {summary}")
    print(f"✅ embedding生成成功，维度: {len(embedding)}")

    print("\n" + "=" * 60)
    print("步骤3：保存到数据库")
    print("=" * 60)

    # 保存到数据库
    memory = AIMemory()
    conv_id = memory.add_conversation(
        title=title,
        summary=summary,
        details=details,
        embedding=embedding,
        tags=tags,
        importance=importance,
        word_count=word_count
    )

    print(f"\n✅ 对话已保存，ID: {conv_id}")

    # 验证保存结果
    conv = memory.get_conversation(conv_id)
    print(f"\n验证结果：")
    print(f"  标题: {conv[1]}")
    print(f"  重要性: {conv[3]}/10")
    print(f"  标签: {conv[5]}")
    print(f"  字数: {conv[6]}")

    memory.close()

    return conv_id


if __name__ == "__main__":
    # 示例：保存一个批判性思维训练的对话
    title = '从"看市盈率"到"质疑表面现象"的批判性思维训练'

    summary = """问题背景：如何训练批判性思维，应用于投资决策

核心跃迁：从"看表面指标（市盈率低=好）"到"质疑表面现象"

掌握的能力：
1. 质疑表面现象能力：不轻信表面指标
2. 区分"便宜"vs"被低估"：理解价格和价值的关系
3. 类比思维：用生活场景验证理解"""

    details = """问题背景：
- 最初理解：市盈率越低越好，便宜=划算
- 已有认知：增长率比PE更重要
- 混淆概念：把"亏损"和"烧钱换增长"混淆

---

我掌握的能力：

能力1：质疑表面现象能力
能力定义：不轻信表面指标，深入理解其背后的含义
体现在深刻洞察：
- 市盈率低不等于被低估，可能本身就是价值低
- 市盈率反映未来预期，不是当前便宜

认知转变过程：
- 原本认知：市盈率越低越好，10倍比100倍更值得投资
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：街边大甩卖便宜但没人买，是因为本身质量不好，不是被低估
- 新认知：市盈率低不等于被低估，可能本身就是价值低

---

能力2：类比思维
能力定义：用熟悉的生活场景验证和理解抽象概念
体现在深刻洞察：
- 用"清仓大甩卖"类比"低市盈率"
- 理解了"便宜"和"价值"的区别

认知转变过程：
- 原本认知：没有明确的类比思维
- 引导提问："清仓大甩卖为什么便宜但没人买？这和被低估有什么关系？"
- 突破点：通过类比理解了市盈率的本质
- 新认知：类比是验证理解的有效方法"""

    tags = ['批判性思维', '投资', '类比思维', '认知跃迁']
    importance = 7  # AI根据IMPORTANCE_GUIDE.md评估

    # 保存对话
    conv_id = save_conversation(title, summary, details, tags, importance)

    print("\n" + "=" * 60)
    print("完成！")
    print("=" * 60)
```

---

## 关键要点总结

### 1. 对话内容 → summary
- 目标：快速概括（100-500字符）
- 包含：问题背景、核心跃迁、掌握的能力
- 格式：编号列出关键点

### 2. summary → 提炼能力
- 目标：提炼可复用的能力
- 包含三要素：能力定义、深刻洞察、认知转变
- 格式：独立成段，用`---`分隔

### 3. 提炼能力 → 评分
- 目标：评估重要性（1-10分）
- 方法：AI根据IMPORTANCE_GUIDE.md评分
- 维度：认知深度、能力迁移性、影响范围、创新性、结构化程度

### 4. 评分 → embedding
- 目标：生成向量嵌入（1536维）
- 方法：OpenAI API（生产）或mock向量（测试）

### 5. embedding → 数据库
- 目标：保存到数据库
- 方法：AIMemory.add_conversation()
- 验证：get_conversation()确认保存成功

---

## 常见问题

### Q1: 如果自动评分不合理怎么办？

**A**: 可以手动调整：
```python
importance = 9  # 手动指定评分
```

### Q2: 如果对话太长怎么办？

**A**: 使用两阶段总结法：
1. 阶段1：提取问题（中间格式）
2. 阶段2：提炼能力（最终格式）

详见[内容存储指南](CONTENT_GUIDELINES.md)。

### Q3: 如果对话中没有明确的能力怎么办？

**A**: 可以保存为"对话记录"：
```python
title = "关于XX的讨论"
summary = "讨论了XX话题"
details = "对话内容..."
importance = 4  # 信息记录
```

### Q4: 如何确保评分的一致性？

**A**:
1. 使用自动评分（推荐）
2. 参考评分指南的详细标准
3. 定期校准评分分布

---

## 参考文档

- [能力提炼指南](CAPABILITY_EXTRACTION.md) - 如何从对话中提炼能力
- [内容存储指南](CONTENT_GUIDELINES.md) - 如何正确存储对话
- [评分指南](IMPORTANCE_GUIDE.md) - 如何评估对话重要性
- [SKILL.md](../SKILL.md) - AI Memory使用说明
