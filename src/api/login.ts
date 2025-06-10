import request from '@/utils/request'

/**
 * 发送登录请求以验证用户身份。
 *
 * @param username - 用户名。
 * @param password - 用户密码。
 * @param code - 验证码内容。
 * @param uuid - 验证码对应的唯一标识。
 * @returns 一个 Promise，解析为登录接口的响应数据。
 *
 * @remark 此请求不会携带令牌（token）。
 */
export function login(
  username: string,
  password: string,
  code: string,
  uuid: string,
): Promise<any> {
  const data = {
    username,
    password,
    code,
    uuid,
  }
  return request({
    url: '/login',
    headers: {
      isToken: false,
    },
    method: 'post',
    data,
  })
}

/**
 * 向后端发送注册请求以创建新用户账户。
 *
 * @param data - 包含注册所需信息的对象。
 * @returns 一个 Promise，解析为注册请求的响应结果。
 */
export function register(data): Promise<any> {
  return request({
    url: '/register',
    headers: {
      isToken: false,
    },
    method: 'post',
    data,
  })
}

/**
 * 获取当前用户的详细信息。
 *
 * @returns 包含用户详细信息的 Promise。
 */
export function getInfo(): Promise<any> {
  return request({
    url: '/getInfo',
    method: 'get',
  })
}

/**
 * 注销当前用户会话。
 *
 * 该方法向服务端发送注销请求，终止当前用户的登录状态。
 *
 * @returns 一个 Promise，解析为注销操作的响应数据。
 */
export function logout(): Promise<any> {
  return request({
    url: '/logout',
    method: 'post',
  })
}

/**
 * 获取用于登录的验证码图片。
 *
 * @returns 包含验证码图片及相关信息的 Promise。
 */
export function getCodeImg(): Promise<any> {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false,
    },
    method: 'get',
    timeout: 20000,
  })
}
