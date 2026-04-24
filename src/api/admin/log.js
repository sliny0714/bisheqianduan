import request from '../../api/request'

// 分页查询操作日志
export function getOperLogList(params) {
  return request({
    url: '/sys/log/admin/list',
    method: 'get',
    params
  })
}

// 获取日志详情
export function getOperLogDetail(id) {
  return request({
    url: `/sys/log/detail/${id}`,
    method: 'get'
  })
}

// 清理日志
export function cleanOperLogs(days) {
  return request({
    url: '/sys/log/clean',
    method: 'delete',
    params: { days }
  })
}
