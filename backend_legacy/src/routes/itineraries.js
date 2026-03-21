import express from 'express';
import {
    createItinerary,
    getUserItineraries,
    getItinerary,
    deleteItinerary
} from '../controllers/itineraryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createItinerary);
router.get('/', authMiddleware, getUserItineraries);
router.get('/:id', getItinerary);
router.delete('/:id', authMiddleware, deleteItinerary);

export default router;
