import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // 选择你喜欢的样式主题

export default {
  mounted(el) {
    const blocks = el.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  },
}
