import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/ruoyi'

/**
 * 获取符合查询条件的用户列表。
 *
 * @param query - 包含筛选条件的查询参数对象。
 * @returns 包含用户列表数据的 Promise。
 */
export function listUser(query): Promise<any> {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getUser(userId): Promise<any> {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get',
  })
}

// 新增用户
export function addUser(data): Promise<any> {
  return request({
    url: '/system/user',
    method: 'post',
    data,
  })
}

/**
 * 更新指定用户的信息。
 *
 * @param data - 包含用户更新信息的数据对象。
 * @returns 一个 Promise，解析为服务器返回的更新结果。
 */
export function updateUser(data): Promise<any> {
  return request({
    url: '/system/user',
    method: 'put',
    data,
  })
}

/**
 * 删除指定用户。
 *
 * @param userId - 要删除的用户ID。
 * @returns 一个 Promise，解析为服务器返回的删除结果。
 */
export function delUser(userId): Promise<any> {
  return request({
    url: '/system/user/' + userId,
    method: 'delete',
  })
}

// 用户密码重置
export function resetUserPwd(userId, password): Promise<any> {
  const data = {
    userId,
    password,
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data,
  })
}

// 用户状态修改
export function changeUserStatus(userId, status): Promise<any> {
  const data = {
    userId,
    status,
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data,
  })
}

// 查询用户个人信息
export function getUserProfile(): Promise<any> {
  return request({
    url: '/system/user/profile',
    method: 'get',
  })
}

// 修改用户个人信息
export function updateUserProfile(data): Promise<any> {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data,
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword): Promise<any> {
  const data = {
    oldPassword,
    newPassword,
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data,
  })
}

// 用户头像上传
export function uploadAvatar(data): Promise<any> {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data,
  })
}

// 查询授权角色
export function getAuthRole(userId): Promise<any> {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get',
  })
}

// 保存授权角色
export function updateAuthRole(data): Promise<any> {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data,
  })
}

// 查询部门下拉树结构
export function deptTreeSelect(): Promise<any> {
  return request({
    url: '/system/user/deptTree',
    method: 'get',
  })
}
