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
    validator?: (value: any) => boolean | Promise<void>
    trigger?: FormItemRule['trigger']
    required?: boolean
  },
): FormItemRule[] => {
  const { validator, trigger = 'change', required = true } = options || {}
  const rule: FormItemRule = {
    trigger,
    required,
    message,
  }
  if (validator) {
    rule.validator = (_rule, value, callback) => {
      const result = validator(value)
      if (typeof result === 'boolean') {
        result ? callback() : callback(new Error(message))
      } else if (result && typeof result.then === 'function') {
        result
          .then(() => callback())
          .catch((err) =>
            callback(typeof err === 'string' ? new Error(err) : err || new Error(message)),
          )
      }
    }
  }
  return [rule]
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

// 适用于简单的非空校验
export const validatorIsEmpty = (val: any) => {
  return val !== null && val !== undefined && String(val).trim().length > 0
}
