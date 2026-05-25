import request from 'supertest'
import app from '../src/app'

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', email: 'invalid', password: 'short' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: 'password123' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')

      expect(res.status).toBe(401)
    })
  })
})
