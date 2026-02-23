# AI Memory Database Schema

AI记忆系统的完整数据库架构文档。

## 表结构

### conversations表

存储对话记录的主表。

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL DEFAULT '',
    summary TEXT,
    details TEXT,
    importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tags TEXT[];
```

**字段说明：**
- `id`: 主键，自增ID
- `date`: 对话日期
- `title`: 对话标题，一句话描述主题
- `summary`: 对话摘要，简要描述（1-3句话）
- `details`: 详细内容，结构化的结论性总结
- `embedding`: 向量嵌入，1536维（OpenAI text-embedding-ada-002）
- `tags`: 标签数组（PostgreSQL TEXT[]类型）
- `importance`: 重要性评分（1-10）
- `word_count`: 字数统计
- `created_at`: 创建时间
- `updated_at`: 更新时间

### tags表

存储标签定义。

```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明：**
- `id`: 主键
- `name`: 标签名称，唯一
- `category`: 标签分类（如：技术栈、主题、难度等）
- `description`: 标签描述
- `created_at`: 创建时间

### conversation_tags表

对话和标签的关联表。

```sql
CREATE TABLE conversation_tags (
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, tag_id)
);
```

**字段说明：**
- `conversation_id`: 对话ID，外键到conversations表
- `tag_id`: 标签ID，外键到tags表
- 主键：(conversation_id, tag_id)

**级联删除：** 当对话或标签被删除时，自动删除关联记录。

## 索引

### B-tree索引

```sql
-- 日期索引
CREATE INDEX idx_conversations_date ON conversations(date);

-- 重要性索引
CREATE INDEX idx_conversations_importance ON conversations(importance DESC);

-- 组合索引（重要性和日期）
CREATE INDEX idx_conversations_imp_date ON conversations(importance DESC, date DESC);
```

**使用场景：**
- `idx_conversations_date`: 按日期范围查询
- `idx_conversations_importance`: 按重要性筛选
- `idx_conversations_imp_date`: 组合筛选（重要性和日期）

### HNSW索引

```sql
-- 向量相似度索引（余弦距离）
CREATE INDEX idx_conversations_embedding ON conversations
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**参数说明：**
- `m`: 每个节点的最大连接数，默认16，越大越好但内存占用越高
- `ef_construction`: 索引构建时的搜索宽度，默认64

**HNSW索引类型：**
- `vector_cosine_ops`: 余弦距离（推荐用于文本embeddings）
- `vector_l2_ops`: 欧氏距离
- `vector_ip_ops`: 内积

**使用场景：**
- 向量相似度搜索
- `embedding <=> %s::vector` 操作符

### 数组索引

```sql
-- 标签数组索引
CREATE INDEX idx_conversations_tags ON conversations USING GIN(tags);
```

**使用场景：**
- 标签查询（`tags && %s` 或 `tags @> %s`）
- GIN索引适合数组类型的包含和重叠查询

### 时间戳索引

```sql
-- 创建时间索引
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- 更新时间索引
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
```

**使用场景：**
- 按创建/更新时间排序
- 范围查询

## 向量操作

### 插入向量

```sql
INSERT INTO conversations (title, summary, embedding)
VALUES ('标题', '摘要', '[0.1, 0.2, 0.3, ...]'::vector);
```

### 向量相似度搜索

```sql
-- 余弦距离（越小越相似）
SELECT id, title, embedding <=> query_vector::vector as distance
FROM conversations
ORDER BY embedding <=> query_vector::vector
LIMIT 10;

-- 余弦相似度（越大越相似，范围0-1）
SELECT id, title, 1 - (embedding <=> query_vector::vector) as similarity
FROM conversations
ORDER BY embedding <=> query_vector::vector
LIMIT 10;
```

**距离类型：**
- `embedding <=> query_vector::vector`: 余弦距离（推荐）
- `embedding <-> query_vector::vector`: 欧氏距离
- `embedding <#> query_vector::vector`: 内积距离

### 向量操作符

| 操作符 | 描述 | 返回值 |
|--------|------|--------|
| `<->` | 欧氏距离 | FLOAT |
| `<#>` | 内积距离 | FLOAT |
| `<=>` | 余弦距离 | FLOAT |

## 标签操作

### 添加标签

```sql
-- 使用数组操作符
UPDATE conversations
SET tags = tags || '新标签'
WHERE id = 123;

-- 使用数组追加函数
UPDATE conversations
SET tags = array_append(tags, '新标签')
WHERE id = 123;
```

### 删除标签

```sql
-- 删除特定标签
UPDATE conversations
SET tags = array_remove(tags, '旧标签')
WHERE id = 123;

-- 删除多个标签
UPDATE conversations
SET tags = array_remove(tags, '标签1') || array_remove(tags, '标签2')
WHERE id = 123;
```

### 查询标签

