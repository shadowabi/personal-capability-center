# LangChain Integration Guide

AI记忆系统与LangChain的完整集成指南。

## 快速开始

### 1. 安装依赖

```bash
pip install langchain langchain-community psycopg2-binary pgvector openai
```

### 2. 基础集成

```python
from langchain_community.vectorstores import PGVector
from scripts.ai_memory import OpenAIEmbeddings

# 创建embedding函数
embeddings = OpenAIEmbeddings(api_key='your-api-key')

# 创建向量存储
vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string='postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory',
    embedding_function=embeddings,
    pre_delete_collection=False
)

# 使用向量存储
results = vectorstore.similarity_search('Python编程', k=5)
```

## OpenAIEmbeddings类

AI记忆系统提供的OpenAI Embeddings实现。

### 初始化

```python
from scripts.ai_memory import OpenAIEmbeddings

# 从环境变量读取API密钥
embeddings = OpenAIEmbeddings()

# 手动指定API密钥
embeddings = OpenAIEmbeddings(api_key='sk-...')
```

### 方法

#### embed_documents()

为文档列表生成embeddings。

```python
texts = [
    'Python是一门编程语言',
    '深度学习是AI的一个分支'
]

embeddings_list = embeddings.embed_documents(texts)
# 返回: [[0.1, 0.2, ...], [0.3, 0.4, ...]]
```

#### embed_query()

为查询文本生成embedding。

```python
query = '如何学习Python？'
query_embedding = embeddings.embed_query(query)
# 返回: [0.1, 0.2, ...]
```

## PGVector配置

### 基础配置

```python
from langchain_community.vectorstores import PGVector

CONNECTION_STRING = 'postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory'

vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
    pre_delete_collection=False  # 是否删除现有collection
)
```

### 高级配置

```python
vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
    pre_delete_collection=False,
    distance_strategy='cosine',  # 'cosine', 'l2', 'max_inner_product'
    kwargs={
        'hnsw_ef_search': 100  # HNSW查询参数
    }
)
```

**distance_strategy选项：**
- `cosine`: 余弦距离（推荐用于文本）
- `l2`: 欧氏距离
- `max_inner_product`: 最大内积

## 添加文档

### 从文档创建

```python
from langchain_core.documents import Document

documents = [
    Document(
        page_content='Python是一门高级编程语言',
        metadata={
            'topic': 'Python',
            'importance': 9,
            'date': '2024-01-15',
            'tags': ['Python', '编程']
        }
    ),
    Document(
        page_content='深度学习使用神经网络',
        metadata={
            'topic': '深度学习',
            'importance': 8,
            'date': '2024-01-16',
            'tags': ['深度学习', 'AI']
        }
    )
]

# 创建向量存储
vectorstore = PGVector.from_documents(
    documents=documents,
    embedding=embeddings,
    collection_name='ai_conversations',
    connection_string=CONNECTION_STRING,
    pre_delete_collection=False
)
```

### 添加单个文档

```python
vectorstore.add_documents([
    Document(
        page_content='新的文档内容',
        metadata={'source': 'user_input', 'topic': 'Python'}
    )
])
```

### 使用metadata

```python
# 添加带metadata的文档
vectorstore.add_texts(
    texts=['文档内容1', '文档内容2'],
    metadatas=[
        {'topic': 'Python', 'importance': 9},
        {'topic': 'AI', 'importance': 8}
    ]
)
```

## 向量搜索

### similarity_search()

简单的相似度搜索。

```python
results = vectorstore.similarity_search(
    'Python编程基础',
    k=5
)

for doc in results:
    print(f"内容: {doc.page_content}")
    print(f"元数据: {doc.metadata}")
    print()
```

### similarity_search_with_score()

带分数的相似度搜索。

```python
results = vectorstore.similarity_search_with_score(
    'Python编程基础',
    k=5
)

for doc, score in results:
    print(f"分数: {score:.4f}")
    print(f"内容: {doc.page_content}")
    print()
```

**分数说明：**
- 余弦距离：越小越相似（0-2）
- 余弦相似度：越大越相似（0-1）
- 计算方式：`similarity = 1 - cosine_distance`

