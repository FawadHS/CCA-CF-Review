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
    
    // Edit country save button
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedCountry);
    }
    
    // Add user save button
    const saveAddUserBtn = document.getElementById('save-add-user-btn');
    if (saveAddUserBtn) {
        saveAddUserBtn.addEventListener('click', addUserToCountry);
    }
    
    // Edit user save button
    const saveEditUserBtn = document.getElementById('save-edit-user-btn');
    if (saveEditUserBtn) {
        saveEditUserBtn.addEventListener('click', saveEditedUser);
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
        
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading countries...</td></tr>';

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
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load countries</td></tr>';
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        const tableBody = document.getElementById('countries-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error connecting to the server</td></tr>';
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
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No countries found</td></tr>';
        return;
    }

    // Add primary row for each country
    countries.forEach(country => {
        // Display the first user information (if any) in the main row
        const firstUser = country.users && country.users.length > 0 ? country.users[0] : null;
        
        const row = document.createElement('tr');
        row.classList.add('country-row');
        row.innerHTML = `
            <td>${country.id}</td>
            <td>${country.name}</td>
            <td>${maskPassword(country.password)}</td>
            <td>${firstUser ? firstUser.username || '-' : '-'}</td>
            <td>${firstUser ? firstUser.email || '-' : '-'}</td>
            <td>${firstUser ? firstUser.organization || '-' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-country-btn me-1" data-id="${country.id}" data-name="${country.name}">
                    Edit
                </button>
                <button class="btn btn-sm btn-info add-user-btn me-1" data-id="${country.id}" data-name="${country.name}">
                    Add User
                </button>
                <button class="btn btn-sm btn-danger delete-country-btn" data-id="${country.id}" data-name="${country.name}">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        
        // Add additional rows for extra users if present
        if (country.users && country.users.length > 1) {
            for (let i = 1; i < country.users.length; i++) {
                const user = country.users[i];
                const userRow = document.createElement('tr');
                userRow.classList.add('user-row', 'table-secondary');
                userRow.innerHTML = `
                    <td colspan="2"></td>
                    <td colspan="1"></td>
                    <td>${user.username || '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td>${user.organization || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-user-btn" 
                            data-country-id="${country.id}" 
                            data-user-index="${i}"
                            data-username="${user.username || ''}">
                            Edit User
                        </button>
                    </td>
                `;
                tableBody.appendChild(userRow);
            }
        }
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-country-btn').forEach(button => {
        button.addEventListener('click', showDeleteConfirmation);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-country-btn').forEach(button => {
        button.addEventListener('click', showEditForm);
    });
    
    // Add event listeners to add user buttons
    document.querySelectorAll('.add-user-btn').forEach(button => {
        button.addEventListener('click', showAddUserForm);
    });
    
    // Add event listeners to edit user buttons
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', showEditUserForm);
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
    const countryUsername = document.getElementById('country-username').value;
    const countryEmail = document.getElementById('country-email').value;
    const countryOrganization = document.getElementById('country-organization').value;

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
                password: countryPassword,
                username: countryUsername,
                email: countryEmail,
                organization: countryOrganization
            }),
        });

        console.log('Add country response status:', response.status);
        const result = await response.json();
        console.log('Add country response:', result);

        if (result.success) {
            let message = 'Country added successfully!';
            if (result.userAdded) {
                message = 'User added to existing country successfully!';
            }
            alert(message);
            
            // Clear the form
            document.getElementById('country-name').value = '';
            document.getElementById('country-password').value = '';
            document.getElementById('country-username').value = '';
            document.getElementById('country-email').value = '';
            document.getElementById('country-organization').value = '';
            
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
        console.log(`Deleting country with ID: ${countryId}`);
        
        // Send DELETE request to the API
        const response = await fetch(`http://localhost:5000/api/admin/countries/${countryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        console.log('Delete response status:', response.status);
        const result = await response.json();
        
        // Hide the modal
        try {
            bootstrap.Modal.getInstance(document.getElementById('delete-modal')).hide();
        } catch (error) {
            console.error('Error hiding modal:', error);
        }
        
        if (result.success) {
            // Show success message
            alert('Country deleted successfully!');
            
            // Reload countries
            loadCountries();
        } else {
            alert(result.message || 'Failed to delete country. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting country:', error);
        alert('An error occurred while deleting the country. Please try again.');
    }
}

// Function to show the edit form modal
async function showEditForm(event) {
    const countryId = event.target.dataset.id;
    const countryName = event.target.dataset.name;
    
    // Get the admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }
    
    try {
        // Fetch the country details from the server
        const response = await fetch(`http://localhost:5000/api/admin/countries/${countryId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.status === 200) {
            const result = await response.json();
            if (result.success && result.country) {
                const country = result.country;
                
                // Populate the edit form with the country details
                document.getElementById('edit-country-id').value = country.id;
                document.getElementById('edit-country-name').value = country.name;
                document.getElementById('edit-country-password').value = ''; // For security, don't populate the password
                
                // Get the first user information (if available)
                const firstUser = country.users && country.users.length > 0 ? country.users[0] : null;
                
                document.getElementById('edit-country-username').value = firstUser ? firstUser.username || '' : '';
                document.getElementById('edit-country-email').value = firstUser ? firstUser.email || '' : '';
                document.getElementById('edit-country-organization').value = firstUser ? firstUser.organization || '' : '';
                
                // Show the modal
                const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
                editModal.show();
            } else {
                console.error('Failed to get country details:', result);
                // Fall back to getting data from the table
                fallbackShowEditForm(event, countryId, countryName);
            }
        } else {
            console.error('Failed to get country details, status:', response.status);
            // Fall back to getting data from the table
            fallbackShowEditForm(event, countryId, countryName);
        }
    } catch (error) {
        console.error('Error fetching country details:', error);
        // Fall back to getting data from the table
        fallbackShowEditForm(event, countryId, countryName);
    }
}

// Fallback function to populate edit form from the table row if API call fails
function fallbackShowEditForm(event, countryId, countryName) {
    // Populate the edit form with the country details
    document.getElementById('edit-country-id').value = countryId;
    document.getElementById('edit-country-name').value = countryName;
    document.getElementById('edit-country-password').value = ''; // For security, don't populate the password
    
    // Find the country row to get data
    const countryRow = event.target.closest('tr');
    if (!countryRow) return;
    
    const cells = countryRow.cells;
    if (cells.length < 6) return;
    
    // Get the first user information from the row cells
    const username = cells[3].textContent !== '-' ? cells[3].textContent : '';
    const email = cells[4].textContent !== '-' ? cells[4].textContent : '';
    const organization = cells[5].textContent !== '-' ? cells[5].textContent : '';
    
    document.getElementById('edit-country-username').value = username;
    document.getElementById('edit-country-email').value = email;
    document.getElementById('edit-country-organization').value = organization;
    
    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
    editModal.show();
}

// Function to save edited country details
async function saveEditedCountry() {
    const countryId = document.getElementById('edit-country-id').value;
    const countryName = document.getElementById('edit-country-name').value;
    const countryPassword = document.getElementById('edit-country-password').value;
    const countryUsername = document.getElementById('edit-country-username').value;
    const countryEmail = document.getElementById('edit-country-email').value;
    const countryOrganization = document.getElementById('edit-country-organization').value;
    
    if (!countryName) {
        alert('Country name is required.');
        return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }
    
    try {
        console.log('Updating country:', {
            id: countryId,
            name: countryName,
            username: countryUsername,
            email: countryEmail,
            organization: countryOrganization
        });
        
        // Make the API call to update the country
        const response = await fetch(`http://localhost:5000/api/admin/countries/${countryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: countryName,
                password: countryPassword, // Only sent if filled in
                username: countryUsername,
                email: countryEmail,
                organization: countryOrganization
            }),
        });

        console.log('Update country response status:', response.status);
        const result = await response.json();
        
        if (result.success) {
            // Close the modal
            bootstrap.Modal.getInstance(document.getElementById('edit-modal')).hide();
            
            // Show success message
            alert('Country updated successfully!');
            
            // Reload countries to refresh the table
            loadCountries();
        } else {
            alert(result.message || 'Failed to update country. Please try again.');
        }
    } catch (error) {
        console.error('Error updating country:', error);
        alert('An error occurred while updating the country. Please try again.');
    }
}

