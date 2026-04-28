"""
Test script to verify MCP server functionality.
Run this to check that all tools work correctly.
"""

import sys
import asyncio
sys.path.insert(0, '.')

from mcp_server import (
    get_heritage_graph,
    list_itineraries,
    list_districts,
    get_heritage_by_dynasty,
)


def test_tools():
    print("Testing MCP Server Tools...")
    print("-" * 50)
    
    print("\n1. Testing list_districts...")
    districts = list_districts()
    print(f"   Found {len(districts)} districts")
    print(f"   Sample: {districts[:5]}")
    
    print("\n2. Testing get_heritage_graph...")
    graph = get_heritage_graph()
    print(f"   Nodes: {len(graph.get('nodes', []))}")
    print(f"   Links: {len(graph.get('links', []))}")
    
    print("\n3. Testing get_heritage_by_dynasty (Chola)...")
    chola_sites = get_heritage_by_dynasty("Chola")
    print(f"   Found {len(chola_sites)} Chola heritage sites")
    for site in chola_sites[:3]:
        print(f"   - {site['name']} ({site['district']})")
    
    print("\n4. Testing list_itineraries...")
    itineraries = list_itineraries(limit=5)
    print(f"   Found {len(itineraries)} saved itineraries")
    
    print("\n" + "=" * 50)
    print("All basic tests passed!")
    print("\nAsync tools (plan_trip_preview, get_weather_forecast)")
    print("require async context - test with MCP client.")
    

if __name__ == "__main__":
    test_tools()
