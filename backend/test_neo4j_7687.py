from neo4j import GraphDatabase

uri = "bolt://localhost:7687"

print("Trying Neo4j with auth=('neo4j', 'rahulpdk#7') on port 7687...")
try:
    driver = GraphDatabase.driver(uri, auth=("neo4j", "rahulpdk#7"))
    driver.verify_connectivity()
    print("SUCCESS!")
    driver.close()
except Exception as e:
    print(f"Failed: {str(e)[:200]}")
