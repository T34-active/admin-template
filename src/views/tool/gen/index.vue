<script setup lang="ts">
import { listTable, previewTable, delTable, genCode, synchDb } from '@/api/tool/gen'
import router from '@/router'
import importTable from './importTable.vue'
import createTable from './createTable.vue'
import QueryForm from '@/components/QueryForm/index.vue'
import { disabledFutureDate } from '@/utils'

const route = useRoute()
const { proxy } = getCurrentInstance()

const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const tableNames = ref([])
const dateRange = ref<[Date | null, Date | null]>([null, null])
const uniqueId = ref('')

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined,
  },
  preview: {
    open: false,
    title: '代码预览',
    data: {},
    activeName: 'domain.java',
  },
})

const { queryParams, preview } = toRefs(data)

onActivated(() => {
  const time = route.query.t
  if (time != null && time !== uniqueId.value) {
    uniqueId.value = time
    queryParams.value.pageNum = Number(route.query.pageNum)
    dateRange.value = [null, null]
    proxy.resetForm('queryForm')
    getList()
  }
})

/** 查询表集合 */
async function getList() {
  loading.value = true
  const response = await listTable(proxy.addDateRange(queryParams.value, dateRange.value))
  tableList.value = response.rows
  total.value = response.total
  loading.value = false
}

/** 搜索按钮操作 */
async function handleQuery() {
  queryParams.value.pageNum = 1
  await getList()
}

/** 生成代码操作 */
async function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value
  if (tbNames === '') {
    proxy.$modal.msgError('请选择要生成的数据')
    return
  }
  if (row.genType === '1') {
    await genCode(row.tableName)
    proxy.$modal.msgSuccess('成功生成到自定义路径：' + row.genPath)
  } else {
    proxy.$download.zip('/tool/gen/batchGenCode?tables=' + tbNames, 'ruoyi.zip')
  }
}

/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName
  proxy.$modal
    .confirm('确认要强制同步"' + tableName + '"表结构吗？')
    .then(function () {
      return synchDb(tableName)
    })
    .then(() => {
      proxy.$modal.msgSuccess('同步成功')
    })
    .catch(() => {})
}

/** 打开导入表弹窗 */
function openImportTable() {
  proxy.$refs.importRef.show()
}

/** 打开创建表弹窗 */
function openCreateTable() {
  proxy.$refs.createRef.show()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [null, null]
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 预览按钮 */
function handlePreview(row) {
  previewTable(row.tableId).then((response) => {
    preview.value.data = response.data
    preview.value.open = true
    preview.value.activeName = 'domain.java'
  })
}

/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess('复制成功')
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.tableId)
  tableNames.value = selection.map((item) => item.tableName)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0]
  router.push({
    path: '/tool/gen-edit/index/' + tableId,
    query: { pageNum: queryParams.value.pageNum },
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const tableIds = row.tableId || ids.value
  proxy.$modal
    .confirm('是否确认删除表编号为"' + tableIds + '"的数据项？')
    .then(function () {
      return delTable(tableIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function getTabName(path: string): string {
  const start = path.lastIndexOf('/') + 1
  const end = path.indexOf('.vm')
  if (start === -1 || end === -1 || end <= start) return path
  return path.substring(start, end)
}

function getLangClass(fileName: string): string {
  // 去掉 .vm 后缀再处理
  const pureName = fileName.replace(/\.vm$/, '').toLowerCase()
  if (pureName.endsWith('.java')) return 'language-java'
  if (pureName.endsWith('.xml')) return 'language-xml'
  if (pureName.endsWith('.sql')) return 'language-java'
  if (pureName.endsWith('.js') || pureName.endsWith('.vue')) return 'language-javascript'
  return 'language-plaintext'
}

onMounted(async () => {
  await getList()
})
</script>

<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-4">
        <el-form :model="queryParams" ref="queryRef" label-width="auto">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <el-form-item label="表名称" prop="tableName">
                <el-input
                  v-model="queryParams.tableName"
                  placeholder="请输入表名称"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <el-form-item label="表描述" prop="tableComment">
                <el-input
                  v-model="queryParams.tableComment"
                  placeholder="请输入表描述"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="dateRange"
                  value-format="YYYY-MM-DD"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :disabled-date="disabledFutureDate"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              plain
              type="primary"
              icon="Download"
              :disabled="multiple"
              @click="handleGenTable"
              v-hasPermi="['tool:gen:code']"
            >
              生成
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              type="primary"
              icon="Plus"
              @click="openCreateTable"
              v-hasRole="['admin']"
            >
              创建
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="Upload"
              @click="openImportTable"
              v-hasPermi="['tool:gen:import']"
            >
              导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleEditTable"
              v-hasPermi="['tool:gen:edit']"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['tool:gen:remove']"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button plain icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button plain type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
        </el-row>
      </div>
    </collapsePanel>
    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="序号" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="表名称"
        align="center"
        prop="tableName"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column
        label="表描述"
        align="center"
        prop="tableComment"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column
        label="实体"
        align="center"
        prop="className"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="160" />
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="160" />
      <el-table-column
        label="操作"
        align="center"
        min-width="200"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip content="预览" placement="top">
            <el-button
              plain
              link
              type="primary"
              icon="View"
              @click="handlePreview(scope.row)"
              v-hasPermi="['tool:gen:preview']"
            />
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button
              plain
              link
              type="primary"
              icon="Edit"
              @click="handleEditTable(scope.row)"
              v-hasPermi="['tool:gen:edit']"
            />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              plain
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['tool:gen:remove']"
            />
          </el-tooltip>
          <el-tooltip content="同步" placement="top">
            <el-button
              plain
              link
              type="primary"
              icon="Refresh"
              @click="handleSynchDb(scope.row)"
              v-hasPermi="['tool:gen:edit']"
            />
          </el-tooltip>
          <el-tooltip content="生成代码" placement="top">
            <el-button
              plain
              link
              type="primary"
              icon="Download"
              @click="handleGenTable(scope.row)"
              v-hasPermi="['tool:gen:code']"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <BottomFixed>
      <div class="flex items-center justify-end p-4">
        <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </BottomFixed>

    <!-- 预览界面 -->
    <el-dialog
      :title="preview.title"
      v-model="preview.open"
      width="80%"
      top="5vh"
      append-to-body
      class="scrollbar"
    >
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :key="key"
          :label="getTabName(key)"
          :name="getTabName(key)"
        >
          <!-- 输出当前语言 class 供调试 -->
          <div class="text-xs text-gray-400 mb-1">{{ getLangClass(key) }}</div>
          <div class="flex justify-end items-center mb-2 lan">
            <el-link underline="always" v-copyText="value" v-copyText:callback="copyTextSuccess">
              <span class="inline-flex items-center gap-x-1">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </span>
            </el-link>
          </div>
          <div v-highlight>
            <pre><code :class="getLangClass(key)">{{ value }}</code></pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>
