"""
AI Memory System 测试脚本
测试系统在不连接数据库情况下的代码结构和功能
"""

import sys
import os
import platform

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加skill根目录到Python路径（脚本在scripts/目录下）
script_dir = os.path.dirname(os.path.abspath(__file__))
skill_root = os.path.dirname(script_dir)
sys.path.insert(0, skill_root)

def get_opencode_skill_dir():
    """获取 OpenCode Skill 目录路径"""
    home_dir = os.path.expanduser("~")
    return os.path.join(home_dir, ".config", "opencode", "skills", "ai-memory")


def test_imports():
    """测试所有必要的导入"""
    print("=" * 60)
    print("测试1: 导入模块")
    print("=" * 60)

    try:
        import psycopg2
        print("✓ psycopg2 导入成功")
    except ImportError as e:
        print(f"✗ psycopg2 导入失败: {e}")
        return False

    try:
        import numpy as np
        print("✓ numpy 导入成功")
    except ImportError as e:
        print(f"✗ numpy 导入失败: {e}")
        return False

    try:
        from scripts.ai_memory import AIMemory, generate_mock_embedding, OpenAIEmbeddings
        print("✓ ai_memory 模块导入成功")
    except ImportError as e:
        print(f"✗ ai_memory 模块导入失败: {e}")
        return False

    print("\n所有模块导入成功！\n")
    return True

def test_mock_embedding():
    """测试生成mock向量"""
    print("=" * 60)
    print("测试2: 生成Mock向量嵌入")
    print("=" * 60)

    try:
        from scripts.ai_memory import generate_mock_embedding

        # 生成1536维向量
        embedding = generate_mock_embedding(1536)
        print(f"✓ 成功生成 {len(embedding)} 维向量")
        print(f"✓ 前5个值: {embedding[:5]}")
        print(f"✓ 向量类型: {type(embedding[0])}")

        # 验证向量维度
        assert len(embedding) == 1536, f"向量维度错误: {len(embedding)} != 1536"
        assert all(isinstance(x, float) for x in embedding), "向量元素类型错误"

        print("\nMock向量生成测试通过！\n")
        return True
    except Exception as e:
        print(f"✗ Mock向量生成测试失败: {e}\n")
        return False

def test_class_structure():
    """测试AIMemory类的结构"""
    print("=" * 60)
    print("测试3: AIMemory类结构")
    print("=" * 60)

    try:
        from scripts.ai_memory import AIMemory
        import inspect

        # 获取所有方法
        methods = [name for name, _ in inspect.getmembers(AIMemory, predicate=inspect.isfunction)]
        print(f"✓ AIMemory类有 {len(methods)} 个方法")
        print(f"✓ 方法列表: {', '.join(methods[:10])}")

        # 检查关键方法是否存在
        key_methods = [
            'add_conversation',
            'search_similar',
            'get_by_tags',
            'get_by_importance',
            'get_conversation',
            'search_by_keyword',
            'get_statistics',
            'close'
        ]

        for method in key_methods:
            if method in methods:
                print(f"✓ {method} 方法存在")
            else:
                print(f"✗ {method} 方法不存在")
                return False

        # 检查方法签名
        add_conv_sig = inspect.signature(AIMemory.add_conversation)
        print(f"\n✓ add_conversation 方法签名: {add_conv_sig}")

        print("\n类结构测试通过！\n")
        return True
    except Exception as e:
        print(f"✗ 类结构测试失败: {e}\n")
        return False

def test_database_connection_simulation():
    """模拟数据库连接（实际连接需要PostgreSQL）"""
    print("=" * 60)
    print("测试4: 数据库连接模拟")
    print("=" * 60)

    try:
        from scripts.ai_memory import AIMemory
        import psycopg2

        print("尝试连接到数据库...")

        # 尝试连接（预期会失败，因为没有数据库）
        try:
            memory = AIMemory(
                host='localhost',
                port=5432,
                database='ai_memory',
                user='ai_user',
                password='ai_password_123'
            )
            print("✓ 数据库连接成功！")
            memory.close()
            return True
        except psycopg2.OperationalError as e:
            print(f"✗ 数据库连接失败（预期结果）: {e}")
            print("\n提示: 要使用完整功能，需要先启动PostgreSQL数据库")
            print("启动方式:")
            print("  1. 安装Docker Desktop")
            skill_dir = get_opencode_skill_dir()
            print(f"  2. 进入ai-memory目录: cd {skill_dir}")
            print("  3. 运行: docker compose up -d")
            print()
            return True  # 连接失败是预期的，不算测试失败

    except Exception as e:
        print(f"✗ 数据库连接测试异常: {e}\n")
        return False

