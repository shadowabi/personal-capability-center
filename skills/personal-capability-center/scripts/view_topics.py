"""
查看Personal Capability Center系统中的所有话题
"""

import sys
import os

# 设置UTF-8编码
if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 添加skill根目录到Python路径（脚本在scripts/目录下）
script_dir = os.path.dirname(os.path.abspath(__file__))
skill_root = os.path.dirname(script_dir)
sys.path.insert(0, skill_root)

from scripts.ai_memory import AIMemory


def main():
    """查看所有话题"""
    print("\n" + "=" * 70)
    print(" Personal Capability Center System - 查看话题")
    print("=" * 70 + "\n")

    try:
        memory = AIMemory()

        # 获取所有标签（话题）
        all_tags = memory.get_all_tags()
        print(f"系统中共有 {len(all_tags)} 个话题:")
        print("-" * 70)
        for idx, tag in enumerate(all_tags, 1):
            print(f"  {idx:2d}. {tag}")

        # 获取热门标签
        print("\n" + "=" * 70)
        print(" 热门话题")
        print("=" * 70 + "\n")
        top_tags = memory.get_top_tags(limit=20)
        print("话题使用次数排行:")
        print("-" * 70)
        for idx, (tag, count) in enumerate(top_tags, 1):
            print(f"  {idx:2d}. {tag:25s} - {count:2d} 次")

        # 获取数据库统计信息
        print("\n" + "=" * 70)
        print(" 数据库统计")
        print("=" * 70 + "\n")
        stats = memory.get_statistics()
        print(f"  总对话数: {stats['total_conversations']}")
        print(f"  带向量的对话数: {stats['with_vectors']}")
        print(f"  高重要性对话数 (>=8): {stats['high_importance']}")
        print(f"  平均字数: {stats['avg_words']}")
        print(f"  最大重要性: {stats['max_importance']}/10")
        print(f"  最小重要性: {stats['min_importance']}/10")

        # 显示最近的对话
        print("\n" + "=" * 70)
        print(" 最近的对话")
        print("=" * 70 + "\n")
        recent = memory.get_recent(days=7, limit=10)
        if recent:
            for idx, (conv_id, title, summary, conv_date, importance) in enumerate(
                recent, 1
            ):
                print(f"  {idx}. ID:{conv_id} | {title}")
                print(f"     {summary} | {conv_date} | 重要性: {importance}/10")
                print()
        else:
            print("  没有找到最近7天的对话")

        memory.close()

    except Exception as e:
        print(f"\n✗ 查询失败: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
