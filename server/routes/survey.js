const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the surveys JSON file
const surveysFilePath = path.join(__dirname, '../data/surveys.json');

// Function to load surveys data
function loadSurveys() {
  const data = fs.readFileSync(surveysFilePath, 'utf-8');
  return JSON.parse(data).surveys;
}

// Function to save surveys data
function saveSurveys(surveys) {
  fs.writeFileSync(surveysFilePath, JSON.stringify({ surveys }, null, 2));
}

// Save survey progress route
router.post('/save', (req, res) => {
  const { token, surveyType, responses, complete } = req.body;

  // Logic for saving the survey progress (replace with actual logic)
  const surveys = loadSurveys();
  const newSurvey = {
    token,
    surveyType,
    responses,
    complete,
    id: (surveys.length + 1).toString() // Simple ID generation
  };

  surveys.push(newSurvey);
  saveSurveys(surveys);

  res.status(200).json({ success: true, message: 'Survey saved successfully' });
});

// Submit survey route
router.post('/submit', (req, res) => {
  const { token, surveyType, responses } = req.body;

  // Logic for submitting the survey (replace with actual logic)
  const surveys = loadSurveys();
  const newSurvey = {
    token,
    surveyType,
    responses,
    complete: true,
    id: (surveys.length + 1).toString() // Simple ID generation
  };

  surveys.push(newSurvey);
  saveSurveys(surveys);

  res.status(200).json({ success: true, message: 'Survey submitted successfully' });
});

module.exports = router;
