const request = require('supertest');
const app = require('../app');
const fs = require('fs');
const path = require('path');

// Helper function to load test countries
const loadTestCountries = () => {
  const countriesPath = path.join(__dirname, '../data/countries.json');
  const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
  return countriesData.countries;
};

describe('Authentication Routes', () => {
  let testCountry;

  beforeAll(() => {
    const countries = loadTestCountries();
    testCountry = countries[0]; // Use first country for testing
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          country: testCountry.name,
          password: testCountry.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          country: testCountry.name,
          password: 'incorrectpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with non-existent country', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          country: 'NonExistentCountry',
          password: 'anypassword'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/validate-session', () => {
    let validToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          country: testCountry.name,
          password: testCountry.password
        });

      validToken = loginResponse.body.token;
    });

    it('should validate a valid session token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-session')
        .send({ token: validToken });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('userInfo');
    });

    it('should reject an invalid session token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-session')
        .send({ token: 'invalidtoken' });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
    });
  });
});