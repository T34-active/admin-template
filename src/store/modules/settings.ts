import { defineStore } from 'pinia'
import defaultSettings from '@/settings'
import { useDynamicTitle } from '@/utils/dynamicTitle'

const {
  sideTheme: defaultSideTheme,
  showSettings,
  topNav: defaultTopNav,
  tagsView: defaultTagsView,
  fixedHeader: defaultFixedHeader,
  sidebarLogo: defaultSidebarLogo,
  dynamicTitle: defaultDynamicTitle,
} = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting') ?? '{}')

const useSettingsStore = defineStore('settings', () => {
  const title = ref('')
  const theme = ref(storageSetting.theme || '#409EFF')
  const sideTheme = ref(storageSetting.sideTheme || defaultSideTheme)
  const topNav = ref(storageSetting.topNav === undefined ? defaultTopNav : storageSetting.topNav)
  const tagsView = ref(
    storageSetting.tagsView === undefined ? defaultTagsView : storageSetting.tagsView,
  )
  const fixedHeader = ref(
    storageSetting.fixedHeader === undefined ? defaultFixedHeader : storageSetting.fixedHeader,
  )
  const sidebarLogo = ref(
    storageSetting.sidebarLogo === undefined ? defaultSidebarLogo : storageSetting.sidebarLogo,
  )
  const dynamicTitle = ref(
    storageSetting.dynamicTitle === undefined ? defaultDynamicTitle : storageSetting.dynamicTitle,
  )
  const showSettingsRef = ref(showSettings)

  // 修改布局设置
  function changeSetting(data: { key: string; value: any }) {
    const { key, value } = data
    if (key in settingsMap) {
      settingsMap[key].value = value
    }
  }

  // 设置网页标题
  function setTitle(newTitle: string) {
    title.value = newTitle
    useDynamicTitle()
  }

  const settingsMap: Record<string, { value: any }> = {
    title,
    theme,
    sideTheme,
    topNav,
    tagsView,
    fixedHeader,
    sidebarLogo,
    dynamicTitle,
    showSettings: showSettingsRef,
  }

  return {
    title,
    theme,
    sideTheme,
    topNav,
    tagsView,
    fixedHeader,
    sidebarLogo,
    dynamicTitle,
    showSettings: showSettingsRef,
    changeSetting,
    setTitle,
  }
})
export default useSettingsStore
