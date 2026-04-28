# MCP Servers Documentation
## Model Context Protocol for Tamil Nadu Tourism

**Version:** 1.0  
**Status:** Production Ready  
**Date:** April 2026

---

## 📦 MCP Servers Included

### 1. Tamil Nadu Tourism MCP
**File:** `backend/mcp_server.py`

Core tourism functionality:
- Heritage graph analysis
- Attraction search and ranking
- Trip planning and optimization
- Weather integration
- Dynasty-based heritage filtering

### 2. STORM Knowledge Synthesis MCP
**File:** `backend/mcp_servers/storm_mcp_server.py`

Knowledge synthesis using STORM methodology:
- Wikipedia-quality content generation
- Multi-perspective research synthesis
- Heritage narrative creation
- Dynasty influence analysis
- Site cross-referencing

### 3. Neon Database MCP
**File:** `backend/mcp_servers/neon_mcp_server.py`

Serverless PostgreSQL via Neon:
- SQL query execution
- Tourism statistics
- Attraction CRUD operations
- User itinerary management
- Analytics and reporting

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install MCP CLI
pip install mcp[cli]

# Install PostgreSQL driver
pip install psycopg2-binary
```

### Running Individual Servers

```bash
# Tamil Nadu Tourism MCP
python backend/mcp_server.py

# STORM MCP
python backend/mcp_servers/storm_mcp_server.py

# Neon DB MCP
NEON_DATABASE_URL=your_url python backend/mcp_servers/neon_mcp_server.py
```

### Configuring in Claude Desktop

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tamil-nadu-tourism": {
      "command": "python",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
    },
    "storm-knowledge": {
      "command": "python",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_servers\\storm_mcp_server.py"]
    },
    "neon-database": {
      "command": "python",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_servers\\neon_mcp_server.py"],
      "env": {
        "NEON_DATABASE_URL": "postgresql://user:pass@host.neon.tech/tourism"
      }
    }
  }
}
```

---

## 🔧 Available Tools

### Tamil Nadu Tourism MCP

| Tool | Description |
|------|-------------|
| `get_heritage_graph` | SNA network with centrality, communities, PageRank |
| `list_itineraries` | Saved trip itineraries |
| `search_attractions` | Search by district/category |
| `get_top_attractions` | Ranked by user interests |
| `plan_trip_preview` | Generate trip plan |
| `get_weather_forecast` | Location weather |
| `list_districts` | 38 TN districts |
| `get_heritage_by_dynasty` | Dynasty-filtered sites |

### STORM MCP

| Tool | Description |
|------|-------------|
| `synthesize_research_topic` | Deep research synthesis |
| `generate_heritage_narrative` | Wikipedia-quality narratives |
| `analyze_dynasty_influence` | Dynasty impact analysis |
| `create_research_outline` | Structured research outline |
| `cross_reference_sites` | Site connection matrix |

### Neon DB MCP

| Tool | Description |
|------|-------------|
| `execute_query` | Raw SQL execution |
| `get_tourism_statistics` | Analytics dashboard |
| `search_attractions_db` | Database search |
| `get_itinerary_analytics` | User behavior analytics |
| `create_attraction` | Add new attraction |
| `update_attraction` | Modify attraction |
| `get_user_itineraries` | User's saved trips |
| `get_database_schema` | Schema information |

---

## 📊 Usage Examples

### Example 1: Plan a Heritage Trip

```
User: "Plan a 3-day Chola dynasty heritage trip from Chennai"

Claude uses:
1. get_heritage_by_dynasty("Chola") - Find Chola sites
2. plan_trip_preview("Thanjavur", 3, ["temple", "heritage"]) - Generate itinerary
3. get_weather_forecast(10.787, 79.1378) - Weather check
```

### Example 2: Research Temple Architecture

```
User: "Research Chola temple architecture for my paper"

Claude uses:
1. synthesize_research_topic("Chola temple architecture", depth="comprehensive")
2. analyze_dynasty_influence("Chola", aspect="architecture")
3. create_research_outline("Chola Architecture", style="academic")
```

### Example 3: Analyze Tourism Data

```
User: "What are the most popular districts for tourism?"

Claude uses:
1. get_tourism_statistics() - Overall stats
2. get_itinerary_analytics(days_back=90, group_by="destination")
3. execute_query("SELECT district, COUNT(*) FROM attractions GROUP BY district")
```

---

## 🗄️ Neon Database Setup

### Create Neon Account

1. Go to https://neon.tech
2. Sign up for free account
3. Create new project: `tamil-nadu-tourism`
4. Copy connection string

### Database Schema

```sql
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
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE itinerary_items (
    id SERIAL PRIMARY KEY,
    itinerary_id INTEGER REFERENCES itineraries(id),
    day INTEGER,
    time_of_day VARCHAR(50),
    activity_name VARCHAR(255),
    notes TEXT
);
```

### Environment Variables

```env
# .env.mcp
NEON_DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech/tourism?sslmode=require
DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech/tourism?sslmode=require
```

---

## 🧪 Testing MCP Servers

### Test Tamil Nadu Tourism MCP

```bash
cd backend
python test_mcp_server.py
```

### Test STORM MCP

```python
# test_storm.py
from mcp_servers.storm_mcp_server import synthesize_research_topic

result = synthesize_research_topic("Chola dynasty architecture")
print(result)
```

### Test Neon DB MCP

```python
# test_neon.py
import os
os.environ["NEON_DATABASE_URL"] = "your_neon_url"

from mcp_servers.neon_mcp_server import get_tourism_statistics

result = get_tourism_statistics()
print(result)
```

---

## 📁 File Structure

```
backend/
├── mcp_server.py              # Main Tourism MCP
├── mcp_servers/
│   ├── storm_mcp_server.py    # STORM Knowledge Synthesis
│   ├── neon_mcp_server.py     # Neon Database MCP
│   └── mcp_config.py          # Configuration templates
├── services/
│   ├── sna_service.py         # SNA heritage graph
│   ├── place_service.py       # Attraction fetching
│   └── ...
├── test_mcp_server.py         # Tests
└── .env                       # Environment variables
```

---

## 🔐 Security Notes

1. **Never commit API keys** - Use environment variables
2. **Use Neon's SSL mode** - `sslmode=require` in connection string
3. **Limit database permissions** - Use read-only users for querying
4. **Validate inputs** - MCP tools should sanitize user inputs

---

## 📚 Further Reading

- [MCP Documentation](https://modelcontextprotocol.io)
- [Neon Documentation](https://neon.tech/docs)
- [STORM Paper](https://arxiv.org/abs/2402.14207)

---

*Documentation for Tamil Nadu Tourism MCP Servers*
