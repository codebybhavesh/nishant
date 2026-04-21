import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const msgBox = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');

    // Extract bookingId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    if (!bookingId) {
        msgBox.textContent = '❌ Invalid Booking ID. Please go back to your history.';
        msgBox.style.color = 'var(--danger)';
        submitBtn.disabled = true;
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = form.querySelector('input[name="rating"]:checked')?.value;
        const message = document.getElementById('message').value.trim();

        if (!rating || !message) {
            msgBox.textContent = 'Please provide both a rating and a message.';
            msgBox.style.color = 'var(--danger)';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        msgBox.textContent = '';

        try {
            await apiFetch('/feedback', {
                method: 'POST',
                body: JSON.stringify({ bookingId, rating, message })
            });

            msgBox.textContent = '✅ Thank you! Your feedback has been submitted successfully.';
            msgBox.style.color = 'var(--success)';
            form.reset();

            // Redirect to home or history after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (err) {
            console.error(err);
            msgBox.textContent = '❌ ' + (err.message || 'Failed to submit feedback. Please try again.');
            msgBox.style.color = 'var(--danger)';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
        }
    });
});
