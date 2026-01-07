// Jest 測試設置檔案

// 設置測試環境變數
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars'
process.env.ADMIN_PASSWORD = 'TestPassword123!'

// 增加測試超時時間
jest.setTimeout(30000)

// 全局 beforeAll
beforeAll(() => {
  // 測試前的全局設置
})

// 全局 afterAll
afterAll(() => {
  // 測試後的清理
})
