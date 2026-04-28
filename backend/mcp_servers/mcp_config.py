# MCP Servers Configuration for Tamil Nadu Tourism
# Configure these in Claude Desktop or Cursor IDE

# ─────────────────────────────────────────────────────────────
# CLAUDE DESKTOP CONFIGURATION
# ─────────────────────────────────────────────────────────────

# Add to: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
# Add to: %APPDATA%\Claude\claude_desktop_config.json (Windows)

claude_desktop_config = {
    "mcpServers": {
        "tamil-nadu-tourism": {
            "command": "python",
            "args": ["C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_server.py"],
            "env": {
                "DATABASE_URL": "sqlite:///./tourism.db",
                "NVIDIA_API_KEY": "nvapi-xxxxx",
            },
        },
        "storm-knowledge": {
            "command": "python",
            "args": [
                "C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_servers\\storm_mcp_server.py"
            ],
            "env": {"PYTHONPATH": "C:\\Users\\HP\\Desktop\\tourism\\backend"},
        },
        "neon-database": {
            "command": "python",
            "args": [
                "C:\\Users\\HP\\Desktop\\tourism\\backend\\mcp_servers\\neon_mcp_server.py"
            ],
            "env": {
                "NEON_DATABASE_URL": "postgresql://user:pass@your-neon-host.neon.tech/tourism",
                "DATABASE_URL": "postgresql://user:pass@your-neon-host.neon.tech/tourism",
            },
        },
    }
}

# ─────────────────────────────────────────────────────────────
# CURSOR IDE CONFIGURATION
# ─────────────────────────────────────────────────────────────

# Add to: .cursor/mcp.json in project root

cursor_mcp_config = {
    "mcpServers": {
        "tamil-nadu-tourism": {
            "command": "python",
            "args": ["${workspaceFolder}/backend/mcp_server.py"],
            "env": {"DATABASE_URL": "sqlite:///./tourism.db"},
        },
        "storm-knowledge": {
            "command": "python",
            "args": ["${workspaceFolder}/backend/mcp_servers/storm_mcp_server.py"],
        },
        "neon-database": {
            "command": "python",
            "args": ["${workspaceFolder}/backend/mcp_servers/neon_mcp_server.py"],
            "env": {"NEON_DATABASE_URL": "${NEON_DATABASE_URL}"},
        },
    }
}

# ─────────────────────────────────────────────────────────────
# ENVIRONMENT VARIABLES
# ─────────────────────────────────────────────────────────────

# Create a .env.mcp file with:

env_template = """
# Neon PostgreSQL Database
NEON_DATABASE_URL=postgresql://username:password@ep-your-endpoint.neon.tech/tourism?sslmode=require

# Local SQLite fallback
DATABASE_URL=sqlite:///./tourism.db

# NVIDIA API for AI insights
NVIDIA_API_KEY=nvapi-your-key-here

# Gemini API (fallback)
VITE_GEMINI_API_KEY=your-gemini-key

# Groq API (fallback)
VITE_GROQ_API_KEY=your-groq-key
"""

# ─────────────────────────────────────────────────────────────
# MCP SERVER TOOLS OVERVIEW
# ─────────────────────────────────────────────────────────────

"""
TAMIL NADU TOURISM MCP (mcp_server.py)
Tools:
- get_heritage_graph() - SNA heritage network
- list_itineraries(limit) - Get saved itineraries
- search_attractions(district, category) - Search attractions
- get_top_attractions(district, interests, limit) - Ranked attractions
- plan_trip_preview(destination, days, interests) - Trip planning
- get_weather_forecast(lat, lon) - Weather data
- list_districts() - Available districts
- get_heritage_by_dynasty(dynasty) - Dynasty-filtered sites

STORM MCP (storm_mcp_server.py)
Tools:
- synthesize_research_topic(topic, context, depth) - Deep research synthesis
- generate_heritage_narrative(place, dynasty) - Wikipedia-quality narratives
- analyze_dynasty_influence(dynasty, aspect) - Dynasty impact analysis
- create_research_outline(topic, sections, style) - Structured outlines
- cross_reference_sites(sites, ref_type) - Site connection analysis

NEON DB MCP (neon_mcp_server.py)
Tools:
- execute_query(query, params) - Raw SQL queries
- get_tourism_statistics() - Tourism analytics
- search_attractions_db(district, category, rating) - DB search
- get_itinerary_analytics(days_back, group_by) - User analytics
- create_attraction(name, district, ...) - Add attraction
- update_attraction(id, updates) - Update attraction
- get_user_itineraries(user_id) - User's saved trips
- get_database_schema() - Schema info
"""

print(json.dumps(claude_desktop_config, indent=2))
