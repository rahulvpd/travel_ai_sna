from neo4j_driver import neo4j_conn
import json
import os
import sqlite3

SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tourism.db")

HERITAGE_NODES = [
    {
        "id": "Brihadeeswarar Temple",
        "dynasty": "Chola",
        "style": "Dravidian",
        "district": "Thanjavur",
    },
    {
        "id": "Gangaikonda Cholapuram",
        "dynasty": "Chola",
        "style": "Dravidian",
        "district": "Ariyalur",
    },
    {
        "id": "Airavatesvara Temple",
        "dynasty": "Chola",
        "style": "Dravidian",
        "district": "Kumbakonam",
    },
    {
        "id": "Chidambaram Nataraja Temple",
        "dynasty": "Chola",
        "style": "Dravidian",
        "district": "Cuddalore",
    },
    {
        "id": "Mahabalipuram",
        "dynasty": "Pallava",
        "style": "Rock-cut",
        "district": "Chengalpattu",
    },
    {
        "id": "Shore Temple",
        "dynasty": "Pallava",
        "style": "Dravidian",
        "district": "Chengalpattu",
    },
    {
        "id": "Kanchipuram Kailasanathar",
        "dynasty": "Pallava",
        "style": "Dravidian",
        "district": "Kanchipuram",
    },
    {
        "id": "Vaikunta Perumal Temple",
        "dynasty": "Pallava",
        "style": "Dravidian",
        "district": "Kanchipuram",
    },
    {
        "id": "Parthasarathy Temple",
        "dynasty": "Pallava",
        "style": "Dravidian",
        "district": "Chennai",
    },
    {
        "id": "Kapaleeshwarar Temple",
        "dynasty": "Pallava",
        "style": "Dravidian",
        "district": "Chennai",
    },
    {
        "id": "Meenakshi Temple",
        "dynasty": "Pandya",
        "style": "Dravidian",
        "district": "Madurai",
    },
    {
        "id": "Sittanavasal Caves",
        "dynasty": "Pandya",
        "style": "Rock-cut",
        "district": "Pudukkottai",
    },
    {
        "id": "Kazhugumalai Vettuvan Koil",
        "dynasty": "Pandya",
        "style": "Rock-cut",
        "district": "Thoothukudi",
    },
    {
        "id": "Fort St. George",
        "dynasty": "British Colonial",
        "style": "Military",
        "district": "Chennai",
    },
    {
        "id": "Madras High Court",
        "dynasty": "British Colonial",
        "style": "Indo-Saracenic",
        "district": "Chennai",
    },
    {
        "id": "Ripon Building",
        "dynasty": "British Colonial",
        "style": "Indo-Saracenic",
        "district": "Chennai",
    },
    {
        "id": "Government Museum (Egmore)",
        "dynasty": "British Colonial",
        "style": "Indo-Saracenic",
        "district": "Chennai",
    },
    {
        "id": "San Thome Cathedral",
        "dynasty": "British Colonial",
        "style": "Neo-Gothic",
        "district": "Chennai",
    },
    {
        "id": "Marina Beach Promenade",
        "dynasty": "British Colonial",
        "style": "Urban",
        "district": "Chennai",
    },
    {
        "id": "Guindy National Park",
        "dynasty": "British Colonial",
        "style": "Natural",
        "district": "Chennai",
    },
    {
        "id": "Senate House",
        "dynasty": "British Colonial",
        "style": "Indo-Saracenic",
        "district": "Chennai",
    },
    {
        "id": "Victoria Public Hall",
        "dynasty": "British Colonial",
        "style": "Indo-Saracenic",
        "district": "Chennai",
    },
    {
        "id": "Valluvar Kottam",
        "dynasty": "Modern",
        "style": "Dravidian Revival",
        "district": "Chennai",
    },
    {
        "id": "DakshinaChitra",
        "dynasty": "Modern",
        "style": "Vernacular",
        "district": "Chengalpattu",
    },
    {
        "id": "Vivekananda Rock Memorial",
        "dynasty": "Modern",
        "style": "Neo-Dravidian",
        "district": "Kanyakumari",
    },
    {
        "id": "Ramanathaswamy Temple",
        "dynasty": "Sethupathi",
        "style": "Dravidian",
        "district": "Rameswaram",
    },
]

