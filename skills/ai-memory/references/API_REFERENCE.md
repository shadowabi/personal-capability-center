# AI Memory API Reference

## AIMemory类

### 构造函数

```python
AIMemory(
    host: str = 'localhost',
    port: int = 5432,
    database: str = 'ai_memory',
    user: str = 'ai_user',
    password: str = 'ai_password_123'
)
```

初始化AI记忆系统连接。

**参数：**
- `host` (str): 数据库主机地址，默认'localhost'
- `port` (int): 数据库端口，默认5432
- `database` (str): 数据库名称，默认'ai_memory'
- `user` (str): 数据库用户名，默认'ai_user'
- `password` (str): 数据库密码，默认'ai_password_123'

**示例：**
```python
# 使用默认配置
memory = AIMemory()

# 自定义配置
memory = AIMemory(
    host='db.example.com',
    database='my_memory',
    user='my_user',
    password='my_password'
)
```

### add_conversation()

添加新对话到记忆系统。

```python
add_conversation(
    title: str,
    summary: str,
    details: str,
    embedding: List[float],
    tags: List[str],
    importance: int,
    word_count: int,
    date: Optional[date] = None
) -> int
```

**参数：**
- `title` (str): 对话标题，一句话描述主题
- `summary` (str): 对话摘要，简要描述（1-3句话）
- `details` (str): 详细内容，结构化的结论性总结
  - ⚠️ **重要**：请参考 [内容存储指南](CONTENT_GUIDELINES.md) 了解正确的格式
  - 应该提炼对话中形成的**能力**，而非简单记录对话内容
  - 必须包含：能力定义、体现在深刻洞察、认知转变过程
- `embedding` (List[float]): 向量嵌入（1536维）
- `tags` (List[str]): 标签列表（推荐3-5个）
- `importance` (int): 重要性评分（1-10）
- `word_count` (int): 字数统计
- `date` (Optional[date]): 对话日期，默认为今天

**返回值：**
- `int`: 新创建的对话记录ID

**示例：**
```python
embedding = generate_embedding(text)

conv_id = memory.add_conversation(
    title='学习Python',
    summary='学习了Python基础语法',
    details='学习了变量、数据类型、控制流等基础知识',
    embedding=embedding,
    tags=['Python', '编程'],
    importance=8,
    word_count=30
)
```

### search_similar()

向量相似度搜索。

```python
search_similar(
    query_vector: List[float],
    limit: int = 5,
    min_importance: int = 0
) -> List[Tuple]
```

**参数：**
- `query_vector` (List[float]): 查询向量（1536维）
- `limit` (int): 返回结果数量，默认5
- `min_importance` (int): 最小重要性筛选，默认0（不限）

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - details: 详细内容
  - tags: 标签列表
  - importance: 重要性
  - similarity: 相似度（0-1，1为完全相同）

**示例：**
```python
embedding = generate_embedding(query_text)

similar = memory.search_similar(
    query_vector=embedding,
    limit=10,
    min_importance=7
)

    for id, title, summary, details, tags, imp, sim in similar:
        print(f"[{sim:.4f}] {title}")
```

### get_by_title()

按标题查询对话。

```python
get_by_title(
    title: str
) -> Optional[Tuple]
```

**参数：**
- `title` (str): 对话标题

**返回值：**
- `Optional[Tuple]`: 找到的对话，包含：
  - id: 对话ID
  - date: 日期
  - title: 标题
  - summary: 摘要
  - details: 详情
  - tags: 标签
  - importance: 重要性
  - word_count: 字数
  - created_at: 创建时间
  - updated_at: 更新时间

**示例：**
```python
title = "2026年02月月度总结"
conv = memory.get_by_title(title)
if conv:
    print(f"Found: {conv[2]}")  # conv[2] 是 title
```

### update_summary()

更新对话摘要和详情。

```python
update_summary(
    conversation_id: int,
    summary: str,
    details: str
) -> bool
```

**参数：**
- `conversation_id` (int): 对话ID
- `summary` (str): 新的摘要
- `details` (str): 新的详情

**返回值：**
- `bool`: 是否更新成功

**示例：**
```python
title = "2026年02月月度总结"
existing = memory.get_by_title(title)
if existing:
    updated = memory.update_summary(existing[0], text[:2000], text)
    print(f"Updated: {updated}")
```

### get_by_tags()

按标签搜索对话。


```python
get_by_tags(
    tags: List[str],
    limit: int = 10,
    match_all: bool = False
) -> List[Tuple]
```

**参数：**
- `tags` (List[str]): 标签列表
- `limit` (int): 返回结果数量，默认10
- `match_all` (bool): True=匹配所有标签(AND)，False=匹配任一标签(OR)，默认False

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - tags: 标签列表
  - importance: 重要性
  - date: 日期

