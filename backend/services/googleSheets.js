/**
 * Google Sheets API Service
 * Handles all interactions with Google Sheets
 */

const { google } = require('googleapis');
const path = require('path');

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const CONTESTANTS_SHEET = 'Contestants';
const VOTES_SHEET = 'Votes';

/**
 * Initialize Google Sheets API client
 * Works in both development (credentials.json file) and production (environment variable)
 */
async function getAuthClient() {
    try {
        let credentials;
        
        // Check if credentials are in environment variable (production/Render)
        if (process.env.GOOGLE_CREDENTIALS) {
            console.log('Using credentials from environment variable');
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } else {
            // Use file for local development
            console.log('Using credentials from file');
            const keyFilePath = path.join(__dirname, '../config/credentials.json');
            credentials = require(keyFilePath);
        }
        
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        return await auth.getClient();
    } catch (error) {
        console.error('Error initializing Google Sheets auth:', error);
        throw new Error('Failed to authenticate with Google Sheets');
    }
}

/**
 * Get Google Sheets API instance
 */
async function getSheetsAPI() {
    const authClient = await getAuthClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Get all contestants from Google Sheets
 */
async function getContestants(includeInactive = false) {
    try {
        const sheets = await getSheetsAPI();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CONTESTANTS_SHEET}!A2:E`, // Skip header row
        });
        
        const rows = response.data.values || [];
        
        const contestants = rows.map(row => ({
            id: parseInt(row[0]),
            name: row[1] || '',
            description: row[2] || '',
            active: row[3] === 'TRUE' || row[3] === true,
            imageUrl: row[4] || ''
        }));
        
        // Filter out inactive contestants if needed
        if (!includeInactive) {
            return contestants.filter(c => c.active);
        }
        
        return contestants;
        
    } catch (error) {
        console.error('Error getting contestants:', error);
        throw error;
    }
}

/**
 * Add a new contestant
 */
async function addContestant(contestantData) {
    try {
        const sheets = await getSheetsAPI();
        
        // Get current contestants to determine next ID
        const contestants = await getContestants(true);
        const nextId = contestants.length > 0 
            ? Math.max(...contestants.map(c => c.id)) + 1 
            : 1;
        
        const values = [
            [
                nextId,
                contestantData.name,
                contestantData.description || '',
                contestantData.active !== false ? 'TRUE' : 'FALSE',
                contestantData.imageUrl || ''
            ]
        ];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CONTESTANTS_SHEET}!A:E`,
            valueInputOption: 'RAW',
            resource: { values }
        });
        
        return { id: nextId, ...contestantData };
        
    } catch (error) {
        console.error('Error adding contestant:', error);
        throw error;
    }
}

/**
 * Update a contestant
 */
async function updateContestant(contestantId, contestantData) {
    try {
        const sheets = await getSheetsAPI();
        
        // Find the row index
        const contestants = await getContestants(true);
        const index = contestants.findIndex(c => c.id === contestantId);
        
        if (index === -1) {
            throw new Error('Contestant not found');
        }
        
        const rowIndex = index + 2; // +2 because of header row and 0-based index
        
        const values = [
            [
                contestantId,
                contestantData.name,
                contestantData.description || '',
                contestantData.active !== false ? 'TRUE' : 'FALSE',
                contestantData.imageUrl || ''
            ]
        ];
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CONTESTANTS_SHEET}!A${rowIndex}:E${rowIndex}`,
            valueInputOption: 'RAW',
            resource: { values }
        });
        
        return { id: contestantId, ...contestantData };
        
    } catch (error) {
        console.error('Error updating contestant:', error);
        throw error;
    }
}

/**
 * Delete a contestant (set to inactive)
 */
async function deleteContestant(contestantId) {
    try {
        const sheets = await getSheetsAPI();
        
        // Find the row index
        const contestants = await getContestants(true);
        const index = contestants.findIndex(c => c.id === contestantId);
        
        if (index === -1) {
            throw new Error('Contestant not found');
        }
        
        const rowIndex = index + 2;
        
        // Set active to FALSE instead of deleting
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CONTESTANTS_SHEET}!D${rowIndex}`,
            valueInputOption: 'RAW',
            resource: { values: [['FALSE']] }
        });
        
        return true;
        
    } catch (error) {
        console.error('Error deleting contestant:', error);
        throw error;
    }
}

/**
 * Check if email or mobile number has already voted
 */