// Function to show the add user form
function showAddUserForm(event) {
    const countryId = event.target.dataset.id;
    const countryName = event.target.dataset.name;
    
    // Set the country information in the add user modal
    document.getElementById('add-user-country-id').value = countryId;
    document.getElementById('add-user-country-name').textContent = countryName;
    
    // Clear the form fields
    document.getElementById('add-user-username').value = '';
    document.getElementById('add-user-email').value = '';
    document.getElementById('add-user-organization').value = '';
    
    // Show the modal
    const addUserModal = new bootstrap.Modal(document.getElementById('add-user-modal'));
    addUserModal.show();
}

// Function to add a new user to a country
async function addUserToCountry() {
    const countryId = document.getElementById('add-user-country-id').value;
    const username = document.getElementById('add-user-username').value;
    const email = document.getElementById('add-user-email').value;
    const organization = document.getElementById('add-user-organization').value;
    
    if (!username) {
        alert('Username is required.');
        return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }
    
    try {
        // Make API call to add user to country
        const response = await fetch(`http://localhost:5000/api/admin/countries/${countryId}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                username,
                email,
                organization
            }),
        });

        console.log('Add user response status:', response.status);
        const result = await response.json();
        
        if (result.success) {
            // Close the modal
            bootstrap.Modal.getInstance(document.getElementById('add-user-modal')).hide();
            
            // Show success message
            alert('User added successfully!');
            
            // Reload countries
            loadCountries();
        } else {
            alert(result.message || 'Failed to add user. Please try again.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('An error occurred while adding the user. Please try again.');
    }
}

// Function to show the edit user form
function showEditUserForm(event) {
    const countryId = event.target.dataset.countryId;
    const userIndex = event.target.dataset.userIndex;
    const username = event.target.dataset.username;
    
    // Find the user row to get data
    const userRow = event.target.closest('tr');
    if (!userRow) return;
    
    const cells = userRow.cells;
    if (cells.length < 6) return;
    
    // Set the edit form values
    document.getElementById('edit-user-country-id').value = countryId;
    document.getElementById('edit-user-index').value = userIndex;
    document.getElementById('edit-user-username').value = username;
    document.getElementById('edit-user-email').value = cells[4].textContent !== '-' ? cells[4].textContent : '';
    document.getElementById('edit-user-organization').value = cells[5].textContent !== '-' ? cells[5].textContent : '';
    
    // Show the modal
    const editUserModal = new bootstrap.Modal(document.getElementById('edit-user-modal'));
    editUserModal.show();
}

// Function to save edited user
async function saveEditedUser() {
    const countryId = document.getElementById('edit-user-country-id').value;
    const userIndex = document.getElementById('edit-user-index').value;
    const username = document.getElementById('edit-user-username').value;
    const email = document.getElementById('edit-user-email').value;
    const organization = document.getElementById('edit-user-organization').value;
    
    if (!username) {
        alert('Username is required.');
        return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        alert('Your session has expired. Please login again.');
        return;
    }
    
    try {
        // Make API call to update user
        const response = await fetch(`http://localhost:5000/api/admin/countries/${countryId}/users/${userIndex}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                username,
                email,
                organization
            }),
        });

        console.log('Update user response status:', response.status);
        const result = await response.json();
        
        if (result.success) {
            // Close the modal
            bootstrap.Modal.getInstance(document.getElementById('edit-user-modal')).hide();
            
            // Show success message
            alert('User updated successfully!');
            
            // Reload countries
            loadCountries();
        } else {
            alert(result.message || 'Failed to update user. Please try again.');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user. Please try again.');
    }
}