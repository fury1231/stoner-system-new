import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentForm from '@/components/PaymentForm.vue'
import { paymentApi } from '@/utils/api'

vi.mock('@/utils/api', () => ({
  paymentApi: {
    create: vi.fn()
  }
}))

describe('PaymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    const wrapper = mount(PaymentForm)
    
    expect(wrapper.find('input[placeholder="帳號後五碼"]').exists()).toBe(true)
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="匯款金額"]').exists()).toBe(true)
    expect(wrapper.find('textarea[placeholder="備註（選填）"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('validates last_five input correctly', async () => {
    const wrapper = mount(PaymentForm)
    const lastFiveInput = wrapper.find('input[placeholder="帳號後五碼"]')
    
    await lastFiveInput.setValue('12345')
    expect(lastFiveInput.element.value).toBe('12345')
    
    await lastFiveInput.setValue('123456')
    expect(lastFiveInput.element.value).toBe('123456')
  })

  it('shows success message after successful submission', async () => {
    const mockResponse = { data: { uuid: 'test-uuid-123' } }
    vi.mocked(paymentApi.create).mockResolvedValue(mockResponse)
    
    const wrapper = mount(PaymentForm)
    
    await wrapper.find('input[placeholder="帳號後五碼"]').setValue('12345')
    await wrapper.find('input[type="datetime-local"]').setValue('2023-07-13T10:30')
    await wrapper.find('input[placeholder="匯款金額"]').setValue('2000')
    await wrapper.find('textarea[placeholder="備註（選填）"]').setValue('測試備註')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(paymentApi.create).toHaveBeenCalledWith({
      last_five: '12345',
      paid_at: '2023-07-13T10:30',
      amount: 2000,
      note: '測試備註'
    })
    
    expect(wrapper.text()).toContain('匯款資訊已成功提交')
    expect(wrapper.text()).toContain('test-uuid-123')
  })

  it('shows error message on submission failure', async () => {
    const mockError = {
      response: {
        data: { message: '提交失敗' }
      }
    }
    vi.mocked(paymentApi.create).mockRejectedValue(mockError)
    
    const wrapper = mount(PaymentForm)
    
    await wrapper.find('input[placeholder="帳號後五碼"]').setValue('12345')
    await wrapper.find('input[type="datetime-local"]').setValue('2023-07-13T10:30')
    await wrapper.find('input[placeholder="匯款金額"]').setValue('2000')
    
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('提交失敗')
  })
})