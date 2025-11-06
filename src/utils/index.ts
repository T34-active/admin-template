import type { FormItemRule } from 'element-plus'
import { Decimal } from 'decimal.js'
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
 * 精确乘法运算，避免 JavaScript 浮点数精度丢失问题。
 *
 * @example
 * accurateMultiply(0.1, 0.2) // 返回 0.02
 * accurateMultiply(3.14, 2.5) // 返回 7.85
 *
 * @param a - 第一个乘数，可以是数字
 * @param b - 第二个乘数，可以是数字
 * @returns 两个数相乘的精确结果，返回 number 类型
 * @throws 如果输入包含无效数值时可能会抛出错误（如 NaN）
 */
export function accurateMultiply(a: number | string, b: number | string): number {
  return new Decimal(a).mul(b).toNumber()
}

/**
 * 精确除法运算，支持数字或字符串形式的输入，避免浮点数精度丢失。
 *
 * @param dividend 被除数，可以是 number 或 string
 * @param divisor 除数，可以是 number 或 string（不能为 0）
 * @param decimalPlaces 可选：保留小数位数。如果不传，默认返回最大精度
 * @returns 两个数相除的精确结果，返回 number 类型
 * @throws 如果除数为 0，会抛出错误；如果输入非法数值也可能抛出异常
 */
export function accurateDivide(
  dividend: number | string | undefined | null,
  divisor: number | string | undefined | null,
  decimalPlaces?: number,
): number | undefined {
  if (dividend == null || divisor == null) return undefined
  const a = new Decimal(dividend)
  const b = new Decimal(divisor)
  if (b.isZero()) throw new Error('除数不能为 0')
  const result = a.div(b)
  return decimalPlaces !== undefined
    ? Number(result.toFixed(decimalPlaces))
    : Number(result.toString())
}
/**
 * ✅ 将数字格式化为千位分隔符格式（最多保留两位小数）
 * @param num 输入数字或字符串
 * @returns 形如 "12,345.67"
 */
export function formatThousand(num: any): string {
  if (num === null || num === undefined || num === '') return ''
  const value = String(num).replace(/,/g, '')
  if (isNaN(Number(value))) return value
  const parts = value.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart
}

/**
 * ✅ 去除千位分隔符，返回纯数字字符串
 * @param num 可能含有逗号的金额字符串
 */
export function unformatThousand(num: any): string {
  if (num === null || num === undefined || num === '') return ''
  return String(num).replace(/,/g, '').trim()
}

/**
 * ✅ 安全解析金额，返回 Decimal 实例（避免科学计数法 / NaN）
 * @param value 任意输入值
 */
export function parseAmount(value: any): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0)
  const cleaned = unformatThousand(value)
  try {
    return new Decimal(cleaned)
  } catch {
    return new Decimal(0)
  }
}

/**
 * ✅ 通用格式化函数：分 → 元（保留两位小数，带￥）
 * @param value 分值或元值
 * @param fromCent 是否从分转换（true=自动除以100）
 */
export function formatCentToYuan(value: any, fromCent = false): string {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean' || Array.isArray(value) || typeof value === 'object')
    return '￥0.00'

  const cleaned = unformatThousand(value)
  const num = Number(cleaned)
  if (Number.isNaN(num)) return '￥0.00'

  const yuan = fromCent ? num / 100 : num
  return `￥${formatThousand(yuan.toFixed(2))}`
}

/**
 * ✅ 元转分（整数，四舍五入）
 * @param value 元字符串或数字
 */
export function yuanToCent(value: any): number {
  const dec = parseAmount(value)
  return dec.times(100).toDecimalPlaces(0).toNumber()
}

/**
 * ✅ 计算两个金额相加（支持字符串、Decimal、数字）
 */
export function addAmount(a: any, b: any): Decimal {
  return parseAmount(a).plus(parseAmount(b))
}

/**
 * ✅ 计算两个金额相减
 */
export function subtractAmount(a: any, b: any): Decimal {
  return parseAmount(a).minus(parseAmount(b))
}

/**
 * ✅ 格式化为显示用字符串（不带￥）
 */
export function formatDisplay(value: any): string {
  return formatThousand(parseAmount(value).toFixed(2))
}

/**
 * 格式化账户号：每4位加一个空格
 * @param value 原始账户号
 * @returns 带空格格式的账户号
 * 示例：6222123456789999 -> 6222 1234 5678 9999
 */
export function formatAcctNo(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value).replace(/\s+/g, '') // 去掉已有空格
  return str.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * 去除账户号中的空格
 * @param value 带空格的账户号
 * @returns 纯数字账户号
 */
export function unformatAcctNo(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, '').trim()
}
/**
 * 格式化银行卡号：每4位插入空格，只保留数字。
 * @param value 当前输入值（v-model）
 * @returns 格式化后的字符串
 */
export function onBankInput(value: string): string {
  if (!value) return ''
  // 去除空格和非数字
  const raw = value.replace(/\s+/g, '').replace(/\D/g, '')
  // 每4位插入一个空格
  return raw.replace(/(.{4})/g, '$1 ').trim()
}
/**
 * 金额转中文大写
 */
export function digitUppercase(n: string | number) {
  if (n === null || n === undefined || n === '') return ''
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  let num = Math.abs(Number(String(n).replace(/,/g, '')))
  if (isNaN(num)) return ''
  let s = ''
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(num * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '')
  }
  s = s || '整'
  num = Math.floor(num)
  for (let i = 0; i < unit[0].length && num > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && num > 0; j++) {
      p = digit[num % 10] + unit[1][j] + p
      num = Math.floor(num / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }
  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整')
}