### similarity_search_by_vector()

使用向量搜索。

```python
query_vector = embeddings.embed_query('Python编程')
results = vectorstore.similarity_search_by_vector(
    query_vector,
    k=5
)
```

### max_marginal_relevance_search()

最大相关性搜索（增加多样性）。

```python
results = vectorstore.max_marginal_relevance_search(
    'Python编程',
    k=5,
    fetch_k=10,
    lambda_mult=0.5  # 0=最大多样性，1=最大相关性
)
```

**参数说明：**
- `k`: 返回结果数量
- `fetch_k`: 初始检索数量（应 >= k）
- `lambda_mult`: 多样性权重（0-1）

## 元数据过滤

### 基础过滤

```python
from langchain_community.vectorstores import PGVector

# 创建向量存储时启用metadata
vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
    collection_metadata={'topic': 'Python'}
)

# 搜索时过滤
results = vectorstore.similarity_search(
    'Python编程',
    k=5,
    filter={'topic': 'Python'}
)
```

### 高级过滤

```python
# 多条件过滤
results = vectorstore.similarity_search(
    'Python编程',
    k=5,
    filter={
        'topic': 'Python',
        'importance': {'$gte': 8}  # 重要性 >= 8
    }
)

# 数组过滤
results = vectorstore.similarity_search(
    'Python编程',
    k=5,
    filter={
        'tags': {'$in': ['Python', '编程']}  # 标签包含Python或编程
    }
)
```

**过滤操作符：**
- `$eq`: 等于
- `$ne`: 不等于
- `$gt`: 大于
- `$gte`: 大于等于
- `$lt`: 小于
- `$lte`: 小于等于
- `$in`: 在列表中
- `$nin`: 不在列表中

## Retrieval Chain

### 基础Retriever

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

# 创建检索器
retriever = vectorstore.as_retriever(
    search_type='similarity',
    search_kwargs={'k': 5}
)

# 创建QA链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model='gpt-4'),
    chain_type='stuff',
    retriever=retriever
)

# 提问
answer = qa_chain.run('如何学习Python编程？')
print(answer)
```

### 自定义Retriever

```python
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.retrievers import BaseRetriever
from typing import List

class CustomRetriever(BaseRetriever):
    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        # 自定义检索逻辑
        results = vectorstore.similarity_search(
            query,
            k=5,
            filter={'importance': {'$gte': 8}}
        )
        return results

# 使用自定义retriever
custom_retriever = CustomRetriever()

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model='gpt-4'),
    chain_type='stuff',
    retriever=custom_retriever
)
```

## 对话式RAG

### ConversationBufferMemory

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# 创建记忆
memory = ConversationBufferMemory(
    memory_key='chat_history',
    return_messages=True
)

# 创建对话式RAG链
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model='gpt-4'),
    retriever=retriever,
    memory=memory,
    return_source_documents=True
)

# 对话
query1 = '什么是Python？'
answer1 = qa_chain({'question': query1})

query2 = '它有哪些特点？'
answer2 = qa_chain({'question': query2})
```

### ConversationBufferWindowMemory

```python
from langchain.memory import ConversationBufferWindowMemory

# 保留最近k轮对话
memory = ConversationBufferWindowMemory(
    memory_key='chat_history',
    k=5,  # 保留最近5轮
    return_messages=True
)
```

### ConversationTokenBufferMemory

```python
from langchain.memory import ConversationTokenBufferMemory

# 限制token数量
memory = ConversationTokenBufferMemory(
    memory_key='chat_history',
    max_token_limit=2000,  # 最大2000 tokens
    return_messages=True
)
```

## 混合搜索

### 向量+关键词搜索

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# 创建BM25检索器
documents = vectorstore.similarity_search('', k=100)
bm25_retriever = BM25Retriever.from_documents(documents)

# 创建向量检索器
vector_retriever = vectorstore.as_retriever(
    search_type='similarity',
    search_kwargs={'k': 10}
)

