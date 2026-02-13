/**
 * Contestants Routes
 * Public routes for viewing contestants
 */

const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');

/**
 * GET /api/contestants
 * Get all active contestants
 */
router.get('/contestants', async (req, res) => {
    try {
        const contestants = await googleSheets.getContestants(false);
        
        res.json({
            success: true,
            contestants: contestants
        });
        
    } catch (error) {
        console.error('Error getting contestants:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading contestants'
        });
    }
});

module.exports = router;