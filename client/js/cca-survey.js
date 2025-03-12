// client/js/cca-survey.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!requireAuth()) {
        return;
    }

    // Display user country
    displayUserCountry();

    // Initialize form
    initializeForm();

    // Set up event listeners
    setupEventListeners();
});

function initializeForm() {
    // Calculate progress based on filled form fields
    updateProgress();

    // Check for saved data
    loadSavedData();
}

function updateProgress() {
    const form = document.getElementById('cca-survey-form');
    const allRequiredInputs = form.querySelectorAll('[required]');
    const filledInputs = Array.from(allRequiredInputs).filter(input => input.value.trim() !== '');
    
    const progressPercentage = Math.round((filledInputs.length / allRequiredInputs.length) * 100);
    
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    progressBar.textContent = `${progressPercentage}%`;
}

async function loadSavedData() {
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    try {
        // Simulate loading saved data (replace with actual API call)
        const savedData = {
            q1_1: 'Previously saved response for question 1.1',
            q1_2: 'Previously saved response for question 1.2',
            q2_1: 'Previously saved response for question 2.1',
            q2_2: 'Previously saved response for question 2.2'
        };

        // Fill the form fields with saved data
        Object.keys(savedData).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = savedData[key];
            }
        });

        // Update progress after loading data
        updateProgress();
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProgress);
    }

    // Form submission
    const form = document.getElementById('cca-survey-form');
    if (form) {
        form.addEventListener('submit', submitSurvey);
    }

    // Update progress as user fills the form
    const formInputs = document.querySelectorAll('#cca-survey-form [required]');
    formInputs.forEach(input => {
        input.addEventListener('change', updateProgress);
    });
}

async function saveProgress(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const form = document.getElementById('cca-survey-form');
    const formData = new FormData(form);
    
    // Convert FormData to object
    const responses = {};
    formData.forEach((value, key) => {
        responses[key] = value;
    });
    
    try {
        const response = await fetch('http://localhost:5000/api/survey/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                surveyType: 'CCA',
                responses: responses,
                complete: false
            }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Survey progress saved successfully!');
        } else {
            alert('Failed to save survey progress. Please try again.');
        }
    } catch (error) {
        console.error('Error saving survey progress:', error);
        alert('An error occurred while saving your progress. Please try again.');
    }
}

async function submitSurvey(event) {
    event.preventDefault();
    
    // Validate form
    const form = document.getElementById('cca-survey-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    if (!confirm('Are you sure you want to submit the survey? You will not be able to make further changes.')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    const formData = new FormData(form);
    
    // Convert FormData to object
    const responses = {};
    formData.forEach((value, key) => {
        responses[key] = value;
    });
    
    try {
        const response = await fetch('http://localhost:5000/api/survey/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                surveyType: 'CCA',
                responses: responses
            }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Survey submitted successfully!');
            window.location.href = 'survey-selection.html';
        } else {
            alert('Failed to submit survey. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('An error occurred while submitting your survey. Please try again.');
    }
}