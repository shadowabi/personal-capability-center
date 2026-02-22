"""
AI Memory System - 完整功能演示
演示所有核心功能的使用
"""

import sys
import os
from datetime import date, timedelta

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加skill根目录到Python路径（脚本在scripts/目录下）
script_dir = os.path.dirname(os.path.abspath(__file__))
skill_root = os.path.dirname(script_dir)
sys.path.insert(0, skill_root)

from scripts.ai_memory import AIMemory, generate_mock_embedding

def print_section(title):
    """打印章节标题"""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def demonstrate_add_conversations():
    """演示添加多个对话"""
    print_section("1. 添加对话到记忆系统")

    try:
        memory = AIMemory()

        # 示例1: 学习Python
        conv_id1 = memory.add_conversation(
            title='学习Python编程',
            summary='学习了Python基础语法和数据结构',
            details='学习了变量、列表、字典、元组、集合等数据类型，以及if语句、for循环、while循环等控制流。',
            embedding=generate_mock_embedding(),
            tags=['Python', '编程', '学习'],
            importance=9,
            word_count=45
        )
        print(f"✓ 添加对话1 - ID: {conv_id1}")

        # 示例2: 投资策略
        conv_id2 = memory.add_conversation(
            title='投资策略评估',
            summary='基于量化信号和沪深300的投资策略',
            details='策略框架：50%沪深300ETF分散风险，50%量化板块追求超额收益。目标年化收益高于沪深300 10%+。',
            embedding=generate_mock_embedding(),
            tags=['投资', '量化策略', '沪深300'],
            importance=8,
            word_count=50
        )
        print(f"✓ 添加对话2 - ID: {conv_id2}")

        # 示例3: 机器学习
        conv_id3 = memory.add_conversation(
            title='机器学习基础',
            summary='学习了监督学习和无监督学习的基本概念',
            details='监督学习包括分类和回归，需要标记数据。无监督学习包括聚类和降维，不需要标记数据。',
            embedding=generate_mock_embedding(),
            tags=['机器学习', 'AI', '学习'],
            importance=7,
            word_count=40
        )
        print(f"✓ 添加对话3 - ID: {conv_id3}")

        # 示例4: 数据库优化
        conv_id4 = memory.add_conversation(
            title='PostgreSQL数据库优化',
            summary='学习了索引和查询优化技巧',
            details='创建合适的索引可以大幅提升查询性能。使用EXPLAIN ANALYZE分析查询计划。',
            embedding=generate_mock_embedding(),
            tags=['数据库', 'PostgreSQL', '优化', '性能'],
            importance=6,
            word_count=35
        )
        print(f"✓ 添加对话4 - ID: {conv_id4}")

        # 示例5: Web开发
        conv_id5 = memory.add_conversation(
            title='Web开发技术栈',
            summary='了解了现代Web开发的技术栈',
            details='前端：React/Vue + TypeScript。后端：Node.js/Python。数据库：PostgreSQL/MongoDB。',
            embedding=generate_mock_embedding(),
            tags=['Web开发', '前端', '后端', '技术栈'],
            importance=5,
            word_count=30
        )
        print(f"✓ 添加对话5 - ID: {conv_id5}")

        memory.close()
        print(f"\n成功添加 {5} 个对话到记忆系统！")
        return True

    except Exception as e:
        print(f"✗ 添加对话失败: {e}")
        return False

