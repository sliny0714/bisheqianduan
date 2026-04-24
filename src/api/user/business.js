import request from '../request'

// ===================== 年审管理模块 =====================

// 用户提交年审
export const submitAnnualReview = (formData) => {
  return request({
    url: '/supplier/annual/submit',
    method: 'post',
    data: formData,
    headers: formData instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  })
}

// 用户查看自己的年审列表
export const getMyAnnualReviewList = (params) => {
  return request({
    url: '/supplier/annual/my',
    method: 'get',
    params
  })
}

// 撤回年审申请
export const withdrawAnnualReview = (id, userId) => {
  return request({
    url: `/supplier/annual/${id}`,
    method: 'delete',
    params: { userId }
  })
}

// 用户查看年审结果
export const getMyAnnualReviewResult = (params) => {
  return request({
    url: '/supplier/annual/my/result',
    method: 'get',
    params
  })
}

// ===================== 订单/支付模块 =====================

// 用户创建订单
export const createOrder = (data) => {
  return request({
    url: '/supplier/order',
    method: 'post',
    params: data
  })
}

// 用户查看自己的订单
export const getMyOrderList = (params) => {
  return request({
    url: '/supplier/order/my',
    method: 'get',
    params
  })
}

// 获取支付宝支付表单
export const getAlipayForm = (orderId) => {
  return request({
    url: '/supplier/order/alipay/form',
    method: 'get',
    params: { orderId }
  })
}

// 查询订单详情
export const getOrderDetail = (orderNo) => {
  return request({
    url: '/supplier/order/detail',
    method: 'get',
    params: { orderNo }
  })
}


// ===================== 绩效考核模块 =====================

// 用户查看自己的绩效
export const getMyPerformance = (params) => {
  return request({
    url: '/supplier/performance/my',
    method: 'get',
    params
  })
}

// 用户查看历史考核
export const getMyPerformanceHistory = (params) => {
  return request({
    url: '/supplier/performance/my/history',
    method: 'get',
    params
  })

}
