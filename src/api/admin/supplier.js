import request from '../request'

// 管理员查看所有供应商
export const getSupplierList = (params) => {
  return request({
    url: '/supplier/list',
    method: 'get',
    params
  })
}
