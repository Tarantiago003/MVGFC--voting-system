/**
 * MVG Foundation Colleges - Voting System
 * Voting Page Frontend Logic
 */

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', function () {
    loadContestants();
    setupVotingForm();
});

async function loadContestants() {
    const container = document.getElementById('contestantsList');
    try {
        const response = await fetch(`${API_BASE_URL}/contestants`);
        if (!response.ok) throw new Error('Failed to load contestants');
        const data = await response.json();
        renderContestants(data.contestants || []);
    } catch (error) {
        console.error('Error loading contestants:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Unable to load contestants. Please refresh the page.</p>
            </div>`;
    }
}

function renderContestants(contestants) {
    const container = document.getElementById('contestantsList');
    if (!container) return;

    if (contestants.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <p>No active contestants at the moment.</p>
            </div>`;
        return;
    }

    container.innerHTML = contestants.map(contestant => {
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
                    ${contestant.description
                        ? `<p class="contestant-description">${escapeHtml(contestant.description)}</p>`
                        : ''}
                </div>
                <div class="radio-indicator"></div>
            </label>`;
    }).join('');

    document.querySelectorAll('.contestant-card').forEach(card => {
        card.addEventListener('click', function () {
            document.querySelectorAll('.contestant-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
}

function setupVotingForm() {
    const form = document.getElementById('votingForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Privacy consent check
        const consent      = document.getElementById('privacyConsent');
        const consentError = document.getElementById('consentError');
        if (!consent.checked) {
            consentError.style.display = 'block';
            consent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        consentError.style.display = 'none';

        // Candidate check
        const selectedContestant = document.querySelector('input[name="contestant"]:checked');
        if (!selectedContestant) {
            showError('Please select a candidate');
            return;
        }

        const formData = {
            fullName:       document.getElementById('fullName').value.trim(),
            email:          document.getElementById('email').value.trim(),
            mobile:         document.getElementById('mobile').value.trim(),
            currentSchool:  document.getElementById('currentSchool').value.trim(),
            gradeLevel:     document.getElementById('gradeLevel').value,
            guardianName:   document.getElementById('guardianName').value.trim(),
            guardianNumber: document.getElementById('guardianNumber').value.trim(),
            contestantId:   parseInt(selectedContestant.value)
        };

        if (!formData.fullName || !formData.email || !formData.mobile ||
            !formData.currentSchool || !formData.gradeLevel ||
            !formData.guardianName || !formData.guardianNumber || !formData.contestantId) {
            showError('Please fill in all required fields');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccess();
            } else {
                showError(result.message || 'Error submitting vote');
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Submit Vote';
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            showError('Connection error. Please check your internet and try again.');
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Submit Vote';
        }
    });
}

function showSuccess() {
    const successMsg = document.getElementById('successMessage');
    const errorMsg   = document.getElementById('errorMessage');
    const form       = document.getElementById('votingForm');

    if (successMsg) successMsg.style.display = 'block';
    if (errorMsg)   errorMsg.style.display   = 'none';
    if (form)       form.style.display        = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError(message) {
    const errorMsg  = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMsg = document.getElementById('successMessage');

    if (errorText)  errorText.textContent      = message;
    if (errorMsg)   errorMsg.style.display     = 'block';
    if (successMsg) successMsg.style.display   = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        if (errorMsg) errorMsg.style.display = 'none';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}