import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  paymentApi,
  type PaymentRecord,
  type PaymentFilters,
  type PaginatedResponse,
} from '@/utils/api'
import { getErrorMessage } from '@/utils/errorHandler'

export const usePaymentsStore = defineStore('payments', () => {
  // 狀態
  const payments = ref<PaymentRecord[]>([])
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const filters = ref<PaymentFilters>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTime = ref<Date | null>(null)

  // 計算屬性
  const hasFilters = computed(() => {
    return (
      filters.value.status ||
      filters.value.payment_method ||
      (filters.value.payment_methods && filters.value.payment_methods.length > 0) ||
      filters.value.store_id ||
      (filters.value.store_ids && filters.value.store_ids.length > 0) ||
      filters.value.start_date ||
      filters.value.end_date ||
      filters.value.search
    )
  })

  const isEmpty = computed(() => payments.value.length === 0 && !isLoading.value)

  // 取得付款記錄
  const fetchPayments = async (newFilters?: PaymentFilters): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // 合併篩選條件
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      const response = await paymentApi.getPaginated({
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      const data = response.data as PaginatedResponse<PaymentRecord>
      payments.value = data.data
      pagination.value = {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }
      lastFetchTime.value = new Date()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 重新整理（保持當前篩選條件）
  const refresh = async (): Promise<void> => {
    await fetchPayments()
  }

  // 更新付款記錄
  const updatePayment = async (
    uuid: string,
    data: Partial<PaymentRecord>
  ): Promise<PaymentRecord> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await paymentApi.update(uuid, data)
      const updatedPayment = response.data

      // 更新本地狀態
      const index = payments.value.findIndex((p) => p.uuid === uuid)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }

      return updatedPayment
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 刪除付款記錄
  const deletePayment = async (uuid: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await paymentApi.delete(uuid)

      // 從本地狀態移除
      payments.value = payments.value.filter((p) => p.uuid !== uuid)
      pagination.value.total -= 1
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 批量刪除
  const batchDelete = async (uuids: string[]): Promise<number> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await paymentApi.batchDelete(uuids)
      const deletedCount = response.data.deletedCount

      // 從本地狀態移除
      payments.value = payments.value.filter((p) => !uuids.includes(p.uuid))
      pagination.value.total -= deletedCount

      return deletedCount
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // 設置篩選條件
  const setFilters = (newFilters: PaymentFilters): void => {
    filters.value = newFilters
    pagination.value.page = 1 // 重置到第一頁
  }

  // 清除篩選條件
  const clearFilters = (): void => {
    filters.value = {}
    pagination.value.page = 1
  }

  // 設置頁碼
  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  // 設置每頁數量
  const setLimit = (limit: number): void => {
    pagination.value.limit = limit
    pagination.value.page = 1
  }

  return {
    // 狀態
    payments,
    pagination,
    filters,
    isLoading,
    error,
    lastFetchTime,
    // 計算屬性
    hasFilters,
    isEmpty,
    // 方法
    fetchPayments,
    refresh,
    updatePayment,
    deletePayment,
    batchDelete,
    setFilters,
    clearFilters,
    setPage,
    setLimit,
  }
})
