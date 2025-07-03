<script setup lang="ts">
import useDictStore from '@/store/modules/dict'
import { optionselect, getType } from '@/api/system/dict/type'
import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data'

import { useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { createRules } from '@/utils'

import { listClassOptions } from '@/utils/column'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref([])
const dataRef = ref<FormInstance>(null)
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const defaultDictType = ref('')
const typeOptions = ref([])
const route = useRoute()

const items = ref<QueryItemConfig[]>([
  // {
  //   label: '字典名称',
  //   prop: 'dictType',
  //   type: 'select',
  //   placeholder: '请选择字典名称',
  //   dict: typeOptions.value.map((item) => ({
  //     label: item.dictName,
  //     value: item.dictType,
  //   })),
  // },
  {
    label: '字典标签',
    prop: 'dictLabel',
    type: 'input',
    placeholder: '请输入字典标签',
  },
  {
    label: '数据状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择数据状态',
    dict: sys_normal_disable,
  },
])

const data = reactive({
  form: {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: 'default',
    dictSort: 0,
    status: '0',
    remark: undefined,
    dictType: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined,
    dictLabel: undefined,
  },
  rules: {
    dictLabel: createRules('数据标签不能为空'),
    dictValue: createRules('数据键值不能为空'),
    dictSort: createRules('数据顺序不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询字典类型详细 */
async function getTypes(dictId) {
  const response = await getType(dictId)
  queryParams.value.dictType = response.data.dictType
  defaultDictType.value = response.data.dictType
  await getList()
}

/** 查询字典类型列表 */
async function getTypeList() {
  const response = await optionselect()
  typeOptions.value = response.data
}
/** 查询字典数据列表 */
async function getList() {
  loading.value = true
  const response = await listData(queryParams.value)
  dataList.value = response.rows
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
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: 'default',
    dictSort: 0,
    status: '0',
    remark: undefined,
    dictType: undefined,
  }
  proxy.resetForm('dataRef')
}
/** 搜索按钮操作 */
async function handleQuery() {
  queryParams.value.pageNum = 1
  await getList()
}
/** 返回按钮操作 */
function handleClose() {
  const obj = { path: '/system/dict' }
  proxy.$tab.closeOpenPage(obj)
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.dictType = defaultDictType
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典数据'
  form.value.dictType = queryParams.value.dictType
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.dictCode)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const dictCode = row.dictCode || ids.value
  const response = await getData(dictCode)
  form.value = response.data
  open.value = true
  title.value = '修改字典数据'
}
/** 提交按钮 */
async function submitForm() {
  const valid = await dataRef.value.validate()
  if (!valid) return
  const isEdit = form.value.dictCode !== undefined
  const action = isEdit ? updateData : addData
  const successMsg = isEdit ? '修改成功' : '新增成功'
  try {
    await action(form.value)
    useDictStore().removeDict(queryParams.value.dictType)
    proxy.$modal.msgSuccess(successMsg)
    open.value = false
    await getList()
  } catch (error) {
    console.error('提交失败：', error)
  }
}
/** 删除按钮操作 */
function handleDelete(row) {
  const dictCodes = row.dictCode || ids.value
  proxy.$modal
    .confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项？')
    .then(function () {
      return delData(dictCodes)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
      useDictStore().removeDict(queryParams.value.dictType)
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 导出按钮操作 */
async function handleExport() {
  await proxy.download(
    'system/dict/data/export',
    {
      ...queryParams.value,
    },
    `dict_data_${new Date().getTime()}.xlsx`,
  )
}
onMounted(async () => {
  await getTypes(route.params && route.params.dictId)
  await getTypeList()
})
</script>
<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-4">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <el-form-item label="字典名称" prop="dictType">
                <el-select v-model="queryParams.dictType" clearable filterable>
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.dictId"
                    :label="item.dictName"
                    :value="item.dictType"
                  />
                </el-select>
              </el-form-item>
            </el-col>
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
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
          </el-col>
        </el-row>
      </div>
    </collapsePanel>
    <el-table v-loading="loading" :data="dataList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="字典编码" prop="dictCode" min-width="100" />
      <el-table-column label="字典标签" prop="dictLabel" min-width="100">
        <template #default="scope">
          <span v-if="scope.row.listClass === '' || scope.row.listClass === 'default'">
            {{ scope.row.dictLabel }}
          </span>
          <el-tag v-else :type="scope.row.listClass === 'primary' ? '' : scope.row.listClass">
            {{ scope.row.dictLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" prop="dictValue" min-width="100" />
      <el-table-column label="字典排序" prop="dictSort" min-width="100" />
      <el-table-column label="状态" prop="status" min-width="55">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="创建时间" prop="createTime" min-width="180" />
      <el-table-column
        label="操作"
        min-width="150"
        class-name="small-padding fixed-width"
        fixed="right"
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
      <div class="flex items-center justify-end p-4">
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
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="dataRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" clearable />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" clearable />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" clearable />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" clearable />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '（' + item.value + '）'"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
