# Vercel Deployment Guide
## Tamil Nadu Tourism + MCP Servers

---

## 🚀 Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Frontend

```bash
cd C:\Users\HP\Desktop\tourism
vercel
```

### Step 4: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```env
VITE_GEMINI_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
VITE_OLA_MAPS_API_KEY=your_key
VITE_NVIDIA_API_KEY=your_key
VITE_MISTRAL_API_KEY=your_key
VITE_TOGETHER_API_KEY=your_key
VITE_COHERE_API_KEY=your_key
VITE_OPENROUTER_API_KEY=your_key
VITE_SARVAM_API_KEY=your_key
```

### Step 5: Configure Build Settings

**vercel.json** (already exists):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🗄️ Backend Deployment Options

### Option A: Vercel Serverless Functions

Create `api/` folder for serverless functions:

```javascript
// api/graph.js - Heritage graph endpoint
export default async function handler(req, res) {
  const { computeChennaiSNA } = await import('../src/services/chennaiSNA.js');
  const data = await computeChennaiSNA();
  res.json(data);
}
```

### Option B: Neon Database + Vercel Edge

1. Create Neon project at https://neon.tech
2. Get connection string
3. Use Vercel Edge Functions for database queries

```javascript
// api/analytics.js
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  const { rows } = await pool.query('SELECT * FROM attractions LIMIT 10');
  res.json(rows);
}
```

### Option C: Railway / Render / Fly.io (Recommended for Backend)

Better for FastAPI + MCP servers:

**Dockerfile** (already exists):

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

**Railway Deployment:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

---

## 📊 Neon Database Setup

### 1. Create Neon Project

```bash
# Via CLI (optional)
npm install -g neonctl
neon auth
neon projects create --name tamil-nadu-tourism
```

Or via dashboard at https://neon.tech

### 2. Get Connection String

```env
NEON_DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/tourism?sslmode=require
```

### 3. Initialize Schema

```sql
-- Run in Neon SQL Editor
CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100),
    category VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    description TEXT,
    address TEXT,
    opening_hours VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE itineraries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(255),
    destination VARCHAR(100),
    start_date DATE,
    end_date DATE,
    summary TEXT,
    green_score DECIMAL(5, 2),
    total_cost VARCHAR(50),
    travel_style VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      # Deploy to Railway/Render
```

---

## 🌐 Environment Variables Checklist

### Frontend (Vercel)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_GEMINI_API_KEY` | Primary AI | ✅ |
| `VITE_GROQ_API_KEY` | Secondary AI | ✅ |
| `VITE_OLA_MAPS_API_KEY` | Maps | ✅ |
| `VITE_NVIDIA_API_KEY` | Nemotron AI | ⚪ |
| `VITE_SARVAM_API_KEY` | Tamil translation | ⚪ |

### Backend (Neon/Railway)

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEON_DATABASE_URL` | PostgreSQL connection | ✅ |
| `DATABASE_URL` | Fallback DB | ✅ |
| `SECRET_KEY` | JWT secret | ✅ |
| `NVIDIA_API_KEY` | AI insights | ⚪ |

---

## 🔗 API Endpoints

### Frontend → Backend

```javascript
// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getHeritageGraph() {
  const res = await fetch(`${API_BASE}/api/graph`);
  return res.json();
}

export async function getAttractions(district) {
  const res = await fetch(`${API_BASE}/api/attractions?district=${district}`);
  return res.json();
}
```

### MCP Server Connections

MCP servers run locally or in your IDE. They don't need public deployment.

---

## ✅ Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Set frontend environment variables
- [ ] Deploy frontend to Vercel
- [ ] Create Neon database
- [ ] Initialize database schema
- [ ] Set backend environment variables
- [ ] Deploy backend to Railway/Render
- [ ] Configure CORS for frontend domain
- [ ] Test API connectivity
- [ ] Enable Vercel Analytics (optional)

---

## 🚨 Troubleshooting

### Build Errors

```bash
# Clear Vercel cache
vercel --force

# Check build logs
vercel logs
```

### Environment Variables Not Loading

- Ensure `VITE_` prefix for frontend vars
- Redeploy after adding new vars
- Check Vercel dashboard for correct values

### Neon Connection Issues

```bash
# Test connection
psql "postgresql://user:pass@host.neon.tech/tourism?sslmode=require"

# Check SSL mode is required
sslmode=require
```

### CORS Errors

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📈 Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics

### Neon Monitoring

- Dashboard shows query performance
- Connection pooling stats
- Storage usage

### Application Logging

```python
# backend/main.py
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    return response
```

---

## 🔐 Security

### Production Checklist

- [ ] Enable Vercel's DDoS protection
- [ ] Set up Neon's IP allowlisting
- [ ] Use environment variables (never commit keys)
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Add authentication to sensitive endpoints

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Railway Docs](https://docs.railway.app)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

*Deployment guide for Tamil Nadu Tourism platform*
