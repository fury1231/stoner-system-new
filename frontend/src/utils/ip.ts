/**
 * IP 地址處理工具函數
 */

/**
 * 格式化 IP 地址為 IPv4 格式顯示
 * @param ip - 原始 IP 地址
 * @returns 格式化後的 IP 地址字符串
 */
export function formatIPAddress(ip: string | null | undefined): string {
  if (!ip) return '-'
  
  // 如果是 IPv6 映射的 IPv4 地址，轉換為 IPv4
  if (ip.startsWith('::ffff:')) {
    const ipv4Part = ip.substring(7)
    if (isIPv4(ipv4Part)) {
      return ipv4Part
    }
  }
  
  // 處理完整的 IPv6 映射格式
  if (ip.match(/^::ffff:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)) {
    return ip.substring(7)
  }
  
  // 如果是本地 IPv6 回環地址，轉換為 IPv4
  if (ip === '::1') {
    return '127.0.0.1'
  }
  
  // 如果是其他 IPv6 地址，保持原樣但添加標示
  if (isIPv6(ip)) {
    return `${ip} (IPv6)`
  }
  
  // 如果是 IPv4 地址，直接返回（不加標籤）
  if (isIPv4(ip)) {
    return ip
  }
  
  // 其他情況返回原值
  return ip
}

/**
 * 檢查是否為 IPv4 地址
 */
export function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

/**
 * 檢查是否為 IPv6 地址
 */
export function isIPv6(ip: string): boolean {
  // 簡化的 IPv6 正則表達式
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv6Regex.test(ip) || ip.includes(':')
}

/**
 * 獲取 IP 地址類型標籤（現在不顯示標籤，返回空字符串）
 */
export function getIPTypeLabel(_ip: string | null | undefined): string {
  // 不顯示任何標籤
  return ''
}