/**
 * Google Sheets API Service
 */

const { google } = require('googleapis');
const path       = require('path');

const SPREADSHEET_ID    = process.env.GOOGLE_SHEET_ID;
const CONTESTANTS_SHEET = 'Contestants';
const VOTES_SHEET       = 'Votes';

async function getAuthClient() {
    try {
        let credentials;
        if (process.env.GOOGLE_CREDENTIALS) {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } else {
            const keyFilePath = path.join(__dirname, '../config/credentials.json');
            credentials = require(keyFilePath);
        }
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return await auth.getClient();
    } catch (error) {
        console.error('Auth error:', error);
        throw new Error('Failed to authenticate with Google Sheets');
    }
}

async function getSheetsAPI() {
    const authClient = await getAuthClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

async function getContestants(includeInactive = false) {
    try {
        const sheets   = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CONTESTANTS_SHEET}!A2:E`,
        });
        const rows = response.data.values || [];
        const contestants = rows.map(row => ({
            id:          parseInt(row[0]),
            name:        row[1] || '',
            description: row[2] || '',
            active:      row[3] === 'TRUE' || row[3] === true,
            imageUrl:    row[4] || ''
        }));
        return includeInactive ? contestants : contestants.filter(c => c.active);
    } catch (error) {
        console.error('Error getting contestants:', error);
        throw error;
    }
}

async function addContestant(contestantData) {
    try {
        const sheets      = await getSheetsAPI();
        const contestants = await getContestants(true);
        const nextId      = contestants.length > 0
            ? Math.max(...contestants.map(c => c.id)) + 1
            : 1;

        await sheets.spreadsheets.values.append({
            spreadsheetId:   SPREADSHEET_ID,
            range:           `${CONTESTANTS_SHEET}!A:E`,
            valueInputOption:'RAW',
            resource: {
                values: [[
                    nextId,
                    contestantData.name,
                    contestantData.description || '',
                    contestantData.active !== false ? 'TRUE' : 'FALSE',
                    contestantData.imageUrl || ''
                ]]
            }
        });
        return { id: nextId, ...contestantData };
    } catch (error) {
        console.error('Error adding contestant:', error);
        throw error;
    }
}

async function updateContestant(contestantId, contestantData) {
    try {
        const sheets      = await getSheetsAPI();
        const contestants = await getContestants(true);
        const index       = contestants.findIndex(c => c.id === contestantId);
        if (index === -1) throw new Error('Contestant not found');

        const rowIndex = index + 2;
        await sheets.spreadsheets.values.update({
            spreadsheetId:   SPREADSHEET_ID,
            range:           `${CONTESTANTS_SHEET}!A${rowIndex}:E${rowIndex}`,
            valueInputOption:'RAW',
            resource: {
                values: [[
                    contestantId,
                    contestantData.name,
                    contestantData.description || '',
                    contestantData.active !== false ? 'TRUE' : 'FALSE',
                    contestantData.imageUrl || ''
                ]]
            }
        });
        return { id: contestantId, ...contestantData };
    } catch (error) {
        console.error('Error updating contestant:', error);
        throw error;
    }
}

async function deleteContestant(contestantId) {
    try {
        const sheets      = await getSheetsAPI();
        const contestants = await getContestants(true);
        const index       = contestants.findIndex(c => c.id === contestantId);
        if (index === -1) throw new Error('Contestant not found');

        await sheets.spreadsheets.values.update({
            spreadsheetId:   SPREADSHEET_ID,
            range:           `${CONTESTANTS_SHEET}!D${index + 2}`,
            valueInputOption:'RAW',
            resource: { values: [['FALSE']] }
        });
        return true;
    } catch (error) {
        console.error('Error deleting contestant:', error);
        throw error;
    }
}

async function checkDuplicateVote(email, mobile) {
    try {
        const sheets   = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${VOTES_SHEET}!C2:D`, // Email, Mobile columns
        });
        const rows       = response.data.values || [];
        const emailLower = email.toLowerCase();
        const mobileClean= mobile.replace(/[\s-]/g, '');

        for (const row of rows) {
            const existingEmail  = (row[0] || '').toLowerCase();
            const existingMobile = (row[1] || '').replace(/[\s-]/g, '');
            if (existingEmail === emailLower || existingMobile === mobileClean) return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking duplicate:', error);
        throw error;
    }
}

async function submitVote(voteData) {
    try {
        const sheets = await getSheetsAPI();

        const isDuplicate = await checkDuplicateVote(voteData.email, voteData.mobile);
        if (isDuplicate) throw new Error('DUPLICATE_VOTE');

        const contestants = await getContestants();
        const contestant  = contestants.find(c => c.id === voteData.contestantId);
        if (!contestant) throw new Error('Invalid contestant');

        const now      = new Date();
        const dateOnly = now.toLocaleDateString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            timeZone: 'Asia/Manila'
        });

        await sheets.spreadsheets.values.append({
            spreadsheetId:   SPREADSHEET_ID,
            range:           `${VOTES_SHEET}!A:J`,
            valueInputOption:'RAW',
            resource: {
                values: [[
                    dateOnly,
                    voteData.fullName,
                    voteData.email,
                    voteData.mobile,
                    voteData.currentSchool  || '',
                    voteData.gradeLevel     || '',
                    voteData.contestantId,
                    voteData.ipAddress      || '',
                    voteData.guardianName   || '',   // Column I
                    voteData.guardianNumber || ''    // Column J
                ]]
            }
        });
        return true;
    } catch (error) {
        console.error('Error submitting vote:', error);
        throw error;
    }
}

async function getVotes() {
    try {
        const sheets   = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${VOTES_SHEET}!A2:J`,
        });
        const rows = response.data.values || [];
        return rows.map(row => ({
            timestamp:     row[0] || '',
            name:          row[1] || '',
            email:         row[2] || '',
            mobile:        row[3] || '',
            currentSchool: row[4] || '',
            gradeLevel:    row[5] || '',
            contestantId:  parseInt(row[6]) || 0,
            ipAddress:     row[7] || '',
            guardianName:  row[8] || '',
            guardianNumber:row[9] || ''
        }));
    } catch (error) {
        console.error('Error getting votes:', error);
        throw error;
    }
}

async function getResults() {
    try {
        const [contestants, votes] = await Promise.all([getContestants(), getVotes()]);
        const voteCounts = {};
        votes.forEach(vote => {
            const id = vote.contestantId;
            voteCounts[id] = (voteCounts[id] || 0) + 1;
        });
        const results = contestants.map(c => ({
            id:          c.id,
            name:        c.name,
            description: c.description,
            imageUrl:    c.imageUrl,
            votes:       voteCounts[c.id] || 0
        }));
        return { totalVotes: votes.length, results };
    } catch (error) {
        console.error('Error getting results:', error);
        throw error;
    }
}

async function getVotersWithNames() {
    try {
        const [contestants, votes] = await Promise.all([getContestants(true), getVotes()]);
        const contestantMap = {};
        contestants.forEach(c => { contestantMap[c.id] = c.name; });
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
    getContestants, addContestant, updateContestant, deleteContestant,
    checkDuplicateVote, submitVote, getVotes, getResults, getVotersWithNames
};