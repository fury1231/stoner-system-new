import { Request } from 'express'

/**
 * 獲取客戶端真實 IP 地址，優先返回 IPv4 格式
 */
export function getClientIP(req: Request): string {
  // 獲取所有可能的 IP 來源
  const forwarded = req.headers['x-forwarded-for']
  const realIP = req.headers['x-real-ip']
  const remoteAddress = req.socket.remoteAddress || req.connection?.remoteAddress
  const reqIP = req.ip

  // 處理 X-Forwarded-For 標頭（可能包含多個 IP）
  const candidateIPs: string[] = []

  if (forwarded) {
    if (typeof forwarded === 'string') {
      candidateIPs.push(...forwarded.split(',').map(ip => ip.trim()))
    } else {
      candidateIPs.push(...forwarded.flatMap(f => f.split(',').map(ip => ip.trim())))
    }
  }

  if (realIP && typeof realIP === 'string') {
    candidateIPs.push(realIP.trim())
  }

  if (reqIP) {
    candidateIPs.push(reqIP)
  }

  if (remoteAddress) {
    candidateIPs.push(remoteAddress)
  }

  // 過濾有效的 IP 地址並轉換 IPv6 映射的 IPv4
  const validIPs = candidateIPs
    .filter(ip => ip && ip !== 'unknown')
    .map(ip => convertIPv6MappedToIPv4(ip))
    .filter(ip => isValidIP(ip))

  // 優先選擇 IPv4 地址
  const ipv4 = validIPs.find(ip => isIPv4(ip))
  if (ipv4) {
    return ipv4
  }

  // 如果沒有 IPv4，返回第一個有效的 IPv6 地址
  const ipv6 = validIPs.find(ip => isIPv6(ip))
  if (ipv6) {
    return ipv6
  }

  // 如果都沒有，返回預設值
  return '127.0.0.1'
}

/**
 * 將 IPv6 映射的 IPv4 地址轉換為純 IPv4 格式
 * 例如：::ffff:127.0.0.1 -> 127.0.0.1
 */
function convertIPv6MappedToIPv4(ip: string): string {
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
  
  return ip
}

/**
 * 檢查是否為 IPv4 地址
 */
function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

/**
 * 檢查是否為 IPv6 地址
 */
function isIPv6(ip: string): boolean {
  // 簡化的 IPv6 正則表達式
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv6Regex.test(ip) || ip.includes(':')
}

/**
 * 檢查是否為有效的 IP 地址
 */
function isValidIP(ip: string): boolean {
  return isIPv4(ip) || isIPv6(ip)
}