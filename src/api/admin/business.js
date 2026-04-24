import request from '../request'

// ===================== 年审管理模块（管理员） =====================

// 管理员查看所有年审列表
export const getAnnualReviewList = (params) => {
  return request({
    url: '/supplier/annual/admin/list',
    method: 'get',
    params
  })
}

// 管理员审核年审（通过/驳回）
export const auditAnnualReview = (data) => {
  return request({
    url: '/supplier/annual/admin/audit',
    method: 'post',
    params: {
      id: data.id,
      status: data.status,
      reviewRemark: data.remark
    }
  })
}

// ===================== 订单管理模块（管理员） =====================

// 管理员查看所有订单
export const getOrderList = (params) => {
  return request({
    url: '/supplier/order/admin/list',
    method: 'get',
    params
  })
}

// 管理员查看订单详情
export const getOrderDetail = (orderNo) => {
  return request({
    url: '/supplier/order/detail',
    method: 'get',
    params: { orderNo }
  })
}

// ===================== 绩效考核模块（管理员） =====================

export const scorePerformance = (data) => {
  return request({
    url: '/supplier/performance/admin/score',
    method: 'post',
    params: data
  })
}

export const getPerformanceList = (params) => {
  return request({
    url: '/supplier/performance/admin/list',
    method: 'get',
    params
  })
}





