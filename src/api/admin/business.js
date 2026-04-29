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

// ===================== 合同管理模块（管理员） =====================

// 获取合同列表
export const getContractList = (params) => {
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

// 创建合同
export const createContract = (data) => {
  return request({
    url: '/contract/save',
    method: 'post',
    data
  })
}

// 更新合同
export const updateContract = (data) => {
  return request({
    url: '/contract/update',
    method: 'post',
    data
  })
}

// 删除合同
export const deleteContract = (id) => {
  return request({
    url: `/contract/delete/${id}`,
    method: 'delete'
  })
}

// 根据供应商ID获取合同
export const getContractBySupplierId = (supplierId) => {
  return request({
    url: `/contract/supplier/${supplierId}`,
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

// 审核合同（通过/驳回）
export const auditContract = (data) => {
  return request({
    url: '/contract/admin/audit',
    method: 'post',
    params: {
      id: data.id,
      status: data.status,
      remark: data.remark
    }
  })
}

