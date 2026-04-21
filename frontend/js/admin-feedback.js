import { apiFetch } from './api.js';
import { initAuthListener } from './auth.js';

initAuthListener({ requireAuth: true, requireAdmin: true });

let allFeedback = [];
let currentFilter = 'pending';

const feedbackList = document.getElementById('feedbackList');
const modal = document.getElementById('manualFeedbackModal');
const openModalBtn = document.getElementById('openManualModal');
const closeModalBtn = document.getElementById('closeManualModal');
const manualForm = document.getElementById('manualFeedbackForm');

async function loadFeedback() {
    try {
        allFeedback = await apiFetch('/feedback/admin/all');
        renderFeedback();
    } catch (err) {
        console.error('Failed to load feedback:', err);
        feedbackList.innerHTML = `<p class="text-center" style="color:var(--danger);">Error: ${err.message}</p>`;
    }
}

function renderFeedback() {
    const filtered = allFeedback.filter(f => f.status === currentFilter);

    if (filtered.length === 0) {
        feedbackList.innerHTML = `<p class="text-center" style="padding:3rem; color:var(--text-muted);">No ${currentFilter} feedback found.</p>`;
        return;
    }

    feedbackList.innerHTML = filtered.map(f => {
        const name = f.isManual ? f.name : (f.userId?.name || 'Anonymous User');
        return `
            <div class="fb-card">
                <div class="fb-meta">
                    <div>
                        <div class="fb-author">${name} ${f.isManual ? '<span class="badge badge-primary" style="margin-left:0.5rem">Manual</span>' : ''}</div>
                        <div class="fb-rating">${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</div>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="fb-message">"${f.message}"</div>
                <div class="fb-actions">
                    ${currentFilter !== 'approved' ? `<button class="btn btn-sm btn-accent" onclick="updateStatus('${f._id}', 'approved')">Approve</button>` : ''}
                    ${currentFilter !== 'rejected' ? `<button class="btn btn-sm btn-outline" onclick="updateStatus('${f._id}', 'rejected')">Reject</button>` : ''}
                    ${currentFilter !== 'pending' && !f.isManual ? `<button class="btn btn-sm btn-ghost" onclick="updateStatus('${f._id}', 'pending')">Move to Pending</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

window.updateStatus = async (id, status) => {
    try {
        await apiFetch(`/feedback/admin/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        await loadFeedback();
    } catch (err) {
        alert('Failed to update status: ' + err.message);
    }
};

// Modal Logic
openModalBtn.onclick = () => modal.style.display = 'flex';
closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

manualForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('mName').value;
    const rating = document.getElementById('mRating').value;
    const message = document.getElementById('mMessage').value;

    try {
        await apiFetch('/feedback/admin/manual', {
            method: 'POST',
            body: JSON.stringify({ name, rating, message })
        });
        modal.style.display = 'none';
        manualForm.reset();
        await loadFeedback();
    } catch (err) {
        alert('Failed to add testimonial: ' + err.message);
    }
};

// Tabs
document.querySelectorAll('.fb-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.status;
        renderFeedback();
    };
});

document.addEventListener('DOMContentLoaded', loadFeedback);
