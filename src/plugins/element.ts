import { ElTable } from 'element-plus/es'

/** Element Plus 运行时组件上仍有 props，但 TS 类型未暴露 */
type ComponentWithProps = {
  props?: Record<
    string,
    {
      default?: unknown
      type?: unknown
      required?: boolean
    }
  >
}

/**
 * 兜底：与 unplugin 实际引入路径一致，避免改错模块实例。
 * 主修复见 NtsTable 包装组件 + NtsTableResolver。
 */
export default function setupElementPlusDefaults() {
  const tableProps = (ElTable as unknown as ComponentWithProps).props
  const tooltipOptions = tableProps?.tooltipOptions
  if (!tooltipOptions) return

  tooltipOptions.default = () => ({
    appendTo: 'body',
    teleported: true,
    popperOptions: {
      strategy: 'fixed',
    },
  })
}
