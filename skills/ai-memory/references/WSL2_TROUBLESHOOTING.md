# WSL2 + Windows环境配置和故障排查

本文档提供WSL2环境下运行PostgreSQL并通过Windows访问的完整配置和故障排查指南。

## 目录

- [环境背景](#环境背景)
- [PostgreSQL配置](#postgresql配置)
- [WSL2 Mirror模式问题](#wsl2-mirror模式问题)
- [连接问题排查](#连接问题排查)
- [PostgreSQL频繁重启问题](#postgresql频繁重启问题)
- [Python psycopg2连接配置](#python-psycopg2连接配置)
- [推荐配置](#推荐配置)

## 环境背景

- **WSL2**: Ubuntu 22.04运行在WSL2中
- **Windows**: Windows 11，使用WSL2 mirror模式
- **PostgreSQL**: 16运行在WSL2中
- **访问方式**: Windows通过psycopg2连接到WSL2中的PostgreSQL

## PostgreSQL配置

### 1. 监听地址配置

**问题**: 从Windows连接到WSL2中的PostgreSQL失败

**错误理解**: 认为需要将PostgreSQL监听限制为localhost以确保安全

**正确做法**:
```ini
# /etc/postgresql/16/main/postgresql.conf
listen_addresses = '*'  # 必须监听0.0.0.0才能从Windows访问
```

**原因**: PostgreSQL运行在WSL2中，Windows是外部客户端，必须监听所有网络接口。

### 2. 安全性通过pg_hba.conf控制

**问题**: 担心`listen_addresses = '*'`不安全

**解决方案**: 通过`pg_hba.conf`严格限制访问范围

```ini
# /etc/postgresql/16/main/pg_hba.conf
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             192.168.1.0/24          md5
host    all             all             ::1/128                 md5
```

**关键点**:
- ✅ `listen_addresses = '*'` - 允许外部访问（跨OS必要）
- ✅ `pg_hba.conf` - 限制谁可以连接（安全性保证）
- ❌ 不要只依赖`listen_addresses = localhost`来保证安全

### 3. 重启PostgreSQL使配置生效

```bash
sudo systemctl restart postgresql
```

## WSL2 Mirror模式问题

### Localhost转发不稳定

**问题**: 尝试使用127.0.0.1连接WSL2服务，连接不稳定

**现象**:
- 有时127.0.0.1可以连接
- 有时127.0.0.1连接被拒绝
- WSL IP (如192.168.1.6) 稳定工作

**原因**: WSL2 mirror模式的localhost转发存在已知的不稳定性

### 建议方案

**方案1: 使用WSL IP（推荐）**
```python
# ✅ 稳定且安全
memory = AIMemory(host='192.168.1.6')  # WSL的实际IP地址
```

**优点**:
- 完全稳定
- 配置简单
- 安全性通过pg_hba.conf保证

**方案2: 配置.wslconfig（不推荐）**

如果一定要使用127.0.0.1，创建`%USERPROFILE%\.wslconfig`:
```
[wsl2]
networkingMode=mirrored
localhostForwarding=true
```

然后重启WSL:
```powershell
wsl --shutdown
```

**缺点**:
- 需要管理员权限
- 需要重启WSL
- 仍有不稳定性问题（WSL2已知问题）

### 检查WSL2网络模式

```bash
# 在WSL中检查
wslinfo --networking-mode

# 输出示例
# Mode: Mirrored
```

## 连接问题排查

遇到连接问题时，按以下步骤排查：

### 1. 检查PostgreSQL是否运行

```bash
wsl.exe -d Ubuntu-22.04 bash -c "systemctl status postgresql"
```

### 2. 检查监听端口

```bash
wsl.exe -d Ubuntu-22.04 bash -c "ss -tlnp | grep 5432"
```

**预期输出**:
```
LISTEN  0  0  0.0.0.0:5432  0.0.0.0:*  users:(("postgres",pid=1234,fd=5))
LISTEN  0  0  [::]:5432       [::]:*  users:(("postgres",pid=1234,fd=6))
```

### 3. 测试从WSL内部连接

```bash
wsl.exe -d Ubuntu-22.04 bash -c "PGPASSWORD=ai_password_123 psql -h 127.0.0.1 -U ai_user -d ai_memory -c 'SELECT 1;'"
```

### 4. 测试网络连通性

```bash
# Ping测试
ping 192.168.1.6

# TCP连接测试
curl http://192.168.1.6:5432
# 预期输出: Connection refused (因为PostgreSQL使用PostgreSQL协议，不是HTTP)
```

### 5. 检查pg_hba.conf配置

```bash
wsl.exe -d Ubuntu-22.04 bash -c "grep -E '^(host|local)' /etc/postgresql/16/main/pg_hba.conf"
```

### 6. 检查PostgreSQL日志

```bash
wsl.exe -d Ubuntu-22.04 bash -c "sudo tail -50 /var/log/postgresql/postgresql-16-main.log"
```

## PostgreSQL频繁重启问题 ⚠️ **常见问题**

### 问题现象

PostgreSQL服务每17-148秒被systemd停止和启动，循环往复。

### 可能原因

- WSL2 systemd配置问题
- 资源限制
- 其他进程干扰
- 服务持久化问题

### 排查步骤

#### 1. 检查系统日志

```bash
wsl.exe -d Ubuntu-22.04 bash -c "journalctl -u postgresql --since '10 minutes ago' --no-pager"
```

#### 2. 检查PostgreSQL日志

```bash
wsl.exe -d Ubuntu-22.04 bash -c "sudo tail -50 /var/log/postgresql/postgresql-16-main.log"
```

**关键日志**: 如果看到`received fast shutdown request`，说明是systemd主动停止PostgreSQL。

#### 3. 检查OOM killer

```bash
wsl.exe -d Ubuntu-22.04 bash -c "dmesg | grep -i 'oom'"
```

#### 4. 关键排查：检查服务持久化状态 ⭐

```bash
# 检查PostgreSQL服务的持久化状态
wsl.exe -d Ubuntu-22.04 bash -c "systemctl show postgresql@16-main.service -p UnitFileState"
```

**输出解读**:
- `enabled-runtime` ❌ - 运行时临时启用，会受WSL2运行时目录清理影响
- `enabled` ✅ - 持久化启用，稳定运行

### WSL2 Systemd持久化问题（常见坑）

#### 问题根源

- WSL2的systemd会定期清理`/run/user/<uid>`等运行时目录（GitHub Issue: microsoft/WSL #13562）
- PostgreSQL服务的依赖文件存储在这些目录中
- systemd检测到文件丢失后，停止并重启PostgreSQL
- 循环周期：17-148秒

#### 识别方法

```bash
# 检查服务状态
wsl.exe -d Ubuntu-22.04 bash -c "systemctl show postgresql@16-main.service -p UnitFileState -p UnitFilePreset"

# 检查是否有持久化symlink
wsl.exe -d Ubuntu-22.04 bash -c "ls -la /etc/systemd/system/multi-user.target.wants/postgresql@*"
```

**预期输出**:

**正确情况（持久化）**:
```
UnitFileState=enabled
lrwxrwxrwx 1 root root 39 Feb 22 03:58 /etc/systemd/system/multi-user.target.wants/postgresql@16-main.service -> /lib/systemd/system/postgresql@.service
```

**错误情况（运行时）**:
```
UnitFileState=enabled-runtime
# 没有持久化symlink
```

#### ✅ 解决方案：持久化启用PostgreSQL服务

```bash
# 启用持久化服务
wsl.exe -d Ubuntu-22.04 bash -c "sudo systemctl enable postgresql@16-main.service"

# 验证持久化symlink已创建
wsl.exe -d Ubuntu-22.04 bash -c "ls -la /etc/systemd/system/multi-user.target.wants/postgresql@*"

# 验证服务状态
wsl.exe -d Ubuntu-22.04 bash -c "systemctl show postgresql@16-main.service -p UnitFileState"
```

**预期结果**:
```
# Symlink创建成功
lrwxrwxrwx 1 root root 39 Feb 22 03:58 /etc/systemd/system/multi-user.target.wants/postgresql@16-main.service -> /lib/systemd/system/postgresql@.service

# UnitFileState变为enabled
UnitFileState=enabled
```

#### 验证修复

```bash
# 等待2-3分钟观察稳定性
sleep 180

wsl.exe -d Ubuntu-22.04 bash -c "systemctl is-active postgresql@16-main.service"

# 测试数据库连接
python -c "import psycopg2; conn=psycopg2.connect(host='192.168.1.6',port=5432,database='ai_memory',user='ai_user',password='ai_password_123',connect_timeout=5); print('OK'); conn.close()"
```

#### 相关GitHub Issues

- [microsoft/WSL #13562](https://github.com/microsoft/WSL/issues/13562) - WSL2运行时目录清理问题
- [microsoft/WSL #11822](https://github.com/microsoft/WSL/issues/11822) - WSL2 systemd服务启动问题

#### 总结

1. **问题**: WSL2 systemd定期清理`/run/user/<uid>`，导致`enabled-runtime`服务停止
2. **识别**: `UnitFileState=enabled-runtime`且没有持久化symlink
3. **解决**: `systemctl enable postgresql@16-main.service`创建持久化symlink
4. **验证**: 服务稳定运行2-3分钟，不再频繁重启
5. **预防**: 安装完成后立即执行`systemctl enable`，避免遇到此问题

#### 其他临时解决方案（如果上述方法无效）

- 检查WSL2资源分配
- 避免频繁运行`systemctl restart`命令
- 监控PostgreSQL日志，确认是systemd主动停止（`received fast shutdown request`）

## Python psycopg2连接配置

### Windows连接WSL2中的PostgreSQL

```python
import psycopg2

# ✅ 使用WSL IP（推荐）
conn = psycopg2.connect(
    host='192.168.1.6',  # WSL的实际IP
    port=5432,
    database='ai_memory',
    user='ai_user',
    password='ai_password_123',
    connect_timeout=5
)

# ⚠️ 使用localhost（可能不稳定）
conn = psycopg2.connect(
    host='127.0.0.1',
    port=5432,
    database='ai_memory',
    user='ai_user',
    password='ai_password_123',
    connect_timeout=5
)
```

### 连接字符串格式

```python
# DSN格式
dsn = "postgresql://ai_user:ai_password_123@192.168.1.6:5432/ai_memory"
conn = psycopg2.connect(dsn)

# 参数格式
conn = psycopg2.connect(
    host='192.168.1.6',
    port=5432,
    database='ai_memory',
    user='ai_user',
    password='ai_password_123'
)
```

### 测试连接

```bash
# 从Windows测试连接
python -c "import psycopg2; conn=psycopg2.connect(host='192.168.1.6',port=5432,database='ai_memory',user='ai_user',password='ai_password_123'); print('OK'); conn.close()"
```

## 推荐配置

### 生产环境配置（WSL2 + Windows）

#### PostgreSQL配置

```ini
# /etc/postgresql/16/main/postgresql.conf
listen_addresses = '*'

# /etc/postgresql/16/main/pg_hba.conf
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             192.168.1.0/24          md5
host    all             all             ::1/128                 md5
```

#### Python连接配置

```python
# Python连接配置
DB_CONFIG = {
    'host': '192.168.1.6',  # 使用WSL IP，稳定可靠
    'port': 5432,
    'database': 'ai_memory',
    'user': 'ai_user',
    'password': 'ai_password_123'
}

memory = AIMemory(**DB_CONFIG)
```

#### 验证配置

```bash
# 从Windows测试连接
python -c "import psycopg2; conn=psycopg2.connect(host='192.168.1.6',port=5432,database='ai_memory',user='ai_user',password='ai_password_123'); print('OK'); conn.close()"

# 测试数据库查询
python check_ai_memory.py
```

## 常见问题快速参考

### 连接被拒绝

```bash
# 1. 检查PostgreSQL是否运行
wsl.exe -d Ubuntu-22.04 bash -c "systemctl status postgresql"

# 2. 检查监听端口
wsl.exe -d Ubuntu-22.04 bash -c "ss -tlnp | grep 5432"

# 3. 检查pg_hba.conf
wsl.exe -d Ubuntu-22.04 bash -c "grep -E '^(host|local)' /etc/postgresql/16/main/pg_hba.conf"
```

### PostgreSQL频繁重启

```bash
# 检查持久化状态
wsl.exe -d Ubuntu-22.04 bash -c "systemctl show postgresql@16-main.service -p UnitFileState"

# 如果是enabled-runtime，执行
wsl.exe -d Ubuntu-22.04 bash -c "sudo systemctl enable postgresql@16-main.service"
```

### Localhost连接不稳定

```bash
# 使用WSL IP替代localhost
# 获取WSL IP
wsl.exe -d Ubuntu-22.04 bash -c "ip addr show eth5 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1"
```

## 相关资源

- [AI Memory主文档](../SKILL.md)
- [安装指南](INSTALL.md)
- [API参考](API_REFERENCE.md)
- [数据库架构](SCHEMA.md)
