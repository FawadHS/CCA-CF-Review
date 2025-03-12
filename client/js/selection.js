// client/js/selection.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!requireAuth()) {
        return;
    }

    // Display user country and info
    displayUserCountry();
    displayUserInfo();

    // Check for saved surveys
    checkSavedSurveys();

    // Set up event listeners
    setupEventListeners();
});

async function displayUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/validate-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.success && data.userInfo) {
            const userInfoDisplay = document.getElementById('user-info-display');
            if (userInfoDisplay) {
                userInfoDisplay.textContent = `Welcome, ${data.userInfo.username || 'User'} (${data.userInfo.country})`;
            }
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

async function checkSavedSurveys() {
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    try {
        // In a real application, you would fetch saved surveys from the server
        // This is simulated data
        const savedSurveys = [
            {
                id: '1',
                surveyType: 'CCA',
                lastUpdated: '2023-06-15',
                percentComplete: 45
            },
            {
                id: '2',
                surveyType: 'CF',
                lastUpdated: '2023-06-10',
                percentComplete: 30
            }
        ];

        if (savedSurveys.length > 0) {
            const resumeSection = document.getElementById('resume-section');
            const savedSurveysContainer = document.getElementById('saved-surveys');
            
            if (resumeSection && savedSurveysContainer) {
                resumeSection.classList.remove('d-none');
                
                // Clear existing content
                savedSurveysContainer.innerHTML = '';
                
                // Add saved surveys to the list
                savedSurveys.forEach(survey => {
                    const surveyItem = document.createElement('a');
                    surveyItem.href = '#';
                    surveyItem.className = 'list-group-item list-group-item-action';
                    surveyItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${survey.surveyType} Survey</h5>
                            <small>${survey.lastUpdated}</small>
                        </div>
                        <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar" role="progressbar" style="width: ${survey.percentComplete}%;" 
                                aria-valuenow="${survey.percentComplete}" aria-valuemin="0" aria-valuemax="100">
                                ${survey.percentComplete}%
                            </div>
                        </div>
                        <small>Last updated on ${survey.lastUpdated}</small>
                    `;
                    
                    // Add click event to resume survey
                    surveyItem.addEventListener('click', function(e) {
                        e.preventDefault();
                        resumeSurvey(survey);
                    });
                    
                    savedSurveysContainer.appendChild(surveyItem);
                });
            }
        }
    } catch (error) {
        console.error('Error checking saved surveys:', error);
    }
}

function resumeSurvey(survey) {
    const surveyPage = survey.surveyType === 'CCA' ? 'cca-survey.html' : 'cf-survey.html';
    window.location.href = surveyPage + '?id=' + survey.id;
}

function setupEventListeners() {
    // CCA Survey button
    const ccaSurveyBtn = document.getElementById('cca-survey-btn');
    if (ccaSurveyBtn) {
        ccaSurveyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cca-survey.html';
        });
    }

    // CF Survey button
    const cfSurveyBtn = document.getElementById('cf-survey-btn');
    if (cfSurveyBtn) {
        cfSurveyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cf-survey.html';
        });
    }
}