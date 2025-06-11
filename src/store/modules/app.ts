import Cookies from 'js-cookie'

const useAppStore = defineStore('app', () => {
  const sidebar = reactive({
    opened: Cookies.get('sidebarStatus') ? !!+(Cookies.get('sidebarStatus') ?? '') : true,
    withoutAnimation: false,
    hide: false,
  })

  const device = ref('desktop')
  const size = ref(Cookies.get('size') || 'default')

  function toggleSideBar(withoutAnimation?: boolean) {
    if (sidebar.hide) return false
    sidebar.opened = !sidebar.opened
    sidebar.withoutAnimation = Boolean(withoutAnimation)
    Cookies.set('sidebarStatus', sidebar.opened ? '1' : '0')
  }

  function closeSideBar({ withoutAnimation }: { withoutAnimation: boolean }) {
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
    Cookies.set('sidebarStatus', '0')
  }

  function toggleDevice(val: string) {
    device.value = val
  }

  function setSize(val: string) {
    size.value = val
    Cookies.set('size', val)
  }

  function toggleSideBarHide(status: boolean) {
    sidebar.hide = status
  }

  return {
    sidebar,
    device,
    size,
    toggleSideBar,
    closeSideBar,
    toggleDevice,
    setSize,
    toggleSideBarHide,
  }
})

export default useAppStore
