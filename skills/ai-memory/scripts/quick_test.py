"""
快速测试脚本 - 一键验证AI Memory系统是否可用
"""

import sys
import os

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加skill根目录到Python路径（脚本在scripts/目录下）
script_dir = os.path.dirname(os.path.abspath(__file__))
skill_root = os.path.dirname(script_dir)
sys.path.insert(0, skill_root)

def main():
    print("\n" + "=" * 70)
    print(" AI Memory System - 快速验证")
    print("=" * 70)

    # 测试1: 导入检查
    print("\n[1/3] 检查依赖...")
    try:
        import psycopg2
        import numpy
        from scripts.ai_memory import AIMemory
        print("✓ 所有依赖已安装")
    except ImportError as e:
        print(f"✗ 依赖检查失败: {e}")
        return False

    # 测试2: 数据库连接
    print("\n[2/3] 连接数据库...")
    try:
        memory = AIMemory()
        print("✓ 数据库连接成功")
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")
        print("\n提示: 请确保PostgreSQL数据库正在运行")
        print("如使用Docker: docker compose up -d")
        return False

    # 测试3: 基础操作
    print("\n[3/3] 测试基础操作...")
    try:
        stats = memory.get_statistics()
        print(f"✓ 系统正常，当前有 {stats['total_conversations']} 条对话")
        memory.close()
    except Exception as e:
        print(f"✗ 基础操作失败: {e}")
        return False

    print("\n" + "=" * 70)
    print(" ✓ AI Memory System 验证通过！系统可以正常使用")
    print("=" * 70 + "\n")

    print("下一步操作:")
    print("  - 查看话题: python scripts/view_topics.py")
    print("  - 完整工作流程: python scripts/test_complete_workflow.py")
    print("  - 完整演示: python scripts/demo_full.py")
    print("  - 系统测试: python scripts/test_ai_memory.py")
    print()

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
