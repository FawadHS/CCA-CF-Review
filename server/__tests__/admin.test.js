const request = require('supertest');
const app = require('../app');
const fs = require('fs');
const path = require('path');

describe('Admin Routes', () => {
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'CCA-CF-123' // Use the actual admin credentials from your system
  };

  let adminToken;

  beforeAll(async () => {
    // Authenticate admin and get token
    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send(ADMIN_CREDENTIALS);

    adminToken = loginResponse.body.token;
  });

  describe('POST /api/admin/login', () => {
    it('should successfully login with valid admin credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send(ADMIN_CREDENTIALS);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/admin/countries', () => {
    it('should retrieve list of countries for authenticated admin', async () => {
      const response = await request(app)
        .get('/api/admin/countries')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('countries');
      expect(Array.isArray(response.body.countries)).toBe(true);
    });

    it('should reject country retrieval without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/countries');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/admin/countries', () => {
    const newCountry = {
      name: 'TestCountry',
      password: 'testpassword123'
    };

    it('should add a new country for authenticated admin', async () => {
      const response = await request(app)
        .post('/api/admin/countries')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCountry);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject country addition without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/countries')
        .send(newCountry);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/admin/surveys', () => {
    it('should retrieve survey responses for authenticated admin', async () => {
      const response = await request(app)
        .get('/api/admin/surveys')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          surveyType: 'CCA',
          status: 'completed'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('surveys');
      expect(Array.isArray(response.body.surveys)).toBe(true);
    });

    it('should reject survey retrieval without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/surveys')
        .query({
          surveyType: 'CCA',
          status: 'completed'
        });

      expect(response.statusCode).toBe(401);
    });
  });
});