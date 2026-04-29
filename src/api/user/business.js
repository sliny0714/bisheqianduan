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

// ===================== 合同管理模块 =====================

// 获取合同列表（用户端只能看到自己创建的合同）
export const getUserContractList = (params) => {
  return request({
    url: '/contract/list',
    method: 'get',
    params
  })
}

// 获取合同详情
export const getContractDetail = (id) => {
  return request({
    url: `/contract/detail/${id}`,
    method: 'get'
  })
}

// 保存合同（新增/修改）
export const saveContract = (data) => {
  return request({
    url: '/contract/save',
    method: 'post',
    data
  })
}

// 获取用户自己的供应商列表（用于下拉框选择）
export const getSupplierList = (userId) => {
  return request({
    url: '/supplier/my/list',
    method: 'get',
    params: { userId: userId, pageNum: 1, pageSize: 1000 }
  })
}

// 上传合同附件
export const uploadContractFile = (formData) => {
  return request({
    url: '/contract/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取30天内到期的合同数量
export const getExpiringContractCount = () => {
  return request({
    url: '/contract/expiring/count',
    method: 'get'
  })
}

// 终止合同
export const terminateContract = (id) => {
  return request({
    url: `/contract/terminate/${id}`,
    method: 'post'
  })
}
