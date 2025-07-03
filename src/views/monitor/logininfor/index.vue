<script setup lang="ts">
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/monitor/logininfor'
import type { Sort } from 'element-plus'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()
const { sys_common_status } = proxy.useDict('sys_common_status')

const logininforList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const selectName = ref('')
const total = ref(0)
const defaultSort = ref<Sort>({ prop: 'loginTime', order: 'descending' })

const items = ref<QueryItemConfig[]>([
  {
    label: '登录地址',
    prop: 'ipaddr',
    type: 'input',
    placeholder: '请输入登录地址',
  },
  {
    label: '用户名称',
    prop: 'userName',
    type: 'input',
    placeholder: '请输入用户名称',
  },

  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择状态',
    dict: sys_common_status,
  },
  {
    label: '登录时间',
    prop: 'dateRange',
    type: 'daterange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
])

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined,
  orderByColumn: undefined,
  isAsc: undefined,
  dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
})

/** 查询登录日志列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await list(proxy.addDateRange(queryParams.value, safeRange))
  logininforList.value = response.rows
  total.value = response.total
  loading.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.dateRange = [undefined, undefined]
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  proxy.$refs.logininforRef.sort(defaultSort.value.prop, defaultSort.value.order)
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.infoId)
  multiple.value = !selection.length
  single.value = selection.length !== 1
  selectName.value = selection.map((item) => item.userName)
}
/** 排序触发事件 */
function handleSortChange(column: any, prop: any, order: any) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order
  getList()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const infoIds = row.infoId || ids.value
  proxy.$modal
    .confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？')
    .then(function () {
      return delLogininfor(infoIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
  //   .catch(() => {});
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal
    .confirm('是否确认清空所有登录日志数据项？')
    .then(function () {
      return cleanLogininfor()
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('清空成功')
    })
  //   .catch(() => {});
}
/** 解锁按钮操作 */
function handleUnlock() {
  const username = selectName.value
  proxy.$modal
    .confirm('是否确认解锁用户"' + username + '"数据项？')
    .then(function () {
      return unlockLogininfor(username)
    })
    .then(() => {
      proxy.$modal.msgSuccess('用户' + username + '解锁成功')
    })
  //   .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/logininfor/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  )
}

getList()
</script>
<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-4">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:remove']"
              type="danger"
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:remove']"
              type="danger"
              icon="Delete"
              @click="handleClean"
            >
              清空
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:unlock']"
              type="primary"
              icon="Unlock"
              :disabled="single"
              @click="handleUnlock"
            >
              解锁
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:export']"
              type="warning"
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
        </el-row>
      </div>
    </collapsePanel>
    <el-table
      ref="logininforRef"
      v-loading="loading"
      :data="logininforList"
      :default-sort="defaultSort"
      @selectionChange="handleSelectionChange"
      @sortChange="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="访问编号" prop="infoId" />
      <el-table-column
        label="用户名称"
        prop="userName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="地址" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录状态" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column
        label="访问时间"
        prop="loginTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="180"
      >
        <template #default="scope">
          <span>{{ scope.row.loginTime }}</span>
        </template>
      </el-table-column>
    </el-table>
    <BottomFixed>
      <div class="flex justify-end items-center p-4">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>
  </div>
</template>
