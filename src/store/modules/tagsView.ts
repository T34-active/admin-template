import type { RouteLocationNormalizedLoaded, RouteRecordName } from 'vue-router'

const useTagsViewStore = defineStore('tags-view', () => {
  const visitedViews = ref<RouteLocationNormalizedLoaded[]>([])
  const cachedViews = ref<RouteRecordName[]>([])
  const iframeViews = ref<RouteLocationNormalizedLoaded[]>([])

  function addView(view: RouteLocationNormalizedLoaded) {
    addVisitedView(view)
    addCachedView(view)
  }

  function addIframeView(view: RouteLocationNormalizedLoaded) {
    if (iframeViews.value.some((v) => v.path === view.path)) return
    iframeViews.value.push({ ...view, title: view.meta.title || 'no-name' })
  }

  function addVisitedView(view: RouteLocationNormalizedLoaded) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push({ ...view, title: view.meta.title || 'no-name' })
  }

  function addCachedView(view: RouteLocationNormalizedLoaded) {
    if (cachedViews.value.includes(view.name ?? '')) return
    if (!view.meta.noCache && view.name) {
      cachedViews.value.push(view.name)
    }
  }

  async function delView(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      delVisitedView(view)
      delCachedView(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delVisitedView(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => v.path !== view.path)
      iframeViews.value = iframeViews.value.filter((v) => v.path !== view.path)
      resolve([...visitedViews.value])
    })
  }

  function delIframeView(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      iframeViews.value = iframeViews.value.filter((v) => v.path !== view.path)
      resolve([...iframeViews.value])
    })
  }

  function delCachedView(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(view.name ?? '')
      if (index > -1) cachedViews.value.splice(index, 1)
      resolve([...cachedViews.value])
    })
  }

  function delOthersViews(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      delOthersVisitedViews(view)
      delOthersCachedViews(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delOthersVisitedViews(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => v.meta.affix || v.path === view.path)
      iframeViews.value = iframeViews.value.filter((v) => v.path === view.path)
      resolve([...visitedViews.value])
    })
  }

  function delOthersCachedViews(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(view.name ?? '')
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1)
      } else {
        cachedViews.value = []
      }
      resolve([...cachedViews.value])
    })
  }

  function delAllViews(view?: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      delAllVisitedViews(view)
      delAllCachedViews(view)
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      })
    })
  }

  function delAllVisitedViews(view?: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => v.meta.affix)
      iframeViews.value = []
      resolve([...visitedViews.value])
    })
  }

  function delAllCachedViews(view?: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      cachedViews.value = []
      resolve([...cachedViews.value])
    })
  }

  function updateVisitedView(view: RouteLocationNormalizedLoaded) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path)
    if (index !== -1) {
      visitedViews.value[index] = Object.assign({}, visitedViews.value[index], view)
    }
  }

  function delRightTags(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index === -1) return

      visitedViews.value = visitedViews.value.filter((item, idx) => {
        if (idx <= index || item.meta?.affix) return true
        const i = cachedViews.value.indexOf(item.name ?? '')
        if (i > -1) cachedViews.value.splice(i, 1)
        if (item.meta.link) {
          const fi = iframeViews.value.findIndex((v) => v.path === item.path)
          if (fi > -1) iframeViews.value.splice(fi, 1)
        }
        return false
      })
      resolve([...visitedViews.value])
    })
  }

  function delLeftTags(view: RouteLocationNormalizedLoaded) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index === -1) return

      visitedViews.value = visitedViews.value.filter((item, idx) => {
        if (idx >= index || item.meta?.affix) return true
        const i = cachedViews.value.indexOf(item.name ?? '')
        if (i > -1) cachedViews.value.splice(i, 1)
        if (item.meta.link) {
          const fi = iframeViews.value.findIndex((v) => v.path === item.path)
          if (fi > -1) iframeViews.value.splice(fi, 1)
        }
        return false
      })
      resolve([...visitedViews.value])
    })
  }

  return {
    visitedViews,
    cachedViews,
    iframeViews,
    addView,
    addIframeView,
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delIframeView,
    delCachedView,
    delOthersViews,
    delOthersVisitedViews,
    delOthersCachedViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    updateVisitedView,
    delRightTags,
    delLeftTags,
  }
})
export default useTagsViewStore
