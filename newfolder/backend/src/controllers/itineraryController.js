import driver from '../config/database.js';
import crypto from 'crypto';

export const createItinerary = async (req, res) => {
    const session = driver.session();
    try {
        const { destination, duration, budget, travelers, days } = req.body;
        const itineraryId = crypto.randomUUID();

        // 1. Create the Itinerary node and link to User
        // 2. Unwind days and activities to create Place and City nodes + relationships
        const query = `
            MATCH (u:User {id: $userId})
            MERGE (c:City {name: $destination})
            CREATE (i:Itinerary {
                id: $itineraryId,
                destination: $destination,
                duration: $duration,
                budget: $budget,
                travelers: $travelers,
                days: $days,
                createdAt: datetime(),
                isPublic: false,
                likes: 0
            })
            CREATE (u)-[:CREATED]->(i)
            CREATE (i)-[:DESTINED_FOR]->(c)
            
            WITH i, c
            UNWIND $parsedDays AS day
            UNWIND day.activities AS activity
            MERGE (p:Place {name: activity.title, cityName: $destination})
            ON CREATE SET 
                p.id = randomUUID(),
                p.type = activity.type,
                p.rating = activity.rating,
                p.lat = activity.location.lat,
                p.lng = activity.location.lng
            
            CREATE (i)-[:VISITS]->(p)
            MERGE (p)-[:LOCATED_IN]->(c)
            
            RETURN i
        `;

        const result = await session.run(query, {
            userId: req.userId,
            itineraryId,
            destination,
            duration,
            budget,
            travelers,
            days: JSON.stringify(days),
            parsedDays: days
        });

        if (result.records.length === 0) {
            throw new Error('Failed to create itinerary or user not found');
        }

        const itinerary = result.records[0].get('i').properties;
        res.status(201).json({
            ...itinerary,
            days: JSON.parse(itinerary.days)
        });
    } catch (error) {
        console.error('Create itinerary error:', error);
        res.status(500).json({ error: 'Failed to create itinerary' });
    } finally {
        await session.close();
    }
};

export const getUserItineraries = async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (i:Itinerary {userId: $userId})
             RETURN i
             ORDER BY i.createdAt DESC`,
            { userId: req.userId }
        );

        const itineraries = result.records.map(record => {
            const itinerary = record.get('i').properties;
            return {
                ...itinerary,
                days: JSON.parse(itinerary.days)
            };
        });

        res.json(itineraries);
    } catch (error) {
        console.error('Get itineraries error:', error);
        res.status(500).json({ error: 'Failed to get itineraries' });
    } finally {
        await session.close();
    }
};

export const getItinerary = async (req, res) => {
    const session = driver.session();
    try {
        const { id } = req.params;

        const result = await session.run(
            'MATCH (i:Itinerary {id: $id}) RETURN i',
            { id }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Itinerary not found' });
        }

        const itinerary = result.records[0].get('i').properties;
        res.json({
            ...itinerary,
            days: JSON.parse(itinerary.days)
        });
    } catch (error) {
        console.error('Get itinerary error:', error);
        res.status(500).json({ error: 'Failed to get itinerary' });
    } finally {
        await session.close();
    }
};

export const deleteItinerary = async (req, res) => {
    const session = driver.session();
    try {
        const { id } = req.params;

        const result = await session.run(
            `MATCH (i:Itinerary {id: $id, userId: $userId})
             DELETE i
             RETURN count(i) as deletedCount`,
            { id, userId: req.userId }
        );

        const deletedCount = result.records[0].get('deletedCount').toNumber();

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Itinerary not found or unauthorized' });
        }

        res.json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
        console.error('Delete itinerary error:', error);
        res.status(500).json({ error: 'Failed to delete itinerary' });
    } finally {
        await session.close();
    }
};
