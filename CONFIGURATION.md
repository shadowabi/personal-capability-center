# 个人配置说明

本仓库支持通过环境变量配置 OpenCode AI，这样每个人都可以使用自己的配置，而不会上传个人敏感信息到 GitHub。

## 配置步骤

### 1. 创建个人配置文件

进入 backend 目录，复制示例配置文件：

```bash
cd backend
cp .env.example .env
```

### 2. 修改 `.env` 文件

编辑 `backend/.env`，填入你的实际配置：


### 3. 如何获取 OPENCODE 配置信息

#### 获取 Agent 名称

在 OpenCode Web 界面查看你的 agents：

```bash
curl -s http://127.0.0.1:4096/agent
```

#### 获取可用的 Models 和 Providers

查看 OpenCode 中配置的模型：

```bash
curl -s http://127.0.0.1:4096/config/providers
```

返回示例：
```json
[
  {
    "id": "zai-coding-plan",
    "models": [
      {"id": "glm-4.7", "name": "GLM-4.7"},
      {"id": "gpt-4", "name": "GPT-4"}
    ]
  }
]
```

从返回结果中找到你要使用的 `providerID` 和 `modelID`。

### 4. 重启服务

配置完成后，重启 backend 服务：

```bash
cd F:\test\ai-memory-dashboard
docker compose up -d backend
```

### 5. 验证配置

检查配置是否生效：

```bash
# 查看环境变量
docker exec ai-memory-backend env | grep -E '(AGENT_NAME|MODEL_ID|PROVIDER_ID)'

# 测试 API
curl http://localhost:8000/api/monthly
```


## 常见问题

### Q: 如果没有 OpenCode 怎么办？

A: 月度/年度总结功能需要 OpenCode AI 支持。如果不需要此功能，可以忽略 `.env` 文件。

### Q: 可以使用不同的 AI 模型吗？

A: 可以！只要在 OpenCode 中配置了对应的 provider 和 model，然后在 `.env` 中指定即可。

### Q: 配置错误会怎样？

A: 如果配置错误，`/api/monthly` 和 `/api/yearly` 会返回 500 错误。查看 backend 日志可以获取详细信息：

```bash
docker logs ai-memory-backend
```