"""
Neon DB MCP Server for Tamil Nadu Tourism
PostgreSQL database via Neon (serverless Postgres)

Neon is a serverless PostgreSQL platform that provides:
- Serverless compute with auto-scaling
- Branching for development
- Point-in-time recovery
- Generous free tier

This MCP server provides tools for:
- Database queries and analytics
- Tourism data management
- User itineraries storage
- Analytics and reporting
"""

import sys
import logging
import json
import os
from typing import Any, Optional
from datetime import datetime, date
from decimal import Decimal

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    logger.error("MCP not installed. Run: pip install mcp[cli]")
    sys.exit(1)

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    logger.warning("psycopg2 not installed. Install with: pip install psycopg2-binary")

mcp = FastMCP("Neon Database")

# ─────────────────────────────────────────────────────────────
# DATABASE CONFIGURATION
# ─────────────────────────────────────────────────────────────


def get_connection_string():
    """Get Neon database connection string from environment"""
    return os.getenv(
        "NEON_DATABASE_URL",
        os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/tourism"),
    )


def get_connection():
    """Get database connection"""
    conn_str = get_connection_string()
    return psycopg2.connect(conn_str)


def serialize_value(value):
    """Serialize values for JSON compatibility"""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


# ─────────────────────────────────────────────────────────────
# NEON DB MCP TOOLS
# ─────────────────────────────────────────────────────────────


@mcp.tool()
def execute_query(
    query: str, params: Optional[list] = None, fetch_all: bool = True
) -> dict[str, Any]:
    """
    Execute a SQL query on the Neon PostgreSQL database.

    Args:
        query: SQL query to execute
        params: Query parameters (optional)
        fetch_all: Return all rows if True, else return first row

    Returns:
        Query results with row count and execution metadata
    """
    logger.info(f"Executing query: {query[:100]}...")

    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(query, params or ())

        if query.strip().upper().startswith(("SELECT", "SHOW", "EXPLAIN")):
            if fetch_all:
                rows = cursor.fetchall()
            else:
                rows = [cursor.fetchone()] if cursor.rowcount > 0 else []

            result = []
            for row in rows:
                result.append({k: serialize_value(v) for k, v in row.items()})

            conn.close()

            return {
                "success": True,
                "rows": result,
                "row_count": len(result),
                "query": query,
                "executed_at": datetime.now().isoformat(),
            }
        else:
            conn.commit()
            affected = cursor.rowcount
            conn.close()

            return {
                "success": True,
                "rows_affected": affected,
                "query": query,
                "executed_at": datetime.now().isoformat(),
            }

    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "query": query,
            "executed_at": datetime.now().isoformat(),
        }


@mcp.tool()
def get_tourism_statistics() -> dict[str, Any]:
    """
    Get comprehensive tourism statistics from the database.

    Returns visitor counts, popular destinations, seasonal trends,
    and key metrics for Tamil Nadu tourism.
    """
    logger.info("Fetching tourism statistics")

    stats = {}

    # Total attractions
    result = execute_query("SELECT COUNT(*) as count FROM attractions")
    stats["total_attractions"] = result.get("rows", [{}])[0].get("count", 0)

    # Attractions by category
    result = execute_query("""
        SELECT category, COUNT(*) as count 
        FROM attractions 
        GROUP BY category 
        ORDER BY count DESC
    """)
    stats["attractions_by_category"] = result.get("rows", [])

    # Attractions by district
    result = execute_query("""
        SELECT district, COUNT(*) as count 
        FROM attractions 
        GROUP BY district 
        ORDER BY count DESC 
        LIMIT 10
    """)
    stats["attractions_by_district"] = result.get("rows", [])

    # Total itineraries
    result = execute_query("SELECT COUNT(*) as count FROM itineraries")
    stats["total_itineraries"] = result.get("rows", [{}])[0].get("count", 0)

    # Average green score
    result = execute_query("SELECT AVG(green_score) as avg_score FROM itineraries")
    stats["avg_green_score"] = result.get("rows", [{}])[0].get("avg_score", 0)

    stats["generated_at"] = datetime.now().isoformat()

    return {"success": True, "statistics": stats, "database": "Neon PostgreSQL"}


