import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/** 字典项结构 */
export interface DictOption {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

/**
 * 使用字典数据
 * @param args 字典类型数组，例如 ['sys_normal_disable', 'sys_user_sex']
 * @returns 返回每个字典类型对应的 ref 响应式数组对象
 */
export function useDict(...args: string[]) {
  const dictStore = useDictStore()
  const res = ref<Record<string, DictOption[]>>({})
  args.forEach((dictType) => {
    res.value[dictType] = []
    const cachedDict = dictStore.getDict(dictType)
    if (cachedDict) {
      res.value[dictType] = cachedDict
    } else {
      getDicts(dictType).then((resp) => {
        const dictData: DictOption[] = resp.data.map((item: any) => ({
          label: item.dictLabel,
          value: item.dictValue,
          elTagType: item.listClass,
          elTagClass: item.cssClass,
        }))
        res.value[dictType] = dictData
        dictStore.setDict(dictType, dictData)
      })
    }
  })

  return toRefs(res.value)
}
