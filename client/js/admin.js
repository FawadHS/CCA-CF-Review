document.getElementById('admin-login-form').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent default form submission

    const password = document.getElementById('admin-password').value;

    const loginData = {
        username: "admin",  // Username is static in this example
        password: password, // Get password from the form input
    };

    try {
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

            // Display country management area
            document.getElementById('admin-login').classList.add('d-none');
            document.getElementById('country-management').classList.remove('d-none');

            // Optionally, redirect to another page after successful login
            // window.location.href = 'admin-dashboard.html'; // Uncomment if redirect is required
        } else {
            // Show error message if login fails
            alert(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error logging in. Please try again.');
    }
});
