import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import copyText from './common/copyText'
import input from './inputInstall/index'
import highlight from './highlight/index'
/**
 * 向应用实例注册自定义指令，包括权限、复制、输入和高亮等功能。
 *
 * @param app - 应用实例，将被添加多个自定义指令。
 */
export default function directive(app: any) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('copyText', copyText)
  app.directive('input', input)
  app.directive('highlight', highlight)
}
