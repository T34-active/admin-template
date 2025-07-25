<script setup lang="ts">
import { listTable, delTable, genCode, synchDb } from '@/api/tool/gen'
import router from '@/router'
import importTable from './importTable.vue'
import createTable from './createTable.vue'
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

const queryParams = ref({
  pageNum: 1,
  pageSize: 50,
  className: undefined,
  tableName: undefined,
  tableComment: undefined,
})

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
function handlePreview(row) {
  const obj = {
    path: '/tool/gen-detail/index/' + row.tableId,
    query: { tableComment: row.tableComment },
  }
  proxy.$tab.closeOpenPage(obj)
}
onMounted(async () => {
  await getList()
})
</script>

<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-16">
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
              <el-form-item label="实体" prop="className">
                <el-input
                  v-model="queryParams.className"
                  placeholder="请输入实体"
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
        prop="tableName"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column
        label="表描述"
        prop="tableComment"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column
        label="实体"
        prop="className"
        :show-overflow-tooltip="true"
        min-width="160"
      />
      <el-table-column label="创建时间" prop="createTime" min-width="160" />
      <el-table-column label="更新时间" prop="updateTime" min-width="160" />
      <el-table-column
        label="操作"
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
      <div class="flex items-center justify-end p-16">
        <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </BottomFixed>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>
