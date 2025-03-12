// client/js/profile.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!requireAuth()) {
        return;
    }

    // Display user country
    displayUserCountry();

    // Load user profile data if exists
    loadProfileData();

    // Set up event listeners
    setupEventListeners();
});

async function loadProfileData() {
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
            const { username, country } = data.userInfo;
            
            // Display country
            const countryDisplay = document.getElementById('country-display');
            if (countryDisplay) {
                countryDisplay.textContent = `Country: ${country}`;
            }

            // Load existing profile data if available
            // This is a simulated response; in a real application, you would fetch this from an API
            const profileData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                organization: 'United Nations'
            };

            // Fill form fields with profile data
            document.getElementById('name').value = profileData.name || '';
            document.getElementById('email').value = profileData.email || '';
            document.getElementById('organization').value = profileData.organization || '';
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }

    // Skip button
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            window.location.href = 'survey-selection.html';
        });
    }

    // Logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const organization = document.getElementById('organization').value;
    
    // Validate form
    if (!name || !email || !organization) {
        alert('Please fill in all fields.');
        return;
    }
    
    try {
        // In a real app, this would be an API call to update the user's profile
        console.log('Saving profile:', { name, email, organization });
        
        // Simulate successful profile update
        alert('Profile updated successfully!');
        
        // Redirect to survey selection page
        window.location.href = 'survey-selection.html';
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile. Please try again.');
    }
}