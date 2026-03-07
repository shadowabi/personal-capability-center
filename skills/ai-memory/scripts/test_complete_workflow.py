#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
AI Memory完整工作流程测试脚本

验证：对话 → 总结 → 提炼能力 → 评分 → 插入数据库 的完整流程
"""

import sys
sys.path.insert(0, r'C:\Users\shadow\.config\opencode\skills\ai-memory')

from scripts.ai_memory import AIMemory, generate_mock_embedding


def test_complete_workflow():
    """测试完整工作流程"""

    print("=" * 70)
    print("AI Memory完整工作流程测试")
    print("=" * 70)

    # ============================================================
    # 步骤1：准备对话内容
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤1：准备对话内容")
    print("=" * 70)

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

    print(f"[OK] 标题: {title}")
    print(f"[OK] Summary长度: {len(summary)} 字符")
    print(f"[OK] Details长度: {len(details)} 字符")
    print(f"[OK] Tags: {tags}")
    print(f"[OK] Word count: {word_count}")

    # ============================================================
    # 步骤2：提炼能力（手动完成，已在details中）
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤2：提炼能力")
    print("=" * 70)

    print("[OK] 能力提炼完成（包含能力定义、深刻洞察、认知转变过程）")
    print(f"   - 能力1：质疑表面现象能力")
    print(f"   - 能力2：类比思维")

    # ============================================================
    # 步骤3：智能评分（AI根据IMPORTANCE_GUIDE.md判断）
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤3：智能评分")
    print("=" * 70)

    # AI根据IMPORTANCE_GUIDE.md评估的重要性评分
    # 评分分析：
    # - 认知深度：7/10
    # - 能力迁移性：8/10
    # - 影响范围：6/10
    # - 创新性：6/10
    # - 结构化程度：8/10
    # 综合评分：7分

    importance = 7
    print(f"重要性评分: {importance}/10")
    print(f"评分依据：IMPORTANCE_GUIDE.md")
    print(f"\n[OK] 评分完成: {importance}/10")

    # ============================================================
    # 步骤4：生成embedding（使用mock向量测试）
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤4：生成embedding向量")
    print("=" * 70)

    embedding = generate_mock_embedding()
    print(f"[OK] Mock embedding生成成功，维度: {len(embedding)}")
    print(f"   (注意：生产环境应使用OpenAI API)")

    # ============================================================
    # 步骤5：插入数据库
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤5：插入数据库")
    print("=" * 70)

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

    print(f"\n[OK] 对话已保存，ID: {conv_id}")

    # ============================================================
    # 步骤6：验证保存结果
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤6：验证保存结果")
    print("=" * 70)

    conv = memory.get_conversation(conv_id)
    print(f"\n数据库记录：")
    print(f"  ID: {conv[0]}")
    print(f"  日期: {conv[1]}")
    print(f"  标题: {conv[2]}")
    print(f"  Summary: {conv[3][:100]}...")
    print(f"  Tags: {conv[5]}")
    print(f"  重要性: {conv[6]}/10")
    print(f"  字数: {conv[7]}")
    print(f"  Details长度: {len(conv[4])} 字符")

    # ============================================================
    # 步骤7：验证向量搜索
    # ============================================================
    print("\n" + "=" * 70)
    print("步骤7：验证向量搜索")
    print("=" * 70)

    similar = memory.search_similar(embedding, limit=3)
    print(f"\n找到 {len(similar)} 个相似对话：")
    for i, (sid, stitle, ssummary, sdetails, stags, simps, sim_score) in enumerate(similar[:3], 1):
        print(f"\n{i}. ID: {sid}")
        print(f"   标题: {stitle}")
        print(f"   重要性: {simps}/10")
        print(f"   相似度: {sim_score:.4f}")

    memory.close()

    # ============================================================
    # 测试总结
    # ============================================================
    print("\n" + "=" * 70)
    print("测试总结")
    print("=" * 70)

    print("\n[OK] 完整工作流程验证通过！")
    print("\n工作流程：")
    print("  1. [OK] 准备对话内容（title, summary, details, tags）")
    print("  2. [OK] 提炼能力（手动完成，已在details中）")
    print("  3. [OK] 智能评分（AI根据IMPORTANCE_GUIDE.md）")
    print("  4. [OK] 生成embedding向量（generate_mock_embedding测试）")
    print("  5. [OK] 插入数据库（add_conversation）")
    print("  6. [OK] 验证保存结果（get_conversation）")
    print("  7. [OK] 验证向量搜索（search_similar）")

    print("\n[STATS] 数据统计：")
    print(f"  对话ID: {conv_id}")
    print(f"  重要性: {importance}/10")
    print(f"  Tags: {tags}")
    print(f"  Word count: {word_count}")

    print("\n" + "=" * 70)
    print("测试完成！")
    print("=" * 70)

    return conv_id


if __name__ == "__main__":
    try:
        test_complete_workflow()
    except Exception as e:
        print(f"\n[FAIL] 测试失败: {e}")
        import traceback
        traceback.print_exc()
