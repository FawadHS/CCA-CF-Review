const request = require('supertest');
const app = require('../app');
const fs = require('fs');
const path = require('path');

describe('Survey Routes', () => {
  let authToken;
  let testCountry;

  beforeAll(async () => {
    // Load test country
    const countriesPath = path.join(__dirname, '../data/countries.json');
    const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
    testCountry = countriesData.countries[0];

    // Authenticate and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        country: testCountry.name,
        password: testCountry.password
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/survey/save', () => {
    const testSurveyData = {
      surveyType: 'CCA',
      responses: {
        section1: {
          question1: 'Test Answer 1',
          question2: 'Test Answer 2'
        }
      }
    };

    it('should save survey progress for authenticated user', async () => {
      const response = await request(app)
        .post('/api/survey/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testSurveyData,
          complete: false
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('savedId');
    });

    it('should reject survey save without authentication', async () => {
      const response = await request(app)
        .post('/api/survey/save')
        .send({
          ...testSurveyData,
          complete: false
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/survey/submit', () => {
    const testCompleteSurveyData = {
      surveyType: 'CF',
      responses: {
        section1: {
          question1: 'Complete Test Answer 1',
          question2: 'Complete Test Answer 2'
        },
        section2: {
          question3: 'Complete Test Answer 3'
        }
      }
    };

    it('should submit a complete survey', async () => {
      const response = await request(app)
        .post('/api/survey/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCompleteSurveyData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('submissionId');
    });

    it('should reject survey submission without authentication', async () => {
      const response = await request(app)
        .post('/api/survey/submit')
        .send(testCompleteSurveyData);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/survey/get', () => {
    it('should retrieve existing survey for authenticated user', async () => {
      const response = await request(app)
        .get('/api/survey/get')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ surveyType: 'CCA' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('surveyData');
    });

    it('should reject survey retrieval without authentication', async () => {
      const response = await request(app)
        .get('/api/survey/get')
        .query({ surveyType: 'CCA' });

      expect(response.statusCode).toBe(401);
    });
  });
});