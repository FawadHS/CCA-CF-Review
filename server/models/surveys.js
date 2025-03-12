const fs = require('fs');
const path = require('path');

const surveysFilePath = path.join(__dirname, '../data/surveys.json');

// Function to load surveys data
function loadSurveys() {
  const data = fs.readFileSync(surveysFilePath, 'utf-8');
  return JSON.parse(data).surveys;
}

// Function to add a new survey
function addSurvey(survey) {
  const surveys = loadSurveys();
  surveys.push(survey);
  fs.writeFileSync(surveysFilePath, JSON.stringify({ surveys }, null, 2));
}

// Function to find a survey by ID
function findSurveyById(surveyId) {
  const surveys = loadSurveys();
  return surveys.find(survey => survey.id === surveyId);
}

module.exports = {
  loadSurveys,
  addSurvey,
  findSurveyById
};
