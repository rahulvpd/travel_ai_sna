import networkx as nx
import json

# Extensive dataset of Tamil Nadu heritage sites for SNA
heritage_data = {
    "nodes": [
        # CHOLA DYNASTY (Dravidian Architecture)
        {"id": "Brihadeeswarar Temple", "dynasty": "Chola", "style": "Dravidian", "district": "Thanjavur"},
        {"id": "Gangaikonda Cholapuram", "dynasty": "Chola", "style": "Dravidian", "district": "Ariyalur"},
        {"id": "Airavatesvara Temple", "dynasty": "Chola", "style": "Dravidian", "district": "Kumbakonam"},
        {"id": "Chidambaram Nataraja Temple", "dynasty": "Chola", "style": "Dravidian", "district": "Cuddalore"},
        
        # PALLAVA DYNASTY (Rock-cut / Early Dravidian)
        {"id": "Mahabalipuram", "dynasty": "Pallava", "style": "Rock-cut", "district": "Chengalpattu"},
        {"id": "Shore Temple", "dynasty": "Pallava", "style": "Dravidian", "district": "Chengalpattu"},
        {"id": "Kanchipuram Kailasanathar", "dynasty": "Pallava", "style": "Dravidian", "district": "Kanchipuram"},
        {"id": "Vaikunta Perumal Temple", "dynasty": "Pallava", "style": "Dravidian", "district": "Kanchipuram"},
        {"id": "Parthasarathy Temple", "dynasty": "Pallava", "style": "Dravidian", "district": "Chennai"},
        {"id": "Kapaleeshwarar Temple", "dynasty": "Pallava", "style": "Dravidian", "district": "Chennai"}, # Originally Pallava
        
        # PANDYA DYNASTY
        {"id": "Meenakshi Temple", "dynasty": "Pandya", "style": "Dravidian", "district": "Madurai"},
        {"id": "Sittanavasal Caves", "dynasty": "Pandya", "style": "Rock-cut", "district": "Pudukkottai"},
        {"id": "Kazhugumalai Vettuvan Koil", "dynasty": "Pandya", "style": "Rock-cut", "district": "Thoothukudi"},
        
        # BRITISH COLONIAL
        {"id": "Fort St. George", "dynasty": "British Colonial", "style": "Military", "district": "Chennai"},
        {"id": "Madras High Court", "dynasty": "British Colonial", "style": "Indo-Saracenic", "district": "Chennai"},
        {"id": "Ripon Building", "dynasty": "British Colonial", "style": "Indo-Saracenic", "district": "Chennai"},
        {"id": "Government Museum (Egmore)", "dynasty": "British Colonial", "style": "Indo-Saracenic", "district": "Chennai"},
        {"id": "San Thome Cathedral", "dynasty": "British Colonial", "style": "Neo-Gothic", "district": "Chennai"}, # Rebuilt by British
        {"id": "Marina Beach Promenade", "dynasty": "British Colonial", "style": "Urban", "district": "Chennai"},
        {"id": "Guindy National Park", "dynasty": "British Colonial", "style": "Natural", "district": "Chennai"},
        {"id": "Senate House", "dynasty": "British Colonial", "style": "Indo-Saracenic", "district": "Chennai"},
        {"id": "Victoria Public Hall", "dynasty": "British Colonial", "style": "Indo-Saracenic", "district": "Chennai"},
        
        # OTHERS
        {"id": "Valluvar Kottam", "dynasty": "Modern", "style": "Dravidian Revival", "district": "Chennai"},
        {"id": "DakshinaChitra", "dynasty": "Modern", "style": "Vernacular", "district": "Chengalpattu"},
        {"id": "Vivekananda Rock Memorial", "dynasty": "Modern", "style": "Neo-Dravidian", "district": "Kanyakumari"},
        {"id": "Ramanathaswamy Temple", "dynasty": "Sethupathi", "style": "Dravidian", "district": "Rameswaram"}
    ],
    "edges": [
        # CHOLA CLUSTER
        ("Brihadeeswarar Temple", "Gangaikonda Cholapuram"),
        ("Gangaikonda Cholapuram", "Airavatesvara Temple"),
        ("Brihadeeswarar Temple", "Chidambaram Nataraja Temple"),
        
        # PALLAVA CLUSTER
        ("Mahabalipuram", "Shore Temple"),
        ("Shore Temple", "Kanchipuram Kailasanathar"),
        ("Kanchipuram Kailasanathar", "Vaikunta Perumal Temple"),
        ("Mahabalipuram", "Kanchipuram Kailasanathar"),
        ("Parthasarathy Temple", "Kanchipuram Kailasanathar"), # Pallava connection
        
        # CHENNAI PALLAVA CONNECTION
        ("Kapaleeshwarar Temple", "Parthasarathy Temple"),
        ("Kapaleeshwarar Temple", "Mahabalipuram"), # Mylapore was a Pallava port
        
        # COLONIAL CLUSTER (INDO-SARACENIC)
        ("Madras High Court", "Ripon Building"),
        ("Ripon Building", "Victoria Public Hall"),
        ("Madras High Court", "Senate House"),
        ("Government Museum (Egmore)", "Madras High Court"),
        ("Government Museum (Egmore)", "Victoria Public Hall"),
        
        # COLONIAL MILITARY/ADMIN
        ("Fort St. George", "Madras High Court"),
        ("Fort St. George", "Marina Beach Promenade"),
        ("Fort St. George", "San Thome Cathedral"), # British connection via Mylapore
        
        # CROSS-DYNASTIC / REGIONAL
        ("Meenakshi Temple", "Ramanathaswamy Temple"), # Pandya region
        ("Brihadeeswarar Temple", "Meenakshi Temple"), # Major Dravidian Evolution
        ("DakshinaChitra", "Mahabalipuram"), # ECR Heritage Corridor
        ("Valluvar Kottam", "Kapaleeshwarar Temple"), # Chennai Cultural Hubs
        ("Guindy National Park", "Marina Beach Promenade") # Green/Blue spaces
    ]
}

def create_heritage_graph():
    G = nx.Graph()
    for node in heritage_data["nodes"]:
        G.add_node(node["id"], dynasty=node["dynasty"], style=node["style"], district=node["district"])
    for edge in heritage_data["edges"]:
        G.add_edge(edge[0], edge[1])
    return G

def get_graph_insights():
    G = create_heritage_graph()
    
    # Calculate degree centrality
    centrality = nx.degree_centrality(G)
    
    # Community detection (using greedy modularity)
    try:
        communities = list(nx.community.greedy_modularity_communities(G))
        community_map = {}
        for i, comm in enumerate(communities):
            for node in comm:
                community_map[node] = i
    except:
        # Fallback if community detection fails (e.g. not enough nodes)
        community_map = {node: 0 for node in G.nodes()}
            
    # Calculate PageRank (Influential sites)
    pagerank = nx.pagerank(G)
    
    # Format for frontend (react-force-graph)
    nodes_formatted = [
        {
            "id": n, 
            "group": community_map.get(n, 0),
            "val": centrality.get(n, 0) * 20, # Size based on centrality
            "dynasty": G.nodes[n].get("dynasty"),
            "district": G.nodes[n].get("district")
        } 
        for n in G.nodes()
    ]
    
    links_formatted = [{"source": u, "target": v} for u, v in G.edges()]

    return {
        "nodes": nodes_formatted,
        "links": links_formatted,
        "centrality": centrality,
        "communities": community_map,
        "pagerank": pagerank
    }
