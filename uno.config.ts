import { defineConfig, presetAttributify, presetIcons, presetMini, presetUno } from 'unocss'

// 刚使用 unocss 的朋友，可以借助这个工具： https://to-unocss.netlify.app

export default defineConfig({
  presets: [
    presetUno,
    presetAttributify,
    presetIcons(),
    // 为什么要用到这个插件？
    // 模板使用 viewport 作为移动端适配方案，unocss 默认单位为 rem
    // 所以需要转成 px，然后由 postcss 把 px 转成 vw/vh，完成适配
    // 这里为什么要设置基础字体大小？看下面这篇文章
    // https://juejin.cn/post/7262975395620618298
    presetMini(),
  ],
  shortcuts: [
    // shortcuts to multiple utilities
    [
      'btn',
      'px-6 py-3 rounded-3 border-none inline-block bg-green-400 text-white cursor-pointer !outline-none hover:bg-green-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    ],
    ['center', 'flex justify-center items-center'],
  ],
  theme: {
    colors: {
      // 状态类颜色
      primary: '#1ECC8B', // 主色（品牌主色调）
      success: '#07C160', // 成功色（用于操作成功等提示）
      successLight: '#5EEBA8', // 成功浅色（清新、辅助、背景）
      successBg: '#F0FAF9', // 成功状态的背景色
      warning: '#FF7500', // 警告色（用于重要提醒、风险提示）
      error: '#E63227', // 错误色（用于操作失败、校验失败等）
      accent: '#FF7500', // 强调色（用于强调场景，等同于 warning）
      highlight: '#FF7201', // 高亮色（略深橙，用于特别强调）

      // 背景类颜色
      surface: '#F7F9FA', // 页面背景色（灰白，常用于底层背景）
      light: '#F5F7F7', // 更浅背景色（常用于卡片、表单区域）
      grayBg: '#f5f6f7', // 中性灰背景色（用于分区、包裹容器等）
      baseBg: '#F5F5F5', // 基础背景色（通用浅灰底）
      border: '#E5E5E5', // 默认边框色（常用于卡片、输入框、分隔）
      // 文本类颜色（按层级区分）
      primaryText: '#333333', // 一级文字色（主标题、重点信息）
      secondaryText: '#666666', // 二级文字色（正文、常规信息）
      mediumText: '#777777', // 中间层级文字色（次要说明、辅助信息）
      infoText: '#888888', // 信息性文字色（时间戳、标签辅助等）
      tertiaryText: '#999999', // 三级文字色（提示说明、表单提示等）
    },
    rounded: {
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      base: '10px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      '4xl': '32px',
    },
    fontSize: {
      xxs: ['10px', 'calc(1 / 0.75)'],
      xs: ['12px', 'calc(1 / 0.75)'],
      sm: ['14px', 'calc(1.25 / 0.875)'],
      base: ['16px', 'calc(1.5 / 1)'],
      lg: ['18px', 'calc(1.75 / 1.125)'],
      xl: ['20px', 'calc(1.75 / 1.25)'],
      '2xl': ['24px', 'calc(2 / 1.5)'],
      '3xl': ['30px', 'calc(2.25 / 1.875)'],
      '4xl': ['36px', 'calc(2.5 / 2.25)'],
      '5xl': ['48px', '1'],
      '6xl': ['60px', '1'],
      '7xl': ['72px', '1'],
      '8xl': ['96px', '1'],
      '9xl': ['128px', '1'],
    },
  },
})
