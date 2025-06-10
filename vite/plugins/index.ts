import vue from '@vitejs/plugin-vue'
import createAutoImport from './auto-import'
import createComponents from './components'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import { PluginOption } from 'vite'
import UnoCSS from 'unocss/vite'

export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
  const vitePlugins: PluginOption[] = [
    vue(), // Vue 插件首先执行
    UnoCSS(), // 然后执行 UnoCSS
  ]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createComponents())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  isBuild && vitePlugins.push(...createCompression(viteEnv))

  return vitePlugins
}
