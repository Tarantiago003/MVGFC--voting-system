/**
 * Vote Routes
 * Handles vote submission
 */

const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');

/**
 * POST /api/vote
 * Submit a vote
 */
router.post('/vote', async (req, res) => {
    try {
        const { fullName, email, mobile, currentSchool, gradeLevel, contestantId } = req.body;
        
        // Validation
        if (!fullName || !email || !mobile || !currentSchool || !gradeLevel || !contestantId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // Validate mobile number (Philippine format)
        const mobileClean = mobile.replace(/[\s-]/g, '');
        const mobileRegex = /^09[0-9]{9}$/;
        if (!mobileRegex.test(mobileClean)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mobile number format. Must be 11 digits starting with 09'
            });
        }
        
        // Validate school name
        if (currentSchool.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid school name'
            });
        }
        
        // Get IP address for logging
        const ipAddress = req.headers['x-forwarded-for'] || 
                          req.connection.remoteAddress || 
                          req.socket.remoteAddress;
        
        // Submit vote
        const voteData = {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobileClean,
            currentSchool: currentSchool.trim(),
            gradeLevel: gradeLevel.trim(),
            contestantId: parseInt(contestantId),
            ipAddress: ipAddress
        };
        
        await googleSheets.submitVote(voteData);
        
        res.json({
            success: true,
            message: 'Vote submitted successfully'
        });
        
    } catch (error) {
        console.error('Vote submission error:', error);
        
        if (error.message === 'DUPLICATE_VOTE') {
            return res.status(400).json({
                success: false,
                message: 'You have already voted. Each email and mobile number can only vote once.'
            });
        }
        
        if (error.message === 'Invalid contestant') {
            return res.status(400).json({
                success: false,
                message: 'Invalid candidate selected'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An error occurred while submitting your vote. Please try again.'
        });
    }
});

/**
 * GET /api/results
 * Get voting results
 */
router.get('/results', async (req, res) => {
    try {
        const results = await googleSheets.getResults();
        
        res.json({
            success: true,
            totalVotes: results.totalVotes,
            results: results.results
        });
        
    } catch (error) {
        console.error('Error getting results:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading results'
        });
    }
});

module.exports = router;