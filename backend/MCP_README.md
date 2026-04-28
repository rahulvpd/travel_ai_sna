# Tamil Nadu Tourism MCP Server

**Status: READY** - The MCP server is fully installed and tested. See configuration below.

Model Context Protocol server for the Tamil Nadu Tourism AI application. This server exposes tourism tools and data to MCP-compatible AI assistants like Claude Desktop, Cursor, Windsurf, and VS Code extensions.

## Why MCP?

MCP (Model Context Protocol) is an open standard that allows AI assistants to securely connect to external data sources and tools. Instead of building custom integrations for each AI tool, you create one MCP server that works with all MCP-compatible clients.

**Why multiple clients?** Different AI assistants excel at different tasks:
- **Claude Desktop** - Best for conversational AI with tool use, natural language queries
- **Cursor** - Code-aware AI that can invoke tools while editing
- **Windsurf** - IDE-integrated AI with MCP support
- **Continue** - Open-source alternative for VS Code

Choose based on your workflow. The same MCP server works with all of them.

**Supported Clients:**

## Quick Start

### 1. Install Dependencies (Already Done)

```bash
cd C:\Users\HP\Desktop\tourism\backend
pip install -r requirements.txt
```

### 2. Run Test Script

```bash
python test_mcp_server.py
```

Expected output:
```
Testing MCP Server Tools...
1. Testing list_districts... Found 38 districts
2. Testing get_heritage_graph... Nodes: 26, Links: 23
3. Testing get_heritage_by_dynasty (Chola)... Found 4 Chola heritage sites
4. Testing list_itineraries... Found 3 saved itineraries
All basic tests passed!
```

## Client Configuration

**Pre-configured files are in this directory:**
- `claude_desktop_config.json` - Copy to `%APPDATA%\Claude\claude_desktop_config.json`
- `cursor_mcp.json` - Copy to `%USERPROFILE%\.cursor\mcp.json`

### Claude Desktop (Windows)

**Config file location:** `%APPDATA%\Claude\claude_desktop_config.json`

**Or use the pre-made config:**
```bash
copy claude_desktop_config.json "%APPDATA%\Claude\claude_desktop_config.json"
```

Manual configuration:

```json
{
  "mcpServers": {
    "tamilnadu-tourism": {
      "command": "C:\\Users\\HP\\Desktop\\tourism\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
    }
  }
}
```

### Cursor IDE (Windows)

**Config file location:** `%USERPROFILE%\.cursor\mcp.json`

```json
{
  "mcpServers": {
    "tamilnadu-tourism": {
      "command": "C:\\Users\\HP\\Desktop\\tourism\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
    }
  }
}
```

### Windsurf (Windows)

**Config file location:** `%USERPROFILE%\.windsurf\mcp.json`

```json
{
  "mcpServers": {
    "tamilnadu-tourism": {
      "command": "C:\\Users\\HP\\Desktop\\tourism\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
    }
  }
}
```

### VS Code (with MCP Extension)

Add to your workspace `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "tamilnadu-tourism": {
      "command": "C:\\Users\\HP\\Desktop\\tourism\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
    }
  }
}
```

### Continue (VS Code Extension)

Add to `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocol": {
      "servers": {
        "tamilnadu-tourism": {
          "command": "C:\\Users\\HP\\Desktop\\tourism\\.venv\\Scripts\\python.exe",
          "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"]
        }
      }
    }
  }
}
```

## Available Tools

### 1. `get_heritage_graph`
Get the Tamil Nadu heritage site network graph with SNA metrics (centrality, communities, PageRank).

### 2. `list_itineraries`
List all saved trip itineraries from the database.

### 3. `search_attractions`
Search for attractions in a specific Tamil Nadu district.

### 4. `get_top_attractions`
Get top attractions ranked by user interests.

### 5. `plan_trip_preview`
Preview a trip plan without saving to database.

### 6. `get_weather_forecast`
Get weather forecast for a specific location.

### 7. `list_districts`
List all available Tamil Nadu districts.

### 8. `get_heritage_by_dynasty`
Get heritage sites filtered by dynasty (Chola, Pallava, Pandya, British Colonial, Modern).

## Available Resources

### `itinerary://{itinerary_id}`
Get full itinerary details as a readable document.

## Available Prompts

### `plan_tamil_nadu_trip`
Generate a comprehensive trip planning prompt.

### `explore_heritage_sites`
Generate a prompt for exploring heritage sites by dynasty.

## Testing

### Test with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector
```

Then connect to your running server.

### Manual Test

```bash
cd C:\Users\HP\Desktop\tourism\backend
python mcp_server.py
```

The server will run in stdio mode, waiting for MCP client connections.

## Example Usage in Claude Desktop

Once configured, you can ask Claude:

- "What are the top attractions in Madurai for temple enthusiasts?"
- "Plan a 3-day trip to Thanjavur focusing on Chola heritage sites"
- "Show me the heritage network graph for Pallava dynasty sites"
- "What's the weather forecast for Kanyakumari?"
- "List all saved itineraries"

## Architecture

```
backend/
├── mcp_server.py          # MCP server entry point
├── main.py                # FastAPI server (HTTP REST)
├── routers/
│   ├── itinerary.py       # FastAPI routes (shared logic)
│   └── ai.py              # AI chat routes
├── services/
│   ├── sna_service.py     # Heritage graph logic
│   ├── place_service.py   # Attraction fetching
│   ├── recommendation_engine.py
│   ├── optimizer.py       # Route optimization
│   ├── weather_service.py
│   └── llm_service.py     # LLM integration
├── models.py              # SQLAlchemy models
├── database.py            # Database connection
└── requirements.txt       # Python dependencies
```

The MCP server reuses the same services as the FastAPI backend, ensuring consistency.

## Troubleshooting

### Server not starting?
1. Check Python path is correct
2. Ensure virtual environment is activated
3. Verify all dependencies are installed

### Tools not appearing?
1. Restart the MCP client after config changes
2. Check client logs for connection errors
3. Verify the server runs manually: `python mcp_server.py`

### Database errors?
1. Ensure `tourism.db` exists in backend folder
2. Run `python main.py` once to create tables
3. Check DATABASE_URL in `.env`

## Security Notes

- The MCP server uses stdio transport (local only)
- Database operations are read-only for preview tools
- No external API keys are exposed through MCP
- Weather and LLM services require their own API keys

## Next Steps

- Add authentication for write operations
- Implement HTTP transport for remote access
- Add more specialized tools (food recommendations, accommodation, transport)
- Integrate with real-time transit data
