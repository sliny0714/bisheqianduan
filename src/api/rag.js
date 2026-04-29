import request from './request'

// 上传文档
export function uploadDoc(formData) {
  return request({
    url: '/document/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}

// 获取文档列表
export function getDocList() {
  return request({
    url: '/document/list',
    method: 'get'
  })
}

// 删除文档
export function deleteDoc(id) {
  return request({
    url: `/document/${id}`,
    method: 'delete'
  })
}

// 智能问答
export function chat(question) {
  const form = new FormData()
  form.append('question', question)
  return request({
    url: '/document/chat',
    method: 'post',
    data: form
  })
}