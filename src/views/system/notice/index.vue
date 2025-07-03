<script setup lang="ts">
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice'

import type { FormRules } from 'element-plus'
import { createRules } from '@/utils'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const { proxy } = getCurrentInstance()

const { sys_notice_status, sys_notice_type } = proxy.useDict('sys_notice_status', 'sys_notice_type')

const noticeList = ref([])
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
    label: '公告标题',
    prop: 'noticeTitle',
    type: 'input',
    placeholder: '请输入公告标题',
  },
  {
    label: '操作人员',
    prop: 'createBy',
    type: 'input',
    placeholder: '请输入操作人员',
  },
  {
    label: '类型',
    prop: 'noticeType',
    type: 'radio',
    dict: sys_notice_type,
  },
])

const data = reactive({
  form: {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: '0',
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: undefined,
    noticeType: undefined,
    createBy: undefined,
    status: undefined,
  },
  rules: {
    noticeTitle: createRules('公告标题不能为空'),
    noticeType: createRules('公告类型不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 查询公告列表 */
async function getList() {
  loading.value = true
  const response = await listNotice(queryParams.value)
  noticeList.value = response.rows
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
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: '0',
  }
  proxy.resetForm('noticeRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.noticeId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加公告'
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const noticeId = row.noticeId || ids.value
  const response = await getNotice(noticeId)
  form.value = response.data
  open.value = true
  title.value = '修改公告'
}
/** 提交按钮 */
async function submitForm() {
  const valid = await proxy.$refs.noticeRef.validate()
  if (!valid) return
  if (form.value.noticeId !== undefined) {
    await updateNotice(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addNotice(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  await getList()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const noticeIds = row.noticeId || ids.value
  proxy.$modal
    .confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？')
    .then(function () {
      return delNotice(noticeIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
onMounted(async () => {
  await getList()
})
</script>

<template>
  <div class="app-container">
    <CollapsePanel v-model="showSearch">
      <div class="p-4">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="20">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              plain
              v-hasPermi="['system:notice:add']"
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
              v-hasPermi="['system:notice:edit']"
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
              v-hasPermi="['system:notice:remove']"
              type="danger"
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
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
    </CollapsePanel>
    <el-table v-loading="loading" :data="noticeList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" prop="noticeId" min-width="150" />
      <el-table-column
        label="公告标题"
        prop="noticeTitle"
        :show-overflow-tooltip="true"
        min-width="200"
      />
      <el-table-column label="公告类型" prop="noticeType" min-width="150">
        <template #default="scope">
          <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="150">
        <template #default="scope">
          <dict-tag :options="sys_notice_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" prop="createBy" min-width="150" />
      <el-table-column label="创建时间" prop="createTime" min-width="200" />
      <el-table-column
        label="操作"
        class-name="small-padding fixed-width"
        fixed="right"
        min-width="150"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:notice:edit']"
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:notice:remove']"
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

    <!-- 添加或修改公告对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="780px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择">
                <el-option
                  v-for="dict in sys_notice_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_notice_status" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
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
