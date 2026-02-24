# 测试与验证

AI Memory提供了多个测试脚本，帮助快速验证系统功能和体验核心特性。

## 快速验证

一键验证系统是否可用：

```bash
python scripts/quick_test.py
```

这个脚本会检查：
- ✓ Python依赖是否安装
- ✓ 数据库连接是否正常
- ✓ 基础操作是否可用

## 查看当前话题

查看数据库中的所有话题和统计信息：

```bash
python scripts/view_topics.py
```

输出包括：
- 所有话题列表
- 热门话题排行
- 数据库统计信息
- 最近的对话

## 完整功能演示

体验所有核心功能：

```bash
python scripts/demo_full.py
```

演示内容：
1. 添加多个对话（5个示例）
2. 向量相似度搜索
3. 按标签搜索
4. 按重要性筛选
5. 关键词搜索
6. 日期范围查询
7. 统计信息查询
8. CRUD操作
9. 高级功能（Context Manager、AND/OR查询）

## 插入示例数据

插入预设的示例对话到数据库：

```bash
python scripts/insert_full_conversation.py
```

## 系统测试

运行完整的系统测试（包括模块导入、类结构等）：

```bash
python scripts/test_ai_memory.py
```

## 验证安装

### 测试数据库连接

```bash
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT version();"
```

### 检查pgvector扩展

```bash
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

### 测试Python依赖

```bash
python3 -c "import psycopg2, langchain, pgvector; print('✓ Python依赖安装成功')"
```
