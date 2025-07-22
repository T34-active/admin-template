<script setup lang="ts">
import useDictStore from '@/store/modules/dict'
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
  refreshCache,
} from '@/api/system/dict/type'
import type { FormRules } from 'element-plus'
import { createRules } from '@/utils'
import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const typeList = ref([])
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
    label: '字典名称',
    prop: 'dictName',
    type: 'input',
    placeholder: '请输入字典名称',
  },
  {
    label: '字典类型',
    prop: 'dictType',
    type: 'input',
    placeholder: '请输入字典类型',
  },
  {
    label: '字典状态',
    prop: 'status',
    type: 'radio',
    dict: sys_normal_disable,
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
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    remark: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 50,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
  rules: {
    dictName: createRules('字典名称不能为空'),
    dictType: createRules('字典类型不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询字典类型列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await listType(proxy.addDateRange(queryParams.value, safeRange))
  typeList.value = response.rows
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
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    remark: undefined,
  }
  proxy.resetForm('dictRef')
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
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典类型'
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.dictId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const dictId = row.dictId || ids.value
  const response = await getType(dictId)
  form.value = response.data
  open.value = true
  title.value = '修改字典类型'
}
/** 提交按钮 */
async function submitForm() {
  const valid = await proxy.$refs.dictRef.validate()
  if (!valid) return
  if (form.value.dictId !== undefined) {
    await updateType(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addType(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  await getList()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const dictIds = row.dictId || ids.value
  proxy.$modal
    .confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？')
    .then(function () {
      return delType(dictIds)
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
  proxy.download(
    'system/dict/type/export',
    {
      ...queryParams.value,
    },
    `dict_${new Date().getTime()}.xlsx`,
  )
}
/** 刷新缓存按钮操作 */
async function handleRefreshCache() {
  await refreshCache()
  proxy.$modal.msgSuccess('刷新成功')
  useDictStore().cleanDict()
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
              v-hasPermi="['system:dict:add']"
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:dict:edit']"
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:dict:remove']"
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
              v-hasPermi="['system:dict:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:dict:remove']"
              type="danger"
              plain
              icon="Refresh"
              @click="handleRefreshCache"
            >
              刷新缓存
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
    <el-table v-loading="loading" :data="typeList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="字典编号" prop="dictId" min-width="100" />
      <el-table-column
        label="字典名称"
        prop="dictName"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="字典类型" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <router-link :to="'/system/dict-data/index/' + scope.row.dictId" class="link-type">
            <span>{{ scope.row.dictType }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="75">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="200" />
      <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column
        label="操作"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="150"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:dict:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:dict:remove']"
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
      width="550px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="dictRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
