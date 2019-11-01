import axios from '@/libs/api.request'

export const login = ({ username, password }) => {
  return axios.postRequest('/login', {
    username,
    password
  })
}

export const getUserInfo = (params) => {
  return axios.getRequest('/me', params)
}

export const logout = (token) => {
  return axios.getRequest('/logout', token)
}

export const getUnreadCount = () => {
  return axios.getRequest('/message-count')
}

export const getUserIndex = (params) => {
  return axios.getRequest('/user/index', params)
}

export const apiRoleIndex = (params) => {
  return axios.getRequest('/role/index', params)
}

export const apiRoleSave = (params) => {
  return axios.postRequest('/role/save', params)
}

export const apiRoleDelete = (ids, params) => {
  return axios.deleteRequest('/role/delete/' + ids, params)
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
