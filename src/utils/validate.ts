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
 * 手机号规则：必须为 11 位数字，符合大陆手机号格式
 */
export function createPhoneRules(message: string) {
  return [
    { required: true, message, trigger: 'blur' },
    {
      pattern: /^(?:13\d|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18\d|19[0-35-9])\d{8}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ]
}

/**
 * 金额规则：非负数，最多两位小数
 * 自动去除千位分隔符
 */
export function createAmountRules(message: string) {
  return [
    { required: true, message, trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === '' || value === null || value === undefined) {
          return callback(new Error(message))
        }
        // 去除千位分隔符
        const cleaned = String(value).replace(/,/g, '').trim()

        const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/
        if (!pattern.test(cleaned)) {
          callback(new Error('金额必须为非负数且小数不超过2位'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ]
}

/**
 * 笔数规则：非负整数（不允许小数）
 * 自动去除千位分隔符
 */
export function createIntegerRules(message: string) {
  return [
    { required: true, message, trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === '' || value === null || value === undefined) {
          return callback(new Error(message))
        }
        // 去除千位分隔符
        const cleaned = String(value).replace(/,/g, '').trim()

        const pattern = /^\d+$/
        if (!pattern.test(cleaned)) {
          callback(new Error('笔数必须是整数，不能带小数'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ]
}

/**
 * 整数规则：必须是正整数（> 0），兼容带空格的显示值
 */
export function createPositiveIntegerRules(message: string) {
  return [
    { required: true, message, trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        // 允许 v-model 传来 null/'' 等
        if (value === '' || value === null || value === undefined) {
          return callback(new Error(message))
        }
        // 关键：去掉所有空格再判断
        const cleaned = String(value).replace(/\s+/g, '')
        // 只要是纯数字，并且转成数是整数且 > 0
        if (!/^\d+$/.test(cleaned)) {
          return callback(new Error('必须是正整数，不能为0或小数'))
        }
        const num = Number(cleaned)
        if (!Number.isInteger(num) || num <= 0) {
          return callback(new Error('必须是正整数，不能为0或小数'))
        }
        callback()
      },
      trigger: 'blur',
    },
  ]
}
