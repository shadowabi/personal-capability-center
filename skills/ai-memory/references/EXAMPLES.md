# AI Memory Examples

AI记忆系统的实际应用示例和完整场景。

## 目录

1. [基础操作](#基础操作)
2. [个人知识库](#个人知识库)
3. [文档管理系统](#文档管理系统)
4. [客户支持AI](#客户支持ai)
5. [会议笔记管理](#会议笔记管理)
6. [学习进度追踪](#学习进度追踪)
7. [高级模式](#高级模式)

## 基础操作

### 添加对话

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date

# 使用context manager
with AIMemory() as memory:
    # 生成embedding（实际使用OpenAI API）
    embedding = generate_mock_embedding()
    
    # 添加对话
    conv_id = memory.add_conversation(
        title='学习Python基础',
        summary='学习了Python的变量、数据类型和控制流',
        details='''
学习了Python的基础知识：
1. 变量和命名规则
2. 数据类型（整数、浮点数、字符串、布尔）
3. 控制流（if、for、while）
4. 函数定义和调用
5. 列表、字典等数据结构
        ''',
        embedding=embedding,
        tags=['Python', '编程', '入门'],
        importance=8,
        word_count=45,
        date=date(2024, 1, 15)
    )
    
    print(f"对话已添加，ID: {conv_id}")
```

### 搜索相似对话

```python
with AIMemory() as memory:
    query_text = '如何学习Python编程？'
    query_embedding = generate_mock_embedding()
    
    # 向量相似度搜索
    similar = memory.search_similar(
        query_vector=query_embedding,
        limit=5,
        min_importance=7
    )
    
    print(f"找到 {len(similar)} 条相似对话:\n")
    for i, (id, title, summary, details, tags, imp, sim) in enumerate(similar, 1):
        print(f"{i}. [{sim:.4f}] {title}")
        print(f"   重要性: {imp}/10")
        print(f"   标签: {', '.join(tags)}")
        print(f"   摘要: {summary[:60]}...")
        print()
```

### 按标签搜索

```python
with AIMemory() as memory:
    # 匹配任一标签（OR）
    python_convos = memory.get_by_tags(
        tags=['Python', '编程'],
        limit=10,
        match_all=False
    )
    
    print(f"Python或编程相关的对话 ({len(python_convos)}条):\n")
    for id, title, summary, tags, imp, dt in python_convos:
        print(f"  {title} (IMP:{imp})")
        print(f"  {summary[:50]}...")
        print()
    
    # 匹配所有标签（AND）
    advanced = memory.get_by_tags(
        tags=['Python', '深度学习'],
        limit=10,
        match_all=True
    )
    
    print(f"\n同时包含Python和深度学习的对话 ({len(advanced)}条)")
```

### 按重要性筛选

```python
with AIMemory() as memory:
    # 获取高重要性对话
    important = memory.get_by_importance(
        min_importance=8,
        limit=10
    )
    
    print(f"高重要性对话 ({len(important)}条):\n")
    for i, (id, title, summary, imp, dt) in enumerate(important, 1):
        print(f"{i}. [{imp}/10] {title}")
        print(f"   {summary[:60]}...")
        print()
```

## 个人知识库

### 存储学习笔记

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date

with AIMemory() as memory:
    notes = [
        {
            'title': 'Transformer架构学习',
            'summary': '学习了Transformer的核心组件',
            'details': '''
Transformer的核心组件：
1. Self-Attention机制
   - Query, Key, Value三个向量
   - 注意力权重计算
   - 多头注意力(Multi-Head Attention)
2. Positional Encoding
   - 位置信息编码
   - 正弦/余弦函数
3. Feed-Forward Networks
   - 位置全连接网络
   - 激活函数
4. Encoder-Decoder架构
   - 编码器处理输入
   - 解码器生成输出
            ''',
            'tags': ['Transformer', 'NLP', 'AI'],
            'importance': 10,
            'word_count': 85,
            'date': date(2024, 1, 20)
        },
        {
            'title': 'BERT模型理解',
            'summary': '学习了BERT的预训练和微调',
            'details': '''
BERT的主要特点：
1. 预训练任务
   - Masked Language Model (MLM)
   - Next Sentence Prediction (NSP)
2. 模型架构
   - 基于Transformer Encoder
   - 双向上下文理解
3. 微调方法
   - 添加任务特定层
   - 针对不同NLP任务
            ''',
            'tags': ['BERT', 'NLP', '预训练'],
            'importance': 9,
            'word_count': 65,
            'date': date(2024, 1, 22)
        }
    ]
    
    # 批量添加笔记
    for note in notes:
        embedding = generate_mock_embedding()
        conv_id = memory.add_conversation(
            title=note['title'],
            summary=note['summary'],
            details=note['details'],
            embedding=embedding,
            tags=note['tags'],
            importance=note['importance'],
            word_count=note['word_count'],
            date=note['date']
        )
        print(f"笔记已保存: {note['title']} (ID: {conv_id})")
```

### 查询知识

```python
with AIMemory() as memory:
    # 按主题查询
    transformer_notes = memory.get_by_tags(['Transformer'], limit=10)
    print(f"Transformer相关笔记 ({len(transformer_notes)}条):\n")
    
    for id, title, summary, tags, imp, dt in transformer_notes:
        conv = memory.get_conversation(id)
        if conv:
            _, _, _, title, _, details, tags, imp, _, _ = conv
            print(f"  {title} (IMP:{imp})")
            print(f"  {details[:100]}...")
            print()
    
    # 向量搜索相关内容
    query = "如何理解Transformer的Self-Attention机制？"
    query_embedding = generate_mock_embedding()
    
    similar = memory.search_similar(query_embedding, limit=3)
    print(f"最相关的笔记:\n")
    
    for id, title, summary, details, tags, imp, sim in similar:
        print(f"[{sim:.4f}] {title}")
        print(f"  {summary[:80]}...")
        print()
```

### 知识统计

```python
with AIMemory() as memory:
    # 获取统计信息
    stats = memory.get_statistics()
    
    print("知识库统计:")
    print(f"  总笔记数: {stats['total_conversations']}")
    print(f"  包含向量: {stats['with_vectors']}")
    print(f"  高重要性: {stats['high_importance']}")
    print(f"  平均字数: {stats['avg_words']}")
    print()
    
    # 获取热门标签
    top_tags = memory.get_top_tags(limit=10)
    print("热门标签:")
    for tag, count in top_tags:
        print(f"  {tag}: {count}次")
    print()
    
    # 获取最近笔记
    recent = memory.get_recent(days=7, limit=5)
    print("最近7天的笔记:")
    for id, title, summary, dt, imp in recent:
        print(f"  {dt} - {title}")
```

## 文档管理系统

### 存储文档摘要

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date

with AIMemory() as memory:
    docs = [
        {
            'title': 'API文档：用户认证',
            'summary': '用户认证API的使用说明和参数',
            'details': '''
用户认证API端点：
POST /api/auth/login
参数:
  - username: 用户名
  - password: 密码
返回:
  - token: JWT token
  - expires: 过期时间

注意事项:
1. 密码需要MD5加密
2. token有效期为24小时
3. 失败返回401状态码
            ''',
            'tags': ['API', '认证', '文档'],
            'importance': 9,
            'word_count': 55
        },
        {
            'title': '数据库设计规范',
            'summary': '项目数据库的命名和设计规范',
            'details': '''
数据库命名规范：
1. 表名：小写+下划线，复数形式
2. 字段名：小写+下划线
3. 主键：id
4. 外键：{table}_id

设计原则：
1. 每个表必须有主键
2. 使用外键约束
3. 添加适当索引
4. 使用timestamp记录创建时间
            ''',
            'tags': ['数据库', '规范', '设计'],
            'importance': 8,
            'word_count': 60
        }
    ]
    
    for doc in docs:
        embedding = generate_mock_embedding()
        conv_id = memory.add_conversation(
            title=doc['title'],
            summary=doc['summary'],
            details=doc['details'],
            embedding=embedding,
            tags=doc['tags'],
            importance=doc['importance'],
            word_count=doc['word_count']
        )
        print(f"文档已保存: {doc['title']}")
```

### 搜索文档

```python
with AIMemory() as memory:
    # 关键词搜索
    results = memory.search_by_keyword(
        keyword='认证',
        search_in_details=True,
        limit=10
    )
    
    print(f"包含'认证'的文档 ({len(results)}条):\n")
    for id, title, summary, imp, dt in results:
        print(f"  {title}")
        print(f"  {summary[:60]}...")
        print()
    
    # 按标签分类
    api_docs = memory.get_by_tags(['API'], limit=10)
    db_docs = memory.get_by_tags(['数据库'], limit=10)
    
    print(f"\nAPI文档: {len(api_docs)}条")
    print(f"数据库文档: {len(db_docs)}条")
```

## 客户支持AI

### 存储客户问题

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date

with AIMemory() as memory:
    faqs = [
        {
            'title': '如何重置密码？',
            'summary': '用户忘记密码时的重置流程',
            'details': '''
密码重置步骤：
1. 访问登录页面，点击"忘记密码"
2. 输入注册邮箱
3. 查收邮件，点击重置链接
4. 设置新密码
5. 使用新密码登录

注意事项：
- 重置链接24小时有效
- 新密码需包含大小写字母和数字
- 避免使用之前的密码
            ''',
            'tags': ['FAQ', '密码', '账号'],
            'importance': 10,
            'word_count': 70
        },
        {
            'title': '如何联系客服？',
            'summary': '客服联系方式和在线时间',
            'details': '''
客服联系方式：
1. 在线客服
   - 网站：点击右下角图标
   - 时间：工作日9:00-18:00
   - 响应时间：5分钟内

2. 电话客服
   - 号码：400-xxx-xxxx
   - 时间：工作日9:00-21:00
   - 周末10:00-18:00

3. 邮件客服
   - 邮箱：support@example.com
   - 响应时间：24小时内
            ''',
            'tags': ['FAQ', '客服', '联系'],
            'importance': 9,
            'word_count': 75
        }
    ]
    
    for faq in faqs:
        embedding = generate_mock_embedding()
        conv_id = memory.add_conversation(
            title=faq['title'],
            summary=faq['summary'],
            details=faq['details'],
            embedding=embedding,
            tags=faq['tags'],
            importance=faq['importance'],
            word_count=faq['word_count']
        )
        print(f"FAQ已保存: {faq['title']}")
```

### 智能问答

```python
def answer_customer_question(question: str):
    """根据客户问题查找相关答案"""
    with AIMemory() as memory:
        # 生成查询向量
        query_embedding = generate_mock_embedding()
        
        # 向量搜索
        similar = memory.search_similar(
            query_vector=query_embedding,
            limit=3,
            min_importance=8
        )
        
        if similar:
            print(f"找到相关答案 ({len(similar)}条):\n")
            
            for i, (id, title, summary, details, tags, imp, sim) in enumerate(similar, 1):
                print(f"{i}. [{sim:.4f}] {title}")
                print(f"   {details}")
                print()
        else:
            print("抱歉，没有找到相关答案，请联系人工客服。")

# 使用示例
answer_customer_question("我的密码忘记了怎么办？")
answer_customer_question("我想联系客服")
```

## 会议笔记管理

### 存储会议记录

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date

with AIMemory() as memory:
    meetings = [
        {
            'title': '项目启动会议',
            'summary': '新项目的技术选型和团队分工',
            'details': '''
会议时间：2024-01-20 14:00-16:00
参会人员：全体开发团队

讨论内容：
1. 技术栈选择
   - 前端：React + TypeScript
   - 后端：Python + FastAPI
   - 数据库：PostgreSQL
   - 部署：Docker + K8s

2. 团队分工
   - 张三：前端开发
   - 李四：后端API
   - 王五：数据库设计
   - 赵六：DevOps

3. 下一步行动
   - 技术调研（1周）
   - 架构设计（1周）
   - 开发环境搭建（3天）
            ''',
            'tags': ['会议', '项目', '启动'],
            'importance': 10,
            'word_count': 90
        },
        {
            'title': '周进度同步会议',
            'summary': '各模块进度汇报和问题讨论',
            'details': '''
会议时间：2024-01-25 10:00-11:00
参会人员：全体开发团队

进度汇报：
1. 前端模块
   - 完成：UI框架搭建
   - 进行中：登录页面
   - 计划：本周完成首页

2. 后端模块
   - 完成：API架构设计
   - 进行中：用户认证
   - 计划：数据接口

3. 数据库模块
   - 完成：表结构设计
   - 进行中：数据迁移
   - 计划：索引优化

问题讨论：
- 前后端接口对接时间确定
- 测试环境部署计划
            ''',
            'tags': ['会议', '进度', '同步'],
            'importance': 8,
            'word_count': 85
        }
    ]
    
    for meeting in meetings:
        embedding = generate_mock_embedding()
        conv_id = memory.add_conversation(
            title=meeting['title'],
            summary=meeting['summary'],
            details=meeting['details'],
            embedding=embedding,
            tags=meeting['tags'],
            importance=meeting['importance'],
            word_count=meeting['word_count'],
            date=date(2024, 1, 25)
        )
        print(f"会议记录已保存: {meeting['title']}")
```

### 查询会议记录

```python
with AIMemory() as memory:
    # 按日期范围查询
    start_date = date(2024, 1, 20)
    end_date = date(2024, 1, 31)
    
    meetings = memory.get_by_date_range(start_date, end_date)
    print(f"2024年1月的会议 ({len(meetings)}条):\n")
    
    for id, title, summary, dt, imp in meetings:
        print(f"{dt} - {title}")
        print(f"  {summary[:60]}...")
        print()
    
    # 按标签查询
    project_meetings = memory.get_by_tags(['项目'], limit=10)
    print(f"\n项目相关会议 ({len(project_meetings)}条)")
```

## 学习进度追踪

### 记录学习进度

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding
from datetime import date, timedelta

with AIMemory() as memory:
    topics = [
        {
            'title': 'Python学习进度',
            'summary': '第一周学习内容总结',
            'details': '''
第1周学习内容：
1. 环境搭建
   - Python 3.10安装
   - VS Code配置
   - pip包管理

2. 基础语法
   - 变量和数据类型
   - 条件语句
   - 循环结构

3. 实践练习
   - 完成5个基础练习
   - 编写简单脚本
   - 掌握基本调试

学习时长：10小时
进度评估：良好
            ''',
            'tags': ['Python', '学习', '进度'],
            'importance': 7,
            'word_count': 80,
            'date': date.today() - timedelta(days=7)
        },
        {
            'title': 'Python学习进度',
            'summary': '第二周学习内容总结',
            'details': '''
第2周学习内容：
1. 函数和模块
   - 函数定义
   - 参数传递
   - 模块导入

2. 数据结构
   - 列表操作
   - 字典使用
   - 集合和元组

3. 文件操作
   - 文件读写
   - JSON处理
   - CSV操作

学习时长：15小时
进度评估：优秀
            ''',
            'tags': ['Python', '学习', '进度'],
            'importance': 8,
            'word_count': 80,
            'date': date.today()
        }
    ]
    
    for topic in topics:
        embedding = generate_mock_embedding()
        conv_id = memory.add_conversation(
            title=topic['title'],
            summary=topic['summary'],
            details=topic['details'],
            embedding=embedding,
            tags=topic['tags'],
            importance=topic['importance'],
            word_count=topic['word_count'],
            date=topic['date']
        )
        print(f"学习记录已保存: {topic['summary']}")
```

### 查看学习统计

```python
with AIMemory() as memory:
    # 按主题统计
    python_records = memory.get_by_tags(['Python', '学习'], limit=20)
    
    print(f"Python学习记录 ({len(python_records)}条):\n")
    
    total_importance = 0
    for id, title, summary, tags, imp, dt in python_records:
        print(f"{dt} - {title}")
        print(f"  重要性: {imp}/10")
        print(f"  {summary[:60]}...")
        print()
        total_importance += imp
    
    print(f"总体评估: {total_importance/len(python_records):.1f}/10")
    
    # 获取最近7天的学习
    recent = memory.get_recent(days=7, limit=10)
    learning_recent = [r for r in recent if '学习' in memory.get_conversation(r[0])[3]]
    
    print(f"\n最近7天的学习 ({len(learning_recent)}条)")
```

## 高级模式

### 批量插入

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding

def batch_insert(memory, records, batch_size=100):
    """批量插入记录"""
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        
        for record in batch:
            embedding = generate_mock_embedding()
            memory.add_conversation(
                title=record['title'],
                summary=record['summary'],
                details=record['details'],
                embedding=embedding,
                tags=record['tags'],
                importance=record['importance'],
                word_count=record['word_count']
            )
        
        print(f"已插入 {min(i+batch_size, len(records))}/{len(records)} 条记录")

# 使用示例
records = [
    {
        'title': f'记录{i}',
        'summary': f'这是第{i}条记录',
        'details': f'详细内容...',
        'tags': ['批量'],
        'importance': 5,
        'word_count': 20
    }
    for i in range(1000)
]

with AIMemory() as memory:
    batch_insert(memory, records, batch_size=100)
```

### 标签分析

```python
with AIMemory() as memory:
    # 获取所有标签统计
    all_tags = memory.get_top_tags(limit=50)
    
    print("标签分析:")
    print(f"  总标签数: {len(all_tags)}")
    print(f"  使用最多的标签: {all_tags[0][0]} ({all_tags[0][1]}次)")
    print(f"  使用最少的标签: {all_tags[-1][0]} ({all_tags[-1][1]}次)")
    
    # 标签分布
    print("\n标签使用分布:")
    ranges = [(1, 5), (6, 10), (11, 20), (21, 100)]
    
    for min_count, max_count in ranges:
        tags_in_range = [t for t, c in all_tags if min_count <= c <= max_count]
        print(f"  {min_count}-{max_count}次: {len(tags_in_range)}个标签")
    
    # 标签组合分析
    print("\n常见标签组合:")
    tag_pairs = {}
    
    convos = memory.get_by_importance(min_importance=0, limit=1000)
    for id, title, summary, tags, imp, dt in convos:
        tags_list = memory.get_conversation(id)[3]
        for i in range(len(tags_list)):
            for j in range(i+1, len(tags_list)):
                pair = tuple(sorted([tags_list[i], tags_list[j]]))
                tag_pairs[pair] = tag_pairs.get(pair, 0) + 1
    
    # Top 10标签组合
    top_pairs = sorted(tag_pairs.items(), key=lambda x: x[1], reverse=True)[:10]
    for pair, count in top_pairs:
        print(f"  {' + '.join(pair)}: {count}次")
```

### 混合搜索

```python
from scripts.ai_memory import AIMemory, generate_mock_embedding

def hybrid_search(
    memory,
    query_text: str,
    tags: List[str],
    min_importance: int = 0,
    limit: int = 10
):
    """混合搜索：向量 + 标签 + 重要性"""
    query_embedding = generate_mock_embedding()
    
    # 向量搜索
    vector_results = memory.search_similar(
        query_vector=query_embedding,
        limit=limit * 2,  # 获取更多结果用于后续筛选
        min_importance=min_importance
    )
    
    # 筛选标签
    filtered_results = []
    for result in vector_results:
        id, title, summary, details, result_tags, imp, sim = result
        if all(tag in result_tags for tag in tags):
            filtered_results.append(result)
    
    # 排序并限制结果数量
    filtered_results.sort(key=lambda x: x[6], reverse=True)  # 按相似度排序
    return filtered_results[:limit]

# 使用示例
with AIMemory() as memory:
    results = hybrid_search(
        memory=memory,
        query_text='Python编程学习',
        tags=['Python', '学习'],
        min_importance=7,
        limit=5
    )
    
    print(f"混合搜索结果 ({len(results)}条):\n")
    for i, (id, title, summary, details, tags, imp, sim) in enumerate(results, 1):
        print(f"{i}. [{sim:.4f}] {title} (IMP:{imp})")
        print(f"   {summary[:60]}...")
        print()
```

### 自动重要性评分

```python
def auto_rate_importance(
    title: str,
    details: str,
    tags: List[str],
    word_count: int
) -> int:
    """自动评估对话重要性"""
    score = 5  # 基础分数
    
    # 根据标题关键词
    high_imp_keywords = ['架构', '设计', '核心', '关键', '重要', '最佳实践']
    for keyword in high_imp_keywords:
        if keyword in title:
            score += 1
            break
    
    # 根据details长度
    if word_count > 100:
        score += 1
    if word_count > 200:
        score += 1
    
    # 根据标签数量
    if len(tags) >= 4:
        score += 1
    
    # 限制在1-10范围
    return min(max(score, 1), 10)

# 使用示例
with AIMemory() as memory:
    embedding = generate_mock_embedding()
    
    title = '系统架构设计'
    details = '详细的系统架构...'
    tags = ['架构', '设计', '系统', '技术']
    word_count = 150
    
    auto_imp = auto_rate_importance(title, details, tags, word_count)
    print(f"自动评估的重要性: {auto_imp}/10")
    
    conv_id = memory.add_conversation(
        title=title,
        summary='系统架构设计讨论',
        details=details,
        embedding=embedding,
        tags=tags,
        importance=auto_imp,
        word_count=word_count
    )
```

## 总结

这些示例涵盖了AI记忆系统的各种实际应用场景：

1. **基础操作**: 增删查改的基本用法
2. **个人知识库**: 学习笔记的存储和检索
3. **文档管理**: 技术文档的组织和搜索
4. **客户支持**: FAQ管理和智能问答
5. **会议管理**: 会议记录的存储和查询
6. **学习追踪**: 学习进度的记录和统计
7. **高级模式**: 批量操作、标签分析、混合搜索等

根据你的具体需求，可以参考这些示例进行定制和扩展。