**示例：**
```python
# 包含Python或机器学习标签
convos = memory.get_by_tags(
    tags=['Python', '机器学习'],
    limit=10,
    match_all=False
)

# 同时包含Python和深度学习标签
convos = memory.get_by_tags(
    tags=['Python', '深度学习'],
    limit=10,
    match_all=True
)
```

### get_by_importance()

按重要性筛选对话。

```python
get_by_importance(
    min_importance: int = 8,
    limit: int = 10
) -> List[Tuple]
```

**参数：**
- `min_importance` (int): 最小重要性评分，默认8
- `limit` (int): 返回结果数量，默认10

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - importance: 重要性
  - date: 日期

**示例：**
```python
# 获取高重要性对话（>=8）
important = memory.get_by_importance(min_importance=8)

# 获取非常重要的对话（>=9）
very_important = memory.get_by_importance(min_importance=9)
```

### get_conversation()

获取对话详情。

```python
get_conversation(
    conversation_id: int
) -> Optional[Tuple]
```

**参数：**
- `conversation_id` (int): 对话ID

**返回值：**
- `Optional[Tuple]`: 对话详情，包含所有字段；如果不存在返回None
  - id: 对话ID
  - date: 日期
  - title: 标题
  - summary: 摘要
  - details: 详细内容
  - tags: 标签列表
  - importance: 重要性
  - word_count: 字数
  - created_at: 创建时间
  - updated_at: 更新时间

**示例：**
```python
conv = memory.get_conversation(123)

if conv:
    id, date, title, summary, details, tags, imp, wc, created, updated = conv
    print(f"标题: {title}")
    print(f"内容: {details}")
else:
    print("对话不存在")
```

### search_by_keyword()

关键词搜索。

```python
search_by_keyword(
    keyword: str,
    search_in_details: bool = True,
    limit: int = 10
) -> List[Tuple]
```

**参数：**
- `keyword` (str): 搜索关键词
- `search_in_details` (bool): 是否搜索details字段，默认True
- `limit` (int): 返回结果数量，默认10

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - importance: 重要性
  - date: 日期

**示例：**
```python
# 搜索标题和摘要
results = memory.search_by_keyword('Python', search_in_details=False)

# 搜索所有字段（标题、摘要、详情）
results = memory.search_by_keyword('深度学习', search_in_details=True)
```

### get_by_date_range()

按日期范围查询。

```python
get_by_date_range(
    start_date: date,
    end_date: date,
    limit: int = 100
) -> List[Tuple]
```

**参数：**
- `start_date` (date): 开始日期
- `end_date` (date): 结束日期
- `limit` (int): 返回结果数量，默认100

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - date: 日期
  - importance: 重要性

**示例：**
```python
from datetime import date

# 查询2024年1月的对话
start = date(2024, 1, 1)
end = date(2024, 1, 31)

january_convos = memory.get_by_date_range(start, end)
```

### get_all_tags()

获取所有标签。

```python
get_all_tags() -> List[str]
```

**返回值：**
- `List[str]`: 所有标签的去重列表，按字母排序

**示例：**
```python
tags = memory.get_all_tags()

print("所有标签:")
for tag in tags:
    print(f"  - {tag}")
```

### update_importance()

更新对话重要性。

```python
update_importance(
    conversation_id: int,
    new_importance: int
) -> bool
```

**参数：**
- `conversation_id` (int): 对话ID
- `new_importance` (int): 新的重要性评分（1-10）

**返回值：**
- `bool`: 是否更新成功

**示例：**
```python
# 将对话重要性从7提升到9
success = memory.update_importance(123, 9)

if success:
    print("更新成功")
else:
    print("对话不存在")
```

### delete_conversation()

删除对话。

```python
delete_conversation(
    conversation_id: int
) -> bool
```

**参数：**
- `conversation_id` (int): 对话ID

**返回值：**
- `bool`: 是否删除成功

**示例：**
```python
success = memory.delete_conversation(123)

if success:
    print("删除成功")
else:
    print("对话不存在")
```

### get_statistics()

获取数据库统计信息。

```python
get_statistics() -> Dict[str, Any]
```

**返回值：**
- `Dict[str, Any]`: 包含统计信息的字典：
  - `total_conversations`: 总对话数
  - `with_vectors`: 包含向量的对话数
  - `high_importance`: 高重要性对话数（>=8）
  - `avg_words`: 平均字数
  - `max_importance`: 最大重要性
  - `min_importance`: 最小重要性

**示例：**
```python
stats = memory.get_statistics()

print(f"总对话数: {stats['total_conversations']}")
print(f"平均字数: {stats['avg_words']}")
print(f"高重要性: {stats['high_importance']}")
```

### get_top_tags()

获取热门标签。

```python
get_top_tags(
    limit: int = 10
) -> List[Tuple[str, int]]
```

**参数：**
- `limit` (int): 返回的标签数量，默认10