HERITAGE_EDGES = [
    ("Brihadeeswarar Temple", "Gangaikonda Cholapuram"),
    ("Gangaikonda Cholapuram", "Airavatesvara Temple"),
    ("Brihadeeswarar Temple", "Chidambaram Nataraja Temple"),
    ("Mahabalipuram", "Shore Temple"),
    ("Shore Temple", "Kanchipuram Kailasanathar"),
    ("Kanchipuram Kailasanathar", "Vaikunta Perumal Temple"),
    ("Mahabalipuram", "Kanchipuram Kailasanathar"),
    ("Parthasarathy Temple", "Kanchipuram Kailasanathar"),
    ("Kapaleeshwarar Temple", "Parthasarathy Temple"),
    ("Kapaleeshwarar Temple", "Mahabalipuram"),
    ("Madras High Court", "Ripon Building"),
    ("Ripon Building", "Victoria Public Hall"),
    ("Madras High Court", "Senate House"),
    ("Government Museum (Egmore)", "Madras High Court"),
    ("Government Museum (Egmore)", "Victoria Public Hall"),
    ("Fort St. George", "Madras High Court"),
    ("Fort St. George", "Marina Beach Promenade"),
    ("Fort St. George", "San Thome Cathedral"),
    ("Meenakshi Temple", "Ramanathaswamy Temple"),
    ("Brihadeeswarar Temple", "Meenakshi Temple"),
    ("DakshinaChitra", "Mahabalipuram"),
    ("Valluvar Kottam", "Kapaleeshwarar Temple"),
    ("Guindy National Park", "Marina Beach Promenade"),
]


def initialize_heritage_graph():
    neo4j_conn.execute_query("MATCH (n) DETACH DELETE n")

    for node in HERITAGE_NODES:
        query = """
        MERGE (a:Attraction {uid: $uid})
        SET
            a.name = $name,
            a.dynasty = $dynasty,
            a.style = $style,
            a.district = $district,
            a.source = "heritage_seed"
        """
        neo4j_conn.execute_query(query, {**node, "uid": node["id"], "name": node["id"]})

    for edge in HERITAGE_EDGES:
        query = """
        MATCH (a:Attraction {uid: $source}), (b:Attraction {uid: $target})
        MERGE (a)-[:CONNECTED_TO {reason: "heritage"}]->(b)
        """
        neo4j_conn.execute_query(query, {"source": edge[0], "target": edge[1]})

    import_backend_sqlite_graph()

    print("Full tourism graph initialized in Neo4j")


