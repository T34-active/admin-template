// 手机号正则
import type { FormItemRule } from 'element-plus'

const phoneRegex = /^(?:13\d|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18\d|19[0-35-9])\d{8}$/
// 密码正则：密码需包含字母、数字、特殊字符，且不少于9位
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?`~]).{9,}$/

/**
 * 判断url是否是http或https
 */
export function isHttp(url: string) {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断path是否为外链
 */
export function isExternal(path: any) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 */
export function validUsername(str: string) {
  const validMap = ['admin', 'editor']
  return validMap.indexOf(str.trim()) >= 0
}

/**
 */
export function validURL(url: string) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 */
export function validLowerCase(str: string) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 */
export function validUpperCase(str: string) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 */
export function validAlphabets(str: string) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 */
export function validEmail(email: string) {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

export const validatePhone = (
  rule: FormItemRule,
  value: string,
  callback: (error?: string | Error) => void,
): void => {
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

export const isValidPhone = (value: string): boolean => {
  return phoneRegex.test(value)
}

export const validatePassword = (
  rule: FormItemRule,
  value: string,
  callback: (error?: string | Error) => void,
): void => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!passwordRegex.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 可在代码逻辑中使用的同步函数
export const isPassword = (value: string): boolean => {
  return passwordRegex.test(value)
}
