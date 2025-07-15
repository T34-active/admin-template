<script setup lang="ts">
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import type { Sort } from 'element-plus'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_oper_type, sys_common_status } = proxy.useDict('sys_oper_type', 'sys_common_status')

const operLogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const defaultSort = ref<Sort>({ prop: 'operTime', order: 'descending' })

const items = ref<QueryItemConfig[]>([
  {
    label: '系统模块',
    prop: 'title',
    type: 'input',
    placeholder: '请输入系统模块',
  },
  {
    label: '操作人员',
    prop: 'operName',
    type: 'input',
    placeholder: '请输入操作人员',
  },
  {
    label: '操作类型',
    prop: 'businessType',
    type: 'select',
    placeholder: '请选择操作类型',
    dict: sys_oper_type,
  },
  {
    label: '操作状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择操作状态',
    dict: sys_oper_type,
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    type: 'daterange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
])

const data = reactive({
  form: {
    title: '', // 操作模块标题
    operName: '', // 操作人名称
    operIp: '', // 操作IP
    operLocation: '', // 操作地点
    operUrl: '', // 请求地址
    requestMethod: '', // 请求方式（GET/POST 等）
    method: '', // 操作方法
    operParam: '', // 请求参数
    jsonResult: '', // 返回参数
    status: 0, // 操作状态（0 正常，1 失败）
    costTime: 0, // 消耗时间（毫秒）
    operTime: '', // 操作时间（时间字符串）
    errorMsg: '', // 异常信息（仅当 status === 1 时显示）
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    orderByColumn: undefined,
    isAsc: undefined,
    status: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
})

const { queryParams, form } = toRefs(data)

/** 查询登录日志 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await list(proxy.addDateRange(queryParams.value, safeRange))
  operLogList.value = response.rows
  total.value = response.total
  loading.value = false
}
/** 操作日志类型字典翻译 */
function typeFormat(row) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType)
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
  queryParams.value.pageNum = 1
  proxy.$refs.openLogRef.sort(defaultSort.value.prop, defaultSort.value.order)
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.operId)
  multiple.value = !selection.length
}
/** 排序触发事件 */
async function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order
  await getList()
}
/** 详细按钮操作 */
function handleView(row, index) {
  open.value = true
  form.value = row
}
/** 删除按钮操作 */
function handleDelete(row) {
  const operIds = row.operId || ids.value
  proxy.$modal
    .confirm('是否确认删除日志编号为"' + operIds + '"的数据项？')
    .then(function () {
      return delOperlog(operIds)
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
    .confirm('是否确认清空所有操作日志数据项？')
    .then(function () {
      return cleanOperlog()
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('清空成功')
    })
  //   .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/operlog/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  )
}
onMounted(async () => {
  await getList()
})
</script>
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
              v-hasPermi="['monitor:operlog:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:operlog:remove']"
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
              v-hasPermi="['monitor:operlog:export']"
              type="warning"
              plain
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
      ref="openLogRef"
      v-loading="loading"
      :data="operLogList"
      :default-sort="defaultSort"
      @selectionChange="handleSelectionChange"
      @sortChange="handleSortChange"
      border
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="日志编号" prop="operId" />
      <el-table-column label="系统模块" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="操作类型" prop="businessType">
        <template #default="scope">
          <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作人员"
        width="110"
        prop="operName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="主机" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作日期"
        prop="operTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="180"
      />
      <el-table-column
        label="消耗时间"
        prop="costTime"
        width="110"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template #default="scope">
          <span>{{ scope.row.costTime }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
            v-hasPermi="['monitor:operlog:query']"
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row, scope.index)"
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

    <!-- 操作日志详细 -->
    <el-dialog
      v-model="open"
      title="操作日志详细"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item label="登录信息">
              {{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法">
              <div v-highlight>
                <pre><code class="language-java break-all whitespace-pre-wrap rounded-md">{{ form.method }}</code></pre>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数">
              <div v-highlight>
                <pre><code class="language-javascript break-all whitespace-pre-wrap rounded-md">{{ form.operParam }}</code></pre>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数">
              <div v-highlight>
                <pre><code class="language-javascript break-all whitespace-pre-wrap rounded-md">{{ form.jsonResult }}</code></pre>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作状态">
              <dict-tag :options="sys_common_status" :value="form.status" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="操作时间">{{ form.operTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === 1" label="异常信息">
              {{ form.errorMsg }}
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