def _sqlite_rows(query, parameters=None):
    if not os.path.exists(SQLITE_DB_PATH):
        return []

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(query, parameters or ()).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def import_backend_sqlite_graph():
    attractions = _sqlite_rows(
        """
        SELECT id, name, latitude, longitude, category, rating, description,
               address, opening_hours, district
        FROM attractions
        ORDER BY id
        """
    )

    for attraction in attractions:
        params = {
            **attraction,
            "uid": f"sqlite_attraction:{attraction['id']}",
            "name": attraction["name"] or f"Attraction {attraction['id']}",
        }
        neo4j_conn.execute_query(
            """
            MERGE (a:Attraction {uid: $uid})
            SET
                a.sqlite_id = $id,
                a.name = $name,
                a.latitude = $latitude,
                a.longitude = $longitude,
                a.category = $category,
                a.rating = $rating,
                a.description = $description,
                a.address = $address,
                a.opening_hours = $opening_hours,
                a.district = $district,
                a.source = "sqlite_backend"
            """,
            params,
        )

    itineraries = _sqlite_rows(
        """
        SELECT id, title, destination, start_date, end_date, summary,
               green_score, total_cost
        FROM itineraries
        ORDER BY id
        """
    )

    for itinerary in itineraries:
        neo4j_conn.execute_query(
            """
            MERGE (i:Itinerary {uid: $uid})
            SET i.sqlite_id = $id,
                i.title = $title,
                i.destination = $destination,
                i.start_date = $start_date,
                i.end_date = $end_date,
                i.summary = $summary,
                i.green_score = $green_score,
                i.total_cost = $total_cost
            """,
            {**itinerary, "uid": f"itinerary:{itinerary['id']}"},
        )

    itinerary_items = _sqlite_rows(
        """
        SELECT id, itinerary_id, day, time_of_day, attraction_id, activity_name,
               notes, latitude, longitude
        FROM itinerary_items
        ORDER BY itinerary_id, day,
            CASE time_of_day
                WHEN 'Morning' THEN 1
                WHEN 'Afternoon' THEN 2
                WHEN 'Evening' THEN 3
                ELSE 4
            END,
            id
        """
    )

    for item in itinerary_items:
        if item["attraction_id"] is None:
            continue
        params = {
            **item,
            "itinerary_uid": f"itinerary:{item['itinerary_id']}",
            "attraction_uid": f"sqlite_attraction:{item['attraction_id']}",
        }
        neo4j_conn.execute_query(
            """
            MATCH (i:Itinerary {uid: $itinerary_uid})
            MATCH (a:Attraction {uid: $attraction_uid})
            MERGE (i)-[r:HAS_STOP {item_id: $id}]->(a)
            SET r.day = $day,
                r.time_of_day = $time_of_day,
                r.activity_name = $activity_name,
                r.notes = $notes
            """,
            params,
        )

    for group_field, reason in (("district", "same_district"), ("category", "same_category")):
        groups = {}
        for attraction in attractions:
            value = attraction.get(group_field)
            if value:
                groups.setdefault(value, []).append(attraction)

        for value_items in groups.values():
            for source, target in zip(value_items, value_items[1:]):
                neo4j_conn.execute_query(
                    """
                    MATCH (a:Attraction {uid: $source}), (b:Attraction {uid: $target})
                    MERGE (a)-[:CONNECTED_TO {reason: $reason}]->(b)
                    """,
                    {
                        "source": f"sqlite_attraction:{source['id']}",
                        "target": f"sqlite_attraction:{target['id']}",
                        "reason": reason,
                    },
                )

    by_itinerary = {}
    for item in itinerary_items:
        if item["attraction_id"] is not None:
            by_itinerary.setdefault(item["itinerary_id"], []).append(item)

    for items in by_itinerary.values():
        for source, target in zip(items, items[1:]):
            neo4j_conn.execute_query(
                """
                MATCH (a:Attraction {uid: $source}), (b:Attraction {uid: $target})
                MERGE (a)-[:CONNECTED_TO {reason: "same_itinerary"}]->(b)
                """,
                {
                    "source": f"sqlite_attraction:{source['attraction_id']}",
                    "target": f"sqlite_attraction:{target['attraction_id']}",
                },
            )

    neo4j_conn.execute_query(
        """
        MERGE (g:TourismGraph {uid: "tourism_project"})
        SET g.name = "Tourism AI Project Graph",
            g.description = "Complete local graph for heritage, backend attractions, and itineraries"
        """
    )
    neo4j_conn.execute_query(
        """
        MATCH (g:TourismGraph {uid: "tourism_project"})
        MATCH (a:Attraction)
        MERGE (g)-[:CONTAINS]->(a)
        """
    )
    neo4j_conn.execute_query(
        """
        MATCH (g:TourismGraph {uid: "tourism_project"})
        MATCH (i:Itinerary)
        MERGE (g)-[:CONTAINS]->(i)
        """
    )


def get_graph_data():
    query = """
    MATCH (a)-[r]->(b)
    WHERE a:TourismGraph OR a:Attraction OR a:Itinerary
    RETURN coalesce(a.uid, a.name, a.title) as source,
           coalesce(b.uid, b.name, b.title) as target,
           type(r) as relationship,
           coalesce(r.reason, type(r)) as reason
    """
    edges = neo4j_conn.execute_query(query) or []

    query = """
    MATCH (n)
    WHERE n:TourismGraph OR n:Attraction OR n:Itinerary
    RETURN coalesce(n.uid, n.name, n.title) as id,
           coalesce(n.name, n.title) as name,
           labels(n) as labels,
           n.dynasty as dynasty,
           n.style as style,
           n.district as district,
           n.category as category,
           n.source as source,
           n.destination as destination
    """
    nodes = neo4j_conn.execute_query(query) or []

    return {"nodes": nodes, "edges": edges}


