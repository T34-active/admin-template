import { ElTable } from 'element-plus/es'

/**
 * 兜底：与 unplugin 实际引入路径一致，避免改错模块实例。
 * 主修复见 NtsTable 包装组件 + NtsTableResolver。
 */
export default function setupElementPlusDefaults() {
  ElTable.props.tooltipOptions.default = () => ({
    appendTo: 'body',
    teleported: true,
    popperOptions: {
      strategy: 'fixed',
    },
  })
}
