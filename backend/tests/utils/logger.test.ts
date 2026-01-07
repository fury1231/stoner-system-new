import { describe, it, expect } from 'vitest'
import { generateRequestId } from '../../src/utils/logger.js'

describe('Logger Utilities', () => {
  describe('generateRequestId', () => {
    it('should generate a unique request ID', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('should start with "req_" prefix', () => {
      const id = generateRequestId()
      expect(id.startsWith('req_')).toBe(true)
    })

    it('should have reasonable length', () => {
      const id = generateRequestId()
      expect(id.length).toBeGreaterThan(10)
      expect(id.length).toBeLessThan(30)
    })
  })
})
