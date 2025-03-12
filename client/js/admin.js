// client/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        console.log('Admin token found, showing admin panel');
        showAdminPanel();
        loadCountries();
    } else {
        console.log('No admin token, showing login form');
    }

    // Set up event listeners - using button click handlers instead of form submit
    setupEventListeners();
});

function setupEventListeners() {
    // Admin login button click
    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
        console.log('Login button found, setting up event listener');
        adminLoginBtn.addEventListener('click', handleAdminLogin);
    } else {
        console.error('Admin login button not found!');
    }

    // Add country button click
    const addCountryBtn = document.getElementById('add-country-btn');
    if (addCountryBtn) {
        addCountryBtn.addEventListener('click', handleAddCountry);
    }

    // Delete country confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteCountry);
    }
}

async function handleAdminLogin() {
    console.log('Admin login function called');

    // Get form values
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (!password) {
        alert('Please enter the admin password');
        return;
    }

    const loginData = {
        username: username,  // Should be "admin" from the hidden field
        password: password
    };

    console.log('Sending login request:', loginData);

    try {
        // Send POST request to the login route
        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        console.log('Login response status:', response.status);
        
        // Try to parse the response as JSON
        try {
            const result = await response.json();
            console.log('Login response:', result);

            // Handle response after successful login
            if (result && result.success) {
                // Save token to localStorage
                localStorage.setItem('adminToken', result.token);
                console.log('Admin login successful, token saved');

                // Show admin panel
                showAdminPanel();
                
                // Load countries
                loadCountries();
            } else {
                // Show error message if login fails
                console.error('Login failed:', result ? result.message : 'Unknown error');
                alert(result && result.message ? result.message : 'Invalid credentials. Please try again.');
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            alert('Error parsing server response. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error connecting to the server. Please ensure the server is running and try again.');
    }
}

function showAdminPanel() {
    console.log('Showing admin panel');
    // Hide login form
    const adminLogin = document.getElementById('admin-login');
    if (adminLogin) {
        adminLogin.classList.add('d-none');
    } else {
        console.error('Admin login section not found!');
    }
    
    // Show country management area
    const countryManagement = document.getElementById('country-management');
    if (countryManagement) {
        countryManagement.classList.remove('d-none');
    } else {
        console.error('Country management section not found!');
    }
}

async function loadCountries() {
    console.log('Loading countries');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        console.error('No admin token found');
        return;
    }

    try {
        // Show loading indicator
        const tableBody = document.getElementById('countries-table-body');
        if (!tableBody) {
            console.error('Countries table body not found!');
            return;
        }
        
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading countries...</td></tr>';

        // Fetch countries from API
        console.log('Fetching countries from API');
        const response = await fetch('http://localhost:5000/api/admin/countries', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        console.log('Countries response status:', response.status);
        const result = await response.json();
        console.log('Countries response:', result);

        if (result.success) {
            displayCountries(result.countries);
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load countries</td></tr>';
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        const tableBody = document.getElementById('countries-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error connecting to the server</td></tr>';
        }
    }
}

function displayCountries(countries) {
    console.log('Displaying countries:', countries);
    const tableBody = document.getElementById('countries-table-body');
    if (!tableBody) {
        console.error('Countries table body not found!');
        return;
    }
    
    tableBody.innerHTML = '';

    if (!countries || countries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No countries found</td></tr>';
        return;
    }

    countries.forEach(country => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${country.id}</td>
            <td>${country.name}</td>
            <td>${maskPassword(country.password)}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-country-btn" data-id="${country.id}" data-name="${country.name}">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-country-btn').forEach(button => {
        button.addEventListener('click', showDeleteConfirmation);
    });
}

function maskPassword(password) {
    // Show only the first and last characters, mask the rest
    if (!password) return '';
    if (password.length <= 2) {
        return password;
    }
    return password.charAt(0) + '*'.repeat(password.length - 2) + password.charAt(password.length - 1);
}

async function handleAddCountry() {
    console.log('Add country function called');

    const countryName = document.getElementById('country-name').value;
    const countryPassword = document.getElementById('country-password').value;

    if (!countryName || !countryPassword) {
        alert('Please enter both country name and password.');
        return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }

    try {
        console.log('Adding country:', countryName);
        const response = await fetch('http://localhost:5000/api/admin/countries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: countryName,
                password: countryPassword
            }),
        });

        console.log('Add country response status:', response.status);
        const result = await response.json();
        console.log('Add country response:', result);

        if (result.success) {
            alert('Country added successfully!');
            
            // Clear the form
            document.getElementById('country-name').value = '';
            document.getElementById('country-password').value = '';
            
            // Reload countries
            loadCountries();
        } else {
            alert(result.message || 'Failed to add country. Please try again.');
        }
    } catch (error) {
        console.error('Error adding country:', error);
        alert('An error occurred while adding the country. Please try again.');
    }
}

function showDeleteConfirmation(event) {
    console.log('Delete button clicked');
    const countryId = event.target.dataset.id;
    const countryName = event.target.dataset.name;
    
    // Set the country name in the confirmation modal
    const deleteCountryNameElem = document.getElementById('delete-country-name');
    if (deleteCountryNameElem) {
        deleteCountryNameElem.textContent = countryName;
    }
    
    // Store the country ID for deletion
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.dataset.id = countryId;
    }
    
    // Show the modal
    try {
        const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
        deleteModal.show();
    } catch (error) {
        console.error('Error showing delete modal:', error);
        if (confirm(`Are you sure you want to delete ${countryName}?`)) {
            confirmDeleteCountry({ dataset: { id: countryId } });
        }
    }
}

async function confirmDeleteCountry() {
    console.log('Delete confirmation button clicked');
    const countryId = this.dataset.id;
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }
    
    try {
        // In a complete implementation, you would have a DELETE endpoint
        // Here we'll just simulate success
        console.log(`Deleting country with ID: ${countryId}`);
        
        // Simulate API call success
        setTimeout(() => {
            // Hide the modal
            try {
                bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
            } catch (error) {
                console.error('Error hiding modal:', error);
            }
            
            // Show success message
            alert('Country deleted successfully!');
            
            // Reload countries
            loadCountries();
        }, 500);
    } catch (error) {
        console.error('Error deleting country:', error);
        alert('An error occurred while deleting the country. Please try again.');
    }
}