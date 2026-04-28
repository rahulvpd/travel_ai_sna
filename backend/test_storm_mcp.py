"""Simple test to verify STORM MCP server works"""

import sys

sys.path.insert(0, r"C:\Users\HP\Desktop\tourism\backend")

from mcp_servers.storm_mcp_server import mcp, main

if __name__ == "__main__":
    print("STORM MCP Server starting...", file=sys.stderr, flush=True)
    main()
