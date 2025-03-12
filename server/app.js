const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/survey');
const adminRoutes = require('./routes/admin');  // Import admin routes

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, JS) from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Root route will serve the 'index.html' file from the 'client' folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));  // Adjusted path
});

// API routes
app.use('/api/auth', authRoutes);    // Routes for login, validate-session
app.use('/api/survey', surveyRoutes);  // Routes for saving, submitting, getting surveys
app.use('/api/admin', adminRoutes);   // Routes for admin functionalities

// Set up the port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
