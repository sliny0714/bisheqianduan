// 时间格式化工具函数

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或日期字符串
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  // 处理日期字符串
  if (typeof date === 'string') {
    // 处理 ISO 格式的日期字符串
    if (date.includes('T')) {
      date = new Date(date)
    } else {
      // 处理其他格式的日期字符串
      date = new Date(date.replace(/-/g, '/'))
    }
  }
  
  // 处理无效日期
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期（仅日期部分）
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDateOnly = (date) => {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间（仅时间部分）
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimeOnly = (date) => {
  return formatDate(date, 'HH:mm:ss')
}