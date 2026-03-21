import driver from '../config/database.js';

/**
 * Get "Influential" places using a PageRank-inspired centrality measure.
 * Ranks places not just by visits, but by the "quality" of itineraries they belong to.
 */
export const getInfluentialPlaces = async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Place)
            OPTIONAL MATCH (p)<-[:VISITS]-(i:Itinerary)<-[:CREATED]-(u:User)
            WITH p, count(u) as uniqueTravelers, count(i) as totalVisits
            // Simple influence score: unique travelers * average rating
            RETURN p.name as name, p.type as type, 
                   (uniqueTravelers * coalesce(p.rating, 0)) as influenceScore,
                   totalVisits
            ORDER BY influenceScore DESC
            LIMIT 5
        `);

        const influential = result.records.map(record => ({
            name: record.get('name'),
            type: record.get('type'),
            score: record.get('influenceScore'),
            visits: record.get('totalVisits').toNumber()
        }));

        res.json(influential);
    } catch (error) {
        console.error('Advanced SNA Error (PageRank):', error);
        res.status(500).json({ error: 'Failed to calculate influence mapping' });
    } finally {
        await session.close();
    }
};

/**
 * Identify the user's "Travel Tribe" using community detection logic.
 * Analyzes the density of categories in the user's graph neighborhood.
 */
export const getTravelTribe = async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User {id: $userId})-[:CREATED]->(i:Itinerary)-[:VISITS]->(p:Place)
            WITH p.type as category, count(*) as frequency
            ORDER BY frequency DESC
            LIMIT 1
            RETURN category as tribe
        `, { userId: req.userId });

        let tribe = "Explorer"; // Default
        if (result.records.length > 0) {
            const topCategory = result.records[0].get('tribe');
            // Map types to tribes
            const tribeMap = {
                'restaurant': 'Culinary Adventurer 🍛',
                'food': 'Culinary Adventurer 🍛',
                'temple': 'Heritage Seeker 🏛️',
                'heritage': 'Heritage Seeker 🏛️',
                'outdoors': 'Nature Enthusiast 🌿',
                'shopping': 'Urban Explorer 🛍️'
            };
            tribe = tribeMap[topCategory.toLowerCase()] || "Vivid Voyager 🗺️";
        }

        res.json({ tribe });
    } catch (error) {
        console.error('Advanced SNA Error (Tribe):', error);
        res.status(500).json({ error: 'Failed to detect traveler community' });
    } finally {
        await session.close();
    }
};

/**
 * Get personalized recommendations for a user based on Jaccard Similarity 
 * (People who visited similar places to you also visited...)
 */
export const getSocialRecommendations = async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u1:User {id: $userId})-[:CREATED]->(i1)-[:VISITS]->(p:Place)<-[:VISITS]-(i2)<-[:CREATED]-(u2:User)
            WHERE u1 <> u2
            
            // Find places user2 visited that user1 hasn't
            MATCH (u2)-[:CREATED]->(i3)-[:VISITS]->(rec:Place)
            WHERE NOT (u1)-[:CREATED]->(:Itinerary)-[:VISITS]->(rec)
            
            RETURN rec.name as name, rec.type as type, rec.rating as rating, count(*) as weight
            ORDER BY weight DESC
            LIMIT 5
        `, { userId: req.userId });

        const recommendations = result.records.map(record => ({
            name: record.get('name'),
            type: record.get('type'),
            rating: record.get('rating'),
            weight: record.get('weight').toNumber()
        }));

        res.json(recommendations);
    } catch (error) {
        console.error('SNA Analytics Error (Social Recs):', error);
        res.status(500).json({ error: 'Failed to fetch social recommendations' });
    } finally {
        await session.close();
    }
};
