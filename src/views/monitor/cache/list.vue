<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-x-2">
                <Collection style="width: 1em; height: 1em; vertical-align: middle" />
                <span style="vertical-align: middle">缓存列表</span>
              </div>
              <div>
                <el-button link type="primary" icon="Refresh" @click="refreshCacheNames()" />
              </div>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="cacheNames"
            :height="tableHeight"
            highlight-current-row
            style="width: 100%"
            @rowClick="getCacheKeys"
          >
            <el-table-column label="序号" width="60" type="index" />
            <el-table-column
              label="缓存名称"
              prop="cacheName"
              :show-overflow-tooltip="true"
              :formatter="nameFormatter"
            />
            <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" />
            <el-table-column label="操作" width="60" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheName(scope.row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-x-2">
                <Key style="width: 1em; height: 1em; vertical-align: middle" />
                <span style="vertical-align: middle">键名列表</span>
              </div>
              <div>
                <el-button link type="primary" icon="Refresh" @click="refreshCacheKeys()" />
              </div>
            </div>
          </template>
          <el-table
            v-loading="subLoading"
            :data="cacheKeys"
            :height="tableHeight"
            highlight-current-row
            style="width: 100%"
            @rowClick="handleCacheValue"
          >
            <el-table-column label="序号" width="60" type="index" />
            <el-table-column
              label="缓存键名"
              :show-overflow-tooltip="true"
              :formatter="keyFormatter"
            />
            <el-table-column label="操作" width="60" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheKey(scope.row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :span="8">
        <el-card :bordered="false">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-x-2">
                <Document style="width: 1em; height: 1em; vertical-align: middle" />
                <span style="vertical-align: middle">缓存内容</span>
              </div>
              <div>
                <el-button link type="primary" icon="Refresh" @click="handleClearCacheAll()">
                  清理全部
                </el-button>
              </div>
            </div>
          </template>
          <el-form :model="cacheForm" label-width="auto">
            <el-row :gutter="32">
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存名称" prop="cacheName">
                  <el-input v-model="cacheForm.cacheName" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存键名" prop="cacheKey">
                  <el-input v-model="cacheForm.cacheKey" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存内容" prop="cacheValue">
                  <el-input
                    v-model="cacheForm.cacheValue"
                    type="textarea"
                    :rows="8"
                    :readOnly="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  listCacheName,
  listCacheKey,
  getCacheValue,
  clearCacheName,
  clearCacheKey,
  clearCacheAll,
} from '@/api/monitor/cache'

const { proxy } = getCurrentInstance()

const cacheNames = ref([])
const cacheKeys = ref([])
const cacheForm = ref({
  cacheName: null,
  cacheKey: null,
  cacheValue: null,
})
const loading = ref(true)
const subLoading = ref(false)
const nowCacheName = ref('')
const tableHeight = ref(window.innerHeight - 200)

/** 查询缓存名称列表 */
async function getCacheNames() {
  loading.value = true
  const response = await listCacheName()
  cacheNames.value = response.data
  loading.value = false
}

/** 刷新缓存名称列表 */
function refreshCacheNames() {
  getCacheNames()
  proxy.$modal.msgSuccess('刷新缓存列表成功')
}

/** 清理指定名称缓存 */
async function handleClearCacheName(row) {
  await clearCacheName(row.cacheName)
  proxy.$modal.msgSuccess('清理缓存名称[' + nowCacheName.value + ']成功')
  await getCacheKeys()
}

/** 查询缓存键名列表 */
async function getCacheKeys(row?: any) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value
  if (cacheName === '') {
    return
  }
  subLoading.value = true
  const response = await listCacheKey(cacheName)
  cacheKeys.value = response.data
  subLoading.value = false
  nowCacheName.value = cacheName
}

/** 刷新缓存键名列表 */
async function refreshCacheKeys() {
  await getCacheKeys()
  proxy.$modal.msgSuccess('刷新键名列表成功')
}

/** 清理指定键名缓存 */
async function handleClearCacheKey(cacheKey: any) {
  await clearCacheKey(cacheKey)
  proxy.$modal.msgSuccess('清理缓存键名[' + cacheKey + ']成功')
  await getCacheKeys()
}

/** 列表前缀去除 */
function nameFormatter(row) {
  return row.cacheName.replace(':', '')
}

/** 键名前缀去除 */
function keyFormatter(cacheKey: any) {
  return cacheKey.replace(nowCacheName.value, '')
}

/** 查询缓存内容详细 */
async function handleCacheValue(cacheKey: any) {
  const response = await getCacheValue(nowCacheName.value, cacheKey)
  cacheForm.value = response.data
}

/** 清理全部缓存 */
async function handleClearCacheAll() {
  await clearCacheAll()
  proxy.$modal.msgSuccess('清理全部缓存成功')
}
onMounted(async () => {
  await getCacheNames()
})
</script>