def demonstrate_search_functions():
    """演示各种搜索功能"""
    print_section("2. 搜索功能演示")

    try:
        memory = AIMemory()

        # 向量相似度搜索
        print("\n2.1 向量相似度搜索")
        print("-" * 70)
        query_embedding = generate_mock_embedding()
        similar = memory.search_similar(query_embedding, limit=3)
        print(f"找到 {len(similar)} 个相似对话:")
        for idx, (conv_id, title, summary, details, tags, importance, similarity) in enumerate(similar, 1):
            print(f"  {idx}. ID:{conv_id} | {title}")
            print(f"     摘要: {summary}")
            print(f"     标签: {tags}")
            print(f"     重要性: {importance}/10 | 相似度: {similarity:.4f}")

        # 按标签搜索
        print("\n2.2 按标签搜索")
        print("-" * 70)
        python_convos = memory.get_by_tags(['Python', '编程'], limit=5)
        print(f"找到 {len(python_convos)} 个带'Python'或'编程'标签的对话:")
        for idx, (conv_id, title, summary, tags, importance, conv_date) in enumerate(python_convos, 1):
            print(f"  {idx}. ID:{conv_id} | {title}")
            print(f"     摘要: {summary}")
            print(f"     重要性: {importance}/10 | 日期: {conv_date}")

        # 按重要性筛选
        print("\n2.3 按重要性筛选")
        print("-" * 70)
        important_convos = memory.get_by_importance(min_importance=7, limit=5)
        print(f"找到 {len(important_convos)} 个重要性 >= 7 的对话:")
        for idx, (conv_id, title, summary, importance, conv_date) in enumerate(important_convos, 1):
            print(f"  {idx}. ID:{conv_id} | {title} (重要性: {importance}/10)")
            print(f"     摘要: {summary}")

        # 关键词搜索
        print("\n2.4 关键词搜索")
        print("-" * 70)
        keyword_results = memory.search_by_keyword('学习', search_in_details=True, limit=5)
        print(f"找到 {len(keyword_results)} 个包含'学习'的对话:")
        for idx, (conv_id, title, summary, importance, conv_date) in enumerate(keyword_results, 1):
            print(f"  {idx}. ID:{conv_id} | {title}")
            print(f"     摘要: {summary} | 重要性: {importance}/10")

        # 按日期范围查询
        print("\n2.5 按日期范围查询")
        print("-" * 70)
        today = date.today()
        yesterday = today - timedelta(days=1)
        date_results = memory.get_by_date_range(yesterday, today, limit=10)
        print(f"从 {yesterday} 到 {today} 的对话:")
        for idx, (conv_id, title, summary, conv_date, importance) in enumerate(date_results, 1):
            print(f"  {idx}. ID:{conv_id} | {title} | 日期: {conv_date}")

        memory.close()
        print("\n✓ 所有搜索功能演示完成！")
        return True

    except Exception as e:
        print(f"✗ 搜索功能演示失败: {e}")
        return False

def demonstrate_statistics():
    """演示统计功能"""
    print_section("3. 统计信息")

    try:
        memory = AIMemory()

        # 获取统计信息
        stats = memory.get_statistics()
        print("\n3.1 数据库统计信息")
        print("-" * 70)
        print(f"  总对话数: {stats['total_conversations']}")
        print(f"  带向量的对话数: {stats['with_vectors']}")
        print(f"  高重要性对话数 (>=8): {stats['high_importance']}")
        print(f"  平均字数: {stats['avg_words']}")
        print(f"  最大重要性: {stats['max_importance']}/10")
        print(f"  最小重要性: {stats['min_importance']}/10")

        # 获取热门标签
        print("\n3.2 热门标签")
        print("-" * 70)
        top_tags = memory.get_top_tags(limit=10)
        print("  标签使用次数:")
        for idx, (tag, count) in enumerate(top_tags, 1):
            print(f"  {idx:2d}. {tag:20s} - {count} 次")

        # 获取所有标签
        print("\n3.3 所有标签")
        print("-" * 70)
        all_tags = memory.get_all_tags()
        print(f"  共 {len(all_tags)} 个标签:")
        print(f"  {', '.join(all_tags)}")

        # 获取最近对话
        print("\n3.4 最近7天的对话")
        print("-" * 70)
        recent = memory.get_recent(days=7, limit=5)
        for idx, (conv_id, title, summary, conv_date, importance) in enumerate(recent, 1):
            print(f"  {idx}. {title} | {conv_date} | 重要性: {importance}/10")

        memory.close()
        print("\n✓ 统计信息演示完成！")
        return True

    except Exception as e:
        print(f"✗ 统计信息演示失败: {e}")
        return False

