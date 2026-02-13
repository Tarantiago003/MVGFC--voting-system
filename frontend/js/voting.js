/**
 * MVG Foundation Colleges - Voting System
 * Voting Page Frontend Logic
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

/**
 * Initialize voting page
 */
document.addEventListener('DOMContentLoaded', function() {
    loadContestants();
    setupVotingForm();
});

/**
 * Load contestants and render voting options
 */
async function loadContestants() {
    const container = document.getElementById('contestantsList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/contestants`);
        
        if (!response.ok) {
            throw new Error('Failed to load contestants');
        }
        
        const data = await response.json();
        renderContestants(data.contestants || []);
        
    } catch (error) {
        console.error('Error loading contestants:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Unable to load contestants. Please refresh the page.</p>
            </div>
        `;
    }
}

/**
 * Render contestant voting cards with images
 */
function renderContestants(contestants) {
    const container = document.getElementById('contestantsList');
    
    if (!container) {
        console.error('contestantsList element not found');
        return;
    }
    
    if (contestants.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <p>No active contestants at the moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = contestants.map(contestant => {
        // Image URL with fallback to placeholder
        const imageUrl = contestant.imageUrl 
            ? `assets/candidates/${contestant.imageUrl}` 
            : 'assets/placeholder-candidate.png';
        
        return `
            <label class="contestant-card">
                <input 
                    type="radio" 
                    name="contestant" 
                    value="${contestant.id}" 
                    required
                    style="display: none;"
                >
                <div class="contestant-image-container">
                    <img 
                        src="${imageUrl}" 
                        alt="${escapeHtml(contestant.name)}"
                        class="contestant-image"
                        onerror="this.src='assets/placeholder-candidate.png'"
                    >
                </div>
                <div class="contestant-info">
                    <h3 class="contestant-name">${escapeHtml(contestant.name)}</h3>
                    ${contestant.description ? `<p class="contestant-description">${escapeHtml(contestant.description)}</p>` : ''}
                </div>
                <div class="radio-indicator"></div>
            </label>
        `;
    }).join('');
    
    // Add click handlers for visual feedback
    document.querySelectorAll('.contestant-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            document.querySelectorAll('.contestant-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Check the radio button
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
}

/**
 * Setup voting form submission
 */
function setupVotingForm() {
    const form = document.getElementById('votingForm');
    
    if (!form) {
        console.error('Voting form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if a contestant is selected
        const selectedContestant = document.querySelector('input[name="contestant"]:checked');
        if (!selectedContestant) {
            showError('Please select a candidate');
            return;
        }
        
        // Collect form data - FIXED: Use exact field names backend expects
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            currentSchool: document.getElementById('currentSchool').value.trim(),
            gradeLevel: document.getElementById('gradeLevel').value,
            contestantId: parseInt(selectedContestant.value)
        };
        
        // Validate form data
        if (!formData.fullName || !formData.email || !formData.mobile || !formData.currentSchool || !formData.gradeLevel || !formData.contestantId) {
            showError('Please fill in all required fields');
            return;
        }
        
        console.log('Submitting vote with data:', formData); // Debug log
        
        // Disable submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            console.log('Server response:', result); // Debug log
            
            if (response.ok && result.success) {
                // Success - show message and redirect
                showSuccess();
                setTimeout(() => {
                    window.location.href = 'results.html';
                }, 2000);
            } else {
                // Error from server
                showError(result.message || 'Error submitting vote');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Vote';
            }
            
        } catch (error) {
            console.error('Error submitting vote:', error);
            showError('Connection error. Please check your internet and try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Vote';
        }
    });
}

/**
 * Show success message
 */
function showSuccess() {
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    const form = document.getElementById('votingForm');
    
    if (successMsg) {
        successMsg.style.display = 'block';
    }
    
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
    
    if (form) {
        form.style.display = 'none';
    }
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show error message
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMsg = document.getElementById('successMessage');
    
    if (errorText) {
        errorText.textContent = message;
    }
    
    if (errorMsg) {
        errorMsg.style.display = 'block';
    }
    
    if (successMsg) {
        successMsg.style.display = 'none';
    }
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}