@mcp.tool()
def search_attractions_db(
    district: Optional[str] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    limit: int = 20,
) -> dict[str, Any]:
    """
    Search attractions in the Neon database with filters.

    Args:
        district: Filter by district name
        category: Filter by category (temple, beach, monument, etc.)
        min_rating: Minimum rating filter
        limit: Maximum results to return

    Returns:
        List of matching attractions with details
    """
    logger.info(f"Searching attractions: district={district}, category={category}")

    query = "SELECT * FROM attractions WHERE 1=1"
    params = []

    if district:
        query += " AND district ILIKE %s"
        params.append(f"%{district}%")

    if category:
        query += " AND category ILIKE %s"
        params.append(f"%{category}%")

    if min_rating:
        query += " AND rating >= %s"
        params.append(min_rating)

    query += f" ORDER BY rating DESC NULLS LAST LIMIT {limit}"

    result = execute_query(query, params)

    return {
        "success": True,
        "attractions": result.get("rows", []),
        "filters": {
            "district": district,
            "category": category,
            "min_rating": min_rating,
        },
        "count": len(result.get("rows", [])),
        "generated_at": datetime.now().isoformat(),
    }


@mcp.tool()
def get_itinerary_analytics(
    days_back: int = 30, group_by: str = "destination"
) -> dict[str, Any]:
    """
    Get analytics on user itineraries from the database.

    Args:
        days_back: Number of days to look back
        group_by: How to group data ("destination", "budget", "travel_style")

    Returns:
        Analytics data with trends and insights
    """
    logger.info(
        f"Getting itinerary analytics: days_back={days_back}, group_by={group_by}"
    )

    valid_groups = ["destination", "budget", "travel_style"]
    if group_by not in valid_groups:
        group_by = "destination"

    query = f"""
        SELECT {group_by}, COUNT(*) as count, 
               AVG(green_score) as avg_green_score,
               AVG(CAST(REPLACE(total_cost, '₹', '') AS numeric)) as avg_cost
        FROM itineraries 
        WHERE created_at >= NOW() - INTERVAL '{days_back} days'
        GROUP BY {group_by}
        ORDER BY count DESC
    """

    result = execute_query(query)

    return {
        "success": True,
        "analytics": {
            "group_by": group_by,
            "period_days": days_back,
            "data": result.get("rows", []),
            "insights": _generate_insights(result.get("rows", [])),
        },
        "generated_at": datetime.now().isoformat(),
    }


@mcp.tool()
def create_attraction(
    name: str,
    district: str,
    category: str,
    latitude: float,
    longitude: float,
    description: Optional[str] = None,
    rating: Optional[float] = None,
    address: Optional[str] = None,
) -> dict[str, Any]:
    """
    Create a new attraction record in the database.

    Args:
        name: Attraction name
        district: District name
        category: Category (temple, beach, monument, etc.)
        latitude: GPS latitude
        longitude: GPS longitude
        description: Description (optional)
        rating: Rating 0-5 (optional)
        address: Physical address (optional)

    Returns:
        Created attraction record
    """
    logger.info(f"Creating attraction: {name}")

    query = """
        INSERT INTO attractions 
        (name, district, category, latitude, longitude, description, rating, address)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """

    params = [
        name,
        district,
        category,
        latitude,
        longitude,
        description,
        rating,
        address,
    ]

    result = execute_query(query, params, fetch_all=False)

    if result.get("success"):
        return {
            "success": True,
            "attraction": result.get("rows", [{}])[0],
            "message": f"Attraction '{name}' created successfully",
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Unknown error"),
            "message": f"Failed to create attraction '{name}'",
        }


@mcp.tool()
def update_attraction(attraction_id: int, updates: dict[str, Any]) -> dict[str, Any]:
    """
    Update an existing attraction record.

    Args:
        attraction_id: ID of attraction to update
        updates: Dictionary of fields to update

    Returns:
        Updated attraction record
    """
    logger.info(f"Updating attraction ID: {attraction_id}")

    if not updates:
        return {"success": False, "error": "No updates provided"}

    set_clauses = []
    params = []

    valid_fields = [
        "name",
        "district",
        "category",
        "latitude",
        "longitude",
        "description",
        "rating",
        "address",
        "opening_hours",
    ]

    for field, value in updates.items():
        if field in valid_fields:
            set_clauses.append(f"{field} = %s")
            params.append(value)

    if not set_clauses:
        return {"success": False, "error": "No valid fields to update"}

    params.append(attraction_id)

    query = f"UPDATE attractions SET {', '.join(set_clauses)} WHERE id = %s RETURNING *"

    result = execute_query(query, params, fetch_all=False)

    if result.get("success"):
        return {
            "success": True,
            "attraction": result.get("rows", [{}])[0],
            "message": f"Attraction {attraction_id} updated successfully",
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Unknown error"),
            "message": f"Failed to update attraction {attraction_id}",
        }