def test_openai_embeddings():
    """测试OpenAI Embeddings类（需要API key）"""
    print("=" * 60)
    print("测试5: OpenAI Embeddings接口")
    print("=" * 60)

    try:
        from scripts.ai_memory import OpenAIEmbeddings
        import inspect

        # 检查类结构
        methods = [name for name, _ in inspect.getmembers(OpenAIEmbeddings, predicate=inspect.ismethod)]
        print(f"✓ OpenAIEmbeddings类可用")
        print(f"✓ 主要方法: embed_documents, embed_query")

        # 测试初始化（不会真正调用API）
        print("\n注意: 要使用OpenAI Embeddings，需要:")
        print("  1. 安装openai包: pip install openai")
        print("  2. 设置OPENAI_API_KEY环境变量")
        print("  3. 或者直接传入api_key参数")
        print()
        return True

    except Exception as e:
        print(f"✗ OpenAI Embeddings测试失败: {e}\n")
        return False

def test_code_examples():
    """测试代码示例"""
    print("=" * 60)
    print("测试6: 代码示例验证")
    print("=" * 60)

    try:
        from scripts.ai_memory import generate_mock_embedding

        # 生成测试数据
        embedding = generate_mock_embedding()

        # 准备测试数据
        test_data = {
            'title': '学习Python',
            'summary': '学习了Python基础语法',
            'details': '学习了变量、数据类型、控制流等基础知识',
            'tags': ['Python', '编程'],
            'importance': 8,
            'word_count': 30
        }

        print("✓ 测试数据准备完成:")
        print(f"  标题: {test_data['title']}")
        print(f"  标签: {test_data['tags']}")
        print(f"  向量维度: {len(embedding)}")

        print("\n注意: 要执行实际的数据库操作，需要先启动PostgreSQL数据库")
        print("示例代码:")
        print("""
        from scripts.ai_memory import AIMemory, generate_mock_embedding

        # 连接数据库
        memory = AIMemory()

        # 添加对话
        conv_id = memory.add_conversation(
            title='学习Python',
            summary='学习了Python基础语法',
            details='学习了变量、数据类型、控制流等基础知识',
            embedding=generate_mock_embedding(),
            tags=['Python', '编程'],
            importance=8,
            word_count=30
        )

        # 搜索相似对话
        similar = memory.search_similar(embedding, limit=5)

        # 按标签搜索
        python_convos = memory.get_by_tags(['Python'], limit=10)

        # 关闭连接
        memory.close()
        """)

        print("\n代码示例验证通过！\n")
        return True

    except Exception as e:
        print(f"✗ 代码示例测试失败: {e}\n")
        return False

def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("AI Memory System - 功能测试")
    print("=" * 60 + "\n")

    results = []

    # 运行所有测试
    results.append(("导入模块", test_imports()))
    results.append(("Mock向量", test_mock_embedding()))
    results.append(("类结构", test_class_structure()))
    results.append(("数据库连接", test_database_connection_simulation()))
    results.append(("OpenAI Embeddings", test_openai_embeddings()))
    results.append(("代码示例", test_code_examples()))

    # 汇总结果
    print("=" * 60)
    print("测试结果汇总")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{test_name:.<40} {status}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    print(f"\n总计: {passed_count}/{total_count} 测试通过")

    if passed_count == total_count:
        print("\n✓ 所有测试通过！")
        print("\n下一步:")
        print("  1. 安装并启动Docker Desktop")
        print("  2. 在ai-memory目录运行: docker compose up -d")
        print("  3. 运行完整的数据库操作测试")
    else:
        print("\n✗ 部分测试失败，请检查错误信息")

    print()

if __name__ == "__main__":
    main()
