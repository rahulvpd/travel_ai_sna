import express from 'express';
import { getInfluentialPlaces, getSocialRecommendations, getTravelTribe } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get PageRank-style influential places
router.get('/influential', getInfluentialPlaces);

// Get the user's "Travel Tribe" (Community Detection)
router.get('/tribe', authMiddleware, getTravelTribe);

// Personalized recommendations based on graph connectivity
router.get('/social-recs', authMiddleware, getSocialRecommendations);

export default router;
