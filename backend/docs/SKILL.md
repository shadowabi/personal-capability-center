# AI Memory - 智能对话记忆系统

一个基于PostgreSQL和pgvector的AI记忆系统，支持向量相似度搜索、多维筛选和LangChain集成。

## 安装

本系统需要PostgreSQL 16和pgvector扩展。推荐使用Docker Compose快速启动（生产环境最佳实践）。

### 推荐：使用Docker Compose（生产环境最佳实践）

#### 优势
- ✅ 开箱即用，无需手动安装PostgreSQL和pgvector
- ✅ 完全隔离，不影响宿主机环境
- ✅ 易于备份和迁移（数据持久化在Docker volumes）
- ✅ 稳定可靠，避免WSL2 idle timeout问题
- ✅ 符合生产环境部署标准

#### 快速启动

```bash
# 进入AI Memory目录
cd path/to/ai-memory

# 使用Docker Compose启动
docker compose up -d

# 查看日志
docker compose logs -f postgresql

# 停止服务
docker compose down
```

配置文件：
- **docker-compose.yml**: Docker Compose配置
- **init-db.sh**: 数据库初始化脚本（自动创建表和安装pgvector）

连接信息：
- Host: 127.0.0.1
- Port: 5432
- Database: ai_memory
- User: ai_user
- Password: ai_password_123

### 手动安装（Ubuntu/WSL）

**注意**: 不推荐手动安装，Docker方案更稳定可靠。

```bash
# 安装PostgreSQL 16和pgvector
sudo apt update
sudo apt install -y postgresql-16 postgresql-16-pgvector postgresql-client-16

# 启动服务
sudo pg_ctlcluster 16 main start

# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE USER ai_user WITH PASSWORD 'ai_password_123';
CREATE DATABASE ai_memory OWNER ai_user;
EOF

# 启用pgvector扩展
sudo -u postgres psql -d ai_memory -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 安装Python依赖
pip3 install psycopg2-binary langchain-community pgvector python-dotenv
```

### 验证安装

```bash
# 测试数据库连接
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT version();"

# 检查pgvector扩展
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# 测试Python依赖
python3 -c "import psycopg2, langchain, pgvector; print('✓ Python依赖安装成功')"
```

---

## 快速开始

### 1. 数据库设置

连接到PostgreSQL并运行初始化脚本：



### 2. 基础使用

```python
from scripts.ai_memory import AIMemory

# 连接数据库
memory = AIMemory()

# 添加对话
embedding = generate_embedding(text)  # 你的embedding生成函数
conv_id = memory.add_conversation(
    title='学习Python',
    summary='学习了Python基础语法',
    details='学习了变量、数据类型、控制流等基础知识',
    tags=['Python', '编程'],
    importance=8,
    word_count=30
)

# 向量搜索
similar = memory.search_similar(embedding, limit=5)

# 按标签搜索
python_convos = memory.get_by_tags(['Python'], limit=10)

# 关闭连接
memory.close()
```

### 3. 测试与验证

AI Memory提供了多个测试脚本，帮助快速验证系统功能和体验核心特性：

#### 快速验证

一键验证系统是否可用：

```bash
python scripts/quick_test.py
```

这个脚本会检查：
- ✓ Python依赖是否安装
- ✓ 数据库连接是否正常
- ✓ 基础操作是否可用

#### 查看当前话题

查看数据库中的所有话题和统计信息：

```bash
python scripts/view_topics.py
```

输出包括：
- 所有话题列表
- 热门话题排行
- 数据库统计信息
- 最近的对话

#### 完整功能演示

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

#### 插入示例数据

插入预设的示例对话到数据库：

```bash
python scripts/insert_full_conversation.py
```

#### 系统测试

运行完整的系统测试（包括模块导入、类结构等）：

```bash
python scripts/test_ai_memory.py
```

## 核心功能

- ✅ **向量搜索** - 基于pgvector的语义相似度搜索
- ✅ **多维筛选** - 按标签、重要性、日期范围筛选
- ✅ **LangChain集成** - 完整的PGVector支持
- ✅ **Python封装** - 开箱即用的AIMemory类
- ✅ **高性能** - HNSW索引加速向量搜索

