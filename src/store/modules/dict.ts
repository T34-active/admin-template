interface DictItem {
  key: string
  value: unknown
}

const useDictStore = defineStore('dict', () => {
  const dict = ref<DictItem[]>([])

  // 获取字典
  function getDict(_key: string | null): unknown | null {
    if (!_key) return null
    try {
      const item = dict.value.find((d) => d.key === _key)
      return item ? item.value : null
    } catch (e) {
      return null
    }
  }

  // 设置字典
  function setDict(_key: string | null, value: unknown): void {
    if (_key) {
      dict.value.push({ key: _key, value })
    }
  }

  // 删除字典
  function removeDict(_key: string): boolean {
    try {
      const index = dict.value.findIndex((d) => d.key === _key)
      if (index !== -1) {
        dict.value.splice(index, 1)
        return true
      }
    } catch (e) {
      return false
    }
    return false
  }

  // 清空字典
  function cleanDict(): void {
    dict.value = []
  }

  return {
    dict,
    getDict,
    setDict,
    removeDict,
    cleanDict,
  }
})

export default useDictStore
