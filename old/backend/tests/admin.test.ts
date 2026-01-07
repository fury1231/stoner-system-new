import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { adminRoutes } from '../src/routes/admin.js'
import { validateCredentials, generateToken } from '../src/middleware/auth.js'

vi.mock('../src/middleware/auth.js')

const app = express()
app.use(express.json())
app.use('/api/admin', adminRoutes)

describe('Admin Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/admin/login', () => {
    it('should login successfully with valid credentials', async () => {
      vi.mocked(validateCredentials).mockResolvedValue(true)
      vi.mocked(generateToken).mockReturnValue('mock-jwt-token')

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('登入成功')
      expect(response.body.token).toBe('mock-jwt-token')
      expect(response.body.user.username).toBe('admin')
    })

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(validateCredentials).mockResolvedValue(false)

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('用戶名或密碼錯誤')
    })

    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          password: 'admin123'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'admin',
          password: '123'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('驗證失敗')
    })
  })

  describe('POST /api/admin/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/admin/logout')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('登出成功')
    })
  })
})