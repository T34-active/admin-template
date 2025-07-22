<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:remove']"
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
              v-hasPermi="['monitor:job:remove']"
              type="danger"
              plain
              icon="Delete"
              @click="handleClean"
            >
              清空
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
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

    <el-table v-loading="loading" :data="jobLogList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="日志编号" width="80" prop="jobLogId" />
      <el-table-column label="任务名称" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务组名" prop="jobGroup" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="日志信息" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="执行状态" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="执行时间" prop="createTime" width="180" />
      <el-table-column label="操作" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
            v-hasPermi="['monitor:job:query']"
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
          >
            详细
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <BottomFixed>
      <div class="flex items-center justify-end p-16">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>

    <!-- 调度日志详细 -->
    <el-dialog
      v-model="open"
      title="调度日志详细"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用方法">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行状态">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === 1" label="异常信息">
              {{ form.exceptionInfo }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getJob } from '@/api/monitor/job'
import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog'
import { oneOf } from '@zeronejs/utils'

import { useRoute } from 'vue-router'
import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()
const { sys_common_status, sys_job_group } = proxy.useDict('sys_common_status', 'sys_job_group')

const jobLogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[Date | null, Date | null]>([null, null])
const route = useRoute()

const data = reactive({
  form: {
    jobLogId: null,
    jobName: null,
    jobGroup: null,
    createTime: null,
    invokeTarget: null,
    jobMessage: null,
    status: null,
    exceptionInfo: null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
})

const { queryParams, form } = toRefs(data)

const items = ref<QueryItemConfig[]>([
  {
    label: '任务名称',
    prop: 'jobName',
    type: 'input',
    placeholder: '请输入任务名称',
  },
  {
    label: '任务组名',
    prop: 'jobGroup',
    type: 'select',
    placeholder: '请选择任务组名',
    dict: sys_job_group,
  },
  {
    label: '执行状态',
    prop: 'status',
    type: 'radio',
    placeholder: '请选择执行状态',
    dict: sys_common_status,
  },
  {
    label: '执行时间',
    prop: 'dateRange',
    type: 'daterange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
])

/** 查询调度日志列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await listJobLog(proxy.addDateRange(queryParams.value, safeRange))
  jobLogList.value = response.rows
  total.value = response.total
  loading.value = false
}
// 返回按钮
function handleClose() {
  const obj = { path: '/monitor/job' }
  proxy.$tab.closeOpenPage(obj)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.dateRange = [null, null]
  proxy.resetForm('queryRef')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobLogId)
  multiple.value = !selection.length
}
/** 详细按钮操作 */
function handleView(row) {
  open.value = true
  form.value = row
}
/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal
    .confirm('是否确认删除调度日志编号为"' + ids.value + '"的数据项？')
    .then(function () {
      return delJobLog(ids.value)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
/** 清空按钮操作 */
function handleClean() {
  proxy.$modal
    .confirm('是否确认清空所有调度日志数据项？')
    .then(function () {
      return cleanJobLog()
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('清空成功')
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/jobLog/export',
    {
      ...queryParams.value,
    },
    `job_log_${new Date().getTime()}.xlsx`,
  )
}

onMounted(async () => {
  const jobId = oneOf(route.params.jobId)
  if (jobId !== undefined && jobId !== '0') {
    const response = await getJob(jobId)
    queryParams.value.jobName = response.data.jobName
    queryParams.value.jobGroup = response.data.jobGroup
  }
  await getList()
})
</script>
