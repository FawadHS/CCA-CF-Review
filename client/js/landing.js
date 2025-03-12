// client/js/landing.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Display user country
    displayUserCountry();

    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // User info form submission
    const userInfoForm = document.getElementById('user-info-form');
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', generateSurveyLink);
    }

    // Copy link button
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyLinkToClipboard);
    }

    // Email link button
    const emailLinkBtn = document.getElementById('email-link-btn');
    if (emailLinkBtn) {
        emailLinkBtn.addEventListener('click', emailSurveyLink);
    }

    // Proceed button
    const proceedBtn = document.getElementById('proceed-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'survey-selection.html';
        });
    }
}

function generateSurveyLink(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const organization = document.getElementById('organization').value;
    
    // Validate form
    if (!name || !email || !organization) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Generate a unique link (this is a simple example)
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const surveyLink = `${window.location.origin}/survey-selection.html?user=${encodeURIComponent(name)}&id=${uniqueId}`;
    
    // Display the link section
    document.getElementById('survey-link-section').classList.remove('d-none');
    document.getElementById('survey-link').value = surveyLink;
    
    // Update proceed button href
    document.getElementById('proceed-btn').href = surveyLink;
    
    // Hide the form
    document.getElementById('user-info-form').classList.add('d-none');
}

function copyLinkToClipboard() {
    const surveyLinkInput = document.getElementById('survey-link');
    surveyLinkInput.select();
    document.execCommand('copy');
    
    alert('Survey link copied to clipboard!');
}

function emailSurveyLink() {
    const email = document.getElementById('email').value;
    const surveyLink = document.getElementById('survey-link').value;
    
    // In a real application, this would call an API to send an email
    alert(`Email with survey link will be sent to ${email}`);
}