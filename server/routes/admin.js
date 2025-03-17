const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the countries JSON file
const countriesFilePath = path.join(__dirname, '../data/countries.json');

// Function to load the countries data
function loadCountries() {
  try {
    const data = fs.readFileSync(countriesFilePath, 'utf-8');
    return JSON.parse(data).countries;
  } catch (error) {
    console.error('Error loading countries:', error);
    return [];
  }
}

// Function to save countries data
function saveCountries(countries) {
  try {
    fs.writeFileSync(countriesFilePath, JSON.stringify({ countries }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving countries:', error);
    return false;
  }
}

// Path to the admin sessions file
const adminSessionsFilePath = path.join(__dirname, '../data/admin-sessions.json');

// Function to load admin sessions data
function loadAdminSessions() {
  try {
    const data = fs.readFileSync(adminSessionsFilePath, 'utf-8');
    return JSON.parse(data).sessions;
  } catch (error) {
    console.error('Error loading admin sessions:', error);
    return [];
  }
}

// Function to save admin sessions data
function saveAdminSessions(sessions) {
  try {
    fs.writeFileSync(adminSessionsFilePath, JSON.stringify({ sessions }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving admin sessions:', error);
    return false;
  }
}

// Admin login route
router.post('/login', (req, res) => {
  console.log('Admin login request received:', req.body);
  
  try {
    const { username, password } = req.body;

    // Verify we have required data
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password required' 
      });
    }

    // Hardcoded credentials for admin login (to be replaced with real logic)
    if (username === 'admin' && password === 'admin123') {
      const token = 'admin-jwt-token-' + Date.now();
      const session = { username, token };

      // Save the session to admin-sessions.json
      const sessions = loadAdminSessions();
      sessions.push(session);
      saveAdminSessions(sessions);

      console.log('Admin login successful:', { username, token: token.substring(0, 10) + '...' });
      res.status(200).json({ success: true, token });
    } else {
      console.log('Admin login failed: invalid credentials');
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Route to add a new country
router.post('/countries', (req, res) => {
  console.log('Add country request:', req.body);
  
  try {
    const { name, password, username, email, organization } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country name is required' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country password is required' 
      });
    }

    const countries = loadCountries();

    // Check if country already exists
    const existingCountryIndex = countries.findIndex(
      country => country.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingCountryIndex !== -1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country already exists' 
      });
    }

    // Generate a new country ID
    const newId = countries.length > 0 
      ? (Math.max(...countries.map(c => parseInt(c.id))) + 1).toString() 
      : '1';

    // Create new country object
    const newCountry = {
      id: newId,
      name: name,
      password: password,
      users: []
    };
    
    // Add user info if provided
    if (username || email || organization) {
      newCountry.users.push({
        username: username || `user_${newId}`,
        email: email || '',
        organization: organization || ''
      });
    }

    // Add the new country
    countries.push(newCountry);

    // Save the updated countries list
    const saveResult = saveCountries(countries);
    
    if (!saveResult) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save new country' 
      });
    }

    console.log('Country added successfully:', name);
    res.status(201).json({ 
      success: true, 
      message: 'Country added successfully',
      country: newCountry
    });
  } catch (error) {
    console.error('Error adding country:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding country',
      error: error.toString()
    });
  }
});

// Route to update an existing country
router.put('/countries/:id', (req, res) => {
  console.log('Update country request:', req.params.id, req.body);
  
  try {
    const countryId = req.params.id;
    const { name, password, username, email, organization } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country name is required' 
      });
    }

    const countries = loadCountries();
    
    // Find the country by ID
    const countryIndex = countries.findIndex(country => country.id === countryId);
    
    if (countryIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }

    // Check for duplicate country name (excluding current country)
    const duplicateCountry = countries.find(
      (country, index) => 
        index !== countryIndex && 
        country.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateCountry) {
      return res.status(400).json({ 
        success: false, 
        message: 'A country with this name already exists' 
      });
    }
    
    // Create a copy of the existing country
    const updatedCountry = { ...countries[countryIndex] };
    
    // Update country name
    updatedCountry.name = name;
    
    // Update password if provided
    if (password) {
      updatedCountry.password = password;
    }
    
    // Ensure users array exists
    if (!updatedCountry.users) {
      updatedCountry.users = [];
    }
    
    // Handle user data
    if (username || email || organization) {
      // Prepare user data
      const userData = {
        username: username || (updatedCountry.users[0]?.username) || `user_${countryId}`,
        email: email || (updatedCountry.users[0]?.email) || '',
        organization: organization || (updatedCountry.users[0]?.organization) || ''
      };
      
      // If no users exist, add the new user
      if (updatedCountry.users.length === 0) {
        updatedCountry.users.push(userData);
      } else {
        // Update the first user
        updatedCountry.users[0] = userData;
      }
    }
    
    // Replace the old country with the updated one
    countries[countryIndex] = updatedCountry;
    
    // Save the updated countries list
    const saveResult = saveCountries(countries);
    
    if (!saveResult) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save country updates' 
      });
    }

    console.log('Country updated successfully:', name);
    res.status(200).json({ 
      success: true, 
      message: 'Country updated successfully',
      country: updatedCountry
    });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating country',
      error: error.toString()
    });
  }
});

