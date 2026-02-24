# Personal Capability Center / 个人能力中心

[![GitHub issues](https://img.shields.io/github/issues/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/issues)
[![GitHub forks](https://img.shields.io/github/forks/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/network/members)
[![GitHub stars](https://img.shields.io/github/stars/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/stargazers)

Personal Capability Center是一个基于PostgreSQL + pgvector的个人知识管理系统，实现AI对话内容的结构化存储、可视化管理和智能化成长分析。

## 核心理念

### 能力提炼（核心）
每一次与AI的对话都可能带来认知跃迁。系统**不存储对话原文**，而是提炼对话中掌握的**可复用能力**，将零散的思考转化为可追溯、可分析的个人能力资产。

> **⚠️ 重要区分**：
> - **存储的是**：提炼后的能力（认知跃迁、能力定义、应用场景）
> - **不存储的是**：对话原文（冗余的试错、反复讨论过程）
> - **为什么**：能力可复用，对话不可复用。存能力=存智慧，存对话=存噪音

### 能力 vs 知识点
- **知识点**："市盈率 = 股价 / 每股收益"（是什么，不可复用）
- **能力**："动态估值能力：理解指标反映未来预期而非静态现实"（怎么用，可复用）
- **本系统专注**：存储**能力**，而非知识点

### 引导式成长
通过月度/年度报告功能，系统化回顾和总结，实现能力的持续迭代和提升。

### 系统能力
- **结构化存储**：将提炼的能力存储为可查询、可管理的结构化数据
- **语义搜索**：基于pgvector的向量搜索，实现智能化的能力检索
- **成长分析**：通过统计和报告功能，可视化展示能力成长轨迹

## 系统定义

Personal Capability Center由以下两部分组成：

### 1. ai-memory（Skill）
- 面向用户AI的SKILL模块
- 提供一整套操作记忆数据库写入和读取的功能
- 职责：数据写入

### 2. 可视化平台（前端 + 后端）
- 提供对话内容的查询、筛选与管理功能
- 支持月度/年度报告的自动生成
- 职责：数据读取、管理与分析

## 平台特性

### 智能记忆管理
- 能力的结构化存储（标题、能力定义、认知转变过程）
- 标签分类和管理
- 重要性标记（高/中/低）

### 能力盘点系统
- 能力列表查看和筛选
- 基于pgvector的语义搜索
- 统计分析功能

### 报告生成
- 月度/年度总结功能
- AI自动生成总结报告
- 报告保存回数据库

### 能力记录
- **SKILL模块**：Python SDK提供完整的数据库写入/读取API
- **可视化平台**：Web界面能力管理和查询
- **按需交互**：减少token消耗，仅在用户要求时产生交互

### 系统特性
- **私有化部署**：数据存储在本地PostgreSQL
- **模块化架构**：可接入不同AI工具（OpenCode、OpenClaw等）
- **按需写入/读取**：独立的系统，仅用户要求时产生交互

## 使用示例

### 场景1：记录AI能力
```
用户：使用 AI-Memory SKILL 总结当前对话并写入
AI：已保存能力到数据库（标题：如何使用PostgreSQL）
```

### 场景2：查询历史能力
```
用户：使用 AI-Memory SKILL 查看关于向量搜索的能力
AI：找到3条相关能力：
1. pgvector基础使用（2025-12-01）
2. 语义搜索优化（2025-12-05）
...
```

### 场景3：生成月度总结
1. 登录前端平台（http://localhost:5173）
2. 点击"月度总结"按钮
3. 后端调用OpenCode AI生成总结
4. 查看能力提升报告

### 场景4：通过 ai-memory Skill 将对话总结成能力（示例）

> **💡 功能说明**：这是 ai-memory Skill 提供的能力提炼功能，用于将单次对话中掌握的能力保存到数据库。
>
> **与月度总结的区别**：
> - **能力提炼**（本场景）：单次对话中掌握的具体能力（如"任务分解能力"）
> - **月度总结**（平台功能）：综合分析所有能力记录，生成更高层次的成长报告
>
> 本场景展示的是**能力提炼**过程。

假设你有以下对话内容：

```
用户:我总是完不成计划,每天列出10个任务,结果只能完成3个,很沮丧。

AI:你说只能完成3个任务,这3个任务有什么共同特点吗?

用户:通常是紧急但重要的事情,比如开会、回复邮件。那些完不成的都是重要但不紧急的,比如学习、锻炼。

AI:很有意思的观察。你觉得为什么重要但不紧急的事情总被推迟?

用户:因为它们没有截止日期,不做也不会立刻有后果。

AI:那么,如果我们给这些重要但不紧急的事情设定明确的截止日期,会有什么变化?

用户:嗯,可能会更容易开始。但是我还是会拖延。

AI:你提到了"拖延"。你觉得拖延的本质是什么?

用户:因为任务太大,不知道从哪里开始。

AI:如果一个大任务被分解成5个小任务,每个小任务只需要10分钟,你还会拖延吗?

用户:应该不会,因为10分钟的事情很容易做。

AI:那么,拖延的根源可能不是懒惰,而是任务太大导致的心理压力?

用户:对,这个角度我没想过。所以解决方案是:把大任务分解成小任务,每个小任务设定明确的截止日期?

AI:很好。你现在掌握了一套方法,能总结一下吗?

用户:1. 任务分解:大任务拆成10分钟的小任务
2. 设定截止日期:每个小任务都有明确截止时间
3. 优先处理重要但不紧急的事
```

**总结成能力的完整示例**：

```python
import sys
sys.path.insert(0, r'C:\Users\shadow\.config\opencode\skills\ai-memory')

from scripts.ai_memory import AIMemory, generate_mock_embedding

# ===== 要保存的内容 =====

# 1. title: 描述认知跃迁
title = "从'任务太多完不成'到'任务分解+截止日期'的认知跃迁"

# 2. summary: 结构化总结
summary = """问题背景: 每天列出10个任务,只能完成3个,感到沮丧

掌握的能力:
1. 任务分解能力: 将大任务拆分成10分钟的小任务
2. 截止日期设定能力: 每个小任务都有明确的截止时间
3. 优先级管理能力: 优先处理重要但不紧急的事情

深刻洞察:
- 拖延的根源不是懒惰,而是任务太大导致的心理压力
- 重要但不紧急的事情因为缺乏截止日期而被推迟
- 小任务因为容易开始,心理压力小"""

# 3. details: 完整思考过程
details = """问题背景:
- 初始情况: 每天列出10个任务,只能完成3个,感到沮丧
- 已有认知: 紧急的事情会完成,重要但不紧急的事情被推迟
- 困惑点: 为什么重要但不紧急的事情总被推迟?

---

我掌握的能力:

能力1: 任务分解能力
能力定义: 将大任务拆分成易于执行的小任务,降低心理压力
体现在深刻洞察:
- 大任务导致心理压力,拖延的本质不是懒惰
- 10分钟的小任务容易开始,心理压力小

认知转变过程:
- 原本认知: 拖延是因为懒惰,完不成任务是自制力差
- 引导提问: "你觉得拖延的本质是什么?"
- 引导追问: "如果一个大任务被分解成5个小任务,每个小任务只需要10分钟,你还会拖延吗?"
- 突破点: 意识到10分钟的事情很容易做,不会拖延
- 新认知: 拖延的根源是任务太大导致的心理压力,解决方案是任务分解

---

能力2: 截止日期设定能力
能力定义: 给任务设定明确的截止日期,制造紧迫感
体现在深刻洞察:
- 重要但不紧急的事情因为缺乏截止日期而被推迟
- 明确的截止日期能促进行动

认知转变过程:
- 原本认知: 重要但不紧急的事情因为不需要立刻做,所以总是被推后
- 引导提问: "如果我们给这些重要而不紧急的事情设定明确的截止日期,会有什么变化?"
- 认识到: 有截止日期的事情更容易开始
- 新认知: 重要但不紧急的事情需要人为制造截止日期

---

能力3: 优先级管理能力
能力定义: 优先处理重要但不紧急的事情,避免总是被紧急事情占据时间
体现在深刻洞察:
- 紧急但重要的事情会自动完成(开会、回复邮件)
- 完不成的是重要但不紧急的事情(学习、锻炼)
- 主动管理重要但不紧急的事情,才能避免被动应付

认知转变过程:
- 原本认知: 每天列出10个任务,能做多少算多少
- 引导观察: "你能完成的3个任务有什么共同特点?"
- 认识到: 完成的是紧急但重要的事情,完不成的是重要但不紧急的
- 引导澄清: "为什么重要但不紧急的事情总被推迟?"
- 突破点: 意识到必须主动管理重要但不紧急的事情
- 新认知: 优先处理重要但不紧急的事情,并用任务分解+截止日期的方法执行"""

# 4. tags: 标签分类
tags = ['时间管理', '任务管理', '认知跃迁']

# 5. importance: 重要性评分(1-10)
importance = 9

# 6. word_count: 字数统计
word_count = len(details)

# ===== 保存到数据库 =====

memory = AIMemory()
embedding = generate_mock_embedding()  # 生成模拟向量(实际应用中用真实的embedding模型)
conv_id = memory.add_conversation(
    title=title,
    summary=summary,
    details=details,
    embedding=embedding,
    tags=tags,
    importance=importance,
    word_count=word_count
)
print(f"保存成功,对话ID: {conv_id}")
memory.close()
```

**核心要点**：
- ✅ **title**: 描述认知跃迁（从"X"到"Y"）
- ✅ **summary**: 结构化总结，包含问题背景、掌握的能力、深刻洞察
- ✅ **details**: 完整思考过程，每个能力包含能力定义、体现在深刻洞察、认知转变过程
- ✅ **认知转变过程**: 原本认知 → 引导提问 → 突破点 → 新认知
- ✅ **能力 vs 知识点**: 能力是"怎么用"，可复用；知识点是"是什么"，不可复用

## 适用场景

- **AI能力管理**：长期保存从AI对话中提炼的能力，形成个人能力库
- **技能成长追踪**：通过月度/年度报告，系统化回顾学习成果
- **能力资源回顾**：基于语义搜索，快速找到历史相关能力
- **个人能力盘点**：通过统计分析，了解自己的能力成长轨迹

## 技术亮点

### 后端技术
- **FastAPI**：高性能异步Web框架，支持自动API文档生成
- **PostgreSQL 16 + pgvector**：支持向量相似度搜索，HNSW算法加速百万级向量检索

### 前端技术
- **React 18 + Vite**：现代化前端架构，极速构建体验
- **shadcn/ui**：高质量UI组件库
- **Framer Motion**：流畅的动画效果

### AI集成
- **Python SDK**：完整的AIMemory类，可直接调用数据库操作
- **渐进式加载**：三级加载机制（metadata → SKILL.md → references）

---

## 项目结构

```
ai-memory-dashboard/
├── skills/                   # Skills 目录
│   └── ai-memory/           # AI Memory Skill
│       ├── SKILL.md         # Skill 文档
│       ├── scripts/         # Python SDK
│       │   ├── ai_memory.py # AIMemory 类
│       │   ├── test_ai_memory.py  # 测试脚本
│       │   └── quick_test.py    # 快速测试
│       ├── references/      # 完整文档
│       │   ├── API_REFERENCE.md
│       │   ├── INSTALL.md
│       │   ├── CONTENT_GUIDELINES.md
│       │   ├── TESTING.md
│       │   ├── WSL2_TROUBLESHOOTING.md
│       │   ├── EXAMPLES.md
│       │   ├── LANGCHAIN.md
│       │   └── SCHEMA.md
│       └── .env.example     # 环境变量示例
│
├── backend/                   # 后端服务 (FastAPI)
│   ├── main.py              # FastAPI 主程序
│   ├── database.py          # 同步数据库连接
│   ├── database_async.py    # 异步数据库连接
│   ├── models.py            # Pydantic 数据模型
│   ├── routers/             # API 路由
│   │   ├── conversations.py # 对话管理 API
│   │   ├── search.py        # 搜索 API
│   │   ├── statistics.py    # 统计 API
│   │   └── summary.py       # 总结 API
│   ├── scripts/             # 工具脚本
│   │   └── init-db.sh       # 数据库初始化
│   ├── docker-compose.yml   # 数据库初始化
│   ├── requirements.txt     # Python 依赖
│   └── .env.example         # 环境变量示例
│
├── frontend/                 # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── App.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationDetail.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── SummaryPage.tsx
│   │   │   └── StatisticsPage.tsx
│   │   ├── services/         # API 调用服务
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript 类型定义
│   │   │   └── index.ts
│   │   ├── assets/           # 静态资源
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx          # 前端入口
│   ├── public/               # 公共静态文件
│   ├── package.json          # 前端依赖配置
│   ├── vite.config.ts        # Vite 配置
│   └── tsconfig.json        # TypeScript 配置
│
├── docs/                      # 项目文档
│   ├── ARCHITECTURE.md      # 系统架构文档
│   ├── DEVELOPMENT.md       # 开发指南
│   ├── API.md              # API 文档
│   └── DEPLOYMENT.md       # 部署指南
│
├── .gitignore              # Git 忽略文件配置
├── README.md              # 项目说明（本文件）
└── PRIVACY_CHECK.md       # 隐私检查指南
```

---

## 核心流程

```mermaid
flowchart TD
    subgraph 写入端
        A[用户与AI讨论] --> B[通过ai-memory Skill保存]
        B --> C[写入数据库]
    end
    
    subgraph 读取端
        C --> D[可视化平台查看]
        D --> E[搜索/筛选]
        E --> F[管理对话]
        F --> G[月度/年度总结]
        G --> H[AI生成总结]
        H --> C
    end
```

### 流程说明

1. **保存阶段**：用户与AI讨论有价值的内容 → 通过ai-memory Skill保存掌握的能力（抽象层）
2. **读取阶段**：可视化平台查看能力记录
3. **检索阶段**：关键词、标签、重要性等搜索
4. **管理阶段**：删除不需要的能力记录
5. **提炼阶段**：月度/年度能力盘点 → AI综合分析所有能力记录，进行体系化 → 保存回数据库

---

## 快速开始

### 环境要求

- **Docker** - 用于运行所有服务（数据库 + 后端 + 前端）
- **OpenCode**（可替换） - AI 助手，用于与数据库交互以及能力总结

### 部署方式对比

| 部署方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| Docker Compose | 快速启动、生产环境 | 一键部署、环境隔离 | 需要安装Docker |
| 手动部署 | 开发调试 | 灵活控制、便于调试 | 需要手动配置环境 |

---

### 方式一：使用 Docker Compose 一键部署（推荐）

#### 1. 启动所有服务

进入项目根目录，使用 Docker Compose 启动所有服务：

```bash
cd personal-capability-center
docker compose up -d
```

这会自动启动以下三个微服务：
- ✅ **PostgreSQL + pgvector** (端口 5432)
- ✅ **FastAPI 后端** (端口 8000)
- ✅ **React + Vite 前端** (端口 5173)

#### 2. 验证服务状态

查看所有服务是否正常运行：

```bash
docker compose ps
```

应该看到三个服务都显示为 `Up` 或 `Up (healthy)` 状态。

#### 3. 测试访问

**测试后端 API**：
```bash
curl http://localhost:8000/health
```
应该返回：`{"status":"healthy"}`

**测试前端**：
```bash
curl -I http://localhost:5173
```
应该返回 `HTTP/1.1 200 OK`

**查看 API 文档**：
访问 http://localhost:8000/docs

#### 4. 配置 OpenCode AI（可选）

如果你想使用月度/年度总结功能，需要配置 OpenCode AI：

```bash
# 复制配置模板
cd backend
cp .env.example .env

# 编辑 .env，填入你的配置
# AGENT_NAME=your-agent-name
# MODEL_ID=your-model-id
# PROVIDER_ID=your-provider-id
```

详细配置说明请参考：[CONFIGURATION.md](./CONFIGURATION.md)

#### 5. 停止服务

```bash
# 停止所有服务
docker compose stop

# 停止并删除容器
docker compose down

# 停止、删除容器和卷（会删除数据）
docker compose down -v
```

---

### 方式二：手动部署（开发调试）

> **注意**：手动部署需要手动配置环境变量。推荐使用Docker Compose一键部署。

#### Step 1: 启动数据库

进入后端目录，使用 Docker Compose 启动数据库：

```bash
cd backend
docker-compose up -d
```

数据库会自动执行初始化脚本，创建以下内容：
- ✅ pgvector 扩展
- ✅ conversations 表（对话记录）
- ✅ tags 表（标签）
- ✅ conversation_tags 关联表
- ✅ 向量列（用于语义搜索）

验证数据库是否启动成功：

```bash
docker ps | grep ai-memory-postgres
```

#### Step 2: 启动后端

##### 2.1 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

##### 2.2 配置环境变量

从示例配置文件创建 `.env` 文件：

```bash
# Windows (PowerShell)
cd backend
Copy-Item .env.example .env

# Linux/Mac
cd backend
cp .env.example .env
```

`.env` 文件包含以下配置：

```bash
# 数据库连接
AI_MEMORY_HOST=localhost
AI_MEMORY_PORT=5432
AI_MEMORY_DB=ai_memory
AI_MEMORY_USER=ai_user
AI_MEMORY_PASSWORD=ai_password_123

# 后端 API 服务
API_HOST=0.0.0.0
API_PORT=8000
# CORS 防护配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# OpenCode 集成
OPENCODE_API_URL=http://127.0.0.1:4096
```

**注意**：`.env` 文件已在 `.gitignore` 中，不会被提交到 Git 仓库。

##### 2.3 启动后端服务

```bash
python main.py
```

后端会运行在：**http://localhost:8000**

查看 API 文档：**http://localhost:8000/docs**

#### Step 3: 启动前端

##### 3.1 安装 Node.js 依赖

```bash
cd frontend
npm install
```

##### 3.2 启动前端开发服务器

```bash
npm run dev
```

前端会运行在：**http://localhost:5173**

---

### Step 4: 配置 OpenCode AI（可选，用于月度/年度总结）

如果你想使用月度/年度总结功能，需要配置 OpenCode AI：

#### 4.1 创建配置文件

```bash
cd backend
cp .env.example .env
```

#### 4.2 修改配置文件

编辑 `backend/.env`，添加 OpenCode 配置：

```bash
# OpenCode Agent 配置
AGENT_NAME=your-agent-name
MODEL_ID=your-model-id
PROVIDER_ID=your-provider-id

# OpenCode API 地址
OPENCODE_API_URL=http://127.0.0.1:4096
```

**如何获取配置信息**：
```bash
# 查看 available agents
curl -s http://127.0.0.1:4096/agent

# 查看 available models and providers
curl -s http://127.0.0.1:4096/config/providers
```

#### 4.3 重启后端服务

```bash
# 停止后端服务
# Ctrl+C 或 kill 进程

# 重新启动
cd backend
python main.py
```

详细配置说明请参考：[CONFIGURATION.md](./CONFIGURATION.md)

### Step 5: 部署 ai-memory Skill 到 OpenCode（可替换）

#### 5.1 找到 OpenCode skill 目录

通常位于：
```
C:\Users\{你的用户名}\.config\opencode\skills\
```

#### 5.2 复制 ai-memory 文件夹

```bash
# Linux/Mac
cp -r skills/ai-memory ~/.config/opencode/skills/

# Windows (PowerShell)
Copy-Item -Recurse skills/ai-memory "$env:USERPROFILE\.config\opencode\skills\"

# 或者手动复制 skills/ai-memory 文件夹到 OpenCode 的 skills 目录
```

复制后的目录结构：
```
skills/ai-memory/
├── SKILL.md              # 技能文档（~100行）
├── scripts/
│   └── ai_memory.py      # AIMemory 类
└── references/           # 完整文档
    ├── API_REFERENCE.md  # API 参考
    ├── INSTALL.md        # 详细安装指南
    ├── CONTENT_GUIDELINES.md  # 内容存储指南
    ├── TESTING.md        # 测试与验证
    └── WSL2_TROUBLESHOOTING.md # 故障排查
```

#### 5.3 重启 OpenCode（可替换）

重启你的 OpenCode，让技能系统加载更新后的 skill。

---

### Step 5: 开始使用

#### 5.1 通过 Skill 记录 AI 能力

现在你的 OpenCode AI 可以使用SKILL操作数据库：

```
查询：使用 AI-Memory SKILL 查看关于XXX的能力
插入：使用 AI-Memory SKILL 总结当前对话并写入
```

#### 5.2 通过前端查看和管理

访问 **http://localhost:5173**

**完整工作流程**：
1. 与 AI 讨论有价值的内容
2. 通过 Skill 保存到数据库（记录掌握的能力、深刻洞察、认知转变）
3. 前端查看和管理（能力记录列表、搜索、统计）
4. 点击月度/年度能力盘点
5. 后端调用 OpenCode 综合分析所有能力记录
6. 总结保存回数据库（你查看能力成长轨迹、能力评估、成长建议）
7. 继续与 AI 讨论...

---

## 技术栈

### 后端
- **FastAPI** - 高性能异步Web框架
- **PostgreSQL 16** - 关系型数据库
- **pgvector** - 向量相似度搜索，支持HNSW算法加速百万级向量检索
- **httpx** - 异步HTTP客户端
- **Pydantic** - 数据验证

### 前端
- **React 18** - UI框架
- **Vite** - 极速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **shadcn/ui** - 高质量UI组件库
- **Framer Motion** - 动画库

### AI Memory Skill
- **Python SDK** - 完整的AIMemory类，可直接调用数据库操作
- **渐进式加载** - 三级加载机制（metadata → SKILL.md → references）
- **API完整** - 所有方法的完整文档和示例

---

## 故障排查

### 后端启动失败

```bash
# 检查PostgreSQL是否运行
docker ps | grep postgresql

# 查看后端日志
cd backend
cat backend.log
```

### 数据库连接失败

```bash
# 测试数据库连接
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT version();"
```

### OpenCode API调用失败

```bash
# 检查OpenCode是否运行
curl http://127.0.0.1:4096/health

# 检查.env配置（Docker部署）
docker exec ai-memory-backend env | grep -E '(AGENT_NAME|MODEL_ID|PROVIDER_ID)'

# 检查.env配置（手动部署）
cat backend/.env | grep -E '(AGENT_NAME|MODEL_ID|PROVIDER_ID)'

# 查看后端日志
docker logs ai-memory-backend
```

详细配置请参考：[CONFIGURATION.md](./CONFIGURATION.md)

### Windows WSL2问题

- 确保Docker Desktop正在运行
- 检查WSL2版本：`wsl --version`
- 参考`skills/ai-memory/references/WSL2_TROUBLESHOOTING.md`

---

## 完整文档

更详细的文档请参考：

### 核心文档
- **README.md** - 项目概述和快速开始（本文件）

### AI Memory Skill
- **AI Memory Skill**：`skills/ai-memory/SKILL.md` - Python SDK完整文档
- **API参考**：`skills/ai-memory/references/API_REFERENCE.md` - 所有API方法说明
- **安装指南**：`skills/ai-memory/references/INSTALL.md` - 详细的安装步骤
- **内容存储**：`skills/ai-memory/references/CONTENT_GUIDELINES.md` - 如何正确存储对话内容
- **测试验证**：`skills/ai-memory/references/TESTING.md` - 测试脚本和验证方法
- **故障排查**：`skills/ai-memory/references/WSL2_TROUBLESHOOTING.md` - WSL2和PostgreSQL问题

### 后端文档
- **后端安装指南**：`backend/docs/INSTALL.md`
- **后端 API 参考**：`backend/docs/references/API_REFERENCE.md`

### 配置文档
- **完整配置指南**：[CONFIGURATION.md](./CONFIGURATION.md) - OpenCode AI 配置、环境变量说明、故障排查

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---
