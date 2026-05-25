import request from 'supertest'
import app from '../src/app'

describe('Room Routes', () => {
  describe('POST /api/rooms', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .send({ name: 'Test Room' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/rooms/join', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/rooms/join')
        .send({ roomCode: 'ABCDEF', nickname: 'TestUser' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/rooms/:id', () => {
    it('should return 404 for non-existent room', async () => {
      const res = await request(app)
        .get('/api/rooms/00000000-0000-0000-0000-000000000000')

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/rooms/:id/queue', () => {
    it('should return empty queue for non-existent room', async () => {
      const res = await request(app)
        .get('/api/rooms/00000000-0000-0000-0000-000000000000/queue')

      expect(res.status).toBe(200)
      expect(res.body.data.queue).toEqual([])
    })
  })
})
