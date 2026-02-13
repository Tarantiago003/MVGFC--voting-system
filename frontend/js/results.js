/**
 * MVG Foundation Colleges - Voting System
 * Frontend Logic for Results Display
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Auto-refresh interval (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;
let refreshInterval;

/**
 * Initialize the results page
 */
document.addEventListener('DOMContentLoaded', function() {
    loadResults();
    
    // Setup auto-refresh
    refreshInterval = setInterval(loadResults, AUTO_REFRESH_INTERVAL);
});

/**
 * Load voting results from API
 */
async function loadResults() {
    const resultsList = document.getElementById('resultsList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/results`);
        
        if (!response.ok) {
            throw new Error('Failed to load results');
        }
        
        const data = await response.json();
        
        // Update statistics
        updateStatistics(data);
        
        // Render results
        renderResults(data.results || []);
        
        // Update last update time
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Error loading results:', error);
        resultsList.innerHTML = `
            <div class="card">
                <div class="error-message">
                    <p>Unable to load results. Please try again.</p>
                </div>
            </div>
        `;
    }
}

/**
 * Update statistics display
 */
function updateStatistics(data) {
    const totalVotes = data.totalVotes || 0;
    const totalCandidates = data.results ? data.results.length : 0;
    
    document.getElementById('totalVotes').textContent = totalVotes;
    document.getElementById('totalCandidates').textContent = totalCandidates;
    
    // Find leading candidate
    if (data.results && data.results.length > 0) {
        const sortedResults = [...data.results].sort((a, b) => b.votes - a.votes);
        const leader = sortedResults[0];
        
        if (leader.votes > 0) {
            document.getElementById('leadingCandidate').textContent = leader.name;
        } else {
            document.getElementById('leadingCandidate').textContent = '-';
        }
    }
}

/**
 * Render voting results with candidate images
 */
function renderResults(results) {
    const resultsList = document.getElementById('resultsList');
    
    if (results.length === 0) {
        resultsList.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: #666;">
                    No votes have been cast yet. Be the first to vote!
                </p>
            </div>
        `;
        return;
    }
    
    // Sort by votes (descending)
    const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
    
    // Calculate total votes for percentages
    const totalVotes = sortedResults.reduce((sum, result) => sum + result.votes, 0);
    
    // Render each contestant result with image
    resultsList.innerHTML = sortedResults.map((result, index) => {
        const percentage = totalVotes > 0 ? (result.votes / totalVotes * 100).toFixed(1) : 0;
        const isLeading = index === 0 && result.votes > 0;
        
        // Candidate image with fallback
        const imageUrl = result.imageUrl 
            ? `assets/candidates/${result.imageUrl}` 
            : 'assets/placeholder-candidate.png';
        
        return `
            <div class="contestant-result ${isLeading ? 'leading' : ''}">
                <div class="contestant-result-header">
                    <div class="contestant-result-info">
                        <div class="result-image-container">
                            <img 
                                src="${imageUrl}" 
                                alt="${escapeHtml(result.name)}"
                                class="result-candidate-image"
                                onerror="this.src='assets/placeholder-candidate.png'"
                            >
                        </div>
                        <div>
                            <h3>${escapeHtml(result.name)}</h3>
                            <p style="color: #666; font-size: 14px; margin-top: 4px;">
                                ${escapeHtml(result.description || 'Student Representative')}
                            </p>
                        </div>
                    </div>
                    <div class="vote-count">
                        ${result.votes} ${result.votes === 1 ? 'vote' : 'votes'}
                    </div>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%">
                        ${percentage > 10 ? `<span class="progress-percentage">${percentage}%</span>` : ''}
                    </div>
                </div>
                
                ${percentage <= 10 ? `
                    <div style="text-align: right; margin-top: 4px; font-size: 14px; color: #666;">
                        ${percentage}%
                    </div>
                ` : ''}
                
                ${isLeading ? `
                    <div style="text-align: center; margin-top: 8px;">
                        <span style="background: var(--accent-green); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            🏆 LEADING
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Manual refresh results
 */
function refreshResults() {
    const button = event.target;
    button.disabled = true;
    button.textContent = '🔄 Refreshing...';
    
    loadResults().then(() => {
        button.disabled = false;
        button.textContent = '🔄 Refresh Results';
    });
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('lastUpdate').textContent = timeString;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});