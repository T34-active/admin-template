<script setup lang="ts">
import { listDbTable, importTable } from '@/api/tool/gen'
import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const total = ref(0)
const visible = ref(false)
const tables = ref([])
const dbTableList = ref([])
const { proxy } = getCurrentInstance()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined,
})

const items = ref<QueryItemConfig[]>([
  {
    label: '表名称',
    prop: 'tableName',
    type: 'input',
    placeholder: '请输入表名称',
  },
  {
    label: '表描述',
    prop: 'tableComment',
    type: 'input',
    placeholder: '请输入表描述',
  },
])
const emit = defineEmits(['ok'])

/** 查询参数列表 */
function show() {
  getList()
  visible.value = true
}

/** 单击选择行 */
function clickRow(row) {
  proxy.$refs.table.toggleRowSelection(row)
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  tables.value = selection.map((item) => item.tableName)
}

/** 查询表数据 */
async function getList() {
  const response = await listDbTable(queryParams)
  dbTableList.value = response.rows
  total.value = response.total
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 导入按钮操作 */
async function handleImportTable() {
  const tableNames = tables.value.join(',')
  if (tableNames === '') {
    proxy.$modal.msgError('请选择要导入的表')
    return
  }
  const response = await importTable({ tables: tableNames })
  proxy.$modal.msgSuccess(response.msg)
  if (response.code === 200) {
    visible.value = false
    emit('ok')
  }
}

defineExpose({
  show,
})
</script>

<template>
  <!-- 导入表 -->
  <el-dialog
    title="导入表"
    v-model="visible"
    width="80%"
    top="5vh"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form :model="queryParams" ref="queryRef" label-width="auto">
      <el-row :gutter="10">
        <QueryForm :model="queryParams" :items="items" @change="handleQuery" />
      </el-row>
    </el-form>
    <el-row :gutter="10" class="mb-10">
      <el-col :span="1.5">
        <el-button plain icon="Refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-table
        @row-click="clickRow"
        ref="table"
        :data="dbTableList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="tableName" label="表名称" :show-overflow-tooltip="true" />
        <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="更新时间" />
      </el-table>
    </el-row>
    <div class="flex items-center justify-end p-16">
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain type="primary" @click="handleImportTable">确 定</el-button>
        <el-button plain @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
