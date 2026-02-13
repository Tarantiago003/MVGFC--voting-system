/**
 * Admin Routes
 * Protected routes for admin panel (WITHOUT file upload)
 */

const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/admin/login
 * Admin login
 */
router.post('/login', (req, res) => {
    const { password } = req.body;
    
    // Check password against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
        // Simple token (in production, use JWT or proper session management)
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
        
        res.json({
            success: true,
            token: token,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
});

/**
 * GET /api/admin/overview
 * Get system overview statistics
 */
router.get('/overview', authenticate, async (req, res) => {
    try {
        const [contestants, votes] = await Promise.all([
            googleSheets.getContestants(true),
            googleSheets.getVotes()
        ]);
        
        const activeContestants = contestants.filter(c => c.active).length;
        
        res.json({
            success: true,
            totalVotes: votes.length,
            totalContestants: contestants.length,
            activeContestants: activeContestants
        });
        
    } catch (error) {
        console.error('Error getting overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading overview'
        });
    }
});

/**
 * GET /api/admin/contestants
 * Get all contestants (including inactive)
 */
router.get('/contestants', authenticate, async (req, res) => {
    try {
        const contestants = await googleSheets.getContestants(true);
        
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

/**
 * POST /api/admin/contestants
 * Add a new contestant (imageUrl is just a filename string)
 */
router.post('/contestants', authenticate, async (req, res) => {
    try {
        const { name, description, active, imageUrl } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Contestant name is required'
            });
        }
        
        const contestantData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            active: active !== false,
            imageUrl: imageUrl ? imageUrl.trim() : '' // Just store filename string
        };
        
        const contestant = await googleSheets.addContestant(contestantData);
        
        res.json({
            success: true,
            message: 'Contestant added successfully',
            contestant: contestant
        });
        
    } catch (error) {
        console.error('Error adding contestant:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding contestant'
        });
    }
});

/**
 * PUT /api/admin/contestants/:id
 * Update a contestant (imageUrl is just a filename string)
 */
router.put('/contestants/:id', authenticate, async (req, res) => {
    try {
        const contestantId = parseInt(req.params.id);
        const { name, description, active, imageUrl } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Contestant name is required'
            });
        }
        
        const contestantData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            active: active !== false,
            imageUrl: imageUrl ? imageUrl.trim() : '' // Just store filename string
        };
        
        const contestant = await googleSheets.updateContestant(contestantId, contestantData);
        
        res.json({
            success: true,
            message: 'Contestant updated successfully',
            contestant: contestant
        });
        
    } catch (error) {
        console.error('Error updating contestant:', error);
        
        if (error.message === 'Contestant not found') {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating contestant'
        });
    }
});

/**
 * DELETE /api/admin/contestants/:id
 * Delete (deactivate) a contestant
 */
router.delete('/contestants/:id', authenticate, async (req, res) => {
    try {
        const contestantId = parseInt(req.params.id);
        
        await googleSheets.deleteContestant(contestantId);
        
        res.json({
            success: true,
            message: 'Contestant deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting contestant:', error);
        
        if (error.message === 'Contestant not found') {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error deleting contestant'
        });
    }
});

/**
 * GET /api/admin/voters
 * Get list of all voters
 */
router.get('/voters', authenticate, async (req, res) => {
    try {
        const voters = await googleSheets.getVotersWithNames();
        
        res.json({
            success: true,
            voters: voters
        });
        
    } catch (error) {
        console.error('Error getting voters:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading voters'
        });
    }
});

module.exports = router;