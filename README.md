# Personal Capability Center

[![GitHub issues](https://img.shields.io/github/issues/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/issues)
[![GitHub forks](https://img.shields.io/github/forks/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/network/members)
[![GitHub stars](https://img.shields.io/github/stars/shadowabi/personal-capability-center)](https://github.com/shadowabi/personal-capability-center/stargazers)

Personal Capability Center is a personal knowledge management system based on PostgreSQL + pgvector, enabling structured storage, visual management, and intelligent growth analysis of AI conversation content.

## Core Features

- **Record User Capabilities**: Use the ai-memory Skill to extract capabilities from conversations and save them to the database
- **Manage Capability Records**: Visual platform to view, search, and delete capability records
- **Generate Capability Summary Reports**: Monthly/yearly summaries to analyze capability growth trajectories

---

## Quick Start

### 1. Start Services

Navigate to the project root directory and start all services using Docker Compose:

```bash
cd personal-capability-center
docker compose up -d
```

### 2. Verify Successful Startup

Check if all services are running properly:

```bash
docker compose ps
```

You should see all three services showing `Up` or `Up (healthy)` status.

Access the frontend at: http://localhost:5173

### 3. Configuration (Optional)

If you need to use the monthly/yearly summary feature, configure OpenCode AI:

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your configuration
```

For detailed configuration instructions, refer to: [CONFIGURATION.md](./CONFIGURATION.md)

---

## Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **PostgreSQL 16** - Relational database
- **pgvector** - Vector similarity search, supporting HNSW algorithm for million-level vector retrieval
- **httpx** - Async HTTP client
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI component library
- **Framer Motion** - Animation library

---

## Usage Examples

### Scenario 1: Record AI Capabilities
```
User: Use AI-Memory SKILL to summarize the current conversation and write it
AI: Capability saved to database (title: How to Use PostgreSQL)
```

### Scenario 2: Query Historical Capabilities
```
User: Use AI-Memory SKILL to view capabilities about vector search
AI: Found 3 related capabilities:
1. pgvector Basic Usage (2025-12-01)
2. Semantic Search Optimization (2025-12-05)
...
```

### Scenario 3: Generate Monthly Summary
1. Log in to the frontend platform (http://localhost:5173)
2. Click the "Monthly Summary" button
3. Backend calls OpenCode AI to generate the summary
4. View the capability summary report

---

## Troubleshooting

### Backend Startup Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgresql

# View backend logs
cd backend
cat backend.log
```

### Database Connection Failed

```bash
# Test database connection
PGPASSWORD=ai_password_123 psql -h localhost -U ai_user -d ai_memory -c "SELECT version();"
```

### OpenCode API Call Failed

```bash
# Check if OpenCode is running
curl http://127.0.0.1:4096/health

# Check .env configuration
docker exec ai-memory-backend env | grep -E '(AGENT_NAME|MODEL_ID|PROVIDER_ID)'

# View backend logs
docker logs ai-memory-backend
```

For detailed configuration, refer to: [CONFIGURATION.md](./CONFIGURATION.md)

---

## Complete Documentation

For more detailed documentation, please refer to:

### Core Documentation
- **README.md** - Project overview and quick start (this file)

### AI Memory Skill
- **AI Memory Skill**: `skills/ai-memory/SKILL.md` - SKILL main file

### Backend Documentation
- **Backend Installation Guide**: `backend/docs/INSTALL.md`
- **Backend API Reference**: `backend/docs/references/API_REFERENCE.md`

### Configuration Documentation
- **Complete Configuration Guide**: [CONFIGURATION.md](./CONFIGURATION.md) - Configuration and environment variable explanations

---

## Contributing

Welcome to submit Issues and Pull Requests!

---