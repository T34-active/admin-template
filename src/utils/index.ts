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
  const { validator, trigger = 'blur', required = true } = options || {}
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
 * 返回日期时间选择器的默认起始和结束时间。
 *
 * @returns 包含两个 {@link Date} 对象的元组，第一个为 2000 年 2 月 1 日 00:00:00，第二个为 2000 年 3 月 1 日 23:59:59。
 */
export function defaultTime(): [Date, Date] {
  return [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
}