**返回值：**
- `List[Tuple[str, int]]`: (tag_name, count)元组列表，按出现次数降序排列

**示例：**
```python
top_tags = memory.get_top_tags(limit=5)

print("热门标签:")
for tag, count in top_tags:
    print(f"  {tag}: {count}次")
```

### get_recent()

获取最近的对话。

```python
get_recent(
    days: int = 7,
    limit: int = 10
) -> List[Tuple]
```

**参数：**
- `days` (int): 最近多少天，默认7
- `limit` (int): 返回结果数量，默认10

**返回值：**
- `List[Tuple]`: 匹配的对话列表，每项包含：
  - id: 对话ID
  - title: 标题
  - summary: 摘要
  - date: 日期
  - importance: 重要性

**示例：**
```python
# 获取最近7天的对话
recent = memory.get_recent(days=7)

# 获取最近30天的对话
last_month = memory.get_recent(days=30)
```

### close()

关闭数据库连接。

```python
close() -> None
```

**建议：** 使用with语句自动管理连接：

```python
with AIMemory() as memory:
    memory.add_conversation(...)
    results = memory.search_similar(...)
# 连接自动关闭
```

### Context Manager

AIMemory支持Python的context manager协议，可以自动管理连接。

**示例：**
```python
# 推荐方式 - 自动管理连接
with AIMemory() as memory:
    conv_id = memory.add_conversation(...)
    results = memory.search_similar(...)
# 连接自动关闭

# 手动方式
memory = AIMemory()
try:
    # 使用memory
    pass
finally:
    memory.close()
```

## 便利函数

### generate_mock_embedding()

生成用于测试的mock向量嵌入。

```python
generate_mock_embedding(dimension: int = 1536) -> List[float]
```

**参数：**
- `dimension` (int): 向量维度，默认1536

**返回值：**
- `List[float]`: 随机生成的向量列表

**注意：** 在实际应用中，应该使用OpenAI API或其他embedding服务生成真实的向量。

**示例：**
```python
from scripts.ai_memory import AIMemory, generate_mock_embedding

with AIMemory() as memory:
    embedding = generate_mock_embedding()
    
    conv_id = memory.add_conversation(
        title='测试对话',
        summary='这是一个测试',
        details='详细内容',
        embedding=embedding,
        tags=['测试'],
        importance=5,
        word_count=10
    )
```

## OpenAIEmbeddings类

OpenAI Embeddings接口实现，用于LangChain集成。

### 构造函数

```python
OpenAIEmbeddings(api_key: Optional[str] = None)
```

**参数：**
- `api_key` (Optional[str]): OpenAI API密钥，如果为None则从环境变量OPENAI_API_KEY读取

**示例：**
```python
from scripts.ai_memory import OpenAIEmbeddings

# 从环境变量读取
embeddings = OpenAIEmbeddings()

# 手动指定
embeddings = OpenAIEmbeddings(api_key='sk-...')
```

### embed_documents()

为文档列表生成embeddings。

```python
embed_documents(texts: List[str]) -> List[List[float]]
```

**参数：**
- `texts` (List[str]): 文本列表

**返回值：**
- `List[List[float]]`: 每个文本的embedding向量列表

**示例：**
```python
texts = [
    'Python是一门编程语言',
    '深度学习是AI的一个分支'
]

embeddings_list = embeddings.embed_documents(texts)
```

### embed_query()

为查询文本生成embedding。

```python
embed_query(text: str) -> List[float]
```

**参数：**
- `text` (str): 查询文本

**返回值：**
- `List[float]`: embedding向量

**示例：**
```python
query = '如何学习Python？'
query_embedding = embeddings.embed_query(query)
```

## 错误处理

大多数方法不抛出异常，而是返回空列表、None或False表示失败。建议：

```python
# 检查返回值
result = memory.get_conversation(123)
if result is None:
    print("对话不存在")
else:
    print(f"对话: {result[2]}")  # title

# 检查操作是否成功
if not memory.update_importance(123, 9):
    print("更新失败，对话可能不存在")
```

对于数据库连接错误，会在初始化时抛出`psycopg2.Error`。

## 性能提示

1. **向量搜索**：使用HNSW索引，性能优秀。建议设置合理的limit和min_importance。
2. **标签搜索**：使用PostgreSQL数组索引，匹配所有标签比匹配任一标签慢。
3. **批量操作**：如果需要插入大量数据，考虑使用事务批量提交。
4. **连接复用**：使用with语句复用连接，避免频繁创建和关闭。

## 最佳实践

1. **使用context manager**：自动管理连接，避免资源泄漏
2. **合理的标签**：每条记录3-5个标签，使用统一的命名规范
3. **重要性评分**：遵循评分标准（9-10关键、7-8重要、5-6一般）
4. **向量质量**：使用真实的embedding服务（如OpenAI API）而非mock
5. **定期维护**：定期运行VACUUM和ANALYZE保持数据库性能