// Route to get all countries (for admin to view them)
router.get('/countries', (req, res) => {
  try {
    const countries = loadCountries();
    console.log('Getting countries, count:', countries.length);
    res.status(200).json({ 
      success: true, 
      countries: countries.map(country => ({
        ...country,
        // Mask password for security
        password: country.password ? '*'.repeat(country.password.length) : ''
      }))
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch countries',
      error: error.toString()
    });
  }
});

// Route to delete a country
router.delete('/countries/:id', (req, res) => {
  console.log('Delete country request:', req.params.id);
  
  try {
    const countryId = req.params.id;
    const countries = loadCountries();
    
    // Find the country index
    const countryIndex = countries.findIndex(country => country.id === countryId);
    
    if (countryIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }
    
    // Get the country name for logging
    const countryName = countries[countryIndex].name;
    
    // Remove the country from the array
    countries.splice(countryIndex, 1);
    
    // Save the updated countries list
    const saveResult = saveCountries(countries);
    
    if (!saveResult) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete country' 
      });
    }
    
    console.log('Country deleted successfully:', countryName);
    res.status(200).json({ 
      success: true, 
      message: 'Country deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting country',
      error: error.toString()
    });
  }
});

// Route to add a user to a country
router.post('/countries/:id/users', (req, res) => {
  console.log('Add user request:', req.params.id, req.body);
  
  try {
    const countryId = req.params.id;
    const { username, email, organization } = req.body;

    // Validate input
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    const countries = loadCountries();
    
    // Find the country by ID
    const countryIndex = countries.findIndex(country => country.id === countryId);
    
    if (countryIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }
    
    // Initialize users array if it doesn't exist
    if (!countries[countryIndex].users) {
      countries[countryIndex].users = [];
    }
    
    // Check if username already exists
    const usernameExists = countries[countryIndex].users.some(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (usernameExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists for this country' 
      });
    }
    
    // Add the new user
    const newUser = {
      username,
      email: email || '',
      organization: organization || ''
    };
    
    countries[countryIndex].users.push(newUser);
    
    // Save the updated countries list
    const saveResult = saveCountries(countries);
    
    if (!saveResult) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add user' 
      });
    }

    console.log('User added successfully to country:', countries[countryIndex].name);
    res.status(201).json({ 
      success: true, 
      message: 'User added successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding user',
      error: error.toString()
    });
  }
});

// Route to update a user in a country
router.put('/countries/:id/users/:index', (req, res) => {
  console.log('Update user request:', req.params.id, req.params.index, req.body);
  
  try {
    const countryId = req.params.id;
    const userIndex = parseInt(req.params.index);
    const { username, email, organization } = req.body;

    // Validate input
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    const countries = loadCountries();
    
    // Find the country by ID
    const countryIndex = countries.findIndex(country => country.id === countryId);
    
    if (countryIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }
    
    // Check if users array exists
    if (!countries[countryIndex].users || !Array.isArray(countries[countryIndex].users)) {
      return res.status(404).json({ 
        success: false, 
        message: 'No users found for this country' 
      });
    }
    
    // Check if user index is valid
    if (userIndex < 0 || userIndex >= countries[countryIndex].users.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if updating to a username that already exists (except for the current user)
    const usernameExists = countries[countryIndex].users.some(
      (user, index) => index !== userIndex && user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (usernameExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists for another user' 
      });
    }
    
    // Update the user
    const updatedUser = {
      username,
      email: email || countries[countryIndex].users[userIndex].email,
      organization: organization || countries[countryIndex].users[userIndex].organization
    };
    
    // Replace the old user with the updated one
    countries[countryIndex].users[userIndex] = updatedUser;
    
    // Save the updated countries list
    const saveResult = saveCountries(countries);
    
    if (!saveResult) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update user' 
      });
    }

    console.log('User updated successfully');
    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating user',
      error: error.toString()
    });
  }
});

// Export the router
module.exports = router;