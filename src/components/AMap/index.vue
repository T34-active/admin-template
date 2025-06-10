<template>
  <div class="w-full h-400px relative">
    <div class="mb-10px">
      <el-input v-model="keyword" placeholder="搜索位置" class="w-300px" />
      <el-button type="primary" @click="searchPlace">搜索</el-button>
    </div>
    <div ref="mapContainer" class="w-full h-360px" />
    <!-- <div
      class="absolute bottom-60px right-20px z-10 bg-white px-10px py-10px rounded-lg shadow-lg w-30px h-30px text-center"
    >
      <svg-icon icon-class="currentLocation" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader'

defineProps({
  modelValue: {
    type: Object,
    default: () => ({ lng: '', lat: '' }),
  },
})
const emit = defineEmits(['update:modelValue'])
// (removed `console.log(import.meta.env)`)
// const ak = ref('bb5286f9310333f8a79803ec75ebf9f4')
const keyword = ref('')
const lng = ref('')
const lat = ref('')
const mapContainer = ref(null)
const AMapInstance = ref(null)
const map = ref(null)
const marker = ref(null)
const placeSearch = ref(null)

// 引入高德地图js
// async function loadAMap() {
//   if (window.AMap) return window.AMap
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script')
//     script.src = `https://webapi.amap.com/maps?v=2.0&key=${ak.value}`
//     script.onload = () => resolve(window.AMap)
//     script.onerror = reject
//     document.head.appendChild(script)
//     // key对应的秘钥
//     window._AMapSecurityConfig = {
//       securityJsCode: '1b8097a0e9fb9fc2c846b140cad58554',
//     }
//   })
// }

async function loadAMap() {
  if (AMapInstance.value) return AMapInstance.value
  try {
    AMapInstance.value = await AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: '2.0',
      // securityJsCode: '1b8097a0e9fb9fc2c846b140cad58554',
      plugins: ['AMap.PlaceSearch', 'AMap.ToolBar'],
    })
    return AMapInstance.value
  } catch (error) {
    console.error('高德地图加载失败', error)
    throw error
  }
}

async function initMap(location = []) {
  const AMap = await loadAMap()
  const defaultCenter = [116.404, 39.915]
  const center = location.length ? location : await getCurrentLocation().catch(() => defaultCenter)
  map.value = new AMap.Map(mapContainer.value, {
    center,
    zoom: location.length ? 16 : 12,
  })
  const point = new AMap.LngLat(...center)
  marker.value = new AMap.Marker({
    position: point,
    map: map.value,
  })
  map.value.on('click', (e) => {
    const point = [e.lnglat.getLng(), e.lnglat.getLat()]
    updateMarker(point)
  })
  // 初始化 PlaceSearch 和工具条
  placeSearch.value = new AMap.PlaceSearch({
    map: map.value,
  })
  map.value.addControl(new AMap.ToolBar())
}

async function updateMarker(point) {
  if (!map.value) return
  if (marker.value) {
    marker.value.setMap(null)
  }
  const AMap = AMapInstance.value
  marker.value = new AMap.Marker({
    position: point,
    map: map.value,
  })
  map.value.setCenter(point)
  emit('update:modelValue', {
    lng: point[0].toFixed(6),
    lat: point[1].toFixed(6),
  })
}

async function searchPlace() {
  if (!placeSearch.value || !keyword.value) return
  placeSearch.value.search(keyword.value, (status, result) => {
    if (status === 'complete' && result.info === 'OK' && result.poiList?.pois?.length > 0) {
      const loc = result.poiList.pois[0].location
      const point = [loc.lng, loc.lat]
      updateMarker(point)
      map.value.setZoom(16)
    } else {
      console.warn('未找到相关位置或搜索失败')
    }
  })
}

async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('浏览器不支持定位'))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve([pos.coords.longitude, pos.coords.latitude])
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0,
      },
    )
  })
}

async function resetMap() {
  if (marker.value) {
    marker.value.setMap(null)
    marker.value = null
  }
  placeSearch.value?.clear()
  map.value?.setCenter([116.404, 39.915])
  map.value?.setZoom(12)
  keyword.value = ''
  lng.value = ''
  lat.value = ''
}

defineExpose({ resetMap, initMap })
</script>
