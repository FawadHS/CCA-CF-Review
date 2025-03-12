// server/start.js
const app = require('./app');

// Set up the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`
========================================
  CCA-CF Survey Application Server
========================================
  Server is running on http://localhost:${PORT}

  Available endpoints:
  - GET  /api/admin/countries (Get all countries)
  - POST /api/admin/login (Admin login)
  - POST /api/admin/countries (Add a new country)
  - POST /api/auth/login (User login)
  - POST /api/auth/validate-session (Validate user session)
  - POST /api/survey/save (Save survey progress)
  - POST /api/survey/submit (Submit survey)

  Default admin credentials:
  - Username: admin
  - Password: admin123

  Access the application at:
  http://localhost:${PORT}
========================================
`);
});