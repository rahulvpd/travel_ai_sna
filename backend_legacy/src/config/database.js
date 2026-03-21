import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD
    )
);

// Test connection
const testConnection = async () => {
    const session = driver.session();
    try {
        await session.run('RETURN 1');
        console.log('✅ Neo4j connected successfully');
    } catch (error) {
        console.error('❌ Neo4j connection failed:', error.message);
    } finally {
        await session.close();
    }
};

testConnection();

export default driver;