def demonstrate_crud_operations():
    """演示CRUD操作"""
    print_section("4. CRUD操作")

    try:
        memory = AIMemory()

        # 1. 创建 (Create) - 已在前面的演示中完成
        print("\n4.1 读取 (Read) - 获取对话详情")
        print("-" * 70)
        # 获取第一个对话
        conv_id = 1
        conv = memory.get_conversation(conv_id)
        if conv:
            (cid, conv_date, title, summary, details, tags, importance,
             word_count, created_at, updated_at) = conv
            print(f"  ID: {cid}")
            print(f"  日期: {conv_date}")
            print(f"  标题: {title}")
            print(f"  摘要: {summary}")
            print(f"  详情: {details[:100]}..." if len(details) > 100 else f"  详情: {details}")
            print(f"  标签: {tags}")
            print(f"  重要性: {importance}/10")
            print(f"  字数: {word_count}")
            print(f"  创建时间: {created_at}")
            print(f"  更新时间: {updated_at}")
        else:
            print(f"  未找到ID为 {conv_id} 的对话")

        # 2. 更新 (Update)
        print("\n4.2 更新 (Update) - 修改重要性")
        print("-" * 70)
        new_importance = 10
        updated = memory.update_importance(conv_id, new_importance)
        if updated:
            print(f"  ✓ 成功将对话 {conv_id} 的重要性更新为 {new_importance}/10")
            # 验证更新
            updated_conv = memory.get_conversation(conv_id)
            if updated_conv:
                print(f"  验证: 当前重要性为 {updated_conv[6]}/10")
        else:
            print(f"  ✗ 更新对话 {conv_id} 重要性失败")

        # 3. 删除 (Delete) - 删除最后一个对话
        print("\n4.3 删除 (Delete) - 删除对话")
        print("-" * 70)
        delete_id = 5
        deleted = memory.delete_conversation(delete_id)
        if deleted:
            print(f"  ✓ 成功删除对话 {delete_id}")
        else:
            print(f"  ✗ 删除对话 {delete_id} 失败")

        memory.close()
        print("\n✓ CRUD操作演示完成！")
        return True

    except Exception as e:
        print(f"✗ CRUD操作演示失败: {e}")
        return False

def demonstrate_advanced_features():
    """演示高级功能"""
    print_section("5. 高级功能")

    try:
        memory = AIMemory()

        # 演示with语句（Context Manager）
        print("\n5.1 使用with语句自动管理连接")
        print("-" * 70)
        print("  使用上下文管理器自动关闭数据库连接")

        with AIMemory() as mem:
            # 在with块内执行操作
            conv_count = mem.get_statistics()['total_conversations']
            print(f"  ✓ 当前共有 {conv_count} 个对话")
            # 连接会在退出with块时自动关闭

        # 演示标签的AND/OR查询
        print("\n5.2 标签查询：AND vs OR")
        print("-" * 70)
        print("  OR查询（匹配任一标签）:")
        or_results = memory.get_by_tags(['Python', '投资'], limit=5, match_all=False)
        print(f"  找到 {len(or_results)} 个对话")

        print("  AND查询（匹配所有标签）:")
        and_results = memory.get_by_tags(['Python', '编程'], limit=5, match_all=True)
        print(f"  找到 {len(and_results)} 个对话")

        # 演示向量搜索的重要性筛选
        print("\n5.3 向量搜索 + 重要性筛选")
        print("-" * 70)
        high_importance_similar = memory.search_similar(
            generate_mock_embedding(),
            limit=3,
            min_importance=7
        )
        print(f"  找到 {len(high_importance_similar)} 个重要性 >= 7 的相似对话")
        for idx, (cid, title, summary, details, tags, importance, similarity) in enumerate(high_importance_similar, 1):
            print(f"  {idx}. {title} (重要性: {importance}/10)")

        memory.close()
        print("\n✓ 高级功能演示完成！")
        return True

    except Exception as e:
        print(f"✗ 高级功能演示失败: {e}")
        return False

def main():
    """运行所有演示"""
    print("\n" + "=" * 70)
    print(" AI Memory System - 完整功能演示")
    print("=" * 70)
    print("\n本演示将展示AI记忆系统的所有核心功能：")
    print("  1. 添加对话到记忆系统")
    print("  2. 各种搜索功能（向量、标签、重要性、关键词、日期）")
    print("  3. 统计信息（数据库统计、热门标签、最近对话）")
    print("  4. CRUD操作（创建、读取、更新、删除）")
    print("  5. 高级功能（Context Manager、AND/OR查询、组合筛选）")

    results = []

    # 运行所有演示
    results.append(("添加对话", demonstrate_add_conversations()))
    results.append(("搜索功能", demonstrate_search_functions()))
    results.append(("统计信息", demonstrate_statistics()))
    results.append(("CRUD操作", demonstrate_crud_operations()))
    results.append(("高级功能", demonstrate_advanced_features()))

    # 汇总结果
    print("\n" + "=" * 70)
    print(" 演示结果汇总")
    print("=" * 70)

    for demo_name, success in results:
        status = "✓ 成功" if success else "✗ 失败"
        print(f"  {demo_name:.<50} {status}")

    success_count = sum(1 for _, success in results if success)
    total_count = len(results)

    print(f"\n  总计: {success_count}/{total_count} 演示成功")

    if success_count == total_count:
        print("\n" + "=" * 70)
        print("  恭喜！所有功能演示完成！")
        print("  AI Memory System 运行正常！")
        print("=" * 70 + "\n")
    else:
        print("\n部分演示失败，请检查错误信息。")

if __name__ == "__main__":
    main()
