// client/js/auth.js

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Function to redirect to login page if not logged in
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Function to validate session with the server
async function validateSession() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
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
        return data.success;
    } catch (error) {
        console.error('Error validating session:', error);
        return false;
    }
}

// Function to display user country in navbar
async function displayUserCountry() {
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
        if (data.success) {
            const countryDisplay = document.getElementById('user-country-display');
            if (countryDisplay) {
                countryDisplay.textContent = `Country: ${data.userInfo.country}`;
            }

            const userInfoDisplay = document.getElementById('user-info-display');
            if (userInfoDisplay) {
                userInfoDisplay.textContent = `${data.userInfo.username} (${data.userInfo.country})`;
            }

            const countryDisplayOnly = document.getElementById('country-display');
            if (countryDisplayOnly) {
                countryDisplayOnly.textContent = `Country: ${data.userInfo.country}`;
            }
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Add event listener to logout links
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        requireAuth();
        displayUserCountry();
    }

    // Add event listener to logout link if it exists
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
});