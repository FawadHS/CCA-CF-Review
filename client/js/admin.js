// client/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        showAdminPanel();
        loadCountries();
    }

    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Admin login form submission
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Add country form submission
    const addCountryForm = document.getElementById('add-country-form');
    if (addCountryForm) {
        addCountryForm.addEventListener('submit', handleAddCountry);
    }

    // Delete country confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteCountry);
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();

    const password = document.getElementById('admin-password').value;

    const loginData = {
        username: "admin",  // Username is static in this example
        password: password, // Get password from the form input
    };

    try {
        // Show loading indicator or disable button here if needed

        // Send POST request to the login route
        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();

        // Handle response after successful login
        if (result.success) {
            // Save token to localStorage
            localStorage.setItem('adminToken', result.token);

            // Show admin panel
            showAdminPanel();
            
            // Load countries
            loadCountries();
        } else {
            // Show error message if login fails
            alert(result.message || 'Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error logging in. Please try again.');
    } finally {
        // Hide loading indicator or enable button here if needed
    }
}

function showAdminPanel() {
    // Hide login form
    document.getElementById('admin-login').classList.add('d-none');
    
    // Show country management area
    document.getElementById('country-management').classList.remove('d-none');
}

async function loadCountries() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        return;
    }

    try {
        // Show loading indicator
        const tableBody = document.getElementById('countries-table-body');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading countries...</td></tr>';

        // Fetch countries from API
        const response = await fetch('http://localhost:5000/api/admin/countries', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const result = await response.json();

        if (result.success) {
            displayCountries(result.countries);
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load countries</td></tr>';
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        document.getElementById('countries-table-body').innerHTML = 
            '<tr><td colspan="4" class="text-center text-danger">Error loading countries</td></tr>';
    }
}

function displayCountries(countries) {
    const tableBody = document.getElementById('countries-table-body');
    tableBody.innerHTML = '';

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
    if (password.length <= 2) {
        return password;
    }
    return password.charAt(0) + '*'.repeat(password.length - 2) + password.charAt(password.length - 1);
}

async function handleAddCountry(event) {
    event.preventDefault();

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
        // Show loading indicator or disable button here if needed

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

        const result = await response.json();

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
    } finally {
        // Hide loading indicator or enable button here if needed
    }
}

function showDeleteConfirmation(event) {
    const countryId = event.target.dataset.id;
    const countryName = event.target.dataset.name;
    
    // Set the country name in the confirmation modal
    document.getElementById('delete-country-name').textContent = countryName;
    
    // Store the country ID for deletion
    document.getElementById('confirm-delete-btn').dataset.id = countryId;
    
    // Show the modal
    const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
    deleteModal.show();
}

async function confirmDeleteCountry() {
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
            bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
            
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