```sql
-- 包含任一标签（OR）
SELECT * FROM conversations
WHERE tags && ARRAY['Python', '机器学习'];

-- 包含所有标签（AND）
SELECT * FROM conversations
WHERE tags @> ARRAY['Python', '深度学习'];

-- 包含特定标签
SELECT * FROM conversations
WHERE 'Python' = ANY(tags);

-- 标签数量
SELECT id, array_length(tags, 1) as tag_count
FROM conversations;

-- 提取所有标签
SELECT DISTINCT unnest(tags) as tag
FROM conversations
ORDER BY tag;
```

### 标签统计

```sql
-- 标签使用统计
SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
FROM conversations
GROUP BY tag
ORDER BY count DESC;

-- 热门标签TOP 10
SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
FROM conversations
GROUP BY tag
ORDER BY count DESC
LIMIT 10;
```

## 性能优化

### 索引优化

```sql
-- 分析表统计信息
ANALYZE conversations;

-- 重建HNSW索引（提高查询性能）
REINDEX INDEX idx_conversations_embedding;

-- VACUUM清理（回收空间）
VACUUM conversations;
```

### 查询优化

```sql
-- 使用EXPLAIN分析查询计划
EXPLAIN
SELECT id, title, 1 - (embedding <=> query_vector::vector) as similarity
FROM conversations
ORDER BY embedding <=> query_vector::vector
LIMIT 10;

-- 组合查询（向量+标签+重要性）
SELECT id, title, 1 - (embedding <=> query_vector::vector) as similarity
FROM conversations
WHERE 'Python' = ANY(tags)
  AND importance >= 8
ORDER BY embedding <=> query_vector::vector
LIMIT 10;
```

### HNSW查询参数

```sql
-- 设置ef_search参数（查询时的搜索宽度）
SET hnsw.ef_search = 100;

-- 查询后重置
SET hnsw.ef_search TO default;
```

**ef_search参数说明：**
- 默认值：40
- 增大：提高准确率，但查询变慢
- 减小：提高查询速度，但准确率降低
- 推荐值：100-200（高精度），40-100（平衡），10-40（高速）

## 维护

### 备份

```sql
-- 备份整个数据库
pg_dump ai_memory > ai_memory_backup.sql

-- 备份特定表
pg_dump -t conversations ai_memory > conversations_backup.sql

-- 使用pg_dumpall备份所有数据库
pg_dumpall > all_databases_backup.sql
```

### 恢复

```sql
-- 恢复整个数据库
psql ai_memory < ai_memory_backup.sql

-- 恢复特定表
psql ai_memory < conversations_backup.sql
```

### 清理

```sql
-- 清理死元组
VACUUM FULL conversations;

-- 清理并分析
VACUUM ANALYZE conversations;

-- 清理所有表
VACUUM FULL;

-- 重建所有索引
REINDEX DATABASE ai_memory;
```

### 监控

```sql
-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引大小
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
WHERE tablename = 'conversations';

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'conversations';
```

## 安全

### 权限管理

```sql
-- 创建只读用户
CREATE USER ai_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE ai_memory TO ai_readonly;
GRANT USAGE ON SCHEMA public TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;

-- 创建读写用户
CREATE USER ai_writer WITH PASSWORD 'writer_password';
GRANT CONNECT ON DATABASE ai_memory TO ai_writer;
GRANT USAGE ON SCHEMA public TO ai_writer;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO ai_writer;

-- 修改默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO ai_readonly;
```

### 数据加密

```sql
-- 启用加密连接（需要SSL证书）
-- 修改postgresql.conf：
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

-- 重启PostgreSQL
sudo service postgresql restart
```

## 扩展

### 添加新字段

```sql
-- 添加用户ID字段
ALTER TABLE conversations
ADD COLUMN user_id INTEGER;

-- 添加对话类型字段
ALTER TABLE conversations
ADD COLUMN conversation_type TEXT DEFAULT 'general';

-- 添加元数据JSON字段
ALTER TABLE conversations
ADD COLUMN metadata JSONB;
```

### 添加新索引

```sql
-- 用户ID索引
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- 对话类型索引
CREATE INDEX idx_conversations_type ON conversations(conversation_type);

-- 元数据GIN索引
CREATE INDEX idx_conversations_metadata ON conversations USING GIN(metadata);
```

## 注意事项

1. **向量维度**: 固定为1536维，对应OpenAI text-embedding-ada-002模型
2. **重要性范围**: 1-10，使用CHECK约束确保有效性
3. **标签格式**: TEXT[]类型，使用PostgreSQL数组操作
4. **索引维护**: 定期VACUUM和ANALYZE保持性能
5. **HNSW参数**: 根据查询需求调整m和ef_construction参数
6. **连接池**: 生产环境建议使用连接池（如psycopg2.pool）
7. **事务**: 批量操作时使用事务提高性能
8. **备份**: 定期备份数据库，特别是向量数据