# 混合检索（50%向量 + 50%关键词）
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.5, 0.5]
)
```

### 重排序

```python
from langchain_community.document_transformers import LongContextReorder

# 重排序结果
reordering = LongContextReorder()

results = vectorstore.similarity_search('Python编程', k=10)
reordered_results = reordering.transform_documents(results)

# 相关文档在前，不相关文档在后
for doc in reordered_results:
    print(doc.page_content)
```

## 完整示例

### RAG应用

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import PGVector
from scripts.ai_memory import OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate

# 初始化
embeddings = OpenAIEmbeddings()
vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string='postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory',
    embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_kwargs={'k': 5})

# 自定义prompt
prompt_template = """使用以下上下文回答问题。

上下文:
{context}

问题: {question}

回答:"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=['context', 'question']
)

# 创建QA链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model='gpt-4'),
    chain_type='stuff',
    retriever=retriever,
    chain_type_kwargs={'prompt': PROMPT},
    return_source_documents=True
)

# 查询
query = '如何学习Python编程？'
result = qa_chain({'query': query})

print(f"回答: {result['result']}")
print(f"\n来源文档:")
for doc in result['source_documents']:
    print(f"- {doc.page_content[:100]}...")
```

## 性能优化

### 连接池

```python
from psycopg2 import pool

# 创建连接池
connection_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host='localhost',
    database='ai_memory',
    user='ai_user',
    password='ai_password_123'
)

# 使用连接池
vectorstore = PGVector(
    collection_name='ai_conversations',
    connection_string='postgresql+psycopg2://ai_user:ai_password_123@localhost:5432/ai_memory',
    embedding_function=embeddings,
    connection_pool=connection_pool
)
```

### 批量插入

```python
# 批量添加文档（更快）
batch_size = 100
for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    vectorstore.add_documents(batch)
```

### 缓存

```python
from langchain.cache import GPTCache
from langchain.globals import set_llm_cache
import diskcache

# 使用磁盘缓存
cache = GPTCache(
    init_func=diskcache.Cache('.langchain_cache')
)
set_llm_cache(cache)

# 重复查询会使用缓存
result1 = qa_chain({'query': 'Python是什么？'})
result2 = qa_chain({'query': 'Python是什么？'})  # 从缓存读取
```

## 故障排除

### 常见问题

**问题1: 连接数据库失败**
```python
# 检查连接字符串
CONNECTION_STRING = 'postgresql+psycopg2://user:password@host:port/database'
```

**问题2: 向量维度不匹配**
```python
# 确保embedding维度正确（1536）
len(embeddings.embed_query('test'))  # 应该返回1536
```

**问题3: 搜索结果不准确**
```python
# 增加ef_search参数
vectorstore = PGVector(
    ...
    kwargs={'hnsw_ef_search': 100}  # 默认40
)
```

**问题4: metadata过滤不生效**
```python
# 确保metadata类型正确
filter={'importance': 8}  # 整数
filter={'importance': '8'}  # 字符串（不匹配）
```

### 调试

```python
# 查看生成的SQL
import logging
logging.basicConfig()
logging.getLogger('langchain').setLevel(logging.DEBUG)

# 查看查询计划
from langchain_community.vectorstores import PGVector

# 使用EXPLAIN ANALYZE
vectorstore.similarity_search(
    'Python',
    k=5,
    kwargs={'verbose': True}
)
```

## 最佳实践

1. **使用连接池**: 生产环境使用连接池管理数据库连接
2. **批量操作**: 批量插入和查询提高性能
3. **缓存查询**: 使用GPTCache减少重复查询
4. **合理设置k值**: 根据需求设置合适的返回数量
5. **优化ef_search**: 平衡准确率和性能
6. **使用metadata**: 通过metadata增强检索能力
7. **监控性能**: 定期检查查询性能和索引状态
8. **备份数据**: 定期备份向量数据

## 下一步

- 参考 [EXAMPLES.md](EXAMPLES.md) 查看更多实际应用示例
- 参考 [API_REFERENCE.md](API_REFERENCE.md) 了解完整的API文档
- 参考 [SCHEMA.md](SCHEMA.md) 了解数据库架构
