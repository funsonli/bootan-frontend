import axios from '@/libs/api.request'

export const uploadFile = '/bootan/common/upload'

export const apiLogin = ({ username, password }) => {
  return axios.postRequest('/login', {
    username,
    password
  })
}

export const apiMe = (params) => {
  return axios.getRequest('/me', params)
}

export const apiLogout = (token) => {
  return axios.getRequest('/logout', token)
}

export const apiMessageCount = () => {
  return axios.getRequest('/message-count')
}

export const apiCommonUpload = (params) => {
  return axios.getRequest('/common/upload', params)
}

export const apiUserIndex = (params) => {
  return axios.getRequest('/user/index', params)
}

export const apiUserSave = (params) => {
  return axios.postRequest('/user/save', params)
}

export const apiUserDelete = (ids, params) => {
  return axios.deleteRequest('/user/delete/' + ids, params)
}

export const apiUserImportData = (params) => {
  return axios.importRequest('/user/import-data', params)
}

export const apiUserDepartmentUser = (id, params) => {
  return axios.getRequest('/user/department-user/' + id, params)
}

export const apiUserUnlock = (params) => {
  return axios.postRequest('/user/unlock', params)
}

export const apiUserResetPassword = (params) => {
  return axios.postRequest('/user/reset-password', params)
}

export const apiUserDisable = (id, params) => {
  return axios.postRequest('/user/disable/' + id, params)
}

export const apiUserEnable = (id, params) => {
  return axios.postRequest('/user/enable/' + id, params)
}

export const apiRoleAll = (params) => {
  return axios.getRequest('/role/all', params)
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

export const apiRoleSavePermission = (params) => {
  return axios.postRequest('/role/save-permission', params)
}

export const apiRoleSaveDepartment = (params) => {
  return axios.postRequest('/role/save-department', params)
}

export const apiRoleSaveDefault = (params) => {
  return axios.postRequest('/role/save-default', params)
}

export const apiPermissionAll = (params) => {
  return axios.getRequest('/permission/all', params)
}

export const apiPermissionIndex = (params) => {
  return axios.getRequest('/permission/index', params)
}

export const apiPermissionSave = (params) => {
  return axios.postRequest('/permission/save', params)
}

export const apiPermissionDelete = (ids, params) => {
  return axios.deleteRequest('/permission/delete/' + ids, params)
}

export const apiPermissionSearch = (keyword, params) => {
  return axios.getRequest('/permission/search/' + keyword, params)
}

export const apiPermissionMenuList = (params) => {
  return axios.getRequest('/permission/menu-list', params)
}

export const apiDepartmentAll = (params) => {
  return axios.getRequest('/department/all', params)
}

export const apiDepartmentList = (parentId, params) => {
  return axios.getRequest('/department/list/' + parentId, params)
}

export const apiDepartmentIndex = (params) => {
  return axios.getRequest('/department/index', params)
}

export const apiDepartmentSave = (params) => {
  return axios.postRequest('/department/save', params)
}

export const apiDepartmentDelete = (ids, params) => {
  return axios.deleteRequest('/department/delete/' + ids, params)
}

export const apiDepartmentSearch = (keyword, params) => {
  return axios.getRequest('/department/search/' + keyword, params)
}

export const apiStudentIndex = (params) => {
  return axios.getRequest('/student/index', params)
}

export const apiStudentSave = (params) => {
  return axios.postRequest('/student/save', params)
}

export const apiStudentDelete = (ids, params) => {
  return axios.deleteRequest('/student/delete/' + ids, params)
}

export const apiStudentAll = (params) => {
  return axios.getRequest('/student/all', params)
}

export const apiStudentImportData = (params) => {
  return axios.importRequest('/student/import-data', params)
}

export const apiStudentDisable = (id, params) => {
  return axios.postRequest('/student/disable/' + id, params)
}

export const apiStudentEnable = (id, params) => {
  return axios.postRequest('/student/enable/' + id, params)
}

export const apiDictAll = (params) => {
  return axios.getRequest('/dict/all', params)
}

export const apiDictIndex = (params) => {
  return axios.getRequest('/dict/index', params)
}

export const apiDictSave = (params) => {
  return axios.postRequest('/dict/save', params)
}

export const apiDictDelete = (ids, params) => {
  return axios.deleteRequest('/dict/delete/' + ids, params)
}

export const apiDictSearch = (keyword, params) => {
  return axios.getRequest('/dict/search/' + keyword, params)
}

export const apiDictDataIndex = (params) => {
  return axios.getRequest('/dict-data/index', params)
}

export const apiDictDataSave = (params) => {
  return axios.postRequest('/dict-data/save', params)
}

export const apiDictDataDelete = (ids, params) => {
  return axios.deleteRequest('/dict-data/delete/' + ids, params)
}

export const apiDictDataViewName = (name, params) => {
  return axios.getRequest('/dict-data/view-name/' + name, params)
}

export const apiDictDataDisable = (id, params) => {
  return axios.postRequest('/dict-data/disable/' + id, params)
}

export const apiDictDataEnable = (id, params) => {
  return axios.postRequest('/dict-data/enable/' + id, params)
}

export const apiLogIndex = (params) => {
  return axios.getRequest('/log/index', params)
}

export const apiLogSave = (params) => {
  return axios.postRequest('/log/save', params)
}

export const apiLogDelete = (ids, params) => {
  return axios.deleteRequest('/log/delete/' + ids, params)
}

export const apiLogAll = (params) => {
  return axios.getRequest('/log/all', params)
}

export const apiLogImportData = (params) => {
  return axios.importRequest('/log/import-data', params)
}

export const apiLogDisable = (id, params) => {
  return axios.postRequest('/log/disable/' + id, params)
}

export const apiLogEnable = (id, params) => {
  return axios.postRequest('/log/enable/' + id, params)
}