## 文档

- **Docker配置**: [docker-compose.yml](docker-compose.yml) - Docker Compose配置
- **数据库初始化**: [init-db.sh](init-db.sh) - 数据库初始化脚本
- **API参考**: [references/API_REFERENCE.md](references/API_REFERENCE.md)
- **数据库架构**: [references/SCHEMA.md](references/SCHEMA.md)
- **LangChain集成**: [references/LANGCHAIN.md](references/LANGCHAIN.md)
- **使用示例**: [references/EXAMPLES.md](references/EXAMPLES.md)

## 数据库连接

### Docker Compose连接（推荐）

默认连接配置（Docker Compose启动）：
- Host: 127.0.0.1
- Port: 5432
- Database: ai_memory
- User: ai_user
- Password: ai_password_123

```python
from scripts.ai_memory import AIMemory

# 连接Docker数据库（默认配置）
memory = AIMemory()
```

### 手动安装连接

如果手动安装PostgreSQL，可以覆盖默认配置：

```python
memory = AIMemory(
    host='your-host',
    database='your-db',
    user='your-user',
    password='your-password'
)
```

## 故障排查

遇到问题？查看详细的故障排查指南：

- **WSL2环境配置** → [WSL2_TROUBLESHOOTING.md](references/WSL2_TROUBLESHOOTING.md)
  - PostgreSQL跨OS访问配置
  - pg_hba.conf安全配置
  - WSL2 Mirror模式问题
  - PostgreSQL频繁重启问题（systemd持久化）
  - 连接问题排查步骤
  - Python psycopg2连接配置

## 内容存储原则

### 重要经验教训

**核心原则：直接使用用户提供的完整内容**

当用户提供的内容本身就是总结性、结构化的文本时，应该直接使用完整原文作为`details`字段，**不要再次"总结"**，否则会丢失重要细节。

### 适用场景

**场景1：用户提供的总结性内容**
```python
# ✅ 正确做法：直接使用完整原文
title = "投资策略评估"
summary = "投资策略：50%沪深300 + 50%量化板块"
details = """策略框架：
资金分配：
- 50%沪深300ETF（510300）：分散风险，获取市场平均收益
- 50%量化板块：根据量化信号选择板块，追求超额收益

目标收益：
- 年化收益：沪深300 + 10%+
- 止损规则：比大盘多亏20%清仓

优化建议：
1. 建立详细记录（6-12个月验证期）
2. 调整补仓策略（不追高）
3. 优化清仓触发条件
4. 增加板块分散度"""

# ❌ 错误做法：再次总结导致细节丢失
# details = "策略：50%沪深300ETF分散风险，50%量化板块追求超额收益..."
```

**场景2：原始对话内容**
```python
# 需要AI进行总结提取
title = extract_title(original_conversation)
summary = extract_summary(original_conversation)
details = extract_structured_points(original_conversation)
```

### 数据库字段说明

- **title**: 一句话描述主题，快速识别
- **summary**: 简要概括，快速浏览
- **details**: 完整内容或结构化要点，保留所有细节

### 字段长度建议

- title: 50-100字符
- summary: 100-200字符
- details: 根据内容需要，不限长度（结构化要点或完整原文）

## 生成向量嵌入

在实际应用中，使用OpenAI API：

```python
import openai

def generate_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model='text-embedding-ada-002'
    )
    return response['data'][0]['embedding']
```

或在测试中使用mock：

```python
from scripts.ai_memory import generate_mock_embedding

embedding = generate_mock_embedding()  # 返回1536维的随机向量
```

## LangChain集成

```python
from langchain_community.vectorstores import PGVector
from scripts.ai_memory import OpenAIEmbeddings

vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string='postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory',
    embedding_function=OpenAIEmbeddings()
)

# 使用向量存储
results = vectorstore.similarity_search('Python编程', k=5)
```

详见 [references/LANGCHAIN.md](references/LANGCHAIN.md)

## 许可证

MIT License
