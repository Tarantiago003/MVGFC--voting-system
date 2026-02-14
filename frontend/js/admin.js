/**
 * MVG Foundation Colleges - Admin Panel Frontend Logic
 */

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

let adminToken = null;

document.addEventListener('DOMContentLoaded', function () {
    adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) showDashboard();
    setupLoginForm();
    setupContestantForm();
});

function setupLoginForm() {
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            showLoginError('Connection error. Please try again.');
        }
    });
}

function showLoginError(message) {
    const errorDiv  = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
}

function showDashboard() {
    document.getElementById('loginScreen').style.display   = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadOverviewData();
    loadContestants();
}

function logout() {
    adminToken = null;
    sessionStorage.removeItem('adminToken');
    document.getElementById('loginScreen').style.display    = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value          = '';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    if (tabName === 'overview')    loadOverviewData();
    if (tabName === 'contestants') loadContestants();
    if (tabName === 'voters')      loadVoters();
}

async function loadOverviewData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        document.getElementById('adminTotalVotes').textContent       = data.totalVotes       || 0;
        document.getElementById('adminTotalContestants').textContent = data.totalContestants || 0;
        document.getElementById('adminActiveContestants').textContent= data.activeContestants|| 0;
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

async function loadContestants() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        renderContestantsTable(data.contestants || []);
    } catch (error) {
        document.getElementById('contestantsTableBody').innerHTML =
            `<tr><td colspan="7" style="text-align:center;color:red;">Error loading contestants</td></tr>`;
    }
}

function renderContestantsTable(contestants) {
    const tbody = document.getElementById('contestantsTableBody');
    if (contestants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No contestants found</td></tr>';
        return;
    }
    tbody.innerHTML = contestants.map(c => {
        const img = c.imageUrl
            ? `<img src="assets/candidates/${c.imageUrl}" alt="${escapeHtml(c.name)}"
                style="width:50px;height:50px;object-fit:cover;border-radius:4px;"
                onerror="this.src='assets/placeholder.png'">`
            : '<span style="color:#999;">No photo</span>';
        return `
            <tr>
                <td>${img}</td>
                <td>${c.id}</td>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.description || '-')}</td>
                <td><code>${escapeHtml(c.imageUrl || '-')}</code></td>
                <td>
                    <span style="padding:4px 8px;border-radius:4px;
                        background:${c.active ? '#e8f5e9' : '#ffebee'};
                        color:${c.active ? '#2e7d32' : '#c62828'};">
                        ${c.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-secondary" style="padding:6px 12px;margin-right:8px;"
                        onclick="editContestant(${c.id})">Edit</button>
                    <button class="btn-secondary"
                        style="padding:6px 12px;background:#ffebee;color:#c62828;"
                        onclick="deleteContestant(${c.id})">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

function setupContestantForm() {
    document.getElementById('contestantFormFields').addEventListener('submit', async function (e) {
        e.preventDefault();
        const id   = document.getElementById('editContestantId').value;
        const data = {
            name:        document.getElementById('contestantName').value.trim(),
            description: document.getElementById('contestantDescription').value.trim(),
            imageUrl:    document.getElementById('contestantImageUrl').value.trim(),
            active:      document.getElementById('contestantActive').value === 'true'
        };
        try {
            const url    = id ? `${API_BASE_URL}/admin/contestants/${id}` : `${API_BASE_URL}/admin/contestants`;
            const method = id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert(id ? 'Contestant updated!' : 'Contestant added!');
                hideContestantForm();
                loadContestants();
            } else {
                alert(result.message || 'Error saving contestant');
            }
        } catch (error) {
            alert('Connection error. Please try again.');
        }
    });
}

function showAddContestantForm() {
    document.getElementById('formTitle').textContent         = 'Add New Contestant';
    document.getElementById('editContestantId').value        = '';
    document.getElementById('contestantName').value          = '';
    document.getElementById('contestantDescription').value   = '';
    document.getElementById('contestantImageUrl').value      = '';
    document.getElementById('contestantActive').value        = 'true';
    document.getElementById('contestantForm').style.display  = 'block';
}

function hideContestantForm() {
    document.getElementById('contestantForm').style.display = 'none';
}

async function editContestant(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data       = await response.json();
        const contestant = data.contestants.find(c => c.id === id);
        if (contestant) {
            document.getElementById('formTitle').textContent         = 'Edit Contestant';
            document.getElementById('editContestantId').value        = contestant.id;
            document.getElementById('contestantName').value          = contestant.name;
            document.getElementById('contestantDescription').value   = contestant.description || '';
            document.getElementById('contestantImageUrl').value      = contestant.imageUrl || '';
            document.getElementById('contestantActive').value        = contestant.active ? 'true' : 'false';
            document.getElementById('contestantForm').style.display  = 'block';
        }
    } catch (error) {
        alert('Error loading contestant data');
    }
}

async function deleteContestant(id) {
    if (!confirm('Are you sure you want to delete this contestant?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contestants/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const result = await response.json();
        if (response.ok && result.success) { alert('Deleted!'); loadContestants(); }
        else alert(result.message || 'Error deleting');
    } catch (error) {
        alert('Connection error.');
    }
}

async function loadVoters() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/voters`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        renderVotersTable(data.voters || []);
    } catch (error) {
        document.getElementById('votersTableBody').innerHTML =
            `<tr><td colspan="7" style="text-align:center;color:red;">Error loading voters</td></tr>`;
    }
}

function renderVotersTable(voters) {
    const tbody = document.getElementById('votersTableBody');
    if (voters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No votes cast yet</td></tr>';
        return;
    }
    tbody.innerHTML = voters.map(v => `
        <tr>
            <td>${escapeHtml(v.timestamp)}</td>
            <td>${escapeHtml(v.name)}</td>
            <td>${escapeHtml(v.email)}</td>
            <td>${escapeHtml(v.mobile)}</td>
            <td>${escapeHtml(v.guardianName   || '-')}</td>
            <td>${escapeHtml(v.guardianNumber || '-')}</td>
            <td>${escapeHtml(v.contestantName)}</td>
        </tr>`).join('');
}

async function exportVoterData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/voters`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data   = await response.json();
        const voters = data.voters || [];
        if (voters.length === 0) { alert('No voter data to export'); return; }

        const headers = ['Date','Name','Email','Mobile','Guardian Name','Guardian Number','Voted For'];
        const csvRows = [headers.join(',')];

        voters.forEach(v => {
            csvRows.push([
                escapeHtml(v.timestamp),
                `"${v.name}"`,
                v.email,
                v.mobile,
                `"${v.guardianName    || ''}"`,
                v.guardianNumber || '',
                `"${v.contestantName}"`
            ].join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `voters_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error exporting data');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}