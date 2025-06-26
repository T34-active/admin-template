// import { parseTime } from './ruoyi'

import type { FormItemRule } from 'element-plus'

/**
 * 通用表单校验规则生成器
 * @param message 校验失败时的提示信息
 * @param options 可选配置项：validator、trigger、required
 * @returns 单个字段的规则数组（FormItemRule[]）
 */
export const createRules = (
  message: string,
  options?: {
    validator?: (value: any) => boolean | Promise<boolean>
    trigger?: FormItemRule['trigger']
    required?: boolean
  },
): FormItemRule[] => {
  const { validator, trigger = 'change', required = true } = options || {}
  const rule: FormItemRule = {
    trigger,
    message,
  }
  if (validator) {
    rule.validator = (_rule, value, callback) => {
      const result = validator(value)
      if (typeof result === 'boolean') {
        result ? callback() : callback(new Error(message))
      } else {
        result.then(() => callback()).catch(() => callback(new Error(message)))
      }
    }
  } else {
    rule.required = required
  }
  return [rule]
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
// export function formatTime(time, option) {
//   if (('' + time).length === 10) {
//     time = parseInt(time) * 1000
//   } else {
//     time = +time
//   }
//   const d = new Date(time)
//   const now = Date.now()
//
//   const diff = (now - d) / 1000
//
//   if (diff < 30) {
//     return '刚刚'
//   } else if (diff < 3600) {
//     // less 1 hour
//     return Math.ceil(diff / 60) + '分钟前'
//   } else if (diff < 3600 * 24) {
//     return Math.ceil(diff / 3600) + '小时前'
//   } else if (diff < 3600 * 24 * 2) {
//     return '1天前'
//   }
//   if (option) {
//     return parseTime(time, option)
//   } else {
//     return (
//       d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
//     )
//   }
// }

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url === null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xdc00 && code <= 0xdfff) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    }),
  ).join('&')
}

/**
 * 将 URL 查询字符串解析为对象。
 *
 * @param url - 包含查询参数的 URL 字符串。
 * @returns 一个对象，键为参数名，值为解码后的参数值。如果没有查询参数，则返回空对象。
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      obj[name] = v.substring(index + 1, v.length)
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt(String((1 + Math.random()) * 65536)) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val]
}

/**
 * 判断字符串是否为有效的数字格式（可带正负号及小数点）。
 *
 * @param str - 待检测的字符串。
 * @returns 如果 {@link str} 是有效数字字符串则返回 true，否则返回 false。
 */
export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

/**
 * 返回日期时间选择器的默认起始和结束时间。
 *
 * @returns 包含两个 {@link Date} 对象的元组，第一个为 2000 年 2 月 1 日 00:00:00，第二个为 2000 年 3 月 1 日 23:59:59。
 */
export function defaultTime(): [Date, Date] {
  return [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
}
// 禁止选择今天之后的结束日期
export function disabledFutureDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 清除时间部分，仅比较日期
  return date.getTime() > today.getTime()
}

/**
 * 格式化金额字符串，只保留数字和最多两位小数
 * @param value 任意输入
 * @returns 格式化后的金额字符串
 */
export function formatToMoney(value: string): string {
  const match = value.match(/^\d*(\.?\d{0,2})?/)
  return match ? match[0] : ''
}