async function checkDuplicateVote(email, mobile) {
    try {
        const sheets = await getSheetsAPI();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${VOTES_SHEET}!B2:D`, // Name, Email, Mobile columns
        });
        
        const rows = response.data.values || [];
        
        // Check for duplicate email or mobile
        const emailLower = email.toLowerCase();
        const mobileClean = mobile.replace(/[\s-]/g, '');
        
        for (const row of rows) {
            const existingEmail = (row[1] || '').toLowerCase();
            const existingMobile = (row[2] || '').replace(/[\s-]/g, '');
            
            if (existingEmail === emailLower || existingMobile === mobileClean) {
                return true; // Duplicate found
            }
        }
        
        return false; // No duplicate
        
    } catch (error) {
        console.error('Error checking duplicate vote:', error);
        throw error;
    }
}

/**
 * Submit a vote
 */
async function submitVote(voteData) {
    try {
        const sheets = await getSheetsAPI();
        
        // Check for duplicate vote
        const isDuplicate = await checkDuplicateVote(voteData.email, voteData.mobile);
        
        if (isDuplicate) {
            throw new Error('DUPLICATE_VOTE');
        }
        
        // Verify contestant exists and is active
        const contestants = await getContestants();
        const contestant = contestants.find(c => c.id === voteData.contestantId);
        
        if (!contestant) {
            throw new Error('Invalid contestant');
        }
        
        // Format date only (no time) - Philippine timezone
        const now = new Date();
        const dateOnly = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Manila'
        });
        
        // Add vote to sheet with new fields
        const values = [
            [
                dateOnly,
                voteData.fullName,
                voteData.email,
                voteData.mobile,
                voteData.currentSchool || '',
                voteData.gradeLevel || '',
                voteData.contestantId,
                voteData.ipAddress || ''
            ]
        ];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${VOTES_SHEET}!A:H`,
            valueInputOption: 'RAW',
            resource: { values }
        });
        
        return true;
        
    } catch (error) {
        console.error('Error submitting vote:', error);
        throw error;
    }
}

/**
 * Get all votes
 */
async function getVotes() {
    try {
        const sheets = await getSheetsAPI();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${VOTES_SHEET}!A2:H`,
        });
        
        const rows = response.data.values || [];
        
        return rows.map(row => ({
            timestamp: row[0] || '',
            name: row[1] || '',
            email: row[2] || '',
            mobile: row[3] || '',
            currentSchool: row[4] || '',
            gradeLevel: row[5] || '',
            contestantId: parseInt(row[6]) || 0,
            ipAddress: row[7] || ''
        }));
        
    } catch (error) {
        console.error('Error getting votes:', error);
        throw error;
    }
}

/**
 * Get voting results (vote counts per contestant)
 * FIXED: Now includes imageUrl for results page
 */
async function getResults() {
    try {
        const [contestants, votes] = await Promise.all([
            getContestants(),
            getVotes()
        ]);
        
        // Count votes per contestant
        const voteCounts = {};
        votes.forEach(vote => {
            const id = vote.contestantId;
            voteCounts[id] = (voteCounts[id] || 0) + 1;
        });
        
        // Build results - NOW INCLUDES imageUrl
        const results = contestants.map(contestant => ({
            id: contestant.id,
            name: contestant.name,
            description: contestant.description,
            imageUrl: contestant.imageUrl, // ✅ ADDED THIS LINE
            votes: voteCounts[contestant.id] || 0
        }));
        
        return {
            totalVotes: votes.length,
            results: results
        };
        
    } catch (error) {
        console.error('Error getting results:', error);
        throw error;
    }
}

/**
 * Get voters list with contestant names
 */
async function getVotersWithNames() {
    try {
        const [contestants, votes] = await Promise.all([
            getContestants(true),
            getVotes()
        ]);
        
        // Map contestant IDs to names
        const contestantMap = {};
        contestants.forEach(c => {
            contestantMap[c.id] = c.name;
        });
        
        // Add contestant names to votes
        return votes.map(vote => ({
            ...vote,
            contestantName: contestantMap[vote.contestantId] || 'Unknown'
        }));
        
    } catch (error) {
        console.error('Error getting voters:', error);
        throw error;
    }
}

module.exports = {
    getContestants,
    addContestant,
    updateContestant,
    deleteContestant,
    checkDuplicateVote,
    submitVote,
    getVotes,
    getResults,
    getVotersWithNames
};