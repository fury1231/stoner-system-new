import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { paymentRoutes } from '../src/routes/payments.js'
import { db } from '../src/db.js'
import { discordNotifier } from '../src/discord.js'

vi.mock('../src/db.js')
vi.mock('../src/discord.js')

const app = express()
app.use(express.json())
app.use('/api/payments', paymentRoutes)

describe('Payment Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/payments', () => {
    it('should create a payment successfully', async () => {
      const mockPayment = {
        uuid: 'test-uuid-123',
        last_five: '12345',
        paid_at: '2023-07-13T10:30:00.000Z',
        amount: 2000,
        note: '測試備註',
        status: '未確認',
        created_at: '2023-07-13T10:30:00.000Z'
      }

      vi.mocked(db.createPayment).mockResolvedValue(mockPayment)
      vi.mocked(discordNotifier.sendPaymentNotification).mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/payments')
        .send({
          last_five: '12345',
          paid_at: '2023-07-13T10:30:00.000Z',
          amount: 2000,
          note: '測試備註'
        })

      expect(response.status).toBe(201)
      expect(response.body.uuid).toBe('test-uuid-123')
      expect(response.body.message).toBe('匯款資訊已成功提交')
      expect(db.createPayment).toHaveBeenCalledWith({
        last_five: '12345',
        paid_at: '2023-07-13T10:30:00.000Z',
        amount: 2000,
        note: '測試備註'
      })
      expect(discordNotifier.sendPaymentNotification).toHaveBeenCalledWith(mockPayment)
    })

    it('should return 400 for invalid last_five', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          last_five: '123',
          paid_at: '2023-07-13T10:30:00.000Z',
          amount: 2000
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })

    it('should return 400 for invalid amount', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          last_five: '12345',
          paid_at: '2023-07-13T10:30:00.000Z',
          amount: 0
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })

    it('should return 400 for future paid_at date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const response = await request(app)
        .post('/api/payments')
        .send({
          last_five: '12345',
          paid_at: futureDate.toISOString(),
          amount: 2000
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })
  })

  describe('GET /api/payments (requires auth)', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/payments')

      expect(response.status).toBe(401)
    })
  })
})