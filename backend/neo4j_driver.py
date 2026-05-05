import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class Neo4jConnection:
    _instance = None
    _driver = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._driver is None:
            self._connect()

    def _connect(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        auth_enabled = os.getenv("NEO4J_AUTH_ENABLED", "true").lower() == "true"

        print(f"Neo4j Config - URI: {uri}, Auth Enabled: {auth_enabled}")

        try:
            if auth_enabled:
                self._driver = GraphDatabase.driver(uri, auth=(user, password))
            else:
                self._driver = GraphDatabase.driver(uri, auth=None)
            self._driver.verify_connectivity()
            print(f"Connected to Neo4j at {uri}")
        except Exception as e:
            print(f"Failed to connect to Neo4j: {e}")
            self._driver = None

    @property
    def driver(self):
        if self._driver is None:
            self._connect()
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None

    def execute_query(self, query, parameters=None):
        if not self._driver:
            return None

        with self._driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]

    def execute_single(self, query, parameters=None):
        if not self._driver:
            return None

        with self._driver.session() as session:
            result = session.run(query, parameters or {})
            return result.single()


neo4j_conn = Neo4jConnection()
