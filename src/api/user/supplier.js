import request from '../request'

// 新增供应商
export const addSupplier = (supplierData, userId) => {
  return request({
    url: '/supplier/add',
    method: 'post',
    params: {
      userId,
      ...supplierData
    }
  })
}

// 分页查询我的供应商
export const getMySupplierList = (params) => {
  return request({
    url: '/supplier/my/list',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      ...params
    }
  })
}

// 查询供应商详情
export const getSupplierDetail = (id) => {
  return request({
    url: '/supplier/detail',
    method: 'get',
    params: {
      id
    }
  })
}

// 修改供应商
export const updateSupplier = (supplierData, userId) => {
  return request({
    url: '/supplier/update',
    method: 'post',
    params: {
      userId,
      ...supplierData
    }
  })
}

// 删除供应商
export const deleteSupplier = (id) => {
  return request({
    url: '/supplier/delete',
    method: 'get',
    params: {
      id
    }
  })
}

// 查询供应商风险预警
export const getSupplierRiskAlert = (supplierId) => {
  return request({
    url: '/supplier/risk/alert',
    method: 'get',
    params: {
      supplierId
    }
  })
}

// 查询供应商风险评估
export const getSupplierRiskAssess = (supplierId) => {
  return request({
    url: '/supplier/risk/assess',
    method: 'get',
    params: {
      supplierId
    }
  })
}