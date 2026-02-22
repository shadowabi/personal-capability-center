# AI Memory - 安装教程

完整的AI记忆系统安装指南，使用Docker Compose快速部署。

## 目录

1. [系统要求](#系统要求)
2. [Docker安装](#docker安装)
3. [快速启动](#快速启动)
4. [配置连接](#配置连接)
5. [验证安装](#验证安装)
6. [常见问题](#常见问题)

## 系统要求

### Windows系统
- Windows 10/11（64位）
- 至少8GB RAM
- 至少20GB可用磁盘空间

### Linux系统
- Ubuntu 20.04/22.04
- 至少4GB RAM
- 至少10GB可用磁盘空间

### 必需软件
- Docker Desktop 4.0+ 或 Docker Engine 20.10+
- Docker Compose 2.0+
- Python 3.8+

## Docker安装

### Windows系统

#### 安装Docker Desktop

1. 下载Docker Desktop
   ```
   https://www.docker.com/products/docker-desktop
   ```

2. 运行安装程序
   - 双击安装程序
   - 按照提示完成安装
   - 重启计算机（如果提示）

3. 验证安装
   ```powershell
   docker --version
   docker compose version
   ```

4. 启用WSL2集成（推荐）
   - 打开Docker Desktop
   - Settings → General
   - 勾选 "Use WSL 2 based engine"

### Linux系统

#### 安装Docker Engine

```bash
# 更新包列表
sudo apt update

# 安装依赖
sudo apt install -y ca-certificates curl gnupg

# 添加Docker官方GPG密钥
sudo install -m 0755 -d /etc/apt/keyrings/docker.gpg
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置Docker仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新包列表
sudo apt update

# 安装Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 安装Docker Compose
sudo apt install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录以生效组权限
newgrp docker
```

## 快速启动

### 1. 获取AI Memory代码

```bash
# 克隆仓库（如果有）
git clone https://github.com/your-repo/ai-memory.git
cd ai-memory

# 或直接进入项目目录
cd path/to/ai-memory
```

### 2. 启动Docker容器

```bash
# 使用Docker Compose启动
docker compose up -d

# 查看启动日志
docker compose logs -f postgresql

# 查看容器状态
docker compose ps
```

### 3. 等待初始化完成

首次启动时，Docker容器会：
1. 拉取镜像：`pgvector/pgvector:pg16`
2. 启动PostgreSQL容器
3. 执行初始化脚本：`init-db.sh`
4. 创建数据库表和索引
5. 安装pgvector扩展

等待约1-2分钟完成初始化。

### 4. 验证容器状态

```bash
# 查看容器状态
docker compose ps

# 预期输出：
# NAME                    STATUS          PORTS
# ai-memory-postgres        Up (healthy)    127.0.0.1:5432->5432/tcp

# 查看容器日志
docker compose logs postgresql

# 查看健康状态
docker inspect ai-memory-postgres --format='{{.State.Health.Status}}'
```

## 配置连接

### 默认连接配置

使用Docker Compose启动的默认配置：
- Host: 127.0.0.1 (Docker host网络)
- Port: 5432
- Database: ai_memory
- User: ai_user
- Password: ai_password_123

```python
from scripts.ai_memory import AIMemory

# 使用默认配置连接
memory = AIMemory()
```

### 自定义配置

```python
memory = AIMemory(
    host='your-host',        # Docker host网络下使用127.0.0.1
    port=5432,
    database='your-database',
    user='your-user',
    password='your-password'
)
```

### 使用环境变量（推荐）

创建 `.env` 文件：

```env
# Database configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=ai_memory
DB_USER=ai_user
DB_PASSWORD=ai_password_123

# OpenAI API (可选，用于生成向量)
OPENAI_API_KEY=your-openai-api-key
```

在Python中使用：

```python
from dotenv import load_dotenv
from scripts.ai_memory import AIMemory
import os

load_dotenv()

memory = AIMemory(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
```

## 验证安装

### 1. 测试数据库连接

```bash
# 在容器内测试
docker compose exec postgresql psql -U ai_user -d ai_memory -c "SELECT version();"

# 预期输出：
# version
# ----------------------------------------------------
#  PostgreSQL 16.x on x86_64-pc-linux-gnu
```

### 2. 验证pgvector扩展

```bash
# 检查pgvector是否安装
docker compose exec postgresql psql -U ai_user -d ai_memory -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# 预期输出：
#  extname | extversion
# ---------+----------
#  vector   | 0.7.4
```

### 3. 验证表结构

```bash
# 查看所有表
docker compose exec postgresql psql -U ai_user -d ai_memory -c "\dt"

# 预期输出：
#              List of relations
#  Schema |    Name            | Type  |  Owner
# --------+-------------------+-------+----------
#  public  | tags             | table | ai_user
#  public  | conversation_tags | table | ai_user
#  public  | conversations     | table | ai_user
```

### 4. 测试向量操作

```bash
# 测试向量创建
docker compose exec postgresql psql -U ai_user -d ai_memory -c "SELECT '[0.1,0.2,0.3,0.4]'::vector(4);"

# 预期输出：
#      vector
# -------------------
#  {0.1,0.2,0.3,0.4}
```

### 5. 测试Python连接

创建测试脚本 `test_connection.py`：

```python
import psycopg2

try:
    conn = psycopg2.connect(
        host='127.0.0.1',
        port=5432,
        database='ai_memory',
        user='ai_user',
        password='ai_password_123'
    )
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()[0]
    print("✓ 数据库连接成功！")
    print(f"PostgreSQL版本: {version}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"✗ 数据库连接失败: {e}")
```

运行测试：

```bash
python test_connection.py
```

## 常见问题

### Q1: Docker无法启动

**问题**: `docker compose up -d` 失败

**解决方案**:
```bash
# 检查Docker是否运行
sudo systemctl status docker

# 启动Docker服务
sudo systemctl start docker

# 检查Docker日志
sudo journalctl -u docker -n 50
```

### Q2: 容器启动失败

**问题**: 容器状态为 `Exited`

**解决方案**:
```bash
# 查看容器日志
docker compose logs postgresql

# 常见原因：
# - 端口5432被占用
# - 权限问题
# - 配置错误

# 检查端口占用
sudo netstat -tulpn | grep 5432

# 如果端口被占用，停止占用进程或修改端口
```

### Q3: 连接被拒绝

**问题**: `connection refused`

**解决方案**:
```bash
# 确认容器在运行
docker compose ps

# 等待容器完全启动（约10-20秒）
docker compose logs postgresql

# 检查healthcheck状态
docker inspect ai-memory-postgres --format='{{.State.Health.Status}}'
```

### Q4: pgvector扩展错误

**问题**: `extension "vector" does not exist`

**解决方案**:
```bash
# 重新运行初始化脚本
docker compose exec postgresql /docker-entrypoint-initdb.d/init-db.sh

# 或手动安装
docker compose exec postgresql psql -U postgres -d ai_memory -c "CREATE EXTENSION vector;"
```

### Q5: 权限错误

**问题**: `permission denied for table conversations`

**解决方案**:
```bash
# 确保在docker-compose.yml中正确配置了环境变量
# POSTGRES_USER: ai_user
# POSTGRES_DB: ai_memory

# 重新初始化数据库
docker compose down -v
docker compose up -d
```

### Q6: Docker网络问题（WSL2）

**问题**: WSL2中的Docker容器无法从Windows访问

**解决方案**:

docker-compose.yml已配置 `network_mode: host`，这是最可靠的方案。

如果仍有问题：

```bash
# 检查WSL2网络模式
wsl.exe -d Ubuntu-22.04 bash -c "wslinfo --networking-mode"

# 应该输出：mirrored

# 检查容器网络
docker inspect ai-memory-postgres --format='{{.HostConfig.NetworkMode}}'

# 应该输出：host
```

### Q7: PostgreSQL频繁重启

**问题**: PostgreSQL容器每隔30-60秒重启一次

**解决方案**:

这是WSL2 Idle Timeout问题。已通过以下配置解决：

1. **更新.wslconfig**（Windows用户目录）:
```ini
[wsl2]
networkingMode=mirrored
localhostForwarding=true
vmIdleTimeout=-1
autoProxy=true

[experimental]
sparseVhd=true
autoMemoryReclaim=Disabled
```

2. **重启WSL2**:
```powershell
wsl --shutdown
```

3. **重新打开WSL2**:
- 打开任意WSL2终端
- Docker会自动重启
- PostgreSQL现在应该稳定运行

验证：
```bash
# 观察容器运行时间
watch -n 10 'docker ps | grep postgres'

# 应该看到容器稳定运行，不再频繁重启
```

## 配置文件说明

### docker-compose.yml

完整的Docker Compose配置文件，包含：
- PostgreSQL服务定义
- pgvector镜像配置
- 数据卷挂载
- 健康检查
- 环境变量

### init-db.sh

数据库初始化脚本，自动执行：
- 安装pgvector扩展
- 创建表结构
- 创建索引
- 设置权限

## 下一步

安装完成后，查看：
- [SKILL.md](SKILL.md) - 快速开始指南
- [API参考](references/API_REFERENCE.md) - 完整API文档
- [使用示例](references/EXAMPLES.md) - 代码示例

## 获取帮助

如果遇到问题：

1. 查看日志文件
2. 参考常见问题章节
3. 查看PostgreSQL和pgvector文档
4. 提交issue到GitHub仓库

## 许可证

MIT License
