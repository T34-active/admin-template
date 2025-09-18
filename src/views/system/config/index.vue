<script setup lang="ts">
import {
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig,
  refreshCache,
} from '@/api/system/config'
import { createRules } from '@/utils'
import type { FormInstance, FormRules } from 'element-plus'
import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()
const { sys_yes_no } = proxy.useDict('sys_yes_no')
const configRef = ref<FormInstance>(null)
const configList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const items = ref<QueryItemConfig[]>([
  {
    label: '参数名称',
    prop: 'configName',
    type: 'input',
    placeholder: '请输入参数名称',
  },
  {
    label: '参数键名',
    prop: 'configKey',
    type: 'input',
    placeholder: '请输入参数键名',
  },
  {
    label: '系统内置',
    prop: 'configType',
    type: 'radio',
    dict: sys_yes_no,
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
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'Y',
    remark: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
  rules: {
    configName: createRules('参数名称不能为空'),
    configKey: createRules('参数键名不能为空'),
    configValue: createRules('参数键值不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询参数列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await listConfig(proxy.addDateRange(queryParams.value, safeRange))
  configList.value = response.rows
  total.value = response.total
  loading.value = false
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'Y',
    remark: undefined,
  }
  proxy?.resetForm('configRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.dateRange = [null, null]
  proxy?.resetForm('queryRef')
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.configId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加参数'
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const configId = row.configId || ids.value
  const response = await getConfig(configId)
  form.value = response.data
  open.value = true
  title.value = '修改参数'
}
/** 提交按钮 */
async function submitForm() {
  const valid = await configRef.value.validate()
  if (!valid) return
  if (form.value.configId) {
    await updateConfig(form.value)
    proxy?.$modal.msgSuccess('修改成功')
  } else {
    await addConfig(form.value)
    proxy?.$modal.msgSuccess('新增成功')
  }
  open.value = false
  await getList()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const configIds = row.configId || ids.value
  proxy?.$modal
    .confirm('是否确认删除参数编号为"' + configIds + '"的数据项？')
    .then(function () {
      return delConfig(configIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy?.download(
    'system/config/export',
    {
      ...queryParams.value,
    },
    `config_${new Date().getTime()}.xlsx`,
  )
}
/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy?.$modal.msgSuccess('刷新缓存成功')
  })
}
onMounted(async () => {
  await getList()
})
</script>
<template>
  <div class="app-container">
    <CollapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:config:add']"
              type="primary"
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:config:edit']"
              type="success"
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:config:remove']"
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
              plain
              v-hasPermi="['system:config:export']"
              type="warning"
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:config:remove']"
              type="danger"
              icon="Refresh"
              @click="handleRefreshCache"
            >
              刷新缓存
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </div>
    </CollapsePanel>
    <el-table v-loading="loading" :data="configList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="参数主键" prop="configId" min-width="85" />
      <el-table-column
        label="参数名称"
        prop="configName"
        :show-overflow-tooltip="true"
        min-width="200"
      />
      <el-table-column
        label="参数键名"
        prop="configKey"
        :show-overflow-tooltip="true"
        min-width="200"
      />
      <el-table-column
        label="参数键值"
        prop="configValue"
        :show-overflow-tooltip="true"
        min-width="200"
      />
      <el-table-column label="系统内置" prop="configType" min-width="85">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="创建时间" prop="createTime" width="180" min-width="200" />

      <el-table-column
        label="操作"
        min-width="150"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:config:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:config:remove']"
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >
            删除
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="configRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" clearable />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" clearable />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" clearable />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