@mcp.tool()
def get_user_itineraries(user_id: int, limit: int = 10) -> dict[str, Any]:
    """
    Get itineraries for a specific user.

    Args:
        user_id: User ID
        limit: Maximum number to return

    Returns:
        List of user's itineraries with details
    """
    logger.info(f"Getting itineraries for user: {user_id}")

    query = """
        SELECT i.*, 
               COUNT(ii.id) as item_count
        FROM itineraries i
        LEFT JOIN itinerary_items ii ON i.id = ii.itinerary_id
        WHERE i.user_id = %s
        GROUP BY i.id
        ORDER BY i.created_at DESC
        LIMIT %s
    """

    result = execute_query(query, [user_id, limit])

    return {
        "success": True,
        "user_id": user_id,
        "itineraries": result.get("rows", []),
        "count": len(result.get("rows", [])),
        "generated_at": datetime.now().isoformat(),
    }


@mcp.tool()
def get_database_schema() -> dict[str, Any]:
    """
    Get the database schema information.

    Returns table names, columns, and relationships for the tourism database.
    """
    logger.info("Fetching database schema")

    query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """

    tables_result = execute_query(query)
    tables = [t["table_name"] for t in tables_result.get("rows", [])]

    schema = {}

    for table in tables:
        col_query = f"""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = '{table}'
            ORDER BY ordinal_position
        """
        cols_result = execute_query(col_query)
        schema[table] = cols_result.get("rows", [])

    return {
        "success": True,
        "schema": schema,
        "tables": tables,
        "generated_at": datetime.now().isoformat(),
    }


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────


def _generate_insights(data: list) -> list[str]:
    """Generate insights from analytics data"""
    insights = []

    if not data:
        return ["No data available for analysis"]

    # Top destination/style
    if data:
        top = data[0]
        top_key = list(top.keys())[0]
        insights.append(
            f"Most popular: {top.get(top_key)} with {top.get('count', 0)} itineraries"
        )

    # Average metrics
    if len(data) > 1:
        avg_count = sum(d.get("count", 0) for d in data) / len(data)
        insights.append(f"Average itineraries per {data[0].keys()}: {avg_count:.1f}")

    # Green score
    green_scores = [d.get("avg_green_score") for d in data if d.get("avg_green_score")]
    if green_scores:
        avg_green = sum(green_scores) / len(green_scores)
        insights.append(f"Average sustainability score: {avg_green:.1f}%")

    return insights


# ─────────────────────────────────────────────────────────────
# NEON RESOURCES
# ─────────────────────────────────────────────────────────────


@mcp.resource("neon://attractions/{attraction_id}")
def get_attraction_resource(attraction_id: int) -> str:
    """
    Get attraction details as a resource.

    Args:
        attraction_id: Attraction ID
    """
    result = execute_query(
        "SELECT * FROM attractions WHERE id = %s", [attraction_id], fetch_all=False
    )
    return json.dumps(result, indent=2)


@mcp.resource("neon://district/{district_name}")
def get_district_resource(district_name: str) -> str:
    """
    Get district attractions as a resource.

    Args:
        district_name: District name
    """
    result = search_attractions_db(district=district_name)
    return json.dumps(result, indent=2)


# ─────────────────────────────────────────────────────────────
# NEON PROMPTS
# ─────────────────────────────────────────────────────────────


@mcp.prompt()
def analyze_tourism_trends(days_back: int = 30) -> str:
    """
    Generate prompt for analyzing tourism trends.

    Args:
        days_back: Number of days to analyze
    """
    return f"""Analyze tourism trends for the past {days_back} days.

    Steps:
    1. Use get_tourism_statistics to get overall stats
    2. Use get_itinerary_analytics with days_back={days_back}
    3. Identify trends by destination, budget, and travel style
    4. Provide actionable insights for tourism development
    
    Focus on data-driven insights and recommendations.
    """


@mcp.prompt()
def search_and_create_attraction(district: str, name: str) -> str:
    """
    Generate prompt for searching and potentially creating attractions.

    Args:
        district: District to search in
        name: Attraction name
    """
    return f"""Search for and potentially create attraction '{name}' in {district}.

    Steps:
    1. Use search_attractions_db to find existing attractions in {district}
    2. If '{name}' doesn't exist, use create_attraction to add it
    3. Verify the creation was successful
    4. Return the attraction details
    
    Include all relevant details: name, district, category, coordinates, description.
    """


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────


def main():
    logger.info("Starting Neon DB MCP Server for Tamil Nadu Tourism")
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