def calculate_centrality():
    query = """
    MATCH (a:Attraction)-[r:CONNECTED_TO]-(:Attraction)
    WITH a, count(r) as degree
    RETURN coalesce(a.uid, a.name) as attraction, a.name as name, degree
    ORDER BY degree DESC
    """
    return neo4j_conn.execute_query(query) or []


def find_communities():
    query = """
    MATCH (a:Attraction)-[r:CONNECTED_TO]->(b:Attraction)
    RETURN coalesce(a.dynasty, a.district, a.category, "Other") as dynasty,
           collect(DISTINCT a.name) as attractions
    """
    return neo4j_conn.execute_query(query) or []


def get_district_connections():
    query = """
    MATCH (a:Attraction)-[r:CONNECTED_TO]->(b:Attraction)
    WHERE a.district = b.district
    RETURN a.district as district, count(r) as connections
    ORDER BY connections DESC
    """
    return neo4j_conn.execute_query(query) or []


def get_neo4j_insights():
    try:
        graph_data = get_graph_data()
        centrality = calculate_centrality()
        communities = find_communities()
        district_connections = get_district_connections()

        node_dict = {n["id"]: n for n in graph_data["nodes"]}

        nodes_formatted = []
        centrality_dict = {c["attraction"]: c["degree"] for c in centrality}

        for i, node in enumerate(graph_data["nodes"]):
            degree = centrality_dict.get(node["id"], 0)
            nodes_formatted.append(
                {
                    "id": node["id"],
                    "name": node["name"],
                    "labels": node["labels"],
                    "group": i % 4,
                    "val": degree + 1,
                    "dynasty": node["dynasty"],
                    "district": node["district"],
                    "category": node["category"],
                    "source": node["source"],
                    "destination": node["destination"],
                }
            )

        links_formatted = [
            {
                "source": e["source"],
                "target": e["target"],
                "relationship": e["relationship"],
                "reason": e["reason"],
            }
            for e in graph_data["edges"]
        ]

        return {
            "nodes": nodes_formatted,
            "links": links_formatted,
            "centrality": centrality_dict,
            "communities": {c["dynasty"]: c["attractions"] for c in communities},
            "district_connections": district_connections,
        }
    except Exception as e:
        print(f"Error getting Neo4j insights: {e}")
        return {"nodes": [], "links": [], "error": str(e)}


def add_attraction(name, dynasty, style, district, latitude=None, longitude=None):
    query = """
    CREATE (a:Attraction {
        name: $name,
        dynasty: $dynasty,
        style: $style,
        district: $district,
        latitude: $latitude,
        longitude: $longitude
    })
    RETURN a
    """
    return neo4j_conn.execute_query(
        query,
        {
            "name": name,
            "dynasty": dynasty,
            "style": style,
            "district": district,
            "latitude": latitude,
            "longitude": longitude,
        },
    )


def add_connection(source, target):
    query = """
    MATCH (a:Attraction {name: $source}), (b:Attraction {name: $target})
    MERGE (a)-[:CONNECTED_TO]->(b)
    """
    return neo4j_conn.execute_query(query, {"source": source, "target": target})


def get_attractions_by_dynasty(dynasty):
    query = """
    MATCH (a:Attraction {dynasty: $dynasty})
    RETURN a.name as name, a.district as district, a.style as style
    """
    return neo4j_conn.execute_query(query, {"dynasty": dynasty}) or []


def get_attractions_by_district(district):
    query = """
    MATCH (a:Attraction {district: $district})
    RETURN a.name as name, a.dynasty as dynasty, a.style as style
    """
    return neo4j_conn.execute_query(query, {"district": district}) or []


def find_path(start, end):
    query = """
    MATCH path = (a:Attraction {name: $start})-[r:CONNECTED_TO*1..5]->(b:Attraction {name: $end})
    RETURN path
    LIMIT 1
    """
    result = neo4j_conn.execute_query(query, {"start": start, "end": end})
    if result and result[0].get("path"):
        return [n["name"] for n in result[0]["path"]]
    return []
