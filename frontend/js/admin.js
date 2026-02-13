/**
 * MVG Foundation Colleges - Voting System
 * Admin Panel Frontend Logic (Simplified - No File Upload)
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Session management
let adminToken = null;

/**
 * Initialize admin panel
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    adminToken = sessionStorage.getItem('adminToken');
    
    if (adminToken) {
        showDashboard();
    }
    
    setupLoginForm();
    setupContestantForm();
});

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                adminToken = result.token;
                sessionStorage.setItem('adminToken', adminToken);
                showDashboard();
            } else {
                showLoginError(result.message || 'Invalid password');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showLoginError('Connection error. Please try again.');
        }
    });
}

/**
 * Show login error
 */
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show admin dashboard
 */
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    // Load initial data
    loadOverviewData();
    loadContestants();
}

/**
 * Logout
 */
function logout() {
    adminToken = null;
    sessionStorage.removeItem('adminToken');
    
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Load data for the selected tab
    if (tabName === 'overview') {
        loadOverviewData();
    } else if (tabName === 'contestants') {
        loadContestants();
    } else if (tabName === 'voters') {
        loadVoters();
    }
}

/**
 * Load overview data
 */
async function loadOverviewData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load overview');
        }
        
        const data = await response.json();
        
        document.getElementById('adminTotalVotes').textContent = data.totalVotes || 0;
        document.getElementById('adminTotalContestants').textContent = data.totalContestants || 0;
        document.getElementById('adminActiveContestants').textContent = data.activeContestants || 0;
        
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

/**
 * Load contestants
 */
async function loadContestants() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load contestants');
        }
        
        const data = await response.json();
        renderContestantsTable(data.contestants || []);
        
    } catch (error) {
        console.error('Error loading contestants:', error);
        document.getElementById('contestantsTableBody').innerHTML = `
            <tr><td colspan="7" style="text-align: center; color: red;">Error loading contestants</td></tr>
        `;
    }
}

/**
 * Render contestants table
 */
function renderContestantsTable(contestants) {
    const tbody = document.getElementById('contestantsTableBody');
    
    if (contestants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No contestants found</td></tr>';
        return;
    }
    
    tbody.innerHTML = contestants.map(contestant => {
        const imageHtml = contestant.imageUrl 
            ? `<img src="assets/candidates/${contestant.imageUrl}" alt="${escapeHtml(contestant.name)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/placeholder.png'">` 
            : '<span style="color: #999;">No photo</span>';
        
        return `
            <tr>
                <td>${imageHtml}</td>
                <td>${contestant.id}</td>
                <td>${escapeHtml(contestant.name)}</td>
                <td>${escapeHtml(contestant.description || '-')}</td>
                <td><code>${escapeHtml(contestant.imageUrl || '-')}</code></td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; background: ${contestant.active ? '#e8f5e9' : '#ffebee'}; color: ${contestant.active ? '#2e7d32' : '#c62828'};">
                        ${contestant.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-secondary" style="padding: 6px 12px; margin-right: 8px;" onclick="editContestant(${contestant.id})">
                        Edit
                    </button>
                    <button class="btn-secondary" style="padding: 6px 12px; background: #ffebee; color: #c62828;" onclick="deleteContestant(${contestant.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Setup contestant form
 */
function setupContestantForm() {
    const form = document.getElementById('contestantFormFields');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const contestantId = document.getElementById('editContestantId').value;
        const contestantData = {
            name: document.getElementById('contestantName').value.trim(),
            description: document.getElementById('contestantDescription').value.trim(),
            imageUrl: document.getElementById('contestantImageUrl').value.trim(),
            active: document.getElementById('contestantActive').value === 'true'
        };
        
        try {
            const url = contestantId 
                ? `${API_BASE_URL}/admin/contestants/${contestantId}`
                : `${API_BASE_URL}/admin/contestants`;
            
            const method = contestantId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(contestantData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(contestantId ? 'Contestant updated successfully!' : 'Contestant added successfully!');
                hideContestantForm();
                loadContestants();
            } else {
                alert(result.message || 'Error saving contestant');
            }
            
        } catch (error) {
            console.error('Error saving contestant:', error);
            alert('Connection error. Please try again.');
        }
    });
}

/**
 * Show add contestant form
 */
function showAddContestantForm() {
    document.getElementById('formTitle').textContent = 'Add New Contestant';
    document.getElementById('editContestantId').value = '';
    document.getElementById('contestantName').value = '';
    document.getElementById('contestantDescription').value = '';
    document.getElementById('contestantImageUrl').value = '';
    document.getElementById('contestantActive').value = 'true';
    document.getElementById('contestantForm').style.display = 'block';
}

/**
 * Hide contestant form
 */
function hideContestantForm() {
    document.getElementById('contestantForm').style.display = 'none';
}

/**
 * Edit contestant
 */
async function editContestant(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        const data = await response.json();
        const contestant = data.contestants.find(c => c.id === id);
        
        if (contestant) {
            document.getElementById('formTitle').textContent = 'Edit Contestant';
            document.getElementById('editContestantId').value = contestant.id;
            document.getElementById('contestantName').value = contestant.name;
            document.getElementById('contestantDescription').value = contestant.description || '';
            document.getElementById('contestantImageUrl').value = contestant.imageUrl || '';
            document.getElementById('contestantActive').value = contestant.active ? 'true' : 'false';
            document.getElementById('contestantForm').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading contestant:', error);
        alert('Error loading contestant data');
    }
}

/**
 * Delete contestant
 */
async function deleteContestant(id) {
    if (!confirm('Are you sure you want to delete this contestant? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Contestant deleted successfully!');
            loadContestants();
        } else {
            alert(result.message || 'Error deleting contestant');
        }
        
    } catch (error) {
        console.error('Error deleting contestant:', error);
        alert('Connection error. Please try again.');
    }
}

/**
 * Load voters list
 */
async function loadVoters() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/voters`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load voters');
        }
        
        const data = await response.json();
        renderVotersTable(data.voters || []);
        
    } catch (error) {
        console.error('Error loading voters:', error);
        document.getElementById('votersTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align: center; color: red;">Error loading voters</td></tr>
        `;
    }
}

/**
 * Render voters table
 */
function renderVotersTable(voters) {
    const tbody = document.getElementById('votersTableBody');
    
    if (voters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No votes cast yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = voters.map(voter => `
        <tr>
            <td>${new Date(voter.timestamp).toLocaleString()}</td>
            <td>${escapeHtml(voter.name)}</td>
            <td>${escapeHtml(voter.email)}</td>
            <td>${escapeHtml(voter.mobile)}</td>
            <td>${escapeHtml(voter.contestantName)}</td>
        </tr>
    `).join('');
}

/**
 * Export voter data to CSV
 */
async function exportVoterData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/voters`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        const data = await response.json();
        const voters = data.voters || [];
        
        if (voters.length === 0) {
            alert('No voter data to export');
            return;
        }
        
        // Create CSV content
        const headers = ['Timestamp', 'Name', 'Email', 'Mobile', 'Voted For'];
        const csvRows = [headers.join(',')];
        
        voters.forEach(voter => {
            const row = [
                new Date(voter.timestamp).toLocaleString(),
                `"${voter.name}"`,
                voter.email,
                voter.mobile,
                `"${voter.contestantName}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voters_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data');
